import { getReportById, listReportHistory } from "./report-service.mjs";
import { loadRuntimeWorkOrders, saveRuntimeWorkOrders } from "./runtime-report-store.mjs";

const WORK_ORDER_STATUSES = new Set([
  "draft",
  "sent",
  "received",
  "in_progress",
  "completed",
  "awaiting_validation",
  "resolved",
  "returned"
]);

const NEXT_STATUS = Object.freeze({
  draft: new Set(["sent"]),
  sent: new Set(["received"]),
  received: new Set(["in_progress"]),
  in_progress: new Set(["completed"]),
  completed: new Set(["awaiting_validation"]),
  awaiting_validation: new Set(["resolved", "returned"]),
  returned: new Set(["in_progress"]),
  resolved: new Set([])
});

const AREAS = Object.freeze([
  { slug: "obras-publicas", name: "Obras Públicas", categories: ["bache", "banqueta-danada", "calle-peligrosa"] },
  { slug: "servicios-publicos", name: "Servicios Públicos", categories: ["basura", "alumbrado", "arbol-obstruyendo"] },
  { slug: "agua-drenaje", name: "Agua y Drenaje", categories: ["fuga-de-agua", "drenaje", "alcantarilla-destapada"] },
  { slug: "transito", name: "Tránsito y Movilidad", categories: ["semaforo-fallando", "senalizacion"] },
  { slug: "inspeccion", name: "Inspección", categories: ["ruido-excesivo", "otro"] }
]);

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function nextWorkOrderId() {
  return `LCH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

function findArea(slug) {
  return AREAS.find((area) => area.slug === slug) || null;
}

export function suggestAreaForReport(report) {
  return AREAS.find((area) => area.categories.includes(report?.category)) || null;
}

export function listWorkOrderAreas() {
  return AREAS;
}

export function listWorkOrders(filters = {}) {
  return loadRuntimeWorkOrders()
    .filter((order) => !filters.reportId || order.reportId === filters.reportId)
    .filter((order) => !filters.status || order.status === filters.status)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function getWorkOrderById(id) {
  return loadRuntimeWorkOrders().find((order) => order.id === id) || null;
}

export function createWorkOrder(reportId, input = {}, options = {}) {
  const report = getReportById(reportId);
  if (!report) return { ok: false, error: "report_not_found" };
  if (listWorkOrders({ reportId }).length > 0) return { ok: false, error: "work_order_exists" };

  const area = findArea(clean(input.areaSlug)) || suggestAreaForReport(report);
  const now = options.now || new Date().toISOString();
  const id = options.id || nextWorkOrderId();
  const order = {
    id,
    reportId,
    status: "draft",
    areaSlug: area?.slug || "otro",
    areaName: area?.name || "Área por asignar",
    recipientEmail: clean(input.recipientEmail),
    contactName: clean(input.contactName),
    instructions: clean(input.instructions),
    dueAt: clean(input.dueAt) || null,
    createdAt: now,
    updatedAt: now,
    sentAt: null,
    receivedAt: null,
    completedAt: null,
    validatedAt: null,
    evidence: null,
    validationNote: null
  };

  saveRuntimeWorkOrders([...loadRuntimeWorkOrders(), order]);
  return { ok: true, order };
}

export function transitionWorkOrder(id, nextStatus, input = {}, options = {}) {
  const orders = loadRuntimeWorkOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return { ok: false, error: "work_order_not_found" };

  const order = orders[index];
  if (!WORK_ORDER_STATUSES.has(nextStatus)) return { ok: false, error: "invalid_status" };
  if (!NEXT_STATUS[order.status]?.has(nextStatus)) {
    return { ok: false, error: "invalid_transition", from: order.status, to: nextStatus };
  }

  const now = options.now || new Date().toISOString();
  const updated = {
    ...order,
    status: nextStatus,
    updatedAt: now
  };

  if (nextStatus === "sent") updated.sentAt = now;
  if (nextStatus === "received") updated.receivedAt = now;
  if (nextStatus === "completed") updated.completedAt = now;
  if (nextStatus === "resolved") {
    updated.validatedAt = now;
    updated.validationNote = clean(input.note) || null;
  }
  if (nextStatus === "returned") updated.validationNote = clean(input.note) || "Evidencia insuficiente; requiere nueva atención.";

  if (input.evidence) {
    updated.evidence = {
      storageKey: clean(input.evidence.storageKey),
      mimeType: clean(input.evidence.mimeType),
      sizeBytes: Number.isFinite(input.evidence.sizeBytes) ? input.evidence.sizeBytes : null,
      caption: clean(input.evidence.caption),
      receivedAt: now
    };
  }

  orders[index] = updated;
  saveRuntimeWorkOrders(orders);
  return { ok: true, order: updated };
}

export function getWorkOrderForReport(reportId) {
  return getWorkOrderById(listWorkOrders({ reportId })[0]?.id);
}

export function getWorkOrderSummary(order) {
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    areaName: order.areaName,
    recipientEmail: order.recipientEmail,
    hasEvidence: Boolean(order.evidence),
    updatedAt: order.updatedAt
  };
}

export function validateWorkOrderEvidence(evidence) {
  if (!evidence || typeof evidence !== "object") return { ok: false, error: "evidence_required" };
  const mimeType = clean(evidence.mimeType);
  const sizeBytes = Number(evidence.sizeBytes);
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return { ok: false, error: "unsupported_image_type" };
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > 5 * 1024 * 1024) return { ok: false, error: "image_too_large" };
  return { ok: true };
}

export { WORK_ORDER_STATUSES };
