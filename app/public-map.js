"use client";

import { useMemo, useState } from "react";

const CATEGORY_ICON = {
  bache: "◉",
  basura: "▣",
  "fuga-de-agua": "≈",
  alumbrado: "✦",
  drenaje: "◌",
  "banqueta-danada": "▱",
  "calle-peligrosa": "!",
  senalizacion: "△",
  "arbol-obstruyendo": "♧",
  "ruido-excesivo": "◒",
  "semaforo-fallando": "●",
  "alcantarilla-destapada": "◉",
  otro: "•"
};

const CATEGORY_LABEL = {
  bache: "Baches",
  basura: "Basura",
  "fuga-de-agua": "Fugas",
  alumbrado: "Alumbrado",
  drenaje: "Drenaje",
  "banqueta-danada": "Banquetas",
  "calle-peligrosa": "Riesgo vial",
  senalizacion: "Señalización",
  "semaforo-fallando": "Semáforos",
  "alcantarilla-destapada": "Alcantarillas",
  otro: "Otros"
};

const STATUS_LABEL = {
  new: "Recibido",
  in_review: "En revisión",
  validated: "Validado",
  needs_info: "Requiere información"
};

export default function PublicMap({ data }) {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const categories = useMemo(
    () => ["all", ...new Set(data.reports.map((report) => report.category))],
    [data.reports]
  );

  const visibleReports = data.reports.filter(
    (report) => filter === "all" || report.category === filter
  );
  const selected = visibleReports.find((report) => report.id === selectedId) || null;

  return (
    <section className="map-stage" aria-label={`Mapa de ${data.territory.name}`}>
      <div className="map-toolbar">
        <span className="map-mode">MAPA OPERATIVO</span>
        <div className="filter-row">
          {categories.map((category) => (
            <button
              key={category}
              className={filter === category ? "filter active" : "filter"}
              onClick={() => setFilter(category)}
            >
              {category === "all" ? "Todos" : CATEGORY_LABEL[category] || category}
            </button>
          ))}
        </div>
      </div>

      <div className="game-map">
        <div className="map-grid" />
        <div className="map-rings" />
        <div className="road road-a" />
        <div className="road road-b" />
        <div className="road road-c" />
        <div className="territory-boundary" />
        <div className="territory-label">PUERTO VALLARTA · ZONA ACTIVA</div>

        {visibleReports.map((report) => (
          <button
            key={report.id}
            className={`map-pin priority-${report.priority}`}
            style={{ left: `${report.location.x * 100}%`, top: `${report.location.y * 100}%` }}
            onClick={() => setSelectedId(report.id)}
            aria-label={report.title}
          >
            <span className="pin-pulse" />
            <span className="pin-core">{CATEGORY_ICON[report.category] || "•"}</span>
          </button>
        ))}

        <div className="map-compass">N<br /><span>⌄</span></div>

        {selected && (
          <aside className="report-popover">
            <button className="close-popover" onClick={() => setSelectedId(null)} aria-label="Cerrar">×</button>
            <span className="popover-category">{CATEGORY_LABEL[selected.category] || selected.category}</span>
            <h2>{selected.title}</h2>
            <p>{selected.neighborhood}</p>
            <div className="popover-meta">
              <span>{STATUS_LABEL[selected.status] || selected.status}</span>
              <span>{selected.priority === "urgent" ? "Prioridad alta" : "Seguimiento activo"}</span>
            </div>
          </aside>
        )}
      </div>

      <div className="map-footer">
        <div className="legend">
          <span><i className="legend-dot normal" /> Activo</span>
          <span><i className="legend-dot high" /> Atención</span>
          <span><i className="legend-dot urgent" /> Prioridad</span>
        </div>
        <span className="territory-lock">⌖ Solo territorio habilitado</span>
      </div>
    </section>
  );
}
