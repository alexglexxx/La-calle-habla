import { getPublicPortalData } from "../src/services/public-report-view.mjs";
import PublicMap from "./public-map-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getPublicPortalData();

  return (
    <main className="public-shell">
      <header className="public-topbar">
        <div className="brand-lockup">
          <span className="brand-mark">LCH</span>
          <div>
            <strong>LA CALLE HABLA</strong>
            <span>Mapa ciudadano</span>
          </div>
        </div>
        <div className="territory-chip">
          <span className="territory-dot" />
          {data.territory.name}
        </div>
      </header>

      <section className="hero-copy">
        <div>
          <span className="eyebrow">ZONA ACTIVA · {data.territory.state.toUpperCase()}</span>
          <h1>Lo que pasa en la calle,<br /><em>se ve en el mapa.</em></h1>
          <p>Explora reportes ciudadanos de problemas urbanos dentro del territorio de {data.territory.name}.</p>
        </div>
        <div className="public-stat">
          <span>{data.stats.active}</span>
          <small>reportes activos</small>
        </div>
      </section>

      <PublicMap data={data} />
    </main>
  );
}
