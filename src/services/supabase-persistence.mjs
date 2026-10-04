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
