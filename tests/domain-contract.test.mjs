import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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
  INTERNAL_NOTE_MAX_LENGTH,
  listReportHistory,
  listReports,
  listReportsByCategory,
  listReportsByStatus,
  PRIVACY_NOTICE_VERSION,
  updateReportStatus,
  validateStatusUpdateInput,
  validateReportInput,
  validateReportStatusUpdate
} from "../src/services/report-service.mjs";
import {
  generatePhoneId,
  groupNearbyPoints,
  handleIncomingCitizenMessage,
  haversineMeters,
  normalizeReference,
  resolveWrittenLocation
} from "../src/services/report-intake-service.mjs";
import {
  loadReportIntakeSessions,
  loadReportHistory,
  loadReportOverrides,
  loadRuntimeReports,
  saveReportIntakeSessions,
  saveReportHistory,
  saveReportOverrides,
  saveRuntimeReports
} from "../src/services/runtime-report-store.mjs";
import { handleRequest, readRequestBody } from "../src/server/index.mjs";
import { isAdminAuthorized, isAdminRoute } from "../src/server/admin-auth.mjs";
import { resolveRoute } from "../src/server/routes.mjs";

const tempDir = mkdtempSync(path.join(tmpdir(), "calle-habla-tests-"));
process.env.LCH_RUNTIME_REPORTS_FILE = path.join(tempDir, "reports.json");
process.env.LCH_REPORT_OVERRIDES_FILE = path.join(tempDir, "report-overrides.json");
process.env.LCH_REPORT_HISTORY_FILE = path.join(tempDir, "report-history.json");
process.env.LCH_REPORT_INTAKE_SESSIONS_FILE = path.join(tempDir, "report-intake-sessions.json");

test.after(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function resetRuntimeReports(reports = []) {
  saveRuntimeReports(reports);
  saveReportOverrides([]);
  saveReportHistory([]);
  saveReportIntakeSessions([]);
}

const reporterIdSecret = "test-reporter-secret-for-task-010";

function validReportInput(overrides = {}) {
  return {
    title: "Bache nuevo frente a tienda",
    description: "Hay un bache profundo frente a la tienda y varios carros frenan de golpe para esquivarlo.",
    category: "bache",
    locationText: "Calle principal frente a tienda de abarrotes",
    neighborhood: "Versalles",
    priority: "high",
    evidenceCount: 0,
    citizenAlias: "Vecino prueba",
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    privacyAcknowledged: true,
    sensitiveDataConsent: false,
    ...overrides
  };
}

function intakeMessage(overrides = {}) {
  return {
    provider: "test",
    senderReference: "+52 322 000 0101",
    messageId: `msg-${Math.random().toString(36).slice(2)}`,
    timestamp: "2026-07-13T10:00:00.000Z",
    type: "action",
    action: { id: "continue_anonymous" },
    ...overrides
  };
}

function intakeAction(overrides = {}) {
  return intakeMessage({
    type: "action",
    action: { id: "continue_anonymous" },
    ...overrides
  });
}

function intakePhoto(overrides = {}) {
  return intakeMessage({
    messageId: "photo-message",
    type: "image",
    image: {
      mediaId: "safe-photo-ref",
      mimeType: "image/jpeg",
      sizeBytes: 120000
    },
    ...overrides
  });
}

function intakeLocation(overrides = {}) {
  return intakeMessage({
    messageId: "location-message",
    type: "location",
    location: {
      latitude: 20.6534,
      longitude: -105.2258,
      name: "Av Mexico y Fluvial Vallarta",
      address: "Puerto Vallarta"
    },
    ...overrides
  });
}

function intakeText(body, overrides = {}) {
  return intakeMessage({
    messageId: "text-message",
    type: "text",
    text: { body },
    ...overrides
  });
}

function runIntake(message, overrides = {}) {
  return handleIncomingCitizenMessage(message, {
    reporterIdSecret,
    ...overrides
  });
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
  assert.equal(
    route.body.includes(
      "Usaremos la información únicamente para registrar y revisar este reporte dentro de La Calle Habla."
    ),
    true
  );
  assert.equal(route.body.includes("enviar un reporte no garantiza su resolución"), true);
  assert.equal(route.body.includes("Ver explicación ampliada de privacidad"), true);
  assert.equal(route.body.includes('id="privacy-acknowledged"'), true);
  assert.equal(route.body.includes('id="sensitive-data-consent"'), true);
  assert.equal(route.body.includes('id="privacy-acknowledged" name="privacyAcknowledged" type="checkbox" checked'), false);
  assert.equal(route.body.includes("Telefono de contacto (opcional sensible)"), true);
  assert.equal(route.body.includes("Precision de ubicacion"), true);
  assert.equal(route.body.includes("Evidencias (opcional sensible)"), true);
  assert.equal(route.body.includes("Debes reconocer el aviso antes de enviar el reporte."), true);
  assert.equal(route.body.includes("privacyNoticeVersion"), true);
  assert.equal(route.body.includes("maskPhone(report.contactPhone)"), true);
  assert.equal(route.body.includes("Dato sensible"), true);
  assert.equal(
    route.body.includes("Consulta únicamente los datos necesarios para revisar el reporte."),
    true
  );
  assert.equal(route.body.includes('id="report-form"'), true);
  assert.equal(route.body.includes('id="report-detail-panel"'), true);
  assert.equal(route.body.includes('id="status-select"'), true);
  assert.equal(route.body.includes("Actualizar estado"), true);
  assert.equal(route.body.includes("Este cambio solo actualiza el seguimiento interno local"), true);
  assert.equal(route.body.includes("Historial interno"), true);
  assert.equal(
    route.body.includes(
      "Este historial corresponde al seguimiento interno de La Calle Habla y no representa una resolución oficial."
    ),
    true
  );
  assert.equal(route.body.includes('id="note-form"'), true);
  assert.equal(route.body.includes('id="note-text"'), true);
  assert.equal(route.body.includes("Sin historial interno por ahora."), true);
  assert.equal(route.body.includes("escapeHtml(event.note)"), true);
  assert.equal(route.body.includes("function selectReport"), true);
  assert.equal(route.body.includes('fetchJson("/api/reports"'), true);
  assert.equal(route.body.includes('fetchJson("/api/report-history?id="'), true);
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
  assert.equal(route.body.includes('id="note-form"'), true);
  assert.equal(route.body.includes("Historial interno"), true);
  assert.equal(route.body.includes("Sin historial interno por ahora."), true);
  assert.equal(route.body.includes("escapeHtml(event.note)"), true);
  assert.equal(route.body.includes('method: "PATCH"'), true);
  assert.equal(route.body.includes("Este cambio solo actualiza el seguimiento interno local"), true);
  assert.equal(route.body.includes("No es un sistema oficial de gobierno"), true);
  assert.equal(route.body.includes("Registro histórico sin consentimiento versionado"), true);
  assert.equal(route.body.includes("Dato sensible"), true);
  assert.equal(
    route.body.includes("Consulta únicamente los datos necesarios para revisar el reporte."),
    true
  );
});

test("admin privacy UI is mobile-first and avoids horizontal overflow structures", () => {
  resetRuntimeReports();
  const route = resolveRoute("GET", "/admin");

  assert.equal(route.body.includes('name="viewport" content="width=device-width, initial-scale=1"'), true);
  assert.equal(route.body.includes("box-sizing: border-box"), true);
  assert.equal(route.body.includes("width: min(1180px, 100%)"), true);
  assert.equal(route.body.includes("grid-template-columns: repeat(2, minmax(0, 1fr))"), true);
  assert.equal(route.body.includes("overflow-x"), false);
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

test("phoneId uses HMAC and never includes original sender", () => {
  const first = generatePhoneId("+52 322 111 2233", { reporterIdSecret });
  const second = generatePhoneId("+52 322 111 2233", { reporterIdSecret });
  const differentSecret = generatePhoneId("+52 322 111 2233", {
    reporterIdSecret: "another-test-reporter-secret"
  });

  assert.equal(first, second);
  assert.notEqual(first, differentSecret);
  assert.equal(first.includes("322"), false);
  assert.equal(first.length, 64);
  assert.throws(() => generatePhoneId("+52 322 111 2233"), /REPORTER_ID_SECRET/);
});

test("anonymous intake privacy acceptance stores mvp-1 without phone number", () => {
  resetRuntimeReports();
  const result = runIntake(intakeAction({ messageId: "privacy-001" }), {
    now: "2026-07-13T10:00:00.000Z"
  });
  const sessions = loadReportIntakeSessions();
  const stored = JSON.stringify(sessions);

  assert.equal(result.ok, true);
  assert.equal(result.reply.text.includes("Envía una foto"), true);
  assert.equal(sessions[0].privacyNoticeVersion, PRIVACY_NOTICE_VERSION);
  assert.equal(sessions[0].privacyAcknowledgedAt, "2026-07-13T10:00:00.000Z");
  assert.equal(stored.includes("+52"), false);
  assert.equal(stored.includes("322 000 0101"), false);
  assert.equal(stored.includes("user-agent"), false);
});

test("photo followed by shared location completes anonymous report", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "a-privacy" }), { now: "2026-07-13T10:00:00.000Z" });
  const photo = runIntake(intakePhoto({ messageId: "a-photo" }), {
    now: "2026-07-13T10:01:00.000Z"
  });
  const completed = runIntake(intakeLocation({ messageId: "a-location" }), {
    now: "2026-07-13T10:02:00.000Z"
  });
  const report = completed.report;

  assert.equal(photo.report, undefined);
  assert.equal(photo.reply.text, "Comparte la ubicación o escribe la calle, cruce, colonia o una referencia.");
  assert.equal(completed.ok, true);
  assert.equal(completed.reply.text.includes("Listo, recibimos tu reporte"), true);
  assert.equal(completed.reply.text.includes("denuncia oficial"), true);
  assert.equal(/report-local-|[a-f0-9]{64}|\+52|322 000/.test(completed.reply.text), false);
  assert.equal(report.source, "whatsapp");
  assert.equal(report.classificationStatus, "pending_classification");
  assert.equal(report.category, "otro");
  assert.equal(report.locationDetails.resolutionStatus, "exact");
  assert.equal(report.locationDetails.confidence, "high");
  assert.equal(report.locationDetails.source, "whatsapp_shared");
  assert.equal(report.photoReference.mimeType, "image/jpeg");
  assert.equal(listReports().some((item) => item.id === report.id), true);
});

test("shared location followed by photo completes anonymous report", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "b-privacy" }));
  const location = runIntake(intakeLocation({ messageId: "b-location" }));
  const completed = runIntake(intakePhoto({ messageId: "b-photo" }));

  assert.equal(location.reply.text, "Ahora envía una foto del problema.");
  assert.equal(completed.report.locationDetails.resolutionStatus, "exact");
});

test("photo followed by written streets completes with pending location", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "c-privacy" }));
  runIntake(intakePhoto({ messageId: "c-photo" }));
  const completed = runIntake(intakeText("Calle Juarez frente a la secundaria", {
    messageId: "c-reference"
  }));

  assert.equal(completed.report.locationDetails.source, "written_reference");
  assert.equal(completed.report.locationDetails.resolutionStatus, "pending");
  assert.equal(completed.report.locationDetails.originalReference, "Calle Juarez frente a la secundaria");
});

test("written streets followed by photo completes anonymous report", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "d-privacy" }));
  const text = runIntake(intakeText("Colonia Versalles cerca del parque", { messageId: "d-reference" }));
  const completed = runIntake(intakePhoto({ messageId: "d-photo" }));

  assert.equal(text.reply.text, "Ahora envía una foto del problema.");
  assert.equal(completed.report.locationDetails.originalReference, "Colonia Versalles cerca del parque");
});

test("single required part does not complete report", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "e-privacy" }));
  const photoOnly = runIntake(intakePhoto({ messageId: "e-photo" }));

  assert.equal(photoOnly.report, undefined);
  assert.equal(listReports().length, seedReports.length);
});

test("optional description updates same completed report without creating another", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "f-privacy" }), { now: "2026-07-13T10:00:00.000Z" });
  runIntake(intakePhoto({ messageId: "f-photo" }), { now: "2026-07-13T10:01:00.000Z" });
  const completed = runIntake(intakeLocation({ messageId: "f-location" }), {
    now: "2026-07-13T10:02:00.000Z"
  });
  const described = runIntake(intakeText("<b>Hay vidrios cerca</b>", { messageId: "f-description" }), {
    now: "2026-07-13T10:03:00.000Z"
  });
  const report = getReportById(completed.report.id);

  assert.equal(described.reply.text, "Listo, agregamos ese detalle al mismo reporte.");
  assert.equal(report.description, "<b>Hay vidrios cerca</b>");
  assert.equal(listReports().filter((item) => item.intakeSource === "fast_anonymous_report").length, 1);
});

test("intake validates image mime, size and safe media id", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "g-privacy" }));
  const svg = runIntake(intakePhoto({
    messageId: "g-svg",
    image: { mediaId: "photo-svg", mimeType: "image/svg+xml", sizeBytes: 1000 }
  }));
  const pathMedia = runIntake(intakePhoto({
    messageId: "g-path",
    image: { mediaId: "../secret", mimeType: "image/jpeg", sizeBytes: 1000 }
  }));

  assert.equal(svg.ok, false);
  assert.equal(pathMedia.ok, false);
  assert.equal(listReports().length, seedReports.length);
});

test("intake validates shared coordinates", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "h-privacy" }));
  const invalid = runIntake(intakeLocation({
    messageId: "h-location",
    location: { latitude: 100, longitude: -200 }
  }));

  assert.equal(invalid.ok, false);
  assert.equal(invalid.errors.some((error) => error.includes("latitude")), true);
});

test("message id idempotency prevents duplicate reports and repeated media/location processing", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "i-privacy" }));
  const photo = intakePhoto({ messageId: "i-photo" });
  runIntake(photo);
  runIntake(photo);
  const location = intakeLocation({ messageId: "i-location" });
  const first = runIntake(location);
  const second = runIntake(location);

  assert.equal(first.report.id, second.report.id);
  assert.equal(second.duplicate, true);
  assert.equal(listReports().filter((report) => report.intakeSource === "fast_anonymous_report").length, 1);
});

test("sessions persist, one incomplete session is reused and expiration clears incomplete session", () => {
  resetRuntimeReports();
  runIntake(intakeAction({ messageId: "j-privacy" }), { now: "2026-07-13T10:00:00.000Z" });
  runIntake(intakePhoto({ messageId: "j-photo" }), { now: "2026-07-13T10:01:00.000Z" });

  assert.equal(loadReportIntakeSessions().length, 1);

  const resumed = runIntake(intakeLocation({ messageId: "j-location" }), {
    now: "2026-07-13T10:05:00.000Z"
  });

  assert.equal(resumed.report.locationDetails.resolutionStatus, "exact");

  runIntake(intakeAction({
    senderReference: "+52 322 000 0199",
    messageId: "expired-privacy"
  }), { now: "2026-07-13T11:00:00.000Z" });
  runIntake(intakePhoto({
    senderReference: "+52 322 000 0199",
    messageId: "expired-photo"
  }), { now: "2026-07-13T11:01:00.000Z" });
  runIntake(intakeAction({
    senderReference: "+52 322 000 0200",
    messageId: "cleanup-trigger"
  }), { now: "2026-07-13T11:30:00.000Z" });

  assert.equal(
    loadReportIntakeSessions().some((session) => session.processedMessages?.some((item) => item.messageId === "expired-photo")),
    false
  );
});

test("reference normalization handles accents, abbreviations and reversed crossings", () => {
  assert.equal(normalizeReference("México y Fluvial"), normalizeReference("Fluvial y Mexico"));
  assert.equal(normalizeReference("Avenida México con Fluvial"), normalizeReference("Av. Mexico y Fluvial"));
  assert.equal(normalizeReference("Colonia Versalles"), normalizeReference("Col. versalles"));
});

test("haversine and grouping keep distant points out of local group", () => {
  const base = { latitude: 20.6534, longitude: -105.2258 };
  const near = { latitude: 20.65345, longitude: -105.22582 };
  const far = { latitude: 20.7, longitude: -105.3 };
  const distance = haversineMeters(base, near);
  const groups = groupNearbyPoints([base, near, far], 150);

  assert.equal(distance < 10, true);
  assert.equal(groups.length, 2);
  assert.equal(groups.some((group) => group.count === 2), true);
});

test("written location inference uses consistent local antecedents only", () => {
  resetRuntimeReports();
  createReport(validReportInput({
    title: "Antecedente uno",
    locationText: "Av Mexico y Fluvial",
    evidenceCount: 1,
    sensitiveDataConsent: true
  }), {
    id: "report-antecedent-001",
    now: "2026-07-13T09:00:00.000Z",
    source: "whatsapp",
    extraFields: {
      locationDetails: {
        source: "whatsapp_shared",
        originalReference: "Av Mexico y Fluvial",
        normalizedReference: normalizeReference("Av Mexico y Fluvial"),
        latitude: 20.6534,
        longitude: -105.2258,
        resolutionStatus: "exact",
        confidence: "high"
      }
    }
  });
  createReport(validReportInput({
    title: "Antecedente dos",
    locationText: "Fluvial y Mexico",
    evidenceCount: 1,
    sensitiveDataConsent: true
  }), {
    id: "report-antecedent-002",
    now: "2026-07-13T09:05:00.000Z",
    source: "whatsapp",
    extraFields: {
      locationDetails: {
        source: "whatsapp_shared",
        originalReference: "Fluvial y Mexico",
        normalizedReference: normalizeReference("Fluvial y Mexico"),
        latitude: 20.65345,
        longitude: -105.22582,
        resolutionStatus: "exact",
        confidence: "high"
      }
    }
  });

  const inferred = resolveWrittenLocation("México y Fluvial");
  const unknown = resolveWrittenLocation("Calle larga sin colonia");

  assert.equal(inferred.resolutionStatus, "inferred");
  assert.equal(inferred.confidence, "high");
  assert.equal(inferred.source, "inferred_from_reports");
  assert.equal(inferred.supportingReportCount, 2);
  assert.equal(unknown.resolutionStatus, "pending");
  assert.equal(unknown.confidence, "unknown");
});

test("single or contradictory candidates do not invent coordinates", () => {
  resetRuntimeReports();
  createReport(validReportInput({
    title: "Antecedente unico",
    locationText: "Calle Unica y Parque",
    evidenceCount: 1,
    sensitiveDataConsent: true
  }), {
    id: "report-antecedent-single",
    now: "2026-07-13T09:00:00.000Z",
    source: "whatsapp",
    extraFields: {
      locationDetails: {
        source: "whatsapp_shared",
        originalReference: "Calle Unica y Parque",
        normalizedReference: normalizeReference("Calle Unica y Parque"),
        latitude: 20.1,
        longitude: -105.1,
        resolutionStatus: "exact",
        confidence: "high"
      }
    }
  });

  const single = resolveWrittenLocation("Parque y Calle Unica");

  assert.equal(single.resolutionStatus, "pending");
  assert.equal(single.latitude, undefined);
  assert.equal(single.confidence, "low");
});

test("rate limiting counts only completed reports and separates users", () => {
  resetRuntimeReports();

  function complete(senderReference, prefix, hour = "10") {
    runIntake(intakeAction({ senderReference, messageId: `${prefix}-privacy` }), {
      now: `2026-07-13T${hour}:00:00.000Z`
    });
    runIntake(intakePhoto({ senderReference, messageId: `${prefix}-photo` }), {
      now: `2026-07-13T${hour}:01:00.000Z`
    });
    return runIntake(intakeLocation({ senderReference, messageId: `${prefix}-location` }), {
      now: `2026-07-13T${hour}:02:00.000Z`
    });
  }

  complete("+52 322 000 0300", "r1");
  complete("+52 322 000 0300", "r2");
  complete("+52 322 000 0300", "r3");
  const limited = runIntake(intakeAction({
    senderReference: "+52 322 000 0300",
    messageId: "r4-privacy"
  }), { now: "2026-07-13T10:20:00.000Z" });
  const otherUser = complete("+52 322 000 0301", "other");
  const released = runIntake(intakeAction({
    senderReference: "+52 322 000 0300",
    messageId: "r5-privacy"
  }), { now: "2026-07-13T12:00:00.000Z" });

  assert.equal(limited.rateLimited, true);
  assert.equal(limited.reply.text.includes("Espera un poco"), true);
  assert.equal(otherUser.ok, true);
  assert.equal(released.rateLimited, undefined);
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

test("historical runtime reports without privacy fields remain readable", () => {
  resetRuntimeReports([
    {
      id: "report-local-historical-001",
      title: "Reporte historico local",
      description: "Reporte creado antes del aviso versionado de privacidad.",
      category: "bache",
      status: "new",
      priority: "normal",
      locationText: "Referencia general historica",
      neighborhood: "Centro",
      zone: "Centro",
      createdAt: "2026-07-10T10:00:00.000Z",
      updatedAt: "2026-07-10T10:00:00.000Z",
      source: "manual",
      evidenceCount: 0,
      citizenAlias: "Vecino historico"
    }
  ]);

  const report = getReportById("report-local-historical-001");
  const route = resolveRoute("GET", "/api/reports?id=report-local-historical-001");
  const body = JSON.parse(route.body);

  assert.equal(report.privacyNoticeVersion, undefined);
  assert.equal(route.statusCode, 200);
  assert.equal(body.report.id, "report-local-historical-001");
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
  assert.equal(result.changed, true);
  assert.equal(result.historyEvent.type, "status_change");
  assert.equal(result.historyEvent.reportId, "report-pv-001");
  assert.equal(result.historyEvent.previousStatus, "validated");
  assert.equal(result.historyEvent.newStatus, "in_review");
  assert.equal(result.historyEvent.createdAt, "2026-07-09T12:00:00.000Z");
  assert.equal(updated.status, "in_review");
  assert.equal(updated.updatedAt, "2026-07-09T12:00:00.000Z");
  assert.equal(loadReportOverrides().length, 1);
  assert.equal(loadReportHistory().length, 1);
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

test("internal notes can be added without changing status", () => {
  resetRuntimeReports();
  const result = updateReportStatus(
    "report-pv-001",
    {
      note: "Se reviso evidencia local sin cambiar el estado."
    },
    {
      now: "2026-07-10T08:00:00.000Z",
      eventId: "history-test-note-001"
    }
  );
  const event = loadReportHistory()[0];

  assert.equal(result.ok, true);
  assert.equal(result.changed, false);
  assert.equal(result.historyEvent.type, "internal_note");
  assert.equal(result.report.status, "validated");
  assert.equal(loadReportOverrides().length, 0);
  assert.deepEqual(event, {
    id: "history-test-note-001",
    reportId: "report-pv-001",
    type: "internal_note",
    createdAt: "2026-07-10T08:00:00.000Z",
    actor: "local_admin",
    note: "Se reviso evidencia local sin cambiar el estado."
  });
});

test("same status without note does not create misleading history", () => {
  resetRuntimeReports();
  const result = updateReportStatus(
    "report-pv-001",
    {
      status: "validated"
    },
    {
      now: "2026-07-10T08:30:00.000Z"
    }
  );

  assert.equal(result.ok, true);
  assert.equal(result.noop, true);
  assert.equal(result.changed, false);
  assert.equal(result.historyEvent, null);
  assert.equal(loadReportHistory().length, 0);
  assert.equal(loadReportOverrides().length, 0);
});

test("same status with note records internal note instead of fake status change", () => {
  resetRuntimeReports();
  const result = updateReportStatus(
    "report-pv-001",
    {
      status: "validated",
      note: "Se conserva el estado por ahora."
    },
    {
      now: "2026-07-10T09:00:00.000Z"
    }
  );
  const event = loadReportHistory()[0];

  assert.equal(result.ok, true);
  assert.equal(result.changed, false);
  assert.equal(event.type, "internal_note");
  assert.equal(event.note, "Se conserva el estado por ahora.");
  assert.equal(event.previousStatus, undefined);
  assert.equal(event.newStatus, undefined);
  assert.equal(loadReportOverrides().length, 0);
});

test("status change with note stores note on status_change event", () => {
  resetRuntimeReports();
  const result = updateReportStatus(
    "report-pv-001",
    {
      status: "needs_info",
      note: "Falta una referencia mas clara."
    },
    {
      now: "2026-07-10T09:30:00.000Z"
    }
  );
  const event = loadReportHistory()[0];

  assert.equal(result.ok, true);
  assert.equal(event.type, "status_change");
  assert.equal(event.previousStatus, "validated");
  assert.equal(event.newStatus, "needs_info");
  assert.equal(event.note, "Falta una referencia mas clara.");
});

test("history remains independent per report and returns deterministic order", () => {
  resetRuntimeReports();
  updateReportStatus("report-pv-001", { note: "Nota dos" }, {
    now: "2026-07-10T11:00:00.000Z",
    eventId: "history-b"
  });
  updateReportStatus("report-pv-002", { note: "Otra nota" }, {
    now: "2026-07-10T10:30:00.000Z",
    eventId: "history-other"
  });
  updateReportStatus("report-pv-001", { status: "in_review" }, {
    now: "2026-07-10T10:00:00.000Z",
    eventId: "history-a"
  });

  const events = listReportHistory("report-pv-001");

  assert.deepEqual(
    events.map((event) => event.id),
    ["history-a", "history-b"]
  );
  assert.equal(events.every((event) => event.reportId === "report-pv-001"), true);
});

test("history persists after service reads storage again", () => {
  resetRuntimeReports();
  updateReportStatus("report-pv-001", { note: "Nota persistente" }, {
    now: "2026-07-10T12:00:00.000Z",
    eventId: "history-persisted"
  });

  assert.equal(loadReportHistory().length, 1);
  assert.equal(listReportHistory("report-pv-001")[0].id, "history-persisted");
});

test("invalid status and missing report do not create history", () => {
  resetRuntimeReports();
  const invalidStatus = updateReportStatus("report-pv-001", { status: "officially_resolved" });
  const missingReport = updateReportStatus("missing-report", { note: "No debe guardarse" });

  assert.equal(invalidStatus.ok, false);
  assert.equal(missingReport.notFound, true);
  assert.equal(loadReportHistory().length, 0);
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
  assert.equal(validateStatusUpdateInput({ note: "Seguimiento interno" }).ok, true);
  assert.equal(validateStatusUpdateInput({}).ok, false);
  assert.equal(validateStatusUpdateInput({ note: "   " }).ok, false);
  assert.equal(validateStatusUpdateInput({ note: "x".repeat(INTERNAL_NOTE_MAX_LENGTH + 1) }).ok, false);
  assert.equal(validateStatusUpdateInput({ note: ["texto"] }).ok, false);
  assert.equal(validateStatusUpdateInput({ status: 12 }).ok, false);
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
  assert.equal(patchBody.historyEvent.type, "status_change");
  assert.equal(patchBody.historyEvent.previousStatus, "in_review");
  assert.equal(patchBody.historyEvent.newStatus, "validated");
  assert.equal(detailBody.report.status, "validated");
  assert.equal(statusBody.reports.some((report) => report.id === "report-pv-002"), true);
  assert.equal(statsBody.stats.byStatus.validated, 5);
  assert.equal(statsBody.stats.byStatus.in_review, 1);
});

test("PATCH /api/reports creates internal note events through API", () => {
  resetRuntimeReports();
  const patchRoute = resolveRoute("PATCH", "/api/reports?id=report-pv-001", {
    body: {
      note: "Nota <strong>interna</strong> sin HTML ejecutable."
    }
  });
  const patchBody = JSON.parse(patchRoute.body);
  const historyRoute = resolveRoute("GET", "/api/report-history?id=report-pv-001");
  const historyBody = JSON.parse(historyRoute.body);

  assert.equal(patchRoute.statusCode, 200);
  assert.equal(patchBody.historyEvent.type, "internal_note");
  assert.equal(patchBody.historyEvent.note, "Nota <strong>interna</strong> sin HTML ejecutable.");
  assert.equal(historyRoute.statusCode, 200);
  assert.equal(historyBody.count, 1);
  assert.equal(historyBody.events[0].note, "Nota <strong>interna</strong> sin HTML ejecutable.");
});

test("GET /api/report-history validates id, report existence and empty history", () => {
  resetRuntimeReports();
  const missingIdRoute = resolveRoute("GET", "/api/report-history");
  const missingReportRoute = resolveRoute("GET", "/api/report-history?id=missing-report");
  const emptyRoute = resolveRoute("GET", "/api/report-history?id=report-pv-001");
  const emptyBody = JSON.parse(emptyRoute.body);

  assert.equal(missingIdRoute.statusCode, 400);
  assert.equal(JSON.parse(missingIdRoute.body).error, "missing_report_id");
  assert.equal(missingReportRoute.statusCode, 404);
  assert.equal(JSON.parse(missingReportRoute.body).error, "report_not_found");
  assert.equal(emptyRoute.statusCode, 200);
  assert.equal(emptyBody.ok, true);
  assert.equal(emptyBody.reportId, "report-pv-001");
  assert.equal(emptyBody.count, 0);
  assert.deepEqual(emptyBody.events, []);
});

test("GET /api/report-history returns existing history in chronological order", () => {
  resetRuntimeReports();
  updateReportStatus("report-pv-001", { note: "Nota posterior" }, {
    now: "2026-07-11T12:00:00.000Z",
    eventId: "history-api-later"
  });
  updateReportStatus("report-pv-001", { status: "in_review" }, {
    now: "2026-07-11T10:00:00.000Z",
    eventId: "history-api-earlier"
  });

  const route = resolveRoute("GET", "/api/report-history?id=report-pv-001");
  const body = JSON.parse(route.body);

  assert.equal(route.statusCode, 200);
  assert.deepEqual(
    body.events.map((event) => event.id),
    ["history-api-earlier", "history-api-later"]
  );
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
  const emptyNoteRoute = resolveRoute("PATCH", "/api/reports?id=report-pv-001", {
    body: { note: "   " }
  });
  const longNoteRoute = resolveRoute("PATCH", "/api/reports?id=report-pv-001", {
    body: { note: "x".repeat(INTERNAL_NOTE_MAX_LENGTH + 1) }
  });
  const wrongNoteTypeRoute = resolveRoute("PATCH", "/api/reports?id=report-pv-001", {
    body: { note: { text: "No" } }
  });

  assert.equal(missingIdRoute.statusCode, 400);
  assert.equal(JSON.parse(missingIdRoute.body).error, "missing_report_id");
  assert.equal(missingReportRoute.statusCode, 404);
  assert.equal(JSON.parse(missingReportRoute.body).error, "report_not_found");
  assert.equal(invalidStatusRoute.statusCode, 400);
  assert.equal(JSON.parse(invalidStatusRoute.body).error, "validation_failed");
  assert.equal(forbiddenFieldRoute.statusCode, 400);
  assert.equal(JSON.parse(forbiddenFieldRoute.body).errors[0].field, "title");
  assert.equal(emptyNoteRoute.statusCode, 400);
  assert.equal(JSON.parse(emptyNoteRoute.body).errors[0].field, "note");
  assert.equal(longNoteRoute.statusCode, 400);
  assert.equal(JSON.parse(longNoteRoute.body).errors[0].field, "note");
  assert.equal(wrongNoteTypeRoute.statusCode, 400);
  assert.equal(JSON.parse(wrongNoteTypeRoute.body).errors[0].field, "note");
  assert.equal(loadReportHistory().length, 0);
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
  assert.equal(result.report.privacyNoticeVersion, PRIVACY_NOTICE_VERSION);
  assert.equal(result.report.privacyAcknowledged, true);
  assert.equal(result.report.privacyAcknowledgedAt, "2026-07-09T10:00:00.000Z");
  assert.equal(result.report.sensitiveDataConsent, false);
  assert.equal(loadRuntimeReports().length, 1);
  assert.equal(listReports().length, seedReports.length + 1);
  assert.equal(getReportById("report-local-test-001")?.title, "Bache nuevo frente a tienda");
});

test("createReport generates trusted privacy acknowledgement timestamp", () => {
  resetRuntimeReports();
  const result = createReport(
    validReportInput({
      privacyAcknowledgedAt: "1999-01-01T00:00:00.000Z"
    }),
    {
      id: "report-local-privacy-time-001",
      now: "2026-07-12T15:30:00.000Z"
    }
  );

  assert.equal(result.ok, true);
  assert.equal(result.report.privacyAcknowledgedAt, "2026-07-12T15:30:00.000Z");
});

test("createReport rejects missing acknowledgement and invalid privacy version", () => {
  resetRuntimeReports();
  const missingAcknowledgement = createReport(
    validReportInput({
      privacyAcknowledged: false
    })
  );
  const invalidVersion = createReport(
    validReportInput({
      privacyNoticeVersion: "old-version"
    })
  );

  assert.equal(missingAcknowledgement.ok, false);
  assert.equal(missingAcknowledgement.errors.some((error) => error.field === "privacyAcknowledged"), true);
  assert.equal(invalidVersion.ok, false);
  assert.equal(invalidVersion.errors.some((error) => error.field === "privacyNoticeVersion"), true);
});

test("sensitive optional data requires explicit consent only when present", () => {
  resetRuntimeReports();
  const noSensitive = createReport(validReportInput({ evidenceCount: 0, sensitiveDataConsent: false }), {
    id: "report-local-no-sensitive-001",
    now: "2026-07-12T16:00:00.000Z"
  });
  const withPhoneNoConsent = createReport(
    validReportInput({
      contactPhone: "322 123 4567",
      sensitiveDataConsent: false
    })
  );
  const withPreciseLocationNoConsent = createReport(
    validReportInput({
      locationPrecision: "precise",
      sensitiveDataConsent: false
    })
  );
  const withEvidenceNoConsent = createReport(
    validReportInput({
      evidenceCount: 1,
      sensitiveDataConsent: false
    })
  );
  const withSensitiveConsent = createReport(
    validReportInput({
      contactPhone: "322 123 4567",
      locationPrecision: "precise",
      evidenceCount: 2,
      sensitiveDataConsent: true
    }),
    {
      id: "report-local-sensitive-001",
      now: "2026-07-12T16:30:00.000Z"
    }
  );

  assert.equal(noSensitive.ok, true);
  assert.equal(noSensitive.report.containsSensitiveOptionalData, false);
  assert.equal(withPhoneNoConsent.ok, false);
  assert.equal(withPhoneNoConsent.errors.some((error) => error.field === "sensitiveDataConsent"), true);
  assert.equal(withPreciseLocationNoConsent.ok, false);
  assert.equal(withPreciseLocationNoConsent.errors.some((error) => error.field === "sensitiveDataConsent"), true);
  assert.equal(withEvidenceNoConsent.ok, false);
  assert.equal(withEvidenceNoConsent.errors.some((error) => error.field === "sensitiveDataConsent"), true);
  assert.equal(withSensitiveConsent.ok, true);
  assert.equal(withSensitiveConsent.report.sensitiveDataConsent, true);
  assert.equal(withSensitiveConsent.report.containsSensitiveOptionalData, true);
});

test("sensitive fields remain optional and invalid structures are rejected", () => {
  resetRuntimeReports();
  const noPhone = validateReportInput(validReportInput({ contactPhone: undefined }));
  const badPhone = validateReportInput(validReportInput({ contactPhone: "abc", sensitiveDataConsent: true }));
  const badPrecision = validateReportInput(validReportInput({ locationPrecision: "roof", sensitiveDataConsent: true }));
  const badConsentType = validateReportInput(validReportInput({ sensitiveDataConsent: "yes" }));
  const unexpectedField = validateReportInput(validReportInput({ password: "no debe aceptarse" }));

  assert.equal(noPhone.ok, true);
  assert.equal(badPhone.ok, false);
  assert.equal(badPhone.errors.some((error) => error.field === "contactPhone"), true);
  assert.equal(badPrecision.ok, false);
  assert.equal(badPrecision.errors.some((error) => error.field === "locationPrecision"), true);
  assert.equal(badConsentType.ok, false);
  assert.equal(badConsentType.errors.some((error) => error.field === "sensitiveDataConsent"), true);
  assert.equal(unexpectedField.ok, false);
  assert.equal(unexpectedField.errors.some((error) => error.field === "password"), true);
});

test("POST /api/reports enforces privacy contract", () => {
  resetRuntimeReports();
  const missingPrivacy = resolveRoute("POST", "/api/reports", {
    body: {
      ...validReportInput(),
      privacyAcknowledged: false
    }
  });
  const sensitiveWithoutConsent = resolveRoute("POST", "/api/reports", {
    body: validReportInput({
      contactPhone: "322 123 4567",
      sensitiveDataConsent: false
    })
  });
  const validSensitive = resolveRoute("POST", "/api/reports", {
    body: validReportInput({
      contactPhone: "322 123 4567",
      locationPrecision: "precise",
      sensitiveDataConsent: true
    })
  });
  const validBody = JSON.parse(validSensitive.body);

  assert.equal(missingPrivacy.statusCode, 400);
  assert.equal(JSON.parse(missingPrivacy.body).errors.some((error) => error.field === "privacyAcknowledged"), true);
  assert.equal(sensitiveWithoutConsent.statusCode, 400);
  assert.equal(JSON.parse(sensitiveWithoutConsent.body).errors.some((error) => error.field === "sensitiveDataConsent"), true);
  assert.equal(validSensitive.statusCode, 201);
  assert.equal(validBody.report.privacyNoticeVersion, PRIVACY_NOTICE_VERSION);
  assert.equal(validBody.report.sensitiveDataConsent, true);
});

test("internal notes do not automatically duplicate sensitive report data", () => {
  resetRuntimeReports();
  const created = createReport(
    validReportInput({
      contactPhone: "322 123 4567",
      description: "Reporte con telefono opcional y descripcion ciudadana.",
      sensitiveDataConsent: true
    }),
    {
      id: "report-local-sensitive-note-001",
      now: "2026-07-12T17:00:00.000Z"
    }
  );
  const updated = updateReportStatus("report-local-sensitive-note-001", {
    note: "Seguimiento interno sin copiar datos personales."
  });
  const event = updated.historyEvent;

  assert.equal(created.ok, true);
  assert.equal(updated.ok, true);
  assert.equal(event.note.includes("322"), false);
  assert.equal(event.note.includes("Reporte con telefono"), false);
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

test("admin routes stay local-only by default and require credentials on public hosts", () => {
  const originalRequired = process.env.ADMIN_AUTH_REQUIRED;
  const originalUsername = process.env.ADMIN_USERNAME;
  const originalPassword = process.env.ADMIN_PASSWORD;

  delete process.env.ADMIN_AUTH_REQUIRED;
  delete process.env.ADMIN_USERNAME;
  delete process.env.ADMIN_PASSWORD;

  assert.equal(isAdminRoute("/admin"), true);
  assert.equal(isAdminRoute("/admin/report"), true);
  assert.equal(isAdminRoute("/api/reports"), true);
  assert.equal(isAdminRoute("/api/stats"), true);
  assert.equal(isAdminRoute("/api/report-history"), true);
  assert.equal(isAdminRoute("/health"), false);
  assert.equal(isAdminAuthorized({ host: "127.0.0.1:3000" }), true);
  assert.equal(isAdminAuthorized({ host: "public.example.com" }), false);

  const unauthorized = resolveRoute("GET", "/admin", {
    headers: { host: "public.example.com" }
  });

  assert.equal(unauthorized.statusCode, 503);
  assert.equal(JSON.parse(unauthorized.body).error, "admin_auth_not_configured");

  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD = "test-password";

  const missingCredentials = resolveRoute("GET", "/admin", {
    headers: { host: "public.example.com" }
  });
  const authorizedHeader = "Basic " + Buffer.from("admin:test-password").toString("base64");
  const authorized = resolveRoute("GET", "/admin", {
    headers: {
      host: "public.example.com",
      authorization: authorizedHeader
    }
  });

  assert.equal(missingCredentials.statusCode, 401);
  assert.equal(JSON.parse(missingCredentials.body).error, "admin_auth_required");
  assert.equal(authorized.statusCode, 200);
  assert.match(authorized.headers["content-type"], /text\\/html/);

  if (originalRequired === undefined) delete process.env.ADMIN_AUTH_REQUIRED;
  else process.env.ADMIN_AUTH_REQUIRED = originalRequired;
  if (originalUsername === undefined) delete process.env.ADMIN_USERNAME;
  else process.env.ADMIN_USERNAME = originalUsername;
  if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalPassword;
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

test("report history store treats missing file as empty and validates saved events", () => {
  resetRuntimeReports();
  rmSync(process.env.LCH_REPORT_HISTORY_FILE, { force: true });

  assert.deepEqual(loadReportHistory(), []);

  saveReportHistory([
    {
      id: "history-store-001",
      reportId: "report-pv-001",
      type: "internal_note",
      createdAt: "2026-07-10T13:00:00.000Z",
      actor: "local_admin",
      note: "Seguimiento local guardado."
    }
  ]);

  assert.deepEqual(loadReportHistory(), [
    {
      id: "history-store-001",
      reportId: "report-pv-001",
      type: "internal_note",
      createdAt: "2026-07-10T13:00:00.000Z",
      actor: "local_admin",
      note: "Seguimiento local guardado."
    }
  ]);
});

test("report history rejects invalid stored event structure before use", () => {
  resetRuntimeReports();
  saveReportHistory([
    {
      id: "history-invalid-001",
      reportId: "report-pv-001",
      type: "internal_note",
      createdAt: "not-a-date",
      actor: "local_admin",
      note: "No debe usarse."
    }
  ]);

  assert.throws(() => listReportHistory("report-pv-001"), /invalid events/);
});

test("runtime history file remains ignored by Git rules", () => {
  const gitignore = readFileSync(".gitignore", "utf8");

  assert.equal(gitignore.includes("data/runtime/*.json"), true);
});
