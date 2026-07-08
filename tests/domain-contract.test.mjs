import assert from "node:assert/strict";
import test from "node:test";
import { reportCategories, reportStatuses } from "../src/lib/domain-constants.mjs";
import { seedReports } from "../src/data/seed-reports.mjs";
import {
  getReportById,
  getReportStats,
  listReports,
  listReportsByCategory,
  listReportsByStatus
} from "../src/services/report-service.mjs";
import { resolveRoute } from "../src/server/routes.mjs";

test("initial categories use citizen-facing labels", () => {
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
  const categorySlugs = new Set(reportCategories.map((category) => category.slug));
  const statusSlugs = new Set(reportStatuses.map((status) => status.slug));

  for (const report of seedReports) {
    assert.equal(categorySlugs.has(report.category), true, `${report.id} has unknown category`);
    assert.equal(statusSlugs.has(report.status), true, `${report.id} has unknown status`);
  }
});

test("report service lists, filters and finds reports", () => {
  assert.equal(listReports().length, seedReports.length);
  assert.equal(getReportById("report-pv-001")?.title.includes("Bache"), true);
  assert.equal(listReportsByCategory("bache").length, 1);
  assert.equal(listReportsByCategory("Bache").length, 1);
  assert.equal(listReportsByStatus("validated").length, 4);
  assert.equal(listReports({ category: "calle-peligrosa", status: "new" }).length, 1);
});

test("report stats calculate totals and date range", () => {
  const stats = getReportStats();

  assert.equal(stats.totalReports, seedReports.length);
  assert.equal(stats.byCategory.bache, 1);
  assert.equal(stats.byStatus.validated, 4);
  assert.equal(stats.byPriority.urgent, 2);
  assert.equal(stats.oldestReportCreatedAt, "2026-07-01T15:20:00.000Z");
  assert.equal(stats.newestReportCreatedAt, "2026-07-07T18:22:00.000Z");
});

test("health route reports local data model status", () => {
  const route = resolveRoute("GET", "/health");
  const body = JSON.parse(route.body);

  assert.equal(route.statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(body.status, "local-data-model");
  assert.equal(body.reports, seedReports.length);
});

test("reports route returns all reports and report details", () => {
  const allReportsRoute = resolveRoute("GET", "/api/reports");
  const allReportsBody = JSON.parse(allReportsRoute.body);
  const detailRoute = resolveRoute("GET", "/api/reports?id=report-pv-004");
  const detailBody = JSON.parse(detailRoute.body);

  assert.equal(allReportsRoute.statusCode, 200);
  assert.equal(allReportsBody.count, seedReports.length);
  assert.equal(detailRoute.statusCode, 200);
  assert.equal(detailBody.report.category, "fuga-de-agua");
});

test("reports route filters by category and status", () => {
  const categoryRoute = resolveRoute("GET", "/api/reports?category=alumbrado");
  const categoryBody = JSON.parse(categoryRoute.body);
  const statusRoute = resolveRoute("GET", "/api/reports?status=new");
  const statusBody = JSON.parse(statusRoute.body);

  assert.equal(categoryBody.count, 1);
  assert.equal(categoryBody.reports[0].id, "report-pv-002");
  assert.equal(statusBody.count, 3);
});

test("stats route returns basic report statistics", () => {
  const route = resolveRoute("GET", "/api/stats");
  const body = JSON.parse(route.body);

  assert.equal(route.statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(body.stats.totalReports, seedReports.length);
  assert.equal(body.stats.byStatus.validated, 4);
});
