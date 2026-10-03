"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const STATUS = {
  new: "Recibido",
  in_review: "En revisión",
  validated: "Validado",
  needs_info: "Requiere información",
  duplicate: "Duplicado",
  closed: "Cerrado"
};

const ORDER_STATUS = {
  draft: "Borrador",
  sent: "Enviada",
  received: "Recepción confirmada",
  in_progress: "En trabajo",
  completed: "Trabajo realizado",
  awaiting_validation: "Pendiente de validación",
  resolved: "Resuelto",
  returned: "Requiere nueva atención"
};

const CATEGORY = {
  bache: "Bache",
  basura: "Basura",
  "fuga-de-agua": "Fuga de agua",
  alumbrado: "Alumbrado",
  "banqueta-danada": "Banqueta",
  "calle-peligrosa": "Calle peligrosa",
  "semaforo-fallando": "Semáforo"
};

export default function AdminShell({ territory, reports, stats, categories, statuses, workOrders: initialWorkOrders, workOrderAreas }) {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const visible = useMemo(() => reports.filter((r) =>
    (status === "all" || r.status === status) &&
    (category === "all" || r.category === category)
  ), [reports, status, category]);

  const primary = [...reports]
    .filter((r) => !["closed", "duplicate"].includes(r.status))
    .sort((a, b) => {
      const priority = { urgent: 4, high: 3, normal: 2, low: 1 };
      return (priority[b.priority] || 0) - (priority[a.priority] || 0) ||
        Date.parse(a.createdAt) - Date.parse(b.createdAt);
    })[0];

  const selected = reports.find((r) => r.id === selectedId) || null;
  const selectedOrder = selected ? workOrders.find((o) => o.reportId === selected.id) : null;

  async function createOrder() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportId: selected.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo crear la orden.");
      setWorkOrders((items) => [data.order, ...items]);
      setMessage("Orden de trabajo creada. Falta configurar el destinatario antes del envío real.");
    } catch (error) {
      setMessage(error.message);
    } finally { setBusy(false); }
  }

  async function advanceOrder(nextStatus, extra = {}) {
    if (!selectedOrder) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/work-orders?id=" + encodeURIComponent(selectedOrder.id), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus, ...extra })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo actualizar la orden.");
      setWorkOrders((items) => items.map((item) => item.id === data.order.id ? data.order : item));
      setMessage("Orden actualizada.");
    } catch (error) {
      setMessage(error.message);
    } finally { setBusy(false); }
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="brand-lockup">
          <span className="brand-mark admin-mark">LCH</span>
          <div><strong>LA CALLE HABLA</strong><span>Centro de operaciones</span></div>
        </div>
        <div className="admin-context">
          <span>{territory.name}, {territory.state}</span>
          <span className="secure-badge">● TERRITORIO RESTRINGIDO</span>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <span className="sidebar-label">OPERACIÓN</span>
          <button className="nav-item active">Resumen</button>
          <button className="nav-item">Reportes</button>
          <button className="nav-item">Órdenes de trabajo</button>
          <button className="nav-item">Zonas</button>
          <button className="nav-item">Analítica</button>
          <span className="sidebar-label second">CONFIGURACIÓN</span>
          <button className="nav-item">Áreas responsables</button>
          <button className="nav-item">Usuarios</button>
          <div className="sidebar-footer">v0.16 · {territory.name}</div>
        </aside>

        <section className="admin-content">
          <div className="admin-heading">
            <div>
              <span className="eyebrow dark">CENTRO DE OPERACIONES</span>
              <h1>Lo que necesita atención.</h1>
              <p>Del reporte ciudadano a la orden de trabajo, con trazabilidad hasta la resolución.</p>
            </div>
            <Link href="/" className="public-link">Ver portal público ↗</Link>
          </div>

          <div className="kpi-grid">
            <Kpi label="Reportes" value={stats.totalReports} />
            <Kpi label="Activos" value={visible.filter((r) => !["closed", "duplicate"].includes(r.status)).length} />
            <Kpi label="Órdenes de trabajo" value={workOrders.length} />
            <Kpi label="Pendientes de validar" value={workOrders.filter((o) => o.status === "awaiting_validation").length} danger />
          </div>

          {primary && (
            <section className="primary-alert" aria-label="Principal punto de atención">
              <div className="alert-pulse"><span>!</span></div>
              <div className="alert-copy">
                <span>PRINCIPAL PUNTO DE ATENCIÓN</span>
                <strong>{primary.title}</strong>
                <p>{primary.neighborhood || primary.zone} · {primary.priority === "urgent" ? "Prioridad urgente" : "Prioridad alta"}</p>
              </div>
              <button className="alert-action" onClick={() => setSelectedId(primary.id)}>Gestionar</button>
            </section>
          )}

          <section className="admin-grid">
            <div className="ops-map-panel">
              <div className="panel-head"><div><span className="panel-kicker">MAPA OPERATIVO</span><h2>{territory.name}</h2></div><span className="boundary-chip">● Límite activo</span></div>
              <div className="admin-map">
                <div className="map-grid" /><div className="map-rings" /><div className="road road-a" /><div className="road road-b" /><div className="territory-boundary" />
                {reports.slice(0, 18).map((report, index) => {
                  const x = 12 + ((index * 37) % 74);
                  const y = 16 + ((index * 53) % 68);
                  return <button key={report.id} className={`admin-pin p-${report.priority}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => setSelectedId(report.id)} aria-label={report.title} />;
                })}
              </div>
            </div>

            <div className="queue-panel">
              <div className="panel-head"><div><span className="panel-kicker">COLA OPERATIVA</span><h2>Reportes</h2></div></div>
              <div className="filters">
                <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Todos los estados</option>{statuses.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
                <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Todas las categorías</option>{categories.map((item) => <option key={item.slug} value={item.name}>{item.name}</option>)}</select>
              </div>
              <div className="report-list">
                {visible.slice(0, 10).map((report) => (
                  <button key={report.id} className="report-row" onClick={() => setSelectedId(report.id)}>
                    <span className={`row-dot ${report.priority}`} />
                    <span className="row-main"><strong>{report.title}</strong><small>{CATEGORY[report.category] || report.category} · {report.neighborhood || report.zone}</small></span>
                    <span className="row-status">{STATUS[report.status] || report.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {selected && (
            <section className="work-order-console">
              <div className="console-head">
                <div><span className="panel-kicker">GESTIÓN DEL REPORTE</span><h2>{selected.title}</h2><p>{selected.locationText || selected.locationText}</p></div>
                <span className={`order-state ${selectedOrder?.status || "none"}`}>{selectedOrder ? ORDER_STATUS[selectedOrder.status] : "Sin orden"}</span>
              </div>
              <div className="console-grid">
                <div className="order-form-card">
                  <span className="panel-kicker">ORDEN DE TRABAJO</span>
                  {!selectedOrder ? (
                    <>
                      <p>Área sugerida: <strong>{workOrderAreas.find((a) => a.categories.includes(selected.category))?.name || "Área por asignar"}</strong></p>
                      <button className="primary-action" disabled={busy} onClick={createOrder}>{busy ? "Creando…" : "Generar orden de trabajo"}</button>
                    </>
                  ) : (
                    <>
                      <div className="order-id">{selectedOrder.id}</div>
                      <div className="order-meta"><span>Área: <strong>{selectedOrder.areaName}</strong></span><span>Estado: <strong>{ORDER_STATUS[selectedOrder.status]}</strong></span></div>
                      <div className="order-actions">
                        {selectedOrder.status === "draft" && <button onClick={() => setMessage("Orden lista para envío. El proveedor de correo aún no está conectado.")}>Preparar envío por correo</button>}
                        {selectedOrder.status === "sent" && <button onClick={() => advanceOrder("received")}>Registrar recepción</button>}
                        {selectedOrder.status === "received" && <button onClick={() => advanceOrder("in_progress")}>Iniciar trabajo</button>}
                        {selectedOrder.status === "in_progress" && <button onClick={() => advanceOrder("completed")}>Marcar trabajo realizado</button>}
                        {selectedOrder.status === "completed" && <button onClick={() => advanceOrder("awaiting_validation")}>Solicitar validación</button>}
                        {selectedOrder.status === "awaiting_validation" && <><button className="success-action" onClick={() => advanceOrder("resolved", { note: "Evidencia validada por administración." })}>✓ Validar y resolver</button><button onClick={() => advanceOrder("returned", { note: "Solicitar nueva evidencia fotográfica." })}>↩ Solicitar nueva evidencia</button></>}
                        {selectedOrder.status === "returned" && <button onClick={() => advanceOrder("in_progress")}>Reabrir atención</button>}
                      </div>
                      {selectedOrder.evidence && <div className="evidence-note">📸 Evidencia registrada · {selectedOrder.evidence.mimeType}</div>}
                    </>
                  )}
                  {message && <div className="console-message">{message}</div>}
                </div>
                <div className="citizen-card">
                  <span className="panel-kicker">TRAZABILIDAD</span>
                  <div className="timeline">
                    <Timeline label="Reporte ciudadano" active />
                    <Timeline label="Orden de trabajo" active={Boolean(selectedOrder)} />
                    <Timeline label="Recepción del área" active={["received","in_progress","completed","awaiting_validation","resolved","returned"].includes(selectedOrder?.status)} />
                    <Timeline label="Trabajo realizado" active={["completed","awaiting_validation","resolved"].includes(selectedOrder?.status)} />
                    <Timeline label="Evidencia validada" active={selectedOrder?.status === "resolved"} />
                    <Timeline label="Publicado como resuelto" active={selectedOrder?.status === "resolved"} />
                  </div>
                </div>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

function Kpi({ label, value, danger = false }) {
  return <div className={danger ? "kpi danger" : "kpi"}><span>{label}</span><strong>{value}</strong></div>;
}

function Timeline({ label, active }) {
  return <div className={active ? "timeline-item active" : "timeline-item"}><span>{active ? "✓" : "○"}</span><strong>{label}</strong></div>;
}
