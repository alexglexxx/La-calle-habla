"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const INITIAL_ZOOM = 14;
const MIN_ZOOM = 11;
const MAX_ZOOM = 19;

function validCoordinate(report) {
  const latitude = Number(report.coordinates?.latitude);
  const longitude = Number(report.coordinates?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function markerClass(priority) {
  if (priority === "urgent") return "priority-urgent";
  if (priority === "high") return "priority-high";
  return "priority-normal";
}

export default function PublicMap({ data }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
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

    const center = [data.territory.center.latitude, data.territory.center.longitude];
    const bounds = L.latLngBounds(
      [data.territory.bounds.south - 0.015, data.territory.bounds.west - 0.015],
      [data.territory.bounds.north + 0.015, data.territory.bounds.east + 0.015]
    );

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: INITIAL_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: bounds,
      maxBoundsViscosity: 0.85,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: false,
      tap: true
    });

    mapRef.current = map;

    const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
      attribution: "© OpenStreetMap contributors",
      crossOrigin: true
    });

    tileLayerRef.current = tileLayer;
    tileLayer.addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    let tileErrors = 0;
    const handleTileError = () => {
      tileErrors += 1;
      if (tileErrors >= 4) setMapError(true);
    };

    tileLayer.on("tileerror", handleTileError);

    const handleLoad = () => {
      setMapReady(true);
      setMapError(false);
      map.invalidateSize();
      map.setView(center, INITIAL_ZOOM, { animate: false });
      setZoom(INITIAL_ZOOM);
    };

    const handleZoom = () => setZoom(Math.round(map.getZoom() * 10) / 10);

    map.on("load", handleLoad);
    map.on("zoomend", handleZoom);

    // Leaflet can initialize before the mobile browser has finalized layout.
    // A second invalidateSize prevents the common blank-container case.
    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 250);

    return () => {
      window.clearTimeout(resizeTimer);
      tileLayer.off("tileerror", handleTileError);
      map.off("load", handleLoad);
      map.off("zoomend", handleZoom);
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, [data.territory]);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || !mapReady) return undefined;

    markersLayer.clearLayers();

    visibleReports.filter(validCoordinate).forEach((report) => {
      const markerIcon = L.divIcon({
        className: `lch-leaflet-marker ${markerClass(report.priority)}`,
        html: `<span class="lch-marker-pulse"></span><span class="lch-marker-core">${CATEGORY_ICON[report.category] || "•"}</span>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker(
        [Number(report.coordinates.latitude), Number(report.coordinates.longitude)],
        { icon: markerIcon, keyboard: true, title: report.title || "Reporte ciudadano" }
      );

      marker.on("click", () => setSelectedId(report.id));
      marker.addTo(markersLayer);
    });

    return () => markersLayer.clearLayers();
  }, [mapReady, visibleReports]);

  const zoomIn = () => mapRef.current?.zoomIn(1, { animate: true });
  const zoomOut = () => mapRef.current?.zoomOut(1, { animate: true });

  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo(
      [data.territory.center.latitude, data.territory.center.longitude],
      INITIAL_ZOOM,
      { duration: 0.45 }
    );
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

      <div className="game-map real-map real-map-v4">
        <div ref={mapContainerRef} className="leaflet-map-container" aria-label="Mapa de calles de Puerto Vallarta" />
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
        <span className="territory-lock">© OpenStreetMap contributors · Datos ciudadanos</span>
      </div>
    </section>
  );
}
