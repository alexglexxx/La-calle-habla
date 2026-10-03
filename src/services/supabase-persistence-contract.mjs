export const SUPABASE_PERSISTENCE_MODE = "supabase";

export const SUPABASE_TABLES = Object.freeze({
  reports: "reports",
  evidence: "report_evidence",
  history: "report_history",
  intakeSessions: "intake_sessions",
  processedMessages: "processed_messages"
});

export const SUPABASE_STORAGE_BUCKET = "report-evidence";

export function assertSupabasePersistenceConfiguration(env = process.env) {
  const missing = [];

  if (!String(env.SUPABASE_URL || "").trim()) missing.push("SUPABASE_URL");
  if (!String(env.SUPABASE_SERVICE_ROLE_KEY || "").trim()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!String(env.SUPABASE_REPORT_BUCKET || "").trim()) {
    missing.push("SUPABASE_REPORT_BUCKET");
  }

  return {
    ok: missing.length === 0,
    missing,
    bucket: String(env.SUPABASE_REPORT_BUCKET || SUPABASE_STORAGE_BUCKET).trim()
  };
}
