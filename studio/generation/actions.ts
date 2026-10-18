"use server"

import { cookies } from "next/headers"

import { getModel, parseSettings } from "./catalog"
import type { GenerationPlane } from "./catalog/types"
import {
  MissingCredentialsError,
  PLATFORM_KEY_COOKIE,
  PLATFORM_KEY_COOKIE_OPTIONS,
  decodeCredentials,
  encodeCredentials,
  parseCredentialInput,
} from "./credentials"
import { describeFailure } from "./errors"
import type { ActionResult } from "./errors"
import { createPlatformClient } from "./platform"
import type { QueuedGeneration, StatusResult } from "./platform"
import { createSubmitGuard, submissionKey } from "./submit-guard"
import { toPlatform } from "./to-platform"

const guardSubmit = createSubmitGuard<QueuedGeneration>()

export async function savePlatformCredentials(
  data: unknown
): Promise<ActionResult<object>> {
  let apiKey: string
  try {
    apiKey = parseCredentialInput(data).apiKey
  } catch (caught) {
    return { ok: false, ...describeFailure(caught) }
  }
  const jar = await cookies()
  jar.set(
    PLATFORM_KEY_COOKIE,
    encodeCredentials(apiKey),
    PLATFORM_KEY_COOKIE_OPTIONS
  )
  return { ok: true }
}

export async function clearPlatformCredentials() {
  const jar = await cookies()
  jar.set(PLATFORM_KEY_COOKIE, "", {
    ...PLATFORM_KEY_COOKIE_OPTIONS,
    maxAge: 0,
  })
}

export async function hasPlatformCredentials() {
  return (await readStoredCredentials()) !== null
}

export async function submitGeneration(
  plane: GenerationPlane
): Promise<ActionResult<{ queued: QueuedGeneration }>> {
  try {
    const model = getModel(plane.model)
    const parsed: GenerationPlane = {
      ...plane,
      settings: parseSettings(model, plane.settings),
    }
    const { path, body } = toPlatform(parsed)
    const credentials = await readCredentials()
    const queued = await guardSubmit(
      submissionKey(credentials.apiKey, path, body),
      () => createPlatformClient(credentials).submit(path, body)
    )
    return { ok: true, queued }
  } catch (caught) {
    const failure = describeFailure(caught)
    // The POST may have been queued before the connection dropped; resending
    // it could start a second paid generation, so the user decides.
    if (failure.code === "unreachable")
      failure.error =
        "Lost contact with Higgsfield while submitting. The generation may still have started; check your Higgsfield account before trying again."
    return { ok: false, ...failure }
  }
}

/** Every request in flight, answered in one round trip. Next dispatches server
    actions one at a time per client, so a poll per run would queue ahead of the
    next submit — the fan-out belongs on this side of the call, where it is
    genuinely parallel. */
export async function getGenerationStatuses(
  data: unknown
): Promise<StatusResult[]> {
  const requestIds = parseRequestIds(data)
  let client: ReturnType<typeof createPlatformClient>
  try {
    client = createPlatformClient(await readCredentials())
  } catch (caught) {
    const { error, retryable } = describeFailure(caught)
    return requestIds.map((requestId) => ({ requestId, error, retryable }))
  }
  return Promise.all(
    requestIds.map(async (requestId): Promise<StatusResult> => {
      try {
        return { requestId, status: await client.status(requestId) }
      } catch (caught) {
        const { error, retryable } = describeFailure(caught)
        return { requestId, error, retryable }
      }
    })
  )
}

export async function cancelGeneration(
  data: unknown
): Promise<ActionResult<object>> {
  try {
    const [requestId] = parseRequestIds(data)
    await createPlatformClient(await readCredentials()).cancel(requestId!)
    return { ok: true }
  } catch (caught) {
    return { ok: false, ...describeFailure(caught) }
  }
}

async function readStoredCredentials() {
  const jar = await cookies()
  return decodeCredentials(jar.get(PLATFORM_KEY_COOKIE)?.value)
}

async function readCredentials() {
  const stored = await readStoredCredentials()
  if (!stored) throw new MissingCredentialsError()
  const baseUrl = process.env.HF_API_BASE_URL
  if (!baseUrl) throw new Error("Missing HF_API_BASE_URL")
  return { ...stored, baseUrl }
}

function parseRequestIds(data: unknown): string[] {
  const payload = asObject(data, "Invalid status payload")
  const requestIds = payload.requestIds
  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    throw new Error("Invalid request ids")
  }
  return requestIds.map((requestId) => {
    if (typeof requestId !== "string" || !requestId)
      throw new Error("Invalid request id")
    return requestId
  })
}

function asObject(data: unknown, message: string): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data))
    throw new Error(message)
  return data as Record<string, unknown>
}
