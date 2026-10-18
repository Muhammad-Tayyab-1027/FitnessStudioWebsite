import { createHash } from "node:crypto"

export const DUPLICATE_WINDOW_MS = 10_000

type Entry<T> = { at: number; promise: Promise<T> }

/**
 * Collapses identical submissions that arrive within `windowMs` (a double
 * click, a resent form) onto the first platform request, so they share one
 * request_id instead of billing a second generation. A submission that fails
 * is forgotten at once so a deliberate retry goes through. Process-local: a
 * multi-instance deployment needs a shared store for the same guarantee.
 */
export function createSubmitGuard<T>(windowMs = DUPLICATE_WINDOW_MS) {
  const recent = new Map<string, Entry<T>>()

  return function guard(
    key: string,
    run: () => Promise<T>,
    now = Date.now()
  ): Promise<T> {
    for (const [k, entry] of recent)
      if (now - entry.at > windowMs) recent.delete(k)

    const existing = recent.get(key)
    if (existing) return existing.promise

    const promise = run()
    recent.set(key, { at: now, promise })
    promise.catch(() => {
      if (recent.get(key)?.promise === promise) recent.delete(key)
    })
    return promise
  }
}

/** Identity of one submission: who sends it (hashed key), where and what. */
export function submissionKey(
  apiKey: string,
  path: string,
  body: Record<string, unknown>
): string {
  return createHash("sha256")
    .update(apiKey)
    .update("\0")
    .update(path)
    .update("\0")
    .update(JSON.stringify(body))
    .digest("hex")
}
