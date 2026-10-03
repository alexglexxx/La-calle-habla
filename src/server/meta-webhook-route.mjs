import {
  extractIncomingCitizenMessages,
  extractPhoneNumberId,
  getMetaRequestBodyLimit,
  parseMetaWebhookPayload,
  verifyMetaChallenge,
  verifyMetaSignature
} from "../integrations/whatsapp/meta-webhook.mjs";
import { handleIncomingCitizenMessage } from "../services/report-intake-service.mjs";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

export async function resolveMetaWebhook(method, requestUrl, options = {}) {
  const url = new URL(requestUrl, "http://127.0.0.1");

  if (method === "GET") {
    const verified = verifyMetaChallenge({
      mode: url.searchParams.get("hub.mode"),
      verifyToken: url.searchParams.get("hub.verify_token"),
      challenge: url.searchParams.get("hub.challenge"),
      expectedToken: process.env.META_WEBHOOK_VERIFY_TOKEN
    });

    if (!verified) return json(403, { ok: false, error: "forbidden" });

    return {
      statusCode: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
      body: url.searchParams.get("hub.challenge")
    };
  }

  if (method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

  const rawBody = String(options.rawBody || "");
  const appSecret = String(process.env.META_APP_SECRET || "");

  if (!verifyMetaSignature(
    rawBody,
    options.headers?.["x-hub-signature-256"],
    appSecret
  )) {
    return json(401, { ok: false, error: "invalid_signature" });
  }

  if (Buffer.byteLength(rawBody, "utf8") > getMetaRequestBodyLimit()) {
    return json(413, { ok: false, error: "payload_too_large" });
  }

  let rawPayload;

  try {
    rawPayload = JSON.parse(rawBody);
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const payload = parseMetaWebhookPayload(rawPayload);

  if (!payload) return json(400, { ok: false, error: "unsupported_payload" });

  const phoneNumberId = extractPhoneNumberId(payload);
  const messages = extractIncomingCitizenMessages(payload);
  const results = [];

  for (const message of messages) {
    const result = handleIncomingCitizenMessage(message);
    results.push({
      messageId: message.messageId,
      ok: result.ok,
      duplicate: Boolean(result.duplicate),
      reportId: result.report?.id || null
    });
  }

  return json(200, {
    ok: true,
    phoneNumberId,
    receivedMessages: messages.length,
    processedMessages: results.filter((item) => item.ok).length,
    results
  });
}
