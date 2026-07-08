import http from "node:http";
import { reportCategories, reportStatuses } from "../src/lib/domain-constants.mjs";
import { seedReports } from "../src/data/seed-reports.mjs";
import { getReportStats } from "../src/services/report-service.mjs";

if (reportCategories.length < 5) {
  throw new Error("Expected initial citizen categories.");
}

if (!reportStatuses.some((status) => status.slug === "new")) {
  throw new Error("Expected a new report status.");
}

if (seedReports.length < 10) {
  throw new Error("Expected at least 10 seed reports.");
}

if (getReportStats().totalReports !== seedReports.length) {
  throw new Error("Stats total does not match seed reports.");
}

if (typeof http.createServer !== "function") {
  throw new Error("Node HTTP runtime is unavailable.");
}

console.log("Build check passed.");
