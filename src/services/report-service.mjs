import { seedCategories } from "../data/seed-categories.mjs";
import { seedReports } from "../data/seed-reports.mjs";
import { seedStatuses } from "../data/seed-statuses.mjs";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function matchesCategory(report, category) {
  const target = normalize(category);
  const categoryRecord = seedCategories.find((item) => item.slug === report.category);

  return [
    report.category,
    categoryRecord?.id,
    categoryRecord?.name,
    categoryRecord?.slug
  ]
    .filter(Boolean)
    .some((value) => normalize(value) === target);
}

function matchesStatus(report, status) {
  const target = normalize(status);
  const statusRecord = seedStatuses.find((item) => item.slug === report.status);

  return [report.status, statusRecord?.id, statusRecord?.name, statusRecord?.slug]
    .filter(Boolean)
    .some((value) => normalize(value) === target);
}

function countBy(items, key) {
  return items.reduce((accumulator, item) => {
    const value = item[key];
    accumulator[value] = (accumulator[value] || 0) + 1;
    return accumulator;
  }, {});
}

export function listCategories() {
  return seedCategories;
}

export function listStatuses() {
  return seedStatuses;
}

export function listReports(filters = {}) {
  return seedReports.filter((report) => {
    if (filters.category && !matchesCategory(report, filters.category)) {
      return false;
    }

    if (filters.status && !matchesStatus(report, filters.status)) {
      return false;
    }

    return true;
  });
}

export function getReportById(id) {
  return seedReports.find((report) => report.id === id);
}

export function listReportsByCategory(category) {
  return listReports({ category });
}

export function listReportsByStatus(status) {
  return listReports({ status });
}

export function getReportStats() {
  const createdDates = seedReports
    .map((report) => report.createdAt)
    .sort((left, right) => left.localeCompare(right));

  return {
    totalReports: seedReports.length,
    byCategory: countBy(seedReports, "category"),
    byStatus: countBy(seedReports, "status"),
    byPriority: countBy(seedReports, "priority"),
    newestReportCreatedAt: createdDates.at(-1) || null,
    oldestReportCreatedAt: createdDates[0] || null
  };
}
