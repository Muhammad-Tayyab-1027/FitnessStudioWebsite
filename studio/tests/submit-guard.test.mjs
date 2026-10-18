import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";

// Match the extensionless TypeScript imports accepted by Next.js.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error.code !== "ERR_MODULE_NOT_FOUND" || !specifier.startsWith(".")) throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});

const { createSubmitGuard, submissionKey } = await import("../generation/submit-guard.ts");
const { describeFailure } = await import("../generation/errors.ts");
const { MissingCredentialsError } = await import("../generation/credentials.ts");
const { PlatformError, createPlatformClient } = await import("../generation/platform.ts");

test("identical submissions inside the window share one platform request", async () => {
  const guard = createSubmitGuard(10_000);
  let calls = 0;
  const run = async () => ({ requestId: `req-${++calls}` });
  const key = submissionKey("key", "/model/path", { prompt: "gym promo" });

  const [a, b] = await Promise.all([guard(key, run, 0), guard(key, run, 500)]);
  assert.equal(calls, 1);
  assert.equal(a.requestId, b.requestId);

  const later = await guard(key, run, 20_000);
  assert.equal(calls, 2);
  assert.equal(later.requestId, "req-2");
});

test("different prompts, models or keys are not collapsed", () => {
  const base = submissionKey("key", "/a", { prompt: "x" });
  assert.notEqual(base, submissionKey("key", "/a", { prompt: "y" }));
  assert.notEqual(base, submissionKey("key", "/b", { prompt: "x" }));
  assert.notEqual(base, submissionKey("other", "/a", { prompt: "x" }));
  assert.ok(!base.includes("key"), "the API key is hashed, not embedded");
});

test("a failed submission is forgotten so a deliberate retry reaches the platform", async () => {
  const guard = createSubmitGuard(10_000);
  let calls = 0;
  const failing = async () => {
    calls++;
    throw new PlatformError(500, { detail: "boom" });
  };
  await assert.rejects(guard("k", failing, 0));
  await assert.rejects(guard("k", failing, 100));
  assert.equal(calls, 2);
});

test("failures map to user-facing codes and retryability", () => {
  assert.deepEqual(describeFailure(new MissingCredentialsError()).code, "missing_key");
  for (const status of [401, 403]) {
    const f = describeFailure(new PlatformError(status, {}));
    assert.equal(f.code, "invalid_key");
    assert.equal(f.retryable, false);
  }
  const limited = describeFailure(new PlatformError(429, {}));
  assert.equal(limited.code, "rate_limited");
  assert.equal(limited.retryable, true);
  assert.equal(describeFailure(new PlatformError(503, {})).retryable, true);
  assert.equal(describeFailure(new PlatformError(422, {})).retryable, false);
  const timeout = new Error("timed out");
  timeout.name = "TimeoutError";
  assert.equal(describeFailure(timeout).code, "unreachable");
});

test("validation detail lists become readable messages", async () => {
  const client = createPlatformClient({
    apiKey: "test_api_key",
    baseUrl: "https://api.example.test",
    fetch: async () =>
      new Response(
        JSON.stringify({ detail: [{ loc: ["body", "duration"], msg: "must be 5 or 10" }] }),
        { status: 422 }
      ),
  });
  await assert.rejects(client.submit("model/path", { prompt: "x" }), /duration: must be 5 or 10/);
});
