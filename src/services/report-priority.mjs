const STATUS_WEIGHT = {\n  resolved: 0,
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
  "calle-peligrosa": 1.35,
  "fuga-de-agua": 1.25,
  bache: 1.15,
  "banqueta-danada": 1.1
};

function daysSince(date, now) {
  const value = Date.parse(date);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, (now - value) / 86400000);
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function scoreBand(score) {
  if (score >= 80) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "attention";
  return "normal";
}

export function calculateReportPriority(report, relatedReports = [], now = Date.now()) {
  const related = [report, ...relatedReports].filter(Boolean);
  const reportAge = daysSince(report.createdAt, now);
  const oldestAge = Math.max(...related.map((item) => daysSince(item.createdAt, now)), reportAge);
  const activeCount = related.filter((item) => !["closed", "duplicate"].includes(normalize(item.status))).length;
  const categoryWeight = CATEGORY_WEIGHT[normalize(report.category)] || 1;
  const statusWeight = STATUS_WEIGHT[normalize(report.status)] ?? 1;

  const countScore = Math.min(35, Math.max(0, activeCount - 1) * 6 + (activeCount >= 3 ? 10 : 0));
  const ageScore = Math.min(30, oldestAge * 3.5);
  const categoryScore = Math.min(20, categoryWeight * 10);
  const trendScore = Math.min(15, related.length >= 4 ? 15 : related.length >= 2 ? 8 : 2);
  const statusScore = statusWeight * 5;

  const score = Math.round(countScore + ageScore + categoryScore + trendScore + statusScore);
  const band = scoreBand(score);

  return {
    score,
    band,
    reasons: [
      activeCount > 1 ? `${activeCount} reportes activos relacionados` : "1 reporte activo",
      `${Math.round(oldestAge * 10) / 10} dias desde el reporte mas antiguo`,
      categoryWeight > 1.2 ? "categoria con mayor peso operativo" : "categoria estandar",
      related.length > 1 ? "concentracion/reincidencia detectada" : "sin concentracion confirmada"
    ]
  };
}

export function findPrimaryAttention(reports, now = Date.now()) {
  const active = reports.filter((report) => !["closed", "duplicate", "resolved"].includes(normalize(report.status)));
  const groups = new Map();

  for (const report of active) {
    const key = `${normalize(report.category)}|${normalize(report.neighborhood || report.zone)}`;
    const group = groups.get(key) || [];
    group.push(report);
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => {
      const [lead] = [...group].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
      return {
        report: lead,
        reports: group,
        priority: calculateReportPriority(lead, group.slice(1), now)
      };
    })
    .sort((a, b) => b.priority.score - a.priority.score)[0] || null;
}
