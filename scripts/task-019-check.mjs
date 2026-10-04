import { existsSync } from "node:fs";

const required = [
  "src/services/supabase-message-idempotency.mjs",
  "tests/task-019-message-idempotency.test.mjs"
];

for (const file of required) {
  if (!existsSync(file)) throw new Error("TASK-019 missing file: " + file);
}

const source = await import("../src/services/supabase-message-idempotency.mjs");
for (const name of ["claimProcessedMessage", "completeProcessedMessage", "failProcessedMessage"]) {
  if (typeof source[name] !== "function") throw new Error("TASK-019 missing export: " + name);
}

console.log("TASK-019 structural check: PASS");
