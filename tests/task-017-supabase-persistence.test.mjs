import test from "node:test";
import assert from "node:assert/strict";
import {
  isSupabaseConfigured,
  insertReportToSupabase
} from "../src/services/supabase-persistence.mjs";

test("Supabase persistence is safely disabled without server credentials", () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  assert.equal(isSupabaseConfigured(), false);

  return insertReportToSupabase({ id: "test", createdAt: "2026-10-03T00:00:00.000Z" })
    .then((result) => {
      assert.deepEqual(result, {
        ok: false,
        skipped: true,
        reason: "supabase_not_configured"
      });
    })
    .finally(() => {
      if (previousUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    });
});
