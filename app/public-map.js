"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Map, Marker } from "maplibre-gl";

// Public cartography uses OpenFreeMap vector tiles with OpenStreetMap data.
// Attribution is rendered by MapLibre and reinforced in the public footer.

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

// Liberty is the cleaner maintained OpenFreeMap style and keeps the real street
// network readable at the default city view on mobile and desktop.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const INITIAL_ZOOM = 14;
const MIN_ZOOM = 12;
const MAX_ZOOM = 18;

function validCoordinate(report) {
  const latitude = Number(report.coordinates?.latitude);
  const longitude = Number(report.coordinates?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function markerPriorityClass(priority) {
  if (priority === "urgent") return "priority-urgent";
  if (priority === "high") return "priority-high";
  return "priority-normal";
}

export default function PublicMap({ data }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const categories = useMemo(
    () => ["all", ...new Set(data.reports.map((report) => report.category))],
    [data.reports]
  );

  const visibleReports = useMemo(
    () => data.reports.filter((report) => filter === "all" || report.category === filter),
    [data.reports, filter]
  );

  const selected = visibleReports.find((report) => report.id === selectedId) || null;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined;

    const map = new Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [data.territory.center.longitude, data.territory.center.latitude],
      zoom: INITIAL_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: true,
      renderWorldCopies: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      maxBounds: [
        [data.territory.bounds.west - 0.015, data.territory.bounds.south - 0.015],
        [data.territory.bounds.east + 0.015, data.territory.bounds.north + 0.015]
      ]
    });

    mapRef.current = map;

    const handleLoad = () => {
      setMapReady(true);
      map.jumpTo({
        center: [data.territory.center.longitude, data.territory.center.latitude],
        zoom: INITIAL_ZOOM
      });
      setZoom(INITIAL_ZOOM);
    };

    const handleZoom = () => setZoom(Math.round(map.getZoom() * 10) / 10);
    const handleError = (event) => {
      if (!map.isStyleLoaded()) setMapError(true);
      console.error("Public map error", event?.error || event);
    };

    map.on("load", handleLoad);
    map.on("zoom", handleZoom);
    map.on("error", handleError);

    return () => {
      map.off("load", handleLoad);
      map.off("zoom", handleZoom);
      map.off("error", handleError);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [data.territory]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return undefined;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    visibleReports.filter(validCoordinate).forEach((report) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = `lch-map-marker ${markerPriorityClass(report.priority)}`;
      element.setAttribute("aria-label", report.title || "Reporte ciudadano");
      element.innerHTML = `<span class="lch-marker-pulse"></span><span class="lch-marker-core">${CATEGORY_ICON[report.category] || "•"}</span>`;
      element.addEventListener("click", () => setSelectedId(report.id));

      const marker = new Marker({
        element,
        anchor: "center",
        pitchAlignment: "viewport",
        rotationAlignment: "viewport"
      })
        .setLngLat([Number(report.coordinates.longitude), Number(report.coordinates.latitude)])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [mapReady, visibleReports]);

  const zoomIn = () => mapRef.current?.zoomIn({ duration: 220 });
  const zoomOut = () => mapRef.current?.zoomOut({ duration: 220 });
  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [data.territory.center.longitude, data.territory.center.latitude],
      zoom: INITIAL_ZOOM,
      duration: 450
    });
  };

  return (
    <section className="map-stage real-cartography-stage" aria-label={`Mapa ciudadano de ${data.territory.name}`}>
      <div className="map-toolbar real-map-toolbar">
        <div className="map-mode">
          <span className="live-dot" /> CARTOGRAFÍA REAL · CAPA CIUDADANA
        </div>
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

      <div className="game-map real-map real-map-v3">
        <div ref={mapContainerRef} className="maplibre-container" aria-label="Mapa de calles de Puerto Vallarta" />
        <div className="territory-label">PUERTO VALLARTA · TERRITORIO ACTIVO</div>
        <div className="map-compass real-compass"><span>N</span><b>⌃</b></div>

        <div className="zoom-control real-zoom">
          <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} aria-label="Alejar">−</button>
          <span>{zoom.toFixed(1)}×</span>
          <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} aria-label="Acercar">+</button>
        </div>
        <button className="map-reset-control" onClick={resetView} aria-label="Ver Puerto Vallarta completo">
          <span>⌖</span>
          <small>PV</small>
        </button>

        {!mapReady && !mapError && (
          <div className="map-loading"><span /> Cargando cartografía real…</div>
        )}

        {mapError && (
          <div className="map-loading map-error-state">
            <strong>No se pudo cargar la cartografía</strong>
            <span>La capa ciudadana sigue intacta. Recarga la página para reintentar.</span>
          </div>
        )}

        {selected && (
          <aside className="report-popover real-popover">
            <button className="close-popover" onClick={() => setSelectedId(null)} aria-label="Cerrar">×</button>
            <span className="popover-category">{CATEGORY_LABEL[selected.category] || selected.category}</span>
            <h2>{selected.title}</h2>
            <p>{selected.neighborhood || "Puerto Vallarta"}</p>
            <div className="popover-meta">
              <span>{STATUS_LABEL[selected.status] || selected.status}</span>
              <span>● Coordenada real</span>
            </div>
          </aside>
        )}

        {visibleReports.length === 0 && (
          <div className="map-empty real-empty">
            <strong>Aún no hay reportes con coordenadas publicables</strong>
            <span>Cuando llegue un reporte válido dentro del territorio, aparecerá aquí.</span>
          </div>
        )}

        <div className="map-corner-card">
          <strong>LA CALLE HABLA</strong>
          <span>Reportes ciudadanos sobre calles reales</span>
        </div>
      </div>

      <div className="map-footer real-map-footer">
        <div className="legend">
          <span><i className="legend-dot normal" /> Reporte</span>
          <span><i className="legend-dot high" /> Atención</span>
          <span><i className="legend-dot urgent" /> Prioridad</span>
        </div>
        <span className="territory-lock">© OpenFreeMap · © OpenStreetMap contributors · Datos ciudadanos</span>
      </div>
    </section>
  );
}
