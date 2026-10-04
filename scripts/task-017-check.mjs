import { existsSync } from "node:fs";
import { resolve } from "node:path";

const required = [
  "src/services/supabase-persistence.mjs",
  "src/integrations/supabase/supabase-rest.mjs",
  "supabase/migrations/20261003_task_017_persistence_hardening.sql"
];

for (const file of required) {
  if (!existsSync(resolve(file))) throw new Error(`TASK-017 missing: ${file}`);
}

const service = await import("../src/services/supabase-persistence.mjs");
for (const key of [
  "isSupabaseConfigured",
  "insertReportToSupabase",
  "insertReportEvidenceToSupabase",
  "insertReportHistoryToSupabase"
]) {
  if (typeof service[key] !== "function") {
    throw new Error(`TASK-017 missing export: ${key}`);
  }
}

const migration = await import("node:fs/promises").then((fs) =>
  fs.readFile(resolve("supabase/migrations/20261003_task_017_persistence_hardening.sql"), "utf8")
);

for (const token of [
  "reports_created_at_idx",
  "reports_location_details_gin_idx",
  "SUPABASE_SERVICE_ROLE_KEY",
  "does NOT enable institutional communication"
]) {
  if (!migration.includes(token)) throw new Error(`TASK-017 migration missing: ${token}`);
}

console.log("TASK-017 CHECK OK");
