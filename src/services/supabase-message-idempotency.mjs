import { supabaseRestRequest } from "../integrations/supabase/supabase-rest.mjs";
import { getSupabaseConfig } from "../integrations/supabase/supabase-rest.mjs";

const PROCESSED_MESSAGES_PATH = "/rest/v1/processed_messages";

const STALE_PROCESSING_MS = 5 * 60 * 1000;

function configured() {
  return Boolean(getSupabaseConfig());
}

function isoMs(value) {
  const ms = Date.parse(value || "");
  return Number.isFinite(ms) ? ms : 0;
}

export async function claimProcessedMessage(message) {
  if (!configured()) {
    return { ok: true, skipped: true, state: "not_configured" };
  }

  const row = {
    message_id: message.messageId,
    phone_id: message.phoneId || null,
    provider: message.provider,
    report_id: null,
    status: "processing",
    payload: {
      type: message.type,
      timestamp: message.timestamp
    }
  };

  const inserted = await supabaseRestRequest(PROCESSED_MESSAGES_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=representation"
    },
    body: JSON.stringify(row)
  });

  if (Array.isArray(inserted) && inserted.length > 0) {
    return { ok: true, claimed: true, state: "processing" };
  }

  const existingRows = await supabaseRestRequest(
    PROCESSED_MESSAGES_PATH + "?message_id=eq." + encodeURIComponent(message.messageId) + "&select=*"
  );

  const existing = Array.isArray(existingRows) ? existingRows[0] : null;

  if (!existing) {
    return { ok: false, error: "processed_message_claim_missing" };
  }

  if (
    existing.status === "processing" &&
    Date.now() - isoMs(existing.first_seen_at) > STALE_PROCESSING_MS
  ) {
    await supabaseRestRequest(
      PROCESSED_MESSAGES_PATH + "?message_id=eq." + encodeURIComponent(message.messageId),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          phone_id: message.phoneId || existing.phone_id || null,
          provider: message.provider,
          status: "processing",
          processed_at: null,
          payload: {
            type: message.type,
            timestamp: message.timestamp,
            reclaimedAt: new Date().toISOString()
          }
        })
      }
    );

    return { ok: true, reclaimed: true, state: "processing" };
  }

  return {
    ok: true,
    duplicate: true,
    state: existing.status,
    reportId: existing.report_id || null
  };
}

export async function completeProcessedMessage(messageId, values = {}) {
  if (!configured()) {
    return { ok: true, skipped: true, reason: "supabase_not_configured" };
  }

  await supabaseRestRequest(
    PROCESSED_MESSAGES_PATH + "?message_id=eq." + encodeURIComponent(messageId),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        report_id: values.reportId || null,
        status: values.status || "processed",
        processed_at: new Date().toISOString(),
        payload: values.payload || null
      })
    }
  );

  return { ok: true, persisted: true };
}

export async function failProcessedMessage(messageId, errorMessage) {
  if (!configured()) {
    return { ok: true, skipped: true, reason: "supabase_not_configured" };
  }

  await supabaseRestRequest(
    PROCESSED_MESSAGES_PATH + "?message_id=eq." + encodeURIComponent(messageId),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        status: "failed",
        processed_at: new Date().toISOString(),
        payload: {
          error: String(errorMessage || "processing_failed").slice(0, 500)
        }
      })
    }
  );

  return { ok: true, persisted: true };
}
