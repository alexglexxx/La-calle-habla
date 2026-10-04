"use client";

import { useMemo, useState } from "react";
import { MAP_THEMES, DEFAULT_MAP_THEME } from "../src/config/map-theme.mjs";
import { clampMapZoom } from "../src/services/map-view.mjs";

const CATEGORY_ICON = { bache:"◉", basura:"▣", "fuga-de-agua":"≈", alumbrado:"✦", drenaje:"◌", "banqueta-danada":"▱", "calle-peligrosa":"!", senalizacion:"△", "arbol-obstruyendo":"♧", "ruido-excesivo":"◒", "semaforo-fallando":"●", "alcantarilla-destapada":"◉", otro:"•" };
const CATEGORY_LABEL = { bache:"Baches", basura:"Basura", "fuga-de-agua":"Fugas", alumbrado:"Alumbrado", drenaje:"Drenaje", "banqueta-danada":"Banquetas", "calle-peligrosa":"Riesgo vial", senalizacion:"Señalización", "semaforo-fallando":"Semáforos", "alcantarilla-destapada":"Alcantarillas", otro:"Otros" };
const STATUS_LABEL = { new:"Recibido", in_review:"En revisión", validated:"Validado", needs_info:"Requiere información" };

function pathPoints(points) {
  return points.split(" ").map((pair) => pair.split(",").map(Number)).map(([x,y]) => (x*1000)+","+((y*800))).join(" ");
}
function landmarkClass(landmark, zoom) {
  const zone = zoom < 1.2 ? "far" : zoom < 1.8 ? "mid" : "near";
  return "landmark landmark-"+landmark.kind+" landmark-"+landmark.size+" landmark-z-"+zone;
}

export default function PublicMap({ data }) {
  const [selectedId,setSelectedId] = useState(null);
  const [filter,setFilter] = useState("all");
  const [zoom,setZoom] = useState(1);
  const [themeId,setThemeId] = useState(DEFAULT_MAP_THEME);
  const theme = MAP_THEMES[themeId] || MAP_THEMES[DEFAULT_MAP_THEME];
  const categories = useMemo(() => ["all", ...new Set(data.reports.map((r) => r.category))], [data.reports]);
  const visibleReports = data.reports.filter((r) => filter === "all" || r.category === filter);
  const selected = visibleReports.find((r) => r.id === selectedId) || null;
  const attentionReport = data.attention ? data.reports.find((r) => r.id === data.attention.reportId) : null;
  const focusReport = (id) => { setSelectedId(id); setZoom((v) => Math.max(v,1.55)); };

  return (
    <section className="map-stage theme-lch" aria-label={"Mapa ciudadano de "+data.territory.name}
      style={{"--map-land":theme.palette.land,"--map-water":theme.palette.water,"--map-park":theme.palette.park,"--map-road":theme.palette.road,"--map-road-major":theme.palette.roadMajor,"--map-road-outline":theme.palette.roadOutline,"--map-text":theme.palette.text,"--map-text-soft":theme.palette.textSoft,"--map-accent":theme.palette.accent,"--map-accent-soft":theme.palette.accentSoft,"--map-hud":theme.palette.hud,"--map-hud-soft":theme.palette.hudSoft,"--map-glow":theme.palette.glow}}>
      <div className="map-toolbar map-toolbar-021">
        <div className="map-brand-badge"><span className="map-brand-dot"/>{theme.labels.territory.toUpperCase()} · {theme.mapLabel}</div>
        <div className="map-controls-row">
          <label className="theme-control"><span>TEMA</span><select value={themeId} onChange={(e)=>setThemeId(e.target.value)}>
            {Object.values(MAP_THEMES).map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
          <div className="zoom-control"><button onClick={()=>setZoom((v)=>clampMapZoom(v-.25))} aria-label="Alejar">−</button><span>{zoom.toFixed(2)}×</span><button onClick={()=>setZoom((v)=>clampMapZoom(v+.25))} aria-label="Acercar">+</button></div>
        </div>
      </div>

      {attentionReport && <button className="map-primary-alert" onClick={()=>focusReport(attentionReport.id)}>
        <span className="alert-orb">!</span><span className="alert-text"><small>ATENCIÓN CIUDADANA</small><strong>{attentionReport.title}</strong><em>{attentionReport.neighborhood || "Territorio activo"} · {data.attention.reasons?.[0] || "Prioridad operativa"}</em></span><span className="alert-arrow">↗</span>
      </button>}

      <div className="game-map city-atlas-map">
        <div className="atlas-water"/><div className="atlas-land"/>
        <div className="atlas-world" style={{transform:"translate(-50%, -50%) scale("+zoom+")"}}>
          <div className="atlas-park park-north"/><div className="atlas-park park-center"/><div className="atlas-park park-east"/>
          <svg className="street-network" viewBox="0 0 1000 800" role="img" aria-label="Red vial ilustrada de Puerto Vallarta">
            {data.map?.streets?.map((street)=><g key={street.id} className={"street-group street-"+street.className}>
              <polyline points={pathPoints(street.points)} className="street-underlay"/><polyline points={pathPoints(street.points)} className="street-line"/><polyline points={pathPoints(street.points)} className="street-center"/>
              {street.className !== "local" && <text className="street-label"><tspan x="0" y="0">{street.name}</tspan></text>}
            </g>)}
          </svg>
          <div className="atlas-zone-labels">{data.map?.zones?.map((zone)=><span key={zone.id} className="zone-label" style={{left:(zone.x*100)+"%",top:(zone.y*100)+"%"}}>{zone.name}</span>)}</div>
          <div className="atlas-landmarks">{data.map?.landmarks?.map((landmark)=><div key={landmark.id} className={landmarkClass(landmark,zoom)} style={{left:(landmark.x*100)+"%",top:(landmark.y*100)+"%"}}>
            <span className="landmark-icon">{landmark.kind==="waterfront"?"≈":landmark.kind==="marina"?"⚓":landmark.kind==="river"?"⌁":"◆"}</span><span>{landmark.name}</span>
          </div>)}</div>
          <div className="atlas-report-layer">{visibleReports.map((report)=><button key={report.id} className={"atlas-report-pin priority-"+(report.priority || "normal")} style={{left:(report.location.x*100)+"%",top:(report.location.y*100)+"%"}} onClick={()=>setSelectedId(report.id)} aria-label={report.title}>
            <span className="atlas-pin-ring"/><span className="atlas-pin-core">{CATEGORY_ICON[report.category] || "•"}</span>
          </button>)}</div>
        </div>

        <div className="territory-stamp"><strong>LA CALLE HABLA</strong><span>Territorio activo · {data.territory.name}</span></div>
        <div className="atlas-compass"><span>N</span><b>⌃</b></div>
        <div className="atlas-legend"><span><i className="legend-dot normal"/> Reporte</span><span><i className="legend-dot high"/> Atención</span><span><i className="legend-dot urgent"/> Prioridad</span></div>

        {selected && <aside className="report-popover atlas-popover"><button className="close-popover" onClick={()=>setSelectedId(null)} aria-label="Cerrar">×</button>
          <span className="popover-category">{CATEGORY_LABEL[selected.category] || selected.category}</span><h2>{selected.title}</h2><p>{selected.neighborhood || "Puerto Vallarta"}</p>
          <div className="popover-meta"><span>{STATUS_LABEL[selected.status] || selected.status}</span><span>● Coordenada real</span></div>
        </aside>}
        {visibleReports.length===0 && <div className="map-empty atlas-empty"><strong>Aún no hay reportes con coordenadas publicables</strong><span>Cuando llegue un reporte válido dentro del territorio, aparecerá aquí.</span></div>}
      </div>

      <div className="map-footer map-footer-021"><div><strong>MAPA VIVO</strong><span>Base cartográfica vectorial + capa ciudadana dinámica</span></div><span className="territory-lock">Geografía separada de la piel visual · Tema: {theme.name}</span></div>
    </section>
  );
}
