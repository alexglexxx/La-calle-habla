import assert from "node:assert/strict";
import test from "node:test";

test("task 020 evidence pipeline exposes the expected production boundaries", async () => {
  const media = await import("../src/integrations/whatsapp/meta-media.mjs");
  const storage = await import("../src/integrations/supabase/supabase-rest.mjs");
  const evidence = await import("../src/services/whatsapp-evidence-service.mjs");

  assert.equal(typeof media.getMetaMediaUrl, "function");
  assert.equal(typeof media.downloadMetaMedia, "function");
  assert.equal(typeof storage.uploadSupabaseObject, "function");
  assert.equal(typeof evidence.persistWhatsAppEvidence, "function");
});

test("task 020 does not run without the server-only Meta access token", async () => {
  const previous = process.env.META_ACCESS_TOKEN;
  delete process.env.META_ACCESS_TOKEN;

  const { persistWhatsAppEvidence } = await import("../src/services/whatsapp-evidence-service.mjs");

  await assert.rejects(
    () => persistWhatsAppEvidence({
      reportId: "test-report",
      evidence: { mediaId: "media-1", messageId: "message-1" }
    }),
    /META_ACCESS_TOKEN/
  );

  if (previous === undefined) delete process.env.META_ACCESS_TOKEN;
  else process.env.META_ACCESS_TOKEN = previous;
});
