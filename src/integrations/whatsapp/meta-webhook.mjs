import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_PATTERN = /^sha256=[a-f0-9]{64}$/i;
const DEFAULT_MAX_BODY_BYTES = 32 * 1024;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function epochToIso(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return new Date().toISOString();
  return new Date(seconds * 1000).toISOString();
}

export function buildMetaSignature(rawBody, appSecret) {
  return "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
}

export function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
  const signature = text(signatureHeader).toLowerCase();
  const secret = text(appSecret);
  if (!secret || !SIGNATURE_PATTERN.test(signature)) return false;

  const expectedBuffer = Buffer.from(buildMetaSignature(rawBody, secret));
  const actualBuffer = Buffer.from(signature);

  return expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer);
}

export function verifyMetaChallenge({ mode, verifyToken, challenge, expectedToken }) {
  return mode === "subscribe" &&
    text(expectedToken) !== "" &&
    text(verifyToken) === text(expectedToken) &&
    text(challenge) !== "";
}

export function parseMetaWebhookPayload(rawPayload) {
  if (!isRecord(rawPayload) || !Array.isArray(rawPayload.entry)) return null;
  return rawPayload;
}

function normalizeMessage(rawMessage) {
  if (!isRecord(rawMessage)) return null;

  const messageId = text(rawMessage.id);
  const senderReference = text(rawMessage.from);
  if (!messageId || !senderReference) return null;

  const timestamp = epochToIso(rawMessage.timestamp);

  if (isRecord(rawMessage.image) && text(rawMessage.image.id)) {
    const mimeType = text(rawMessage.image.mime_type) || "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return null;

    return {
      provider: "meta_whatsapp",
      senderReference,
      messageId,
      timestamp,
      type: "image",
      image: {
        mediaId: text(rawMessage.image.id),
        messageId,
        mimeType,
        ...(Number.isFinite(Number(rawMessage.image.file_size))
          ? { sizeBytes: Number(rawMessage.image.file_size) }
          : {})
      }
    };
  }

  if (isRecord(rawMessage.location)) {
    const latitude = Number(rawMessage.location.latitude);
    const longitude = Number(rawMessage.location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return null;
    }

    return {
      provider: "meta_whatsapp",
      senderReference,
      messageId,
      timestamp,
      type: "location",
      location: {
        latitude,
        longitude,
        ...(text(rawMessage.location.name) ? { name: text(rawMessage.location.name) } : {}),
        ...(text(rawMessage.location.address) ? { address: text(rawMessage.location.address) } : {})
      }
    };
  }

  if (isRecord(rawMessage.interactive) && isRecord(rawMessage.interactive.button_reply) &&
      text(rawMessage.interactive.button_reply.id)) {
    return {
      provider: "meta_whatsapp",
      senderReference,
      messageId,
      timestamp,
      type: "action",
      action: { id: text(rawMessage.interactive.button_reply.id) }
    };
  }

  if (isRecord(rawMessage.button) && text(rawMessage.button.payload)) {
    return {
      provider: "meta_whatsapp",
      senderReference,
      messageId,
      timestamp,
      type: "action",
      action: { id: text(rawMessage.button.payload) }
    };
  }

  if (isRecord(rawMessage.text) && text(rawMessage.text.body)) {
    return {
      provider: "meta_whatsapp",
      senderReference,
      messageId,
      timestamp,
      type: "text",
      text: { body: text(rawMessage.text.body) }
    };
  }

  return null;
}

export function extractIncomingCitizenMessages(payload) {
  const messages = [];

  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      for (const rawMessage of change?.value?.messages ?? []) {
        const normalized = normalizeMessage(rawMessage);
        if (normalized) messages.push(normalized);
      }
    }
  }

  return messages;
}

export function extractPhoneNumberId(payload) {
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const phoneNumberId = text(change?.value?.metadata?.phone_number_id);
      if (phoneNumberId) return phoneNumberId;
    }
  }
  return null;
}

export function getMetaRequestBodyLimit() {
  const configured = Number(process.env.META_WEBHOOK_MAX_BODY_BYTES);
  return Number.isInteger(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_BODY_BYTES;
}
