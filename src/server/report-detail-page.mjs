export function renderReportDetailPage() {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Detalle de reporte - La Calle Habla</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #18221f;
        --muted: #5f6f68;
        --paper: #f4f1ea;
        --panel: #fffdf8;
        --line: #ddd6ca;
        --accent: #1f6f61;
        --accent-dark: #174f45;
        --danger: #8d2d2d;
        --ok: #246b45;
        --chip: #e8e0d3;
        font-family: Arial, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        line-height: 1.45;
      }

      button,
      select {
        font: inherit;
      }

      .shell {
        width: min(900px, 100%);
        margin: 0 auto;
        padding: 18px;
      }

      a {
        color: var(--accent-dark);
        font-weight: 800;
      }

      header {
        padding: 18px 0 14px;
      }

      h1 {
        margin: 0;
        font-size: 2rem;
        line-height: 1;
        letter-spacing: 0;
      }

      .subtitle {
        margin: 8px 0 0;
        color: var(--muted);
      }

      .notice {
        margin-top: 14px;
        padding: 12px 14px;
        border: 1px solid #dec59c;
        background: #fff2d8;
        color: #654009;
        border-radius: 8px;
        font-weight: 700;
      }

      .layout {
        display: grid;
        gap: 14px;
      }

      section {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 14px;
      }

      h2 {
        margin: 0 0 12px;
        font-size: 1.16rem;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 10px 0;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        min-height: 26px;
        border-radius: 999px;
        padding: 4px 9px;
        background: var(--chip);
        color: var(--ink);
        font-size: 0.78rem;
        font-weight: 800;
      }

      .meta {
        display: grid;
        gap: 8px;
        color: var(--muted);
      }

      .meta strong {
        color: var(--ink);
      }

      label {
        display: grid;
        gap: 6px;
        color: var(--muted);
        font-weight: 800;
        font-size: 0.92rem;
      }

      select {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #ffffff;
        color: var(--ink);
        padding: 10px 11px;
      }

      button {
        border: 0;
        border-radius: 8px;
        background: var(--accent);
        color: #ffffff;
        min-height: 44px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 800;
      }

      button:hover,
      button:focus {
        background: var(--accent-dark);
      }

      .message {
        min-height: 24px;
        color: var(--muted);
      }

      .message.success {
        color: var(--ok);
        font-weight: 800;
      }

      .message.error {
        color: var(--danger);
        font-weight: 800;
      }

      @media (min-width: 820px) {
        .layout {
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          align-items: start;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header>
        <p><a href="/admin">Volver al panel</a></p>
        <h1>La Calle Habla</h1>
        <p class="subtitle">Detalle local de reporte ciudadano</p>
        <div class="notice">Vista local de prueba. No es un sistema oficial de gobierno.</div>
      </header>

      <div class="layout">
        <section>
          <h2 id="report-title">Cargando reporte...</h2>
          <div id="report-chips" class="chips"></div>
          <div id="report-meta" class="meta"></div>
        </section>

        <section>
          <h2>Seguimiento administrativo local</h2>
          <p class="message">Este cambio solo actualiza el seguimiento interno local. No confirma resolucion por autoridad.</p>
          <form id="status-form">
            <label>
              Estado interno
              <select id="status-select" name="status"></select>
            </label>
            <button type="submit" style="margin-top: 12px;">Actualizar estado</button>
            <p id="status-message" class="message" role="status"></p>
          </form>
        </section>
      </div>
    </main>

    <script>
      const labels = {
        status: {
          new: "Nuevo",
          in_review: "En revision",
          validated: "Validado",
          needs_info: "Requiere informacion",
          duplicate: "Duplicado",
          closed: "Cerrado"
        },
        priority: {
          low: "Baja",
          normal: "Normal",
          high: "Alta",
          urgent: "Urgente"
        },
        source: {
          seed: "Seed",
          manual: "Manual/local",
          whatsapp: "WhatsApp"
        }
      };
      let report = null;
      let categories = [];
      let statuses = [];

      function text(value) {
        return String(value ?? "");
      }

      function escapeHtml(value) {
        return text(value)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }

      function byId(id) {
        return document.getElementById(id);
      }

      async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const body = await response.json().catch(() => ({}));

        if (!response.ok || body.ok === false) {
          const message = body.errors
            ? body.errors.map((error) => error.message).join(" ")
            : body.message || "No se pudo completar la accion.";
          throw new Error(message);
        }

        return body;
      }

      function categoryName(slug) {
        return categories.find((category) => category.slug === slug)?.name || slug;
      }

      function formatDate(value) {
        if (!value) return "Sin fecha";
        return new Intl.DateTimeFormat("es-MX", {
          dateStyle: "medium",
          timeStyle: "short"
        }).format(new Date(value));
      }

      function renderReport() {
        byId("report-title").textContent = report.title;
        byId("report-chips").innerHTML =
          '<span class="chip">' + escapeHtml(categoryName(report.category)) + '</span>' +
          '<span class="chip">' + escapeHtml(labels.status[report.status] || report.status) + '</span>' +
          '<span class="chip">' + escapeHtml(labels.priority[report.priority] || report.priority) + '</span>' +
          '<span class="chip">' + escapeHtml(labels.source[report.source] || report.source) + '</span>';
        byId("report-meta").innerHTML =
          '<div><strong>Descripcion:</strong> ' + escapeHtml(report.description) + '</div>' +
          '<div><strong>Categoria:</strong> ' + escapeHtml(categoryName(report.category)) + '</div>' +
          '<div><strong>Estado actual:</strong> ' + escapeHtml(labels.status[report.status] || report.status) + '</div>' +
          '<div><strong>Prioridad:</strong> ' + escapeHtml(labels.priority[report.priority] || report.priority) + '</div>' +
          '<div><strong>Ubicacion:</strong> ' + escapeHtml(report.locationText) + '</div>' +
          '<div><strong>Colonia:</strong> ' + escapeHtml(report.neighborhood || "Sin colonia") + '</div>' +
          '<div><strong>Zona:</strong> ' + escapeHtml(report.zone || "Sin zona") + '</div>' +
          '<div><strong>Alias ciudadano:</strong> ' + escapeHtml(report.citizenAlias || "Ciudadano anonimo") + '</div>' +
          '<div><strong>Evidencias:</strong> ' + escapeHtml(report.evidenceCount) + '</div>' +
          '<div><strong>Origen:</strong> ' + escapeHtml(labels.source[report.source] || report.source) + '</div>' +
          '<div><strong>Fecha de reporte:</strong> ' + escapeHtml(formatDate(report.createdAt)) + '</div>' +
          '<div><strong>Ultima actualizacion:</strong> ' + escapeHtml(formatDate(report.updatedAt)) + '</div>' +
          '<div><strong>ID:</strong> ' + escapeHtml(report.id) + '</div>';
        byId("status-select").value = report.status;
      }

      function fillStatuses() {
        byId("status-select").innerHTML = statuses
          .map((status) => '<option value="' + escapeHtml(status.slug) + '">' + escapeHtml(status.name) + '</option>')
          .join("");
      }

      async function loadReport() {
        const id = new URLSearchParams(window.location.search).get("id");

        if (!id) {
          throw new Error("Falta el id del reporte.");
        }

        const [categoryResponse, statusResponse, reportResponse] = await Promise.all([
          fetchJson("/api/categories"),
          fetchJson("/api/statuses"),
          fetchJson("/api/reports?id=" + encodeURIComponent(id))
        ]);

        categories = categoryResponse.categories || [];
        statuses = statusResponse.statuses || [];
        report = reportResponse.report;
        fillStatuses();
        renderReport();
      }

      async function submitStatus(event) {
        event.preventDefault();
        const message = byId("status-message");
        message.className = "message";
        message.textContent = "Guardando seguimiento...";

        try {
          const response = await fetchJson("/api/reports?id=" + encodeURIComponent(report.id), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              status: byId("status-select").value
            })
          });

          report = response.report;
          renderReport();
          message.className = "message success";
          message.textContent = "Estado guardado para seguimiento interno.";
        } catch (error) {
          message.className = "message error";
          message.textContent = error.message || "No se pudo guardar el estado.";
        }
      }

      byId("status-form").addEventListener("submit", submitStatus);
      loadReport().catch((error) => {
        byId("report-title").textContent = "No se pudo cargar el reporte";
        byId("report-meta").innerHTML = '<div>' + escapeHtml(error.message) + '</div>';
      });
    </script>
  </body>
</html>`;
}
