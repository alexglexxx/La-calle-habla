import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_RUNTIME_REPORTS_FILE = "data/runtime/reports.json";
const DEFAULT_REPORT_OVERRIDES_FILE = "data/runtime/report-overrides.json";

export function getRuntimeReportsFilePath() {
  return path.resolve(process.env.LCH_RUNTIME_REPORTS_FILE || DEFAULT_RUNTIME_REPORTS_FILE);
}

export function getReportOverridesFilePath() {
  return path.resolve(process.env.LCH_REPORT_OVERRIDES_FILE || DEFAULT_REPORT_OVERRIDES_FILE);
}

function loadJsonArray(filePath, label) {
  if (!existsSync(filePath)) {
    return [];
  }

  const raw = readFileSync(filePath, "utf8").trim();

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`${label} file must contain an array.`);
  }

  return parsed;
}

function saveJsonArray(filePath, items) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

export function loadRuntimeReports() {
  return loadJsonArray(getRuntimeReportsFilePath(), "Runtime reports");
}

export function saveRuntimeReports(reports) {
  saveJsonArray(getRuntimeReportsFilePath(), reports);
}

export function loadReportOverrides() {
  return loadJsonArray(getReportOverridesFilePath(), "Report overrides");
}

export function saveReportOverrides(overrides) {
  saveJsonArray(getReportOverridesFilePath(), overrides);
}
