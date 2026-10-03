const STATUS_WEIGHT = {
  resolved: 0,
  new: 1.2,
  in_review: 1,
  validated: 1.1,
  needs_info: 0.7,
  duplicate: 0.15,
  closed: 0
};

const CATEGORY_WEIGHT = {
  "alcantarilla-destapada": 1.5,
  "semaforo-fallando": 1.45,
  "fuga-de-agua": 1.35,
  bache: 1.2,
  "calle-peligrosa": 1.2,
  "banqueta-danada": 1.1,
  alumbrado: 1.1,
  basura: 1,
  otro: 0.8
};

function normalize(value) { return String(value || "").trim().toLowerCase(); }
function ageDays(createdAt, now = Date.now()) {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, (now - t) / 86400000);
}

export function calculateReportPriority(report, now = Date.now()) {
  const status = normalize(report?.status);
  if (["closed", "duplicate", "resolved"].includes(status)) return 0;
  const age = ageDays(report?.createdAt, now);
  const ageWeight = Math.min(2.5, 1 + age / 14);
  const statusWeight = STATUS_WEIGHT[status] ?? 1;
  const categoryWeight = CATEGORY_WEIGHT[normalize(report?.category)] ?? 1;
  const explicit = normalize(report?.priority);
  const explicitWeight = explicit === "urgent" ? 2 : explicit === "high" ? 1.5 : 1;
  return Number((ageWeight * statusWeight * categoryWeight * explicitWeight).toFixed(4));
}

export function rankReports(reports = [], now = Date.now()) {
  return [...reports]
    .map((report) => ({ ...report, priorityScore: calculateReportPriority(report, now) }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
