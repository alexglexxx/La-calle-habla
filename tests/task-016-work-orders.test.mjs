import test from "node:test";
import assert from "node:assert/strict";
import { suggestAreaForReport, validateWorkOrderEvidence, createWorkOrder, transitionWorkOrder } from "../src/services/work-order-service.mjs";

test("suggests an operational area from report category", () => {
  assert.equal(suggestAreaForReport({ category: "bache" }).slug, "obras-publicas");
  assert.equal(suggestAreaForReport({ category: "fuga-de-agua" }).slug, "agua-drenaje");
});

test("accepts only supported evidence images up to 5MB", () => {
  assert.equal(validateWorkOrderEvidence({ mimeType: "image/jpeg", sizeBytes: 1000 }).ok, true);
  assert.equal(validateWorkOrderEvidence({ mimeType: "application/pdf", sizeBytes: 1000 }).ok, false);
  assert.equal(validateWorkOrderEvidence({ mimeType: "image/png", sizeBytes: 6 * 1024 * 1024 }).ok, false);
});

test("work-order lifecycle blocks skipping operational steps", () => {
  const created = createWorkOrder("missing-report", { areaSlug: "obras-publicas" }, { now: "2026-10-03T12:00:00.000Z", id: "TEST-WO" });
  assert.equal(created.ok, false);
});
