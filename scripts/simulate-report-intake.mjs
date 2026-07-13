import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const tempDir = mkdtempSync(path.join(tmpdir(), "calle-habla-intake-sim-"));

process.env.REPORTER_ID_SECRET = "simulated-reporter-secret-for-task-010";
process.env.LCH_RUNTIME_REPORTS_FILE = path.join(tempDir, "reports.json");
process.env.LCH_REPORT_OVERRIDES_FILE = path.join(tempDir, "report-overrides.json");
process.env.LCH_REPORT_HISTORY_FILE = path.join(tempDir, "report-history.json");
process.env.LCH_REPORT_INTAKE_SESSIONS_FILE = path.join(tempDir, "report-intake-sessions.json");

const { handleIncomingCitizenMessage } = await import("../src/services/report-intake-service.mjs");
const { listReports } = await import("../src/services/report-service.mjs");

function message(overrides) {
  return {
    provider: "simulator",
    senderReference: "+52 322 000 0000",
    messageId: `sim-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    ...overrides
  };
}

function run(input) {
  const result = handleIncomingCitizenMessage(input);

  if (!result.ok) {
    throw new Error(`${result.error}: ${(result.errors || [result.message]).join(", ")}`);
  }

  console.log(result.reply.text);
  return result;
}

try {
  console.log("Escenario A: foto + ubicacion compartida");
  run(message({ messageId: "a-privacy", type: "action", action: { id: "continue_anonymous" } }));
  run(message({
    messageId: "a-photo",
    type: "image",
    image: { mediaId: "sim-photo-a", mimeType: "image/jpeg", sizeBytes: 120000 }
  }));
  const completedA = run(message({
    messageId: "a-location",
    type: "location",
    location: {
      latitude: 20.6534,
      longitude: -105.2258,
      name: "Av Mexico y Fluvial Vallarta",
      address: "Puerto Vallarta"
    }
  }));

  console.log("Escenario B: foto + calles escritas");
  run(message({
    senderReference: "+52 322 000 0001",
    messageId: "b-privacy",
    type: "action",
    action: { id: "continue_anonymous" }
  }));
  run(message({
    senderReference: "+52 322 000 0001",
    messageId: "b-photo",
    type: "image",
    image: { mediaId: "sim-photo-b", mimeType: "image/png", sizeBytes: 90000 }
  }));
  const completedB = run(message({
    senderReference: "+52 322 000 0001",
    messageId: "b-reference",
    type: "text",
    text: { body: "Calle Juarez frente a la secundaria" }
  }));

  console.log("Escenario C: referencia coincidente con antecedentes");
  run(message({
    senderReference: "+52 322 000 0002",
    messageId: "c-privacy",
    type: "action",
    action: { id: "continue_anonymous" }
  }));
  run(message({
    senderReference: "+52 322 000 0002",
    messageId: "c-location",
    type: "location",
    location: {
      latitude: 20.65345,
      longitude: -105.22582,
      name: "Fluvial y Mexico",
      address: "Puerto Vallarta"
    }
  }));
  run(message({
    senderReference: "+52 322 000 0002",
    messageId: "c-photo",
    type: "image",
    image: { mediaId: "sim-photo-c1", mimeType: "image/webp", sizeBytes: 100000 }
  }));
  run(message({
    senderReference: "+52 322 000 0003",
    messageId: "d-privacy",
    type: "action",
    action: { id: "continue_anonymous" }
  }));
  run(message({
    senderReference: "+52 322 000 0003",
    messageId: "d-location",
    type: "location",
    location: {
      latitude: 20.6535,
      longitude: -105.22585,
      name: "Av. México con Fluvial",
      address: "Puerto Vallarta"
    }
  }));
  run(message({
    senderReference: "+52 322 000 0003",
    messageId: "d-photo",
    type: "image",
    image: { mediaId: "sim-photo-c2", mimeType: "image/jpeg", sizeBytes: 100000 }
  }));
  run(message({
    senderReference: "+52 322 000 0004",
    messageId: "e-privacy",
    type: "action",
    action: { id: "continue_anonymous" }
  }));
  run(message({
    senderReference: "+52 322 000 0004",
    messageId: "e-photo",
    type: "image",
    image: { mediaId: "sim-photo-c3", mimeType: "image/jpeg", sizeBytes: 100000 }
  }));
  const completedC = run(message({
    senderReference: "+52 322 000 0004",
    messageId: "e-reference",
    type: "text",
    text: { body: "México y Fluvial" }
  }));

  const duplicate = run(message({
    senderReference: "+52 322 000 0004",
    messageId: "e-reference",
    type: "text",
    text: { body: "México y Fluvial" }
  }));

  const reports = listReports().filter((report) => report.intakeSource === "fast_anonymous_report");
  const replies = [completedA, completedB, completedC, duplicate].map((item) => item.reply.text).join("\n");

  if (reports.length < 5) {
    throw new Error("Expected simulated intake reports to be created.");
  }

  if (/report-local-|[a-f0-9]{64}|\+52|322 000/.test(replies)) {
    throw new Error("Simulator response leaked an internal id, phoneId or phone number.");
  }

  if (completedC.report.locationDetails.resolutionStatus !== "inferred") {
    throw new Error("Expected scenario C to infer location from local antecedents.");
  }

  if (!duplicate.duplicate) {
    throw new Error("Expected duplicate message to be idempotent.");
  }

  console.log(`Reportes conversacionales creados: ${reports.length}`);
  console.log("Simulador completado sin conexión real de WhatsApp.");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
