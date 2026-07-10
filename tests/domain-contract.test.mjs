import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import { reportCategories, reportStatuses } from "../src/lib/domain-constants.mjs";
import { seedReports } from "../src/data/seed-reports.mjs";
import {
  createReport,
  getReportById,
  getReportStats,
  listReports,
  listReportsByCategory,
  listReportsByStatus,
  updateReportStatus,
  validateStatusUpdateInput,
  validateReportInput,
  validateReportStatusUpdate
} from "../src/services/report-service.mjs";
import {
  loadReportOverrides,
  loadRuntimeReports,
  saveReportOverrides,
  saveRuntimeReports
} from "../src/services/runtime-report-store.mjs";
import { handleRequest, readRequestBody } from "../src/server/index.mjs";
import { resolveRoute } from "../src/server/routes.mjs";

const tempDir = mkdtempSync(path.join(tmpdir(), "calle-habla-tests-"));
process.env.LCH_RUNTIME_REPORTS_FILE = path.join(tempDir, "reports.json");
process.env.LCH_REPORT_OVERRIDES_FILE = path.join(tempDir, "report-overrides.json");

test.after(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function resetRuntimeReports(reports = []) {
  saveRuntimeReports(reports);
  saveReportOverrides([]);
}

function validReportInput(overrides = {}) {
  return {
    title: "Bache nuevo frente a tienda",
    description: "Hay un bache profundo frente a la tienda y varios carros frenan de golpe para esquivarlo.",
    category: "bache",
    locationText: "Calle principal frente a tienda de abarrotes",
    neighborhood: "Versalles",
    priority: "high",
    evidenceCount: 1,
    citizenAlias: "Vecino prueba",
    ...overrides
  };
}

test("initial categories use citizen-facing labels", () => {
  resetRuntimeReports();
  const categoryNames = reportCategories.map((category) => category.name);

  assert.ok(categoryNames.includes("Bache"));
  assert.ok(categoryNames.includes("Basura"));
  assert.ok(categoryNames.includes("Fuga de agua"));
  assert.ok(categoryNames.includes("Alumbrado"));
  assert.ok(categoryNames.includes("Arbol obstruyendo"));
  assert.ok(categoryNames.includes("Ruido excesivo"));
  assert.ok(categoryNames.includes("Semaforo fallando"));
  assert.ok(categoryNames.includes("Otro"));
});

test("statuses describe platform workflow without promising government resolution", () => {
  resetRuntimeReports();
  const statusSlugs = reportStatuses.map((status) => status.slug);
  const allStatusText = reportStatuses
    .map((status) => `${status.name} ${status.description}`)
    .join(" ")
    .toLowerCase();

  assert.deepEqual(statusSlugs, [
    "new",
    "in_review",
    "validated",
    "needs_info",
    "duplicate",
    "closed"
  ]);
  assert.equal(allStatusText.includes("gobierno resolvera"), false);
  assert.equal(allStatusText.includes("resuelto por autoridad"), false);
});

test("seed reports exist and include required fields", () => {
  resetRuntimeReports();
  const requiredFields = [
    "id",
    "title",
    "description",
    "category",
    "status",
    "priority",
    "locationText",
    "neighborhood",
    "zone",
    "createdAt",
    "updatedAt",
    "source",
    "evidenceCount",
    "citizenAlias"
  ];

  assert.ok(seedReports.length >= 10);

  for (const report of seedReports) {
    for (const field of requiredFields) {
      assert.notStrictEqual(report[field], undefined, `${report.id} missing ${field}`);
      assert.notStrictEqual(report[field], "", `${report.id} empty ${field}`);
    }
  }
});

test("seed reports use known categories and statuses", () => {
  resetRuntimeReports();
  const categorySlugs = new Set(reportCategories.map((category) => category.slug));
  const statusSlugs = new Set(reportStatuses.map((status) => status.slug));

  for (const report of seedReports) {
    assert.equal(categorySlugs.has(report.category), true, `${report.id} has unknown category`);
    assert.equal(statusSlugs.has(report.status), true, `${report.id} has unknown status`);
  }
});

test("report service lists, filters and finds reports", () => {
  resetRuntimeReports();
  assert.equal(listReports().length, seedReports.length);
  assert.equal(getReportById("report-pv-001")?.title.includes("Bache"), true);
  assert.equal(listReportsByCategory("bache").length, 1);
  assert.equal(listReportsByCategory("Bache").length, 1);
  assert.equal(listReportsByStatus("validated").length, 4);
  assert.equal(listReports({ category: "calle-peligrosa", status: "new" }).length, 1);
});

test("report stats calculate totals and date range", () => {
  resetRuntimeReports();
  const stats = getReportStats();

  assert.equal(stats.totalReports, seedReports.length);
  assert.equal(stats.byCategory.bache, 1);
  assert.equal(stats.byStatus.validated, 4);
  assert.equal(stats.byPriority.urgent, 2);
  assert.equal(stats.oldestReportCreatedAt, "2026-07-01T15:20:00.000Z");
  assert.equal(stats.newestReportCreatedAt, "2026-07-07T18:22:00.000Z");
});

test("health route reports local data model status", () => {
  resetRuntimeReports();
  const route = resolveRoute("GET", "/health");
  const body = JSON.parse(route.body);

  assert.equal(route.statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(body.status, "local-persistence");
  assert.equal(body.reports, seedReports.length);
});

test("admin route returns local HTML view", () => {
  resetRuntimeReports();
  const route = resolveRoute("GET", "/admin");
  const headRoute = resolveRoute("HEAD", "/admin");

  assert.equal(route.statusCode, 200);
  assert.equal(headRoute.statusCode, 200);
  assert.equal(route.headers["content-type"], "text/html; charset=utf-8");
  assert.equal(route.body.includes("La Calle Habla"), true);
  assert.equal(route.body.includes("Panel local de reportes ciudadanos"), true);
  assert.equal(route.body.includes("No es un sistema oficial de gobierno"), true);
  assert.equal(route.body.includes('id="report-form"'), true);
  assert.equal(route.body.includes('id="report-detail-panel"'), true);
  assert.equal(route.body.includes('id="status-select"'), true);
  assert.equal(route.body.includes("Actualizar estado"), true);
  assert.equal(route.body.includes("Este cambio solo actualiza el seguimiento interno local"), true);
  assert.equal(route.body.includes("function selectReport"), true);
  assert.equal(route.body.includes('fetchJson("/api/reports"'), true);
  assert.equal(route.body.includes('method: "PATCH"'), true);
});

test("report detail route returns local HTML view", () => {
  resetRuntimeReports();
  const route = resolveRoute("GET", "/admin/report?id=report-pv-001");
  const headRoute = resolveRoute("HEAD", "/admin/report?id=report-pv-001");

  assert.equal(route.statusCode, 200);
  assert.equal(headRoute.statusCode, 200);
  assert.equal(route.headers["content-type"], "text/html; charset=utf-8");
  assert.equal(route.body.includes("Detalle local de reporte ciudadano"), true);
  assert.equal(route.body.includes("Seguimiento administrativo local"), true);
  assert.equal(route.body.includes('id="status-form"'), true);
  assert.equal(route.body.includes('method: "PATCH"'), true);
  assert.equal(route.body.includes("Este cambio solo actualiza el seguimiento interno local"), true);
  assert.equal(route.body.includes("No es un sistema oficial de gobierno"), true);
});

test("admin route does not break health or API routes", () => {
  resetRuntimeReports();
  const adminRoute = resolveRoute("GET", "/admin");
  const healthRoute = resolveRoute("GET", "/health");
  const reportsRoute = resolveRoute("GET", "/api/reports");
  const statsRoute = resolveRoute("GET", "/api/stats");

  assert.equal(adminRoute.statusCode, 200);
  assert.equal(JSON.parse(healthRoute.body).ok, true);
  assert.equal(JSON.parse(reportsRoute.body).count, seedReports.length);
  assert.equal(JSON.parse(statsRoute.body).stats.totalReports, seedReports.length);
});

test("reports route returns all reports and report details", () => {
  resetRuntimeReports();
  const allReportsRoute = resolveRoute("GET", "/api/reports");
  const allReportsBody = JSON.parse(allReportsRoute.body);
  const detailRoute = resolveRoute("GET", "/api/reports?id=report-pv-004");
  const detailBody = JSON.parse(detailRoute.body);

  assert.equal(allReportsRoute.statusCode, 200);
  assert.equal(allReportsBody.count, seedReports.length);
  assert.equal(detailRoute.statusCode, 200);
  assert.equal(detailBody.report.category, "fuga-de-agua");
});

test("updateReportStatus persists local status override for seed reports without changing seed", () => {
  resetRuntimeReports();
  const seedBefore = seedReports.find((report) => report.id === "report-pv-001");
  const result = updateReportStatus(
    "report-pv-001",
    {
      status: "in_review"
    },
    {
      now: "2026-07-09T12:00:00.000Z"
    }
  );
  const updated = getReportById("report-pv-001");
  const stats = getReportStats();

  assert.equal(result.ok, true);
  assert.equal(updated.status, "in_review");
  assert.equal(updated.updatedAt, "2026-07-09T12:00:00.000Z");
  assert.equal(loadReportOverrides().length, 1);
  assert.equal(seedBefore.status, "validated");
  assert.equal(seedBefore.updatedAt, "2026-07-02T18:10:00.000Z");
  assert.equal(stats.byStatus.validated, 3);
  assert.equal(stats.byStatus.in_review, 3);
});

test("updateReportStatus persists local status override for runtime reports", () => {
  resetRuntimeReports();
  createReport(validReportInput(), {
    id: "report-local-status-001",
    now: "2026-07-09T10:00:00.000Z"
  });

  const result = updateReportStatus(
    "report-local-status-001",
    {
      status: "needs_info"
    },
    {
      now: "2026-07-09T12:30:00.000Z"
    }
  );
  const updated = getReportById("report-local-status-001");

  assert.equal(result.ok, true);
  assert.equal(updated.status, "needs_info");
  assert.equal(updated.createdAt, "2026-07-09T10:00:00.000Z");
  assert.equal(updated.updatedAt, "2026-07-09T12:30:00.000Z");
  assert.equal(updated.source, "manual");
});

test("validateStatusUpdateInput rejects invalid status and non-status fields", () => {
  resetRuntimeReports();
  const forbiddenFields = [
    "id",
    "category",
    "source",
    "createdAt",
    "updatedAt",
    "title",
    "description",
    "locationText",
    "priority",
    "evidenceCount"
  ];

  assert.equal(validateStatusUpdateInput({ status: "validated" }).ok, true);
  assert.equal(validateReportStatusUpdate({ status: "validated" }).ok, true);
  assert.equal(validateReportStatusUpdate({ status: "officially_resolved" }).ok, false);

  for (const field of forbiddenFields) {
    assert.equal(validateStatusUpdateInput({ status: "new", [field]: "blocked" }).ok, false);
  }
});

test("PATCH /api/reports updates seed status and GET routes reflect overrides", () => {
  resetRuntimeReports();
  const patchRoute = resolveRoute("PATCH", "/api/reports?id=report-pv-002", {
    body: {
      status: "validated"
    }
  });
  const patchBody = JSON.parse(patchRoute.body);
  const detailRoute = resolveRoute("GET", "/api/reports?id=report-pv-002");
  const detailBody = JSON.parse(detailRoute.body);
  const statusRoute = resolveRoute("GET", "/api/reports?status=validated");
  const statusBody = JSON.parse(statusRoute.body);
  const statsRoute = resolveRoute("GET", "/api/stats");
  const statsBody = JSON.parse(statsRoute.body);

  assert.equal(patchRoute.statusCode, 200);
  assert.equal(patchBody.report.status, "validated");
  assert.equal(detailBody.report.status, "validated");
  assert.equal(statusBody.reports.some((report) => report.id === "report-pv-002"), true);
  assert.equal(statsBody.stats.byStatus.validated, 5);
  assert.equal(statsBody.stats.byStatus.in_review, 1);
});

test("PATCH /api/reports updates runtime status", () => {
  resetRuntimeReports();
  createReport(validReportInput(), {
    id: "report-local-status-002",
    now: "2026-07-09T10:00:00.000Z"
  });

  const patchRoute = resolveRoute("PATCH", "/api/reports?id=report-local-status-002", {
    body: {
      status: "closed"
    }
  });
  const patchBody = JSON.parse(patchRoute.body);
  const detailRoute = resolveRoute("GET", "/api/reports?id=report-local-status-002");
  const detailBody = JSON.parse(detailRoute.body);

  assert.equal(patchRoute.statusCode, 200);
  assert.equal(patchBody.report.status, "closed");
  assert.equal(detailBody.report.status, "closed");
});

test("PATCH /api/reports rejects missing id, missing report, invalid status and forbidden fields", () => {
  resetRuntimeReports();
  const missingIdRoute = resolveRoute("PATCH", "/api/reports", {
    body: { status: "validated" }
  });
  const missingReportRoute = resolveRoute("PATCH", "/api/reports?id=missing-report", {
    body: { status: "validated" }
  });
  const invalidStatusRoute = resolveRoute("PATCH", "/api/reports?id=report-pv-001", {
    body: { status: "officially_resolved" }
  });
  const forbiddenFieldRoute = resolveRoute("PATCH", "/api/reports?id=report-pv-001", {
    body: { status: "validated", title: "No debe permitir cambiar titulo" }
  });

  assert.equal(missingIdRoute.statusCode, 400);
  assert.equal(JSON.parse(missingIdRoute.body).error, "missing_report_id");
  assert.equal(missingReportRoute.statusCode, 404);
  assert.equal(JSON.parse(missingReportRoute.body).error, "report_not_found");
  assert.equal(invalidStatusRoute.statusCode, 400);
  assert.equal(JSON.parse(invalidStatusRoute.body).error, "validation_failed");
  assert.equal(forbiddenFieldRoute.statusCode, 400);
  assert.equal(JSON.parse(forbiddenFieldRoute.body).errors[0].field, "title");
});

test("PATCH /api/reports rejects invalid JSON", () => {
  resetRuntimeReports();
  const invalidJsonRoute = resolveRoute("PATCH", "/api/reports?id=report-pv-001", {
    rawBody: "{",
    headers: {
      "content-type": "application/json"
    }
  });

  assert.equal(invalidJsonRoute.statusCode, 400);
  assert.equal(JSON.parse(invalidJsonRoute.body).error, "invalid_json");
});

test("reports route filters by category and status", () => {
  resetRuntimeReports();
  const categoryRoute = resolveRoute("GET", "/api/reports?category=alumbrado");
  const categoryBody = JSON.parse(categoryRoute.body);
  const statusRoute = resolveRoute("GET", "/api/reports?status=new");
  const statusBody = JSON.parse(statusRoute.body);

  assert.equal(categoryBody.count, 1);
  assert.equal(categoryBody.reports[0].id, "report-pv-002");
  assert.equal(statusBody.count, 3);
});

test("stats route returns basic report statistics", () => {
  resetRuntimeReports();
  const route = resolveRoute("GET", "/api/stats");
  const body = JSON.parse(route.body);

  assert.equal(route.statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(body.stats.totalReports, seedReports.length);
  assert.equal(body.stats.byStatus.validated, 4);
});

test("createReport creates a valid local report and persists it", () => {
  resetRuntimeReports();
  const result = createReport(validReportInput(), {
    id: "report-local-test-001",
    now: "2026-07-09T10:00:00.000Z"
  });

  assert.equal(result.ok, true);
  assert.equal(result.report.id, "report-local-test-001");
  assert.equal(result.report.status, "new");
  assert.equal(result.report.source, "manual");
  assert.equal(result.report.category, "bache");
  assert.equal(loadRuntimeReports().length, 1);
  assert.equal(listReports().length, seedReports.length + 1);
  assert.equal(getReportById("report-local-test-001")?.title, "Bache nuevo frente a tienda");
});

test("created reports affect stats and filters", () => {
  resetRuntimeReports();
  createReport(validReportInput({ category: "Fuga de agua", priority: "urgent" }), {
    id: "report-local-test-002",
    now: "2026-07-09T11:00:00.000Z"
  });

  const stats = getReportStats();

  assert.equal(stats.totalReports, seedReports.length + 1);
  assert.equal(stats.byCategory["fuga-de-agua"], 2);
  assert.equal(stats.byStatus.new, 4);
  assert.equal(stats.byPriority.urgent, 3);
  assert.equal(listReportsByCategory("fuga-de-agua").length, 2);
  assert.equal(listReportsByStatus("new").length, 4);
});

test("validateReportInput rejects invalid input", () => {
  resetRuntimeReports();
  assert.equal(validateReportInput(validReportInput({ title: "" })).ok, false);
  assert.equal(validateReportInput(validReportInput({ description: "Muy corto" })).ok, false);
  assert.equal(validateReportInput(validReportInput({ category: "categoria-falsa" })).ok, false);
  assert.equal(validateReportInput(validReportInput({ priority: "extreme" })).ok, false);
  assert.equal(validateReportInput(validReportInput({ evidenceCount: 21 })).ok, false);
  assert.equal(validateReportInput(validReportInput({ evidenceCount: 1.5 })).ok, false);
});

test("createReport rejects user-controlled generated fields", () => {
  resetRuntimeReports();
  const result = createReport(
    validReportInput({
      id: "report-forged",
      status: "validated",
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-01-01T00:00:00.000Z"
    })
  );

  assert.equal(result.ok, false);
  assert.deepEqual(
    result.errors.map((error) => error.field),
    ["id", "status", "createdAt", "updatedAt"]
  );
});

test("createReport keeps local source manual and rejects whatsapp source", () => {
  resetRuntimeReports();
  const result = createReport(validReportInput({ source: "whatsapp" }));

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.field === "source"), true);
});

test("POST /api/reports creates a report visible in GET routes", () => {
  resetRuntimeReports();
  const postRoute = resolveRoute("POST", "/api/reports", {
    body: validReportInput({ category: "category-pothole" })
  });
  const postBody = JSON.parse(postRoute.body);
  const allReportsRoute = resolveRoute("GET", "/api/reports");
  const allReportsBody = JSON.parse(allReportsRoute.body);
  const detailRoute = resolveRoute("GET", `/api/reports?id=${postBody.report.id}`);
  const detailBody = JSON.parse(detailRoute.body);

  assert.equal(postRoute.statusCode, 201);
  assert.equal(postBody.ok, true);
  assert.equal(postBody.report.status, "new");
  assert.equal(postBody.report.source, "manual");
  assert.equal(allReportsBody.count, seedReports.length + 1);
  assert.equal(detailBody.report.id, postBody.report.id);
});

test("POST /api/reports rejects invalid JSON and validation failures", () => {
  resetRuntimeReports();
  const invalidJsonRoute = resolveRoute("POST", "/api/reports", {
    rawBody: "{",
    headers: {
      "content-type": "application/json"
    }
  });
  const validationRoute = resolveRoute("POST", "/api/reports", {
    body: validReportInput({ category: "categoria-falsa" })
  });

  assert.equal(invalidJsonRoute.statusCode, 400);
  assert.equal(JSON.parse(invalidJsonRoute.body).error, "invalid_json");
  assert.equal(validationRoute.statusCode, 400);
  assert.equal(JSON.parse(validationRoute.body).error, "validation_failed");
});

test("request body reader rejects payloads over the configured limit", async () => {
  const request = Readable.from([Buffer.from("123456")]);
  const result = await readRequestBody(request, 5);

  assert.equal(result.ok, false);
  assert.equal(result.route.statusCode, 413);
  assert.equal(JSON.parse(result.route.body).error, "payload_too_large");
});

test("PATCH /api/reports rejects payloads over the server limit", async () => {
  resetRuntimeReports();
  const request = Readable.from([Buffer.alloc(33 * 1024, "x")]);
  request.method = "PATCH";
  request.url = "/api/reports?id=report-pv-001";
  request.headers = {
    "content-type": "application/json"
  };

  const route = await handleRequest(request);

  assert.equal(route.statusCode, 413);
  assert.equal(JSON.parse(route.body).error, "payload_too_large");
});

test("report overrides store saves and loads status overrides", () => {
  resetRuntimeReports();
  saveReportOverrides([
    {
      reportId: "report-pv-001",
      status: "in_review",
      updatedAt: "2026-07-09T12:00:00.000Z"
    }
  ]);

  assert.deepEqual(loadReportOverrides(), [
    {
      reportId: "report-pv-001",
      status: "in_review",
      updatedAt: "2026-07-09T12:00:00.000Z"
    }
  ]);
});
