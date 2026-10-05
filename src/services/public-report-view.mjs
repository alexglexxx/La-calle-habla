import { listReports } from "./report-service.mjs";
import { isInsideTerritory, LCH_TERRITORY } from "../config/territory.mjs";
import { findPrimaryAttention } from "./report-priority.mjs";
import { projectReportsToMap } from "./gis-view.mjs";
import { getPublicMapModel } from "./map-view.mjs";
import { listReportsFromSupabase } from "./supabase-persistence.mjs";

const PUBLIC_STATUSES = new Set(["new", "in_review", "validated", "needs_info"]);

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function projectPoint(report) {
  const hash = hashString(report.id);
  const x = 0.12 + ((hash % 760) / 1000);
  const y = 0.14 + (((hash >>> 8) % 650) / 1000);
  return { x: Math.min(0.9, x), y: Math.min(0.88, y) };
}

function projectPublicReport(report) {
  return {
      id: report.id,
      title: report.title,
      category: report.category,
      status: report.status,
      priority: report.priority,
      neighborhood: report.neighborhood || report.zone,
      createdAt: report.createdAt,
    locationDetails: report.locationDetails || null
  };
}

export async function getPublicReports() {
  const localReports = listReports()
    .filter((report) => PUBLIC_STATUSES.has(report.status))
    .map(projectPublicReport);

  let persistedReports = [];

  try {
    persistedReports = (await listReportsFromSupabase())
      .filter((report) => PUBLIC_STATUSES.has(report.status))
      .map(projectPublicReport);
  } catch {
    // The public portal keeps its local/seed projection if Supabase is temporarily unavailable.
  }

  const byId = new Map(localReports.map((report) => [report.id, report]));

  for (const report of persistedReports) {
    byId.set(report.id, report);
  }

  return projectReportsToMap([...byId.values()]);
}

export async function getPublicPortalData() {
  const reports = await getPublicReports();
  const attention = findPrimaryAttention(reports);
  const categories = reports.reduce((acc, report) => {
    acc[report.category] = (acc[report.category] || 0) + 1;
    return acc;
  }, {});

  return {
    territory: LCH_TERRITORY,
    map: getPublicMapModel(),
    reports,
    stats: {
      active: reports.length,
      categories
    },
    attention: attention
      ? {
          reportId: attention.report.id,
          title: attention.report.title,
          category: attention.report.category,
          neighborhood: attention.report.neighborhood,
          score: attention.priority.score,
          band: attention.priority.band,
          reasons: attention.priority.reasons
        }
      : null
  };
}
