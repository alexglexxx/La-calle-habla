import fs from "node:fs";
import assert from "node:assert/strict";

const required = [
  "src/services/whatsapp-evidence-service.mjs",
  "src/integrations/whatsapp/meta-media.mjs",
  "src/integrations/supabase/supabase-rest.mjs",
  "tests/task-020-evidence-pipeline.test.mjs"
];

for (const file of required) {
  assert.equal(fs.existsSync(file), true, "Missing required Task 020 file: " + file);
}

const source = fs.readFileSync("src/services/whatsapp-evidence-service.mjs", "utf8");

for (const token of [
  "getMetaMediaUrl",
  "downloadMetaMedia",
  "uploadSupabaseObject",
  "persistEvidence",
  "META_ACCESS_TOKEN",
  "report-evidence",
  "sha256",
  "detectImageSignature"
]) {
  assert.equal(source.includes(token), true, "Task 020 missing token: " + token);
}

console.log("Task 020 check passed.");
