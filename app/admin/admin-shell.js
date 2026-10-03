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

const CATEGORY = {
  bache: "Bache",
  basura: "Basura",
  "fuga-de-agua": "Fuga de agua",
  alumbrado: "Alumbrado",
  "banqueta-danada": "Banqueta",
  "calle-peligrosa": "Calle peligrosa",
  "semaforo-fallando": "Semáforo"
};

export default function AdminShell({ territory, reports, stats, categories, statuses }) {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const visible = useMemo(
    () => reports.filter((r) =>
      (status === "all" || r.status === status) &&
      (category === "all" || r.category === category)
    ),
    [reports, status, category]
  );

  const primary = [...reports]
    .filter((r) => !["closed", "duplicate"].includes(r.status))
    .sort((a, b) => {
      const priority = { urgent: 4, high: 3, normal: 2, low: 1 };
      return (priority[b.priority] || 0) - (priority[a.priority] || 0) || Date.parse(a.createdAt) - Date.parse(b.createdAt);
    })[0];

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="brand-lockup">
          <span className="brand-mark admin-mark">LCH</span>
          <div>
            <strong>LA CALLE HABLA</strong>
            <span>Centro de operaciones</span>
          </div>
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
          <button className="nav-item">Zonas</button>
          <button className="nav-item">Analítica</button>
          <span className="sidebar-label second">CONFIGURACIÓN</span>
          <button className="nav-item">Categorías</button>
          <button className="nav-item">Usuarios</button>
          <div className="sidebar-footer">v0.13 · {territory.name}</div>
        </aside>

        <section className="admin-content">
          <div className="admin-heading">
            <div>
              <span className="eyebrow dark">CENTRO DE OPERACIONES</span>
              <h1>Lo que necesita atención.</h1>
              <p>Supervisa actividad ciudadana dentro del territorio habilitado.</p>
            </div>
            <Link href="/" className="public-link">Ver portal público ↗</Link>
          </div>

          <div className="kpi-grid">
            <Kpi label="Reportes" value={stats.totalReports} />
            <Kpi label="Activos" value={visible.filter((r) => !["closed", "duplicate"].includes(r.status)).length} />
            <Kpi label="Validados" value={visible.filter((r) => r.status === "validated").length} />
            <Kpi label="Prioridad alta" value={visible.filter((r) => ["high", "urgent"].includes(r.priority)).length} danger />
          </div>

          {primary && (
            <section className="primary-alert" aria-label="Principal punto de atención">
              <div className="alert-pulse"><span>!</span></div>
              <div className="alert-copy">
                <span>PRINCIPAL PUNTO DE ATENCIÓN</span>
                <strong>{primary.title}</strong>
                <p>{primary.neighborhood || primary.zone} · {primary.priority === "urgent" ? "Prioridad urgente" : "Prioridad alta"} · {Math.max(1, Math.round((Date.now() - Date.parse(primary.createdAt)) / 86400000))} días abierto</p>
              </div>
              <button className="alert-action" onClick={() => setSelectedId(primary.id)}>Ver reportes</button>
            </section>
          )}

          <section className="admin-grid">
            <div className="ops-map-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">MAPA OPERATIVO</span>
                  <h2>{territory.name}</h2>
                </div>
                <span className="boundary-chip">● Límite activo</span>
              </div>
              <div className="admin-map">
                <div className="map-grid" />
                <div className="map-rings" />
                <div className="road road-a" />
                <div className="road road-b" />
                <div className="territory-boundary" />
                {reports.slice(0, 18).map((report, index) => {
                  const x = 12 + ((index * 37) % 74);
                  const y = 16 + ((index * 53) % 68);
                  return <button key={report.id} className={`admin-pin p-${report.priority}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => setSelectedId(report.id)} aria-label={report.title} />;
                })}
                {selectedId && (
                  <div className="admin-map-selection">
                    <strong>{reports.find((r) => r.id === selectedId)?.title || "Reporte seleccionado"}</strong>
                    <span>{reports.find((r) => r.id === selectedId)?.neighborhood || ""}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="queue-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">COLA OPERATIVA</span>
                  <h2>Reportes</h2>
                </div>
              </div>
              <div className="filters">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">Todos los estados</option>
                  {statuses.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="all">Todas las categorías</option>
                  {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
              </div>
              <div className="report-list">
                {visible.slice(0, 8).map((report) => (
                  <button key={report.id} className="report-row" onClick={() => setSelectedId(report.id)}>
                    <span className={`row-dot ${report.priority}`} />
                    <span className="row-main">
                      <strong>{report.title}</strong>
                      <small>{CATEGORY[report.category] || report.category} · {report.neighborhood || report.zone}</small>
                    </span>
                    <span className="row-status">{STATUS[report.status] || report.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Kpi({ label, value, danger = false }) {
  return (
    <div className={danger ? "kpi danger" : "kpi"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
