import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_RUNTIME_REPORTS_FILE = "data/runtime/reports.json";

export function getRuntimeReportsFilePath() {
  return path.resolve(process.env.LCH_RUNTIME_REPORTS_FILE || DEFAULT_RUNTIME_REPORTS_FILE);
}

export function loadRuntimeReports() {
  const filePath = getRuntimeReportsFilePath();

  if (!existsSync(filePath)) {
    return [];
  }

  const raw = readFileSync(filePath, "utf8").trim();

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Runtime reports file must contain an array.");
  }

  return parsed;
}

export function saveRuntimeReports(reports) {
  const filePath = getRuntimeReportsFilePath();
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(reports, null, 2)}\n`, "utf8");
}
