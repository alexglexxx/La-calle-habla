import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import {
  buildMetaSignature,
  extractIncomingCitizenMessages,
  extractPhoneNumberId,
  parseMetaWebhookPayload,
  verifyMetaChallenge,
  verifyMetaSignature
} from "../src/integrations/whatsapp/meta-webhook.mjs";
import { assertSupabasePersistenceConfiguration } from "../src/services/supabase-persistence-contract.mjs";

const payload = {
  object: "whatsapp_business_account",
  entry: [{
    id: "waba-test",
    changes: [{
      field: "messages",
      value: {
        metadata: {
          phone_number_id: "phone-test-001"
        },
        messages: [
          {
            from: "521000000000",
            id: "wamid.image-001",
            timestamp: "1760000000",
            image: {
              id: "media-001",
              mime_type: "image/jpeg",
              file_size: 120000
            }
          },
          {
            from: "521000000000",
            id: "wamid.location-001",
            timestamp: "1760000001",
            location: {
              latitude: 20.6534,
              longitude: -105.2258,
              name: "Fluvial"
            }
          },
          {
            from: "521000000000",
            id: "wamid.text-001",
            timestamp: "1760000002",
            text: {
              body: "Hay un bache aqui"
            }
          },
          {
            from: "521000000000",
            id: "wamid.action-001",
            timestamp: "1760000003",
            interactive: {
              button_reply: {
                id: "continue_anonymous",
                title: "Continuar"
              }
            }
          }
        ]
      }
    }]
  }]
};

test("Meta signature validates raw webhook payload", () => {
  const rawBody = JSON.stringify(payload);
  const secret = "task-012-test-secret";
  const signature = buildMetaSignature(rawBody, secret);

  assert.equal(
    signature,
    "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex")
  );
  assert.equal(verifyMetaSignature(rawBody, signature, secret), true);
  assert.equal(verifyMetaSignature(rawBody + "x", signature, secret), false);
});

test("Meta verification challenge requires the configured verify token", () => {
  assert.equal(
    verifyMetaChallenge({
      mode: "subscribe",
      verifyToken: "token-123",
      challenge: "challenge-456",
      expectedToken: "token-123"
    }),
    true
  );
  assert.equal(
    verifyMetaChallenge({
      mode: "subscribe",
      verifyToken: "wrong",
      challenge: "challenge-456",
      expectedToken: "token-123"
    }),
    false
  );
});

test("Meta payload normalizes into the La Calle Habla citizen-message contract", () => {
  const parsed = parseMetaWebhookPayload(payload);
  const messages = extractIncomingCitizenMessages(parsed);

  assert.ok(parsed);
  assert.equal(extractPhoneNumberId(parsed), "phone-test-001");
  assert.equal(messages.length, 4);
  assert.equal(messages[0].type, "image");
  assert.equal(messages[0].image.mediaId, "media-001");
  assert.equal(messages[1].type, "location");
  assert.equal(messages[2].type, "text");
  assert.equal(messages[3].type, "action");
  assert.equal(messages[3].action.id, "continue_anonymous");
  assert.equal(messages[0].provider, "meta_whatsapp");
  assert.equal(messages[0].senderReference, "521000000000");
});

test("Supabase configuration contract never accepts an incomplete server configuration", () => {
  const missing = assertSupabasePersistenceConfiguration({});
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.missing, [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_REPORT_BUCKET"
  ]);

  const configured = assertSupabasePersistenceConfiguration({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "server-only",
    SUPABASE_REPORT_BUCKET: "report-evidence"
  });

  assert.equal(configured.ok, true);
  assert.equal(configured.bucket, "report-evidence");
});
