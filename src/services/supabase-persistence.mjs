import { getSupabaseConfig, supabaseRestRequest } from "../integrations/supabase/supabase-rest.mjs";

const REPORTS_PATH = "/rest/v1/reports";
const EVIDENCE_PATH = "/rest/v1/report_evidence";
const HISTORY_PATH = "/rest/v1/report_history";

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

function asReportRow(report) {
  return {
    id: report.id,
    title: report.title,
    description: report.description,
    category: report.category,
    status: report.status,
    location_text: report.locationText || "",
    neighborhood: report.neighborhood || null,
    zone: report.zone || null,
    priority: report.priority || "normal",
    source: report.source || "manual",
    source_message_id: report.sourceMessageId || null,
    received_at: report.receivedAt || report.createdAt,
    validated_at: report.validatedAt || null,
    closed_at: report.closedAt || null,
    evidence_count: Number.isInteger(report.evidenceCount) ? report.evidenceCount : 0,
    citizen_alias: report.citizenAlias || null,
    anonymous_alias: report.anonymousAlias || null,
    phone_id: report.phoneId || null,
    location_precision: report.locationPrecision || "approximate",
    privacy_notice_version: report.privacyNoticeVersion || "mvp-1",
    privacy_acknowledged: report.privacyAcknowledged === true,
    privacy_acknowledged_at: report.privacyAcknowledgedAt || null,
    sensitive_data_consent: report.sensitiveDataConsent === true,
    contains_sensitive_optional_data: report.containsSensitiveOptionalData === true,
    classification_status: report.classificationStatus || null,
    intake_channel: report.intakeChannel || null,
    intake_source: report.intakeSource || null,
    location_details: report.locationDetails || null,
    location_resolution_summary: report.locationResolutionSummary || null,
    created_at: report.createdAt,
    updated_at: report.updatedAt
  };
}

export async function insertReportToSupabase(report) {
  if (!isSupabaseConfigured()) {
    return { ok: false, skipped: true, reason: "supabase_not_configured" };
  }

  const rows = await supabaseRestRequest(REPORTS_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(asReportRow(report))
  });

  return { ok: true, rows };
}

export async function findEvidenceByMediaId(mediaId) {
  if (!isSupabaseConfigured()) return null;
  const value = encodeURIComponent(String(mediaId || "").trim());
  if (!value) return null;

  const rows = await supabaseRestRequest(
    EVIDENCE_PATH + "?media_id=eq." + value + "&select=*&limit=1",
    { method: "GET" }
  );

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function insertReportEvidenceToSupabase(evidence) {
  if (!isSupabaseConfigured()) {
    return { ok: false, skipped: true, reason: "supabase_not_configured" };
  }

  const rows = await supabaseRestRequest(EVIDENCE_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(evidence)
  });

  return { ok: true, rows };
}

export async function insertReportHistoryToSupabase(event) {
  if (!isSupabaseConfigured()) {
    return { ok: false, skipped: true, reason: "supabase_not_configured" };
  }

  const rows = await supabaseRestRequest(HISTORY_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(event)
  });

  return { ok: true, rows };
}


export async function listReportsFromSupabase() {
  if (!isSupabaseConfigured()) return [];

  const select = [
    "id",
    "title",
    "description",
    "category",
    "status",
    "location_text",
    "neighborhood",
    "zone",
    "priority",
    "source",
    "evidence_count",
    "citizen_alias",
    "anonymous_alias",
    "location_precision",
    "classification_status",
    "intake_channel",
    "intake_source",
    "location_details",
    "location_resolution_summary",
    "created_at",
    "updated_at"
  ].join(",");

  const rows = await supabaseRestRequest(
    REPORTS_PATH +
      "?status=in.(new,in_review,validated,needs_info)" +
      "&select=" + encodeURIComponent(select) +
      "&order=created_at.desc",
    { method: "GET" }
  );

  return Array.isArray(rows)
    ? rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        status: row.status,
        locationText: row.location_text,
        neighborhood: row.neighborhood,
        zone: row.zone,
        priority: row.priority,
        source: row.source,
        evidenceCount: row.evidence_count,
        citizenAlias: row.citizen_alias,
        anonymousAlias: row.anonymous_alias,
        locationPrecision: row.location_precision,
        classificationStatus: row.classification_status,
        intakeChannel: row.intake_channel,
        intakeSource: row.intake_source,
        locationDetails: row.location_details,
        locationResolutionSummary: row.location_resolution_summary,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    : [];
}

export async function persistReportCreated(report) {
  if (!isSupabaseConfigured()) {
    return { ok: true, skipped: true, reason: "supabase_not_configured" };
  }

  try {
    await insertReportToSupabase(report);
    return { ok: true, persisted: true, reportId: report.id };
  } catch (error) {
    throw new Error(
      "Supabase report persistence failed: " +
      (error instanceof Error ? error.message : "Unexpected error.")
    );
  }
}

export async function persistEvidence(reportId, evidence) {
  if (!isSupabaseConfigured()) {
    return { ok: true, skipped: true, reason: "supabase_not_configured" };
  }

  const row = {
    report_id: reportId,
    type: evidence.type || "photo",
    storage_key: evidence.storageKey || null,
    mime_type: evidence.mimeType || null,
    size_bytes: Number.isInteger(evidence.sizeBytes) ? evidence.sizeBytes : null,
    sha256: evidence.sha256 || null,
    media_id: evidence.mediaId || null,
    message_id: evidence.messageId || null,
    caption: evidence.caption || null,
    captured_at: evidence.capturedAt || null,
    received_at: evidence.receivedAt || new Date().toISOString(),
    metadata: evidence.metadata || null
  };

  await insertReportEvidenceToSupabase(row);
  return { ok: true, persisted: true, reportId };
}

export async function persistHistoryEvent(event) {
  if (!isSupabaseConfigured()) {
    return { ok: true, skipped: true, reason: "supabase_not_configured" };
  }

  const row = {
    id: event.id,
    report_id: event.reportId,
    type: event.type,
    created_at: event.createdAt,
    actor: event.actor,
    note: event.note || null,
    previous_status: event.previousStatus || null,
    new_status: event.newStatus || null
  };

  await insertReportHistoryToSupabase(row);
  return { ok: true, persisted: true, reportId: event.reportId };
}
