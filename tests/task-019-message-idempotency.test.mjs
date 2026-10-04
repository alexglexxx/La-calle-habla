import test from "node:test";
import assert from "node:assert/strict";

test("TASK-019 durable idempotency boundary exists", async () => {
  const module = await import("../src/services/supabase-message-idempotency.mjs");
  assert.equal(typeof module.claimProcessedMessage, "function");
  assert.equal(typeof module.completeProcessedMessage, "function");
  assert.equal(typeof module.failProcessedMessage, "function");
});

test("TASK-019 idempotency safely skips without Supabase credentials", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const previousBucket = process.env.SUPABASE_REPORT_BUCKET;

  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_REPORT_BUCKET;

  const { claimProcessedMessage, completeProcessedMessage, failProcessedMessage } =
    await import("../src/services/supabase-message-idempotency.mjs");

  const message = {
    messageId: "wamid-task-019-test",
    provider: "meta_whatsapp",
    type: "text",
    timestamp: new Date().toISOString()
  };

  assert.deepEqual(await claimProcessedMessage(message), {
    ok: true,
    skipped: true,
    state: "not_configured"
  });
  assert.equal((await completeProcessedMessage(message.messageId)).skipped, true);
  assert.equal((await failProcessedMessage(message.messageId, "test")).skipped, true);

  if (previousUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = previousUrl;
  if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  if (previousBucket === undefined) delete process.env.SUPABASE_REPORT_BUCKET;
  else process.env.SUPABASE_REPORT_BUCKET = previousBucket;
});
