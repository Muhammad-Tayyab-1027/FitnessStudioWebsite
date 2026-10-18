"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { cancelGeneration, submitGeneration } from "@/generation/actions"
import { getModel } from "@/generation/catalog"
import type { GenerationPlane } from "@/generation/catalog"
import type { FailureCode } from "@/generation/errors"
import type { GenerationStatus } from "@/generation/platform"
import { stopWatching, watchRequest } from "@/generation/poll"

import {
  aspectFromSettings,
  loadHistory,
  saveHistory,
  type RunRecord,
} from "./history"

/**
 * The studio's generation controller: submits planes to the platform through
 * the server action, keeps every run in IndexedDB-backed history, and resumes
 * polls for runs that were still in flight when the page reloaded.
 */
export function useRuns() {
  const [records, setRecords] = useState<RunRecord[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // State lags a render behind; the ref closes the double-click window at once.
  const submittingRef = useRef(false)
  const recordsRef = useRef(records)
  useEffect(() => {
    recordsRef.current = records
  }, [records])

  const update = useCallback((id: string, patch: Partial<RunRecord>) => {
    setRecords((current) =>
      current.map((r) => (r.id === id ? { ...r, ...patch } : r))
    )
  }, [])

  const watch = useCallback(
    (record: RunRecord) => {
      watchRequest(record.requestId, {
        deadline: record.createdAt + 15 * 60_000,
      })
        .then((status) => update(record.id, settle(status)))
        .catch((caught: unknown) => {
          update(record.id, {
            status: "failed",
            error: caught instanceof Error ? caught.message : String(caught),
          })
        })
    },
    [update]
  )

  useEffect(() => {
    let alive = true
    void loadHistory().then((stored) => {
      if (!alive) return
      setRecords(stored)
      setLoaded(true)
      for (const record of stored)
        if (record.status === "running") watch(record)
    })
    return () => {
      alive = false
      stopWatching()
    }
  }, [watch])

  useEffect(() => {
    if (loaded) void saveHistory(records)
  }, [loaded, records])

  const submit = useCallback(
    async (
      plane: GenerationPlane,
      projectId?: string
    ): Promise<{ record: RunRecord | null; code?: FailureCode }> => {
      if (submittingRef.current) return { record: null }
      submittingRef.current = true
      setSubmitting(true)
      setError(null)
      const model = getModel(plane.model)
      try {
        const result = await submitGeneration(plane)
        if (!result.ok) {
          setError(result.error)
          return { record: null, code: result.code }
        }
        const { queued } = result
        const record: RunRecord = {
          id: queued.requestId,
          requestId: queued.requestId,
          surface: model.surface,
          modelId: model.id,
          modelLabel: model.label,
          prompt: plane.prompt.text,
          settings: plane.settings,
          ...(projectId ? { projectId } : {}),
          aspect: aspectFromSettings(plane.settings),
          status: "running",
          urls: [],
          createdAt: Date.now(),
        }
        // The server collapses duplicate submits onto one request_id.
        if (recordsRef.current.some((r) => r.requestId === record.requestId))
          return { record: null }
        setRecords((current) => [record, ...current])
        watch(record)
        return { record }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught))
        return { record: null }
      } finally {
        submittingRef.current = false
        setSubmitting(false)
      }
    },
    [watch]
  )

  const cancel = useCallback(
    async (id: string) => {
      const record = records.find((r) => r.id === id)
      if (!record || record.status !== "running") return
      try {
        const result = await cancelGeneration({
          requestIds: [record.requestId],
        })
        if (result.ok) update(id, { status: "failed", error: "Canceled" })
        else setError(result.error)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    },
    [records, update]
  )

  const remove = useCallback((id: string) => {
    setRecords((current) => current.filter((r) => r.id !== id))
  }, [])

  const running = records.filter((r) => r.status === "running")

  return {
    records,
    running,
    loaded,
    error,
    submitting,
    submit,
    cancel,
    remove,
    setError,
  }
}

function settle(status: GenerationStatus): Partial<RunRecord> {
  const urls = [
    ...(status.images?.map((i) => i.url) ?? []),
    ...(status.video ? [status.video.url] : []),
  ]
  if (status.status === "completed" && urls.length > 0)
    return { status: "completed", urls }
  const reason =
    status.status === "nsfw"
      ? "Blocked by the content filter"
      : status.status === "canceled"
        ? "Canceled"
        : (describeError(status.error) ??
          "The generation did not produce media")
  return { status: "failed", error: reason }
}

function describeError(error: unknown): string | undefined {
  if (typeof error === "string") return error
  if (error && typeof error === "object") {
    const detail =
      (error as { detail?: unknown; message?: unknown }).detail ??
      (error as { message?: unknown }).message
    if (typeof detail === "string") return detail
  }
  return undefined
}
