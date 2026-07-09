export function renderAdminPage() {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>La Calle Habla - Panel local</title>
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
        --warn: #9f4f1b;
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
      input,
      select,
      textarea {
        font: inherit;
      }

      .shell {
        width: min(1180px, 100%);
        margin: 0 auto;
        padding: 18px;
      }

      header {
        padding: 18px 0 14px;
      }

      h1 {
        margin: 0;
        font-size: 2.35rem;
        line-height: 1;
        letter-spacing: 0;
      }

      .subtitle {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 1rem;
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

      .grid {
        display: grid;
        gap: 14px;
      }

      .stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin: 12px 0 16px;
      }

      .stat {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 14px;
      }

      .stat strong {
        display: block;
        font-size: 1.8rem;
        line-height: 1;
      }

      .stat span {
        display: block;
        margin-top: 6px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .workspace {
        display: grid;
        gap: 16px;
      }

      section,
      aside {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 14px;
      }

      h2 {
        margin: 0 0 12px;
        font-size: 1.15rem;
      }

      .filters,
      .form-grid {
        display: grid;
        gap: 10px;
      }

      label {
        display: grid;
        gap: 5px;
        color: var(--muted);
        font-size: 0.9rem;
        font-weight: 700;
      }

      input,
      select,
      textarea {
        width: 100%;
        min-height: 42px;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 10px 11px;
        background: #ffffff;
        color: var(--ink);
      }

      textarea {
        min-height: 104px;
        resize: vertical;
      }

      .actions {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
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

      button.secondary {
        background: #e6dfd3;
        color: var(--ink);
      }

      button.secondary:hover,
      button.secondary:focus {
        background: #d7cdbd;
      }

      .message {
        min-height: 24px;
        margin: 10px 0 0;
        color: var(--muted);
        font-size: 0.94rem;
      }

      .message.success {
        color: var(--ok);
        font-weight: 800;
      }

      .message.error {
        color: var(--danger);
        font-weight: 800;
      }

      .report-list {
        display: grid;
        gap: 12px;
      }

      .report-card {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 13px;
        background: #fffaf0;
      }

      .report-head {
        display: flex;
        gap: 8px;
        justify-content: space-between;
        align-items: flex-start;
      }

      .report-title {
        margin: 0;
        font-size: 1.02rem;
      }

      .chips {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin: 9px 0;
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

      .chip.status-new {
        background: #dff0eb;
        color: #164d42;
      }

      .chip.status-validated {
        background: #dcebd6;
        color: #24511c;
      }

      .chip.priority-urgent,
      .chip.priority-high {
        background: #f4dac8;
        color: #7b350e;
      }

      .meta {
        display: grid;
        gap: 5px;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .empty {
        border: 1px dashed var(--line);
        border-radius: 8px;
        padding: 20px;
        color: var(--muted);
        text-align: center;
      }

      @media (min-width: 720px) {
        .stats {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .filters {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .form-grid .wide {
          grid-column: 1 / -1;
        }
      }

      @media (min-width: 980px) {
        .workspace {
          grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.65fr);
          align-items: start;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header>
        <h1>La Calle Habla</h1>
        <p class="subtitle">Panel local de reportes ciudadanos</p>
        <div class="notice">Vista local de prueba. No es un sistema oficial de gobierno.</div>
      </header>

      <section class="grid stats" aria-label="Contadores rapidos">
        <div class="stat"><strong id="stat-total">0</strong><span>Total de reportes</span></div>
        <div class="stat"><strong id="stat-new">0</strong><span>Nuevos</span></div>
        <div class="stat"><strong id="stat-validated">0</strong><span>Validados</span></div>
        <div class="stat"><strong id="stat-urgent">0</strong><span>Urgentes</span></div>
        <div class="stat"><strong id="stat-manual">0</strong><span>Reportes manuales/locales</span></div>
      </section>

      <div class="workspace">
        <section>
          <h2>Reportes</h2>
          <div class="filters" aria-label="Filtros de reportes">
            <label>
              Categoria
              <select id="filter-category">
                <option value="">Todas</option>
              </select>
            </label>
            <label>
              Estado
              <select id="filter-status">
                <option value="">Todos</option>
              </select>
            </label>
            <label>
              Prioridad
              <select id="filter-priority">
                <option value="">Todas</option>
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </label>
          </div>
          <p id="list-message" class="message">Cargando reportes...</p>
          <div id="report-list" class="report-list"></div>
        </section>

        <aside>
          <h2>Crear reporte local</h2>
          <form id="report-form">
            <div class="form-grid">
              <label class="wide">
                Titulo
                <input name="title" required minlength="5" maxlength="120" placeholder="Ej. Bache nuevo frente a tienda">
              </label>
              <label class="wide">
                Descripcion
                <textarea name="description" required minlength="15" maxlength="1000" placeholder="Describe que pasa, donde se nota y por que es importante revisarlo."></textarea>
              </label>
              <label>
                Categoria
                <select id="form-category" name="category" required></select>
              </label>
              <label>
                Prioridad
                <select name="priority">
                  <option value="normal">Normal</option>
                  <option value="low">Baja</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>
              <label class="wide">
                Ubicacion textual
                <input name="locationText" required minlength="5" maxlength="200" placeholder="Calle, cruce o referencia visible">
              </label>
              <label>
                Colonia
                <input name="neighborhood" maxlength="120" placeholder="Ej. Versalles">
              </label>
              <label>
                Zona
                <input name="zone" maxlength="120" placeholder="Ej. Centro">
              </label>
              <label>
                Evidencias
                <input name="evidenceCount" type="number" min="0" max="20" value="0">
              </label>
              <label>
                Alias ciudadano
                <input name="citizenAlias" maxlength="80" placeholder="Ciudadano anonimo">
              </label>
            </div>
            <div class="actions" style="margin-top: 12px;">
              <button type="submit">Guardar reporte</button>
              <button class="secondary" type="reset">Limpiar</button>
            </div>
            <p id="form-message" class="message" role="status"></p>
          </form>
        </aside>
      </div>
    </main>

    <script>
      const state = {
        reports: [],
        categories: [],
        statuses: [],
        stats: null
      };

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
        return state.categories.find((category) => category.slug === slug)?.name || slug;
      }

      function formatDate(value) {
        if (!value) return "Sin fecha";
        return new Intl.DateTimeFormat("es-MX", {
          dateStyle: "medium",
          timeStyle: "short"
        }).format(new Date(value));
      }

      function fillSelects() {
        const categoryOptions = state.categories
          .map((category) => '<option value="' + escapeHtml(category.slug) + '">' + escapeHtml(category.name) + '</option>')
          .join("");
        const statusOptions = state.statuses
          .map((status) => '<option value="' + escapeHtml(status.slug) + '">' + escapeHtml(status.name) + '</option>')
          .join("");

        byId("filter-category").innerHTML = '<option value="">Todas</option>' + categoryOptions;
        byId("form-category").innerHTML = '<option value="">Selecciona categoria</option>' + categoryOptions;
        byId("filter-status").innerHTML = '<option value="">Todos</option>' + statusOptions;
      }

      function updateStats() {
        const stats = state.stats || {};
        const manualCount = state.reports.filter((report) => report.source === "manual").length;

        byId("stat-total").textContent = stats.totalReports || 0;
        byId("stat-new").textContent = stats.byStatus?.new || 0;
        byId("stat-validated").textContent = stats.byStatus?.validated || 0;
        byId("stat-urgent").textContent = stats.byPriority?.urgent || 0;
        byId("stat-manual").textContent = manualCount;
      }

      function filteredReports() {
        const category = byId("filter-category").value;
        const status = byId("filter-status").value;
        const priority = byId("filter-priority").value;

        return state.reports.filter((report) => {
          if (category && report.category !== category) return false;
          if (status && report.status !== status) return false;
          if (priority && report.priority !== priority) return false;
          return true;
        });
      }

      function renderReports() {
        const list = byId("report-list");
        const message = byId("list-message");
        const reports = filteredReports().slice().sort((left, right) => {
          return text(right.createdAt).localeCompare(text(left.createdAt));
        });

        message.textContent = reports.length + " reportes visibles";

        if (reports.length === 0) {
          list.innerHTML = '<div class="empty">No hay reportes con esos filtros.</div>';
          return;
        }

        list.innerHTML = reports.map((report) => {
          const zone = report.neighborhood || report.zone || "Sin zona";
          return '<article class="report-card">' +
            '<div class="report-head">' +
              '<h3 class="report-title">' + escapeHtml(report.title) + '</h3>' +
              '<span class="chip priority-' + escapeHtml(report.priority) + '">' + escapeHtml(labels.priority[report.priority] || report.priority) + '</span>' +
            '</div>' +
            '<div class="chips">' +
              '<span class="chip">' + escapeHtml(categoryName(report.category)) + '</span>' +
              '<span class="chip status-' + escapeHtml(report.status) + '">' + escapeHtml(labels.status[report.status] || report.status) + '</span>' +
              '<span class="chip">' + escapeHtml(labels.source[report.source] || report.source) + '</span>' +
            '</div>' +
            '<div class="meta">' +
              '<div><strong>Zona o colonia:</strong> ' + escapeHtml(zone) + '</div>' +
              '<div><strong>Ubicacion:</strong> ' + escapeHtml(report.locationText) + '</div>' +
              '<div><strong>Fecha:</strong> ' + escapeHtml(formatDate(report.createdAt)) + '</div>' +
              '<div><strong>Evidencias:</strong> ' + escapeHtml(report.evidenceCount) + '</div>' +
            '</div>' +
          '</article>';
        }).join("");
      }

      async function loadData() {
        const [categories, statuses, reports, stats] = await Promise.all([
          fetchJson("/api/categories"),
          fetchJson("/api/statuses"),
          fetchJson("/api/reports"),
          fetchJson("/api/stats")
        ]);

        state.categories = categories.categories || [];
        state.statuses = statuses.statuses || [];
        state.reports = reports.reports || [];
        state.stats = stats.stats || {};

        fillSelects();
        updateStats();
        renderReports();
      }

      function formPayload(form) {
        const data = new FormData(form);
        const payload = {
          title: text(data.get("title")).trim(),
          description: text(data.get("description")).trim(),
          category: text(data.get("category")).trim(),
          locationText: text(data.get("locationText")).trim(),
          neighborhood: text(data.get("neighborhood")).trim(),
          zone: text(data.get("zone")).trim(),
          priority: text(data.get("priority")).trim(),
          evidenceCount: Number.parseInt(text(data.get("evidenceCount") || "0"), 10),
          citizenAlias: text(data.get("citizenAlias")).trim()
        };

        if (!payload.neighborhood) delete payload.neighborhood;
        if (!payload.zone) delete payload.zone;
        if (!payload.citizenAlias) delete payload.citizenAlias;

        return payload;
      }

      async function submitReport(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const message = byId("form-message");
        message.className = "message";
        message.textContent = "Guardando reporte...";

        try {
          const created = await fetchJson("/api/reports", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formPayload(form))
          });

          form.reset();
          message.className = "message success";
          message.textContent = "Reporte guardado: " + created.report.title;
          await loadData();
        } catch (error) {
          message.className = "message error";
          message.textContent = error.message || "No se pudo guardar el reporte.";
        }
      }

      for (const id of ["filter-category", "filter-status", "filter-priority"]) {
        byId(id).addEventListener("change", renderReports);
      }

      byId("report-form").addEventListener("submit", submitReport);

      loadData().catch(() => {
        byId("list-message").className = "message error";
        byId("list-message").textContent = "No se pudieron cargar los reportes locales.";
      });
    </script>
  </body>
</html>`;
}
