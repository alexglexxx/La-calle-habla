"use client";

import { useMemo, useState } from "react";

const CATEGORY_ICON = { bache:"◉", basura:"▣", "fuga-de-agua":"≈", alumbrado:"✦", drenaje:"◌", "banqueta-danada":"▱", "calle-peligrosa":"!", senalizacion:"△", "arbol-obstruyendo":"♧", "ruido-excesivo":"◒", "semaforo-fallando":"●", "alcantarilla-destapada":"◉", otro:"•" };
const CATEGORY_LABEL = { bache:"Baches", basura:"Basura", "fuga-de-agua":"Fugas", alumbrado:"Alumbrado", drenaje:"Drenaje", "banqueta-danada":"Banquetas", "calle-peligrosa":"Riesgo vial", senalizacion:"Señalización", "semaforo-fallando":"Semáforos", "alcantarilla-destapada":"Alcantarillas", otro:"Otros" };
const STATUS_LABEL = { new:"Recibido", in_review:"En revisión", validated:"Validado", needs_info:"Requiere información" };
const TILE_SIZE = 256;
const MIN_ZOOM = 12;
const MAX_ZOOM = 16;

function clampZoom(value) { return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value)); }
function longitudeToTileX(longitude, zoom) { return ((longitude + 180) / 360) * 2 ** zoom; }
function latitudeToTileY(latitude, zoom) {
  const radians = (latitude * Math.PI) / 180;
  return ((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * 2 ** zoom;
}
function tileUrl(x, y, zoom) {
  const max = 2 ** zoom;
  const wrappedX = ((x % max) + max) % max;
  if (y < 0 || y >= max) return null;
  return `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`;
}

export default function PublicMap({ data }) {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [zoom, setZoom] = useState(13);

  const categories = useMemo(() => ["all", ...new Set(data.reports.map((r) => r.category))], [data.reports]);
  const visibleReports = data.reports.filter((r) => filter === "all" || r.category === filter);
  const selected = visibleReports.find((r) => r.id === selectedId) || null;
  const center = data.territory.center;
  const centerX = longitudeToTileX(center.longitude, zoom);
  const centerY = latitudeToTileY(center.latitude, zoom);
  const centerTileX = Math.floor(centerX);
  const centerTileY = Math.floor(centerY);

  const tiles = useMemo(() => {
    const items = [];
    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dy = -2; dy <= 2; dy += 1) {
        const x = centerTileX + dx;
        const y = centerTileY + dy;
        const src = tileUrl(x, y, zoom);
        if (src) items.push({ key: `${zoom}:${x}:${y}`, src, left: (x - centerX) * TILE_SIZE, top: (y - centerY) * TILE_SIZE });
      }
    }
    return items;
  }, [centerTileX, centerTileY, centerX, centerY, zoom]);

  const reportStyle = (report) => {
    const latitude = Number(report.coordinates?.latitude);
    const longitude = Number(report.coordinates?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { display: "none" };
    const x = (longitudeToTileX(longitude, zoom) - centerX) * TILE_SIZE;
    const y = (latitudeToTileY(latitude, zoom) - centerY) * TILE_SIZE;
    return { left: "50%", top: "50%", transform: `translate(-50%,-50%) translate(${x}px,${y}px)` };
  };

  const mapLayerStyle = { position: "absolute", inset: 0, overflow: "hidden", background: "#dce7e4" };
  const tileCanvasStyle = { position: "absolute", left: "50%", top: "50%", width: 1, height: 1 };
  const tileStyle = { position: "absolute", width: TILE_SIZE, height: TILE_SIZE, maxWidth: "none", display: "block" };

  return (
    <section className="map-stage real-cartography-stage" aria-label={`Mapa ciudadano de ${data.territory.name}`}>
      <div className="map-toolbar real-map-toolbar">
        <div className="map-mode"><span className="live-dot"/> MAPA CIUDADANO · CARTOGRAFÍA REAL</div>
        <div className="filter-row">
          {categories.map((category) => <button key={category} className={filter === category ? "filter active" : "filter"} onClick={() => setFilter(category)}>{category === "all" ? "Todos" : CATEGORY_LABEL[category] || category}</button>)}
        </div>
      </div>

      <div className="game-map real-map real-map-v2">
        <div className="osm-layer" aria-hidden="true" style={mapLayerStyle}>
          <div className="osm-tiles" style={tileCanvasStyle}>
            {tiles.map((tile) => <img key={tile.key} src={tile.src} alt="" className="osm-tile" style={{ ...tileStyle, left: tile.left, top: tile.top }} />)}
          </div>
          <div className="cartography-wash" style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(245,249,246,.08),rgba(245,249,246,.08))", pointerEvents: "none" }} />
        </div>

        <div className="territory-frame" aria-hidden="true"/>
        <div className="territory-label">PUERTO VALLARTA · TERRITORIO ACTIVO</div>
        <div className="map-compass real-compass"><span>N</span><b>⌃</b></div>

        <div className="zoom-control real-zoom">
          <button onClick={() => setZoom((v) => clampZoom(v - 1))} disabled={zoom <= MIN_ZOOM} aria-label="Alejar">−</button>
          <span>ZOOM {zoom}</span>
          <button onClick={() => setZoom((v) => clampZoom(v + 1))} disabled={zoom >= MAX_ZOOM} aria-label="Acercar">+</button>
        </div>

        <div className="atlas-report-layer real-report-layer">
          {visibleReports.map((report) => <button key={report.id} className={`map-pin real-report-pin priority-${report.priority || "normal"}`} style={reportStyle(report)} onClick={() => setSelectedId(report.id)} aria-label={report.title}>
            <span className="pin-pulse"/><span className="pin-core">{CATEGORY_ICON[report.category] || "•"}</span>
          </button>)}
        </div>

        {selected && <aside className="report-popover real-popover">
          <button className="close-popover" onClick={() => setSelectedId(null)} aria-label="Cerrar">×</button>
          <span className="popover-category">{CATEGORY_LABEL[selected.category] || selected.category}</span>
          <h2>{selected.title}</h2><p>{selected.neighborhood || "Puerto Vallarta"}</p>
          <div className="popover-meta"><span>{STATUS_LABEL[selected.status] || selected.status}</span><span>● Coordenada real</span></div>
        </aside>}

        {visibleReports.length === 0 && <div className="map-empty real-empty"><strong>Aún no hay reportes con coordenadas publicables</strong><span>Cuando llegue un reporte válido dentro del territorio, aparecerá aquí.</span></div>}

        <div className="map-corner-card"><strong>LA CALLE HABLA</strong><span>Datos ciudadanos sobre cartografía real</span></div>
        <div className="map-attribution">© OpenStreetMap contributors</div>
      </div>

      <div className="map-footer real-map-footer">
        <div className="legend"><span><i className="legend-dot normal"/> Reporte</span><span><i className="legend-dot high"/> Atención</span><span><i className="legend-dot urgent"/> Prioridad</span></div>
        <span className="territory-lock">Solo territorio habilitado · Coordenadas verificadas</span>
      </div>
    </section>
  );
}
