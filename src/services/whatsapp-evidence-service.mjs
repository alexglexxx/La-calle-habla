import crypto from "node:crypto";
import { getMetaMediaUrl, downloadMetaMedia } from "../integrations/whatsapp/meta-media.mjs";
import { uploadSupabaseObject } from "../integrations/supabase/supabase-rest.mjs";
import { findEvidenceByMediaId, persistEvidence } from "./supabase-persistence.mjs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EXTENSIONS = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
});

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getMetaAccessToken() {
  const token = text(process.env.META_ACCESS_TOKEN);
  if (!token) throw new Error("META_ACCESS_TOKEN is required for WhatsApp media.");
  return token;
}

function detectImageSignature(bytes) {
  if (!(bytes instanceof Uint8Array)) return null;
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return null;
}

function safeStorageKey(reportId, mediaId, mimeType) {
  const report = text(reportId);
  const media = text(mediaId);
  const extension = EXTENSIONS[mimeType];
  if (!report || !media || !extension) throw new Error("Invalid evidence identity.");
  const digest = crypto.createHash("sha256").update(media).digest("hex");
  return "reports/" + report + "/" + digest + "." + extension;
}

export async function persistWhatsAppEvidence({ reportId, evidence }) {
  if (!reportId || !evidence?.mediaId || !evidence?.messageId) {
    throw new Error("reportId, evidence.mediaId and evidence.messageId are required.");
  }

  const existing = await findEvidenceByMediaId(evidence.mediaId);
  if (existing?.storage_key) {
    return {
      ok: true,
      duplicate: true,
      reportId,
      storageKey: existing.storage_key,
      mimeType: existing.mime_type || null,
      sizeBytes: existing.size_bytes || null,
      sha256: existing.sha256 || null
    };
  }

  const accessToken = getMetaAccessToken();
  const media = await getMetaMediaUrl(evidence.mediaId, accessToken);

  if (media.fileSizeBytes !== null && media.fileSizeBytes > MAX_IMAGE_BYTES) {
    throw new Error("Media exceeds the configured maximum size.");
  }

  const downloaded = await downloadMetaMedia({
    mediaUrl: media.url,
    accessToken,
    maxBytes: MAX_IMAGE_BYTES
  });

  const detectedMime = detectImageSignature(downloaded.bytes);
  if (!detectedMime || detectedMime !== downloaded.mimeType) {
    throw new Error("Downloaded media failed image signature validation.");
  }

  if (media.mimeType && media.mimeType !== detectedMime) {
    throw new Error("Meta media MIME type does not match downloaded bytes.");
  }

  const sha256 = crypto.createHash("sha256").update(downloaded.bytes).digest("hex");
  const storageKey = safeStorageKey(reportId, evidence.mediaId, detectedMime);
  const bucket = text(process.env.SUPABASE_REPORT_BUCKET) || "report-evidence";

  await uploadSupabaseObject({
    bucket,
    storageKey,
    bytes: downloaded.bytes,
    contentType: detectedMime
  });

  await persistEvidence(reportId, {
    ...evidence,
    type: "photo",
    storageKey,
    mimeType: detectedMime,
    sizeBytes: downloaded.sizeBytes,
    sha256,
    metadata: {
      provider: "meta_whatsapp",
      verifiedMimeType: detectedMime,
      mediaLookupMimeType: media.mimeType,
      mediaLookupSizeBytes: media.fileSizeBytes
    }
  });

  return {
    ok: true,
    reportId,
    storageKey,
    mimeType: detectedMime,
    sizeBytes: downloaded.sizeBytes,
    sha256
  };
}
