import { MissingCredentialsError } from "./credentials"
import { PlatformError } from "./platform"

export type FailureCode =
  "missing_key" | "invalid_key" | "rate_limited" | "unreachable" | "failed"

export type Failure = {
  code: FailureCode
  error: string
  /** The same call may succeed later without the user changing anything. */
  retryable: boolean
}

/** Server action outcome. Next redacts thrown server-action errors in
    production builds, so user-facing failures travel back as values. */
export type ActionResult<T> = ({ ok: true } & T) | ({ ok: false } & Failure)

export function describeFailure(caught: unknown): Failure {
  if (caught instanceof MissingCredentialsError)
    return {
      code: "missing_key",
      error: "Connect your Higgsfield API key to generate.",
      retryable: false,
    }
  if (caught instanceof PlatformError) {
    if (caught.status === 401 || caught.status === 403)
      return {
        code: "invalid_key",
        error:
          "Higgsfield rejected your API key. Replace it under Manage API key.",
        retryable: false,
      }
    if (caught.status === 429)
      return {
        code: "rate_limited",
        error: "Higgsfield rate limit reached. Wait a moment and try again.",
        retryable: true,
      }
    return {
      code: "failed",
      error: caught.message,
      retryable: caught.status >= 500,
    }
  }
  if (isAbortOrNetwork(caught))
    return {
      code: "unreachable",
      error: "Could not reach Higgsfield. Check your connection and try again.",
      retryable: true,
    }
  return {
    code: "failed",
    error: caught instanceof Error ? caught.message : String(caught),
    retryable: false,
  }
}

function isAbortOrNetwork(caught: unknown): boolean {
  if (!(caught instanceof Error)) return false
  return (
    caught.name === "TimeoutError" ||
    caught.name === "AbortError" ||
    (caught instanceof TypeError && /fetch/i.test(caught.message))
  )
}
