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

const ZOOM = 13;
const TILE_SIZE = 256;

function longitudeToTileX(longitude) {
  return ((longitude + 180) / 360) * 2 ** ZOOM;
}

function latitudeToTileY(latitude) {
  const radians = (latitude * Math.PI) / 180;
  return ((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * 2 ** ZOOM;
}

function tileUrl(x, y) {
  const max = 2 ** ZOOM;
  const wrappedX = ((x % max) + max) % max;
  if (y < 0 || y >= max) return null;
  return `https://tile.openstreetmap.org/${ZOOM}/${wrappedX}/${y}.png`;
}

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
  const centerX = longitudeToTileX(data.territory.center.longitude);
  const centerY = latitudeToTileY(data.territory.center.latitude);
  const centerTileX = Math.floor(centerX);
  const centerTileY = Math.floor(centerY);

  const tiles = useMemo(
    () =>
      [-1, 0, 1].flatMap((dx) =>
        [-1, 0, 1].map((dy) => {
          const x = centerTileX + dx;
          const y = centerTileY + dy;
          return {
            key: `${x}:${y}`,
            src: tileUrl(x, y),
            left: `${(x - centerX) * TILE_SIZE + 50}%`,
            top: `${(y - centerY) * TILE_SIZE + 50}%`
          };
        })
      ),
    [centerTileX, centerTileY, centerX, centerY]
  );

  return (
    <section className="map-stage" aria-label={`Mapa de ${data.territory.name}`}>
      <div className="map-toolbar">
        <span className="map-mode">MAPA GIS · DATOS REALES</span>
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

      <div className="game-map real-map">
        <div className="osm-layer" aria-hidden="true">
          {tiles.map((tile) =>
            tile.src ? (
              <img
                key={tile.key}
                src={tile.src}
                alt=""
                className="osm-tile"
                style={{ left: tile.left, top: tile.top }}
              />
            ) : null
          )}
        </div>

        <div className="map-overlay" />
        <div className="territory-boundary" />
        <div className="territory-label">
          {data.territory.name.toUpperCase()} · TERRITORIO ACTIVO
        </div>

        {visibleReports.map((report) => (
          <button
            key={report.id}
            className={`map-pin priority-${report.priority}`}
            style={{
              left: `${report.location.x * 100}%`,
              top: `${report.location.y * 100}%`
            }}
            onClick={() => setSelectedId(report.id)}
            aria-label={report.title}
          >
            <span className="pin-pulse" />
            <span className="pin-core">{CATEGORY_ICON[report.category] || "•"}</span>
          </button>
        ))}

        <div className="map-compass">N<br /><span>⌃</span></div>

        {selected && (
          <aside className="report-popover">
            <button className="close-popover" onClick={() => setSelectedId(null)} aria-label="Cerrar">×</button>
            <span className="popover-category">{CATEGORY_LABEL[selected.category] || selected.category}</span>
            <h2>{selected.title}</h2>
            <p>{selected.neighborhood}</p>
            <div className="popover-meta">
              <span>{STATUS_LABEL[selected.status] || selected.status}</span>
              <span>{selected.priority === "urgent" ? "Prioridad alta" : "Seguimiento activo"}</span>
              <span>● Coordenada real</span>
            </div>
          </aside>
        )}

        {visibleReports.length === 0 && (
          <div className="map-empty">
            <strong>Sin coordenadas publicables todavía</strong>
            <span>Los reportes aparecerán aquí cuando tengan una ubicación válida dentro del territorio.</span>
          </div>
        )}
      </div>

      <div className="map-footer">
        <div className="legend">
          <span><i className="legend-dot normal" /> Activo</span>
          <span><i className="legend-dot high" /> Atención</span>
          <span><i className="legend-dot urgent" /> Prioridad</span>
        </div>
        <span className="territory-lock">⌖ Solo coordenadas válidas · © OpenStreetMap</span>
      </div>
    </section>
  );
}
