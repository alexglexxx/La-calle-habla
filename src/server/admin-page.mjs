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

      .detail-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 34px;
        border-radius: 8px;
        padding: 7px 10px;
        background: #e6dfd3;
        color: var(--ink);
        font-size: 0.86rem;
        font-weight: 800;
        text-decoration: none;
      }

      button:hover,
      button:focus {
        background: var(--accent-dark);
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.62;
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

      .privacy-box {
        display: grid;
        gap: 10px;
        margin-top: 12px;
        border: 1px solid #dec59c;
        border-radius: 8px;
        padding: 12px;
        background: #fff8e8;
        color: #563907;
      }

      .privacy-box p {
        margin: 0;
      }

      .privacy-details {
        color: var(--ink);
      }

      .privacy-details summary {
        min-height: 34px;
        cursor: pointer;
        font-weight: 800;
      }

      .checkbox-label {
        display: flex;
        grid-template-columns: none;
        gap: 10px;
        align-items: flex-start;
        color: var(--ink);
        font-size: 0.92rem;
        line-height: 1.35;
      }

      .checkbox-label input {
        width: auto;
        min-width: 20px;
        min-height: 20px;
        margin-top: 1px;
      }

      .sensitive-tag {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        border-radius: 999px;
        padding: 3px 8px;
        background: #fff2d8;
        color: #654009;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .admin-warning {
        margin: 10px 0;
        padding: 10px 12px;
        border: 1px solid #dec59c;
        border-radius: 8px;
        background: #fff8e8;
        color: #563907;
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

      .report-card.selected {
        border-color: var(--accent);
        box-shadow: 0 0 0 2px rgba(31, 111, 97, 0.12);
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

      .detail-panel {
        margin: 14px 0;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fffaf0;
        padding: 13px;
      }

      .detail-panel[hidden] {
        display: none;
      }

      .detail-header {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        justify-content: space-between;
      }

      .detail-title {
        margin: 0;
        font-size: 1.05rem;
      }

      .detail-warning {
        margin: 10px 0;
        color: #654009;
        font-weight: 800;
      }

      .detail-fields {
        display: grid;
        gap: 7px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .detail-fields strong {
        color: var(--ink);
      }

      .status-form {
        display: grid;
        gap: 10px;
        margin-top: 12px;
      }

      .help {
        margin: 0;
        color: var(--muted);
        font-size: 0.84rem;
      }

      .field-message {
        min-height: 20px;
        margin: 0;
        color: var(--danger);
        font-size: 0.88rem;
        font-weight: 800;
      }

      .history-section {
        margin-top: 14px;
        border-top: 1px solid var(--line);
        padding-top: 14px;
      }

      .history-warning {
        margin: 0 0 12px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      .timeline {
        display: grid;
        gap: 10px;
      }

      .timeline-item {
        display: grid;
        gap: 5px;
        border-left: 4px solid var(--accent);
        border-radius: 0 8px 8px 0;
        background: #fffdf8;
        padding: 10px 11px;
      }

      .timeline-item.note {
        border-left-color: var(--warn);
      }

      .timeline-type {
        color: var(--ink);
        font-weight: 800;
      }

      .timeline-meta,
      .timeline-note {
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
          <div id="report-detail-panel" class="detail-panel" hidden>
            <div class="detail-header">
              <h3 id="detail-title" class="detail-title">Reporte seleccionado</h3>
              <button id="close-detail" class="secondary" type="button">Cerrar detalle</button>
            </div>
            <p class="detail-warning">Este cambio solo actualiza el seguimiento interno local. No confirma resolución por autoridad.</p>
            <p class="admin-warning">Consulta únicamente los datos necesarios para revisar el reporte. No copies información personal a notas internas.</p>
            <div id="detail-fields" class="detail-fields"></div>
            <form id="status-form" class="status-form">
              <label>
                Estado interno
                <select id="status-select" name="status" required></select>
              </label>
              <div class="actions">
                <button id="status-submit" type="submit">Actualizar estado</button>
              </div>
              <p id="status-message" class="message" role="status"></p>
            </form>
            <form id="note-form" class="status-form">
              <label>
                Nota interna
                <textarea id="note-text" name="note" maxlength="500" placeholder="Agrega una nota de seguimiento interno. No es una respuesta oficial."></textarea>
              </label>
              <p id="note-counter" class="help">0 de 500 caracteres</p>
              <p id="note-field-message" class="field-message" aria-live="polite"></p>
              <div class="actions">
                <button id="note-submit" type="submit">Agregar nota</button>
              </div>
              <p id="note-message" class="message" role="status"></p>
            </form>
            <div class="history-section">
              <h3 class="detail-title">Historial interno</h3>
              <p class="history-warning">Este historial corresponde al seguimiento interno de La Calle Habla y no representa una resolución oficial.</p>
              <p id="history-message" class="message" role="status">Cargando historial...</p>
              <div id="history-list" class="timeline"></div>
            </div>
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
                <textarea name="description" required minlength="15" maxlength="1000" placeholder="Describe el problema sin incluir contraseñas, datos bancarios, identificaciones oficiales, informacion medica ni datos de menores."></textarea>
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
                Ubicacion aproximada
                <input name="locationText" required minlength="5" maxlength="200" placeholder="Referencia general; no necesitas dar domicilio exacto">
              </label>
              <label>
                Precision de ubicacion
                <select name="locationPrecision">
                  <option value="approximate">Aproximada</option>
                  <option value="precise">Precisa (opcional sensible)</option>
                </select>
              </label>
              <label>
                Colonia (opcional)
                <input name="neighborhood" maxlength="120" placeholder="Ej. Versalles">
              </label>
              <label>
                Zona (opcional)
                <input name="zone" maxlength="120" placeholder="Ej. Centro">
              </label>
              <label>
                Evidencias (opcional sensible)
                <input name="evidenceCount" type="number" min="0" max="20" value="0">
              </label>
              <label>
                Telefono de contacto (opcional sensible)
                <input name="contactPhone" maxlength="30" inputmode="tel" placeholder="Solo si quieres que se pueda pedir informacion">
              </label>
              <label>
                Alias ciudadano (opcional)
                <input name="citizenAlias" maxlength="80" placeholder="Ciudadano anonimo">
              </label>
            </div>
            <div class="privacy-box" aria-label="Aviso corto de privacidad">
              <p><strong>Privacidad MVP:</strong> Usaremos la información únicamente para registrar y revisar este reporte dentro de La Calle Habla. No incluyas contraseñas, datos bancarios, identificaciones oficiales ni información médica. Este servicio no pertenece al gobierno y enviar un reporte no garantiza su resolución.</p>
              <details class="privacy-details">
                <summary>Ver explicación ampliada de privacidad</summary>
                <p>Esta es una base operativa local del MVP, no un aviso legal definitivo. Teléfono, ubicación precisa y evidencias son opcionales y pueden ser sensibles. La información se guarda en archivos runtime locales ignorados por Git. Antes de usar datos reales o producción hace falta revisión legal.</p>
              </details>
              <label class="checkbox-label">
                <input id="privacy-acknowledged" name="privacyAcknowledged" type="checkbox">
                <span>Reconozco este aviso de privacidad operativo del MVP.</span>
              </label>
              <label class="checkbox-label">
                <input id="sensitive-data-consent" name="sensitiveDataConsent" type="checkbox">
                <span>Doy consentimiento para guardar datos opcionales sensibles que yo proporcione, como teléfono, ubicación precisa o evidencia.</span>
              </label>
              <p id="privacy-field-message" class="field-message" aria-live="polite"></p>
            </div>
            <div class="actions" style="margin-top: 12px;">
              <button id="report-submit" type="submit">Guardar reporte</button>
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
        stats: null,
        selectedReportId: null,
        history: [],
        historyLoading: false
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
      const privacyNoticeVersion = "mvp-1";

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

      function statusName(slug) {
        return state.statuses.find((status) => status.slug === slug)?.name || labels.status[slug] || slug;
      }

      function formatDate(value) {
        if (!value) return "Sin fecha";
        return new Intl.DateTimeFormat("es-MX", {
          dateStyle: "medium",
          timeStyle: "short"
        }).format(new Date(value));
      }

      function maskPhone(value) {
        const digits = text(value).replace(/\D/g, "");
        if (digits.length < 4) return "Dato sensible registrado";
        return "termina en " + digits.slice(-4);
      }

      function locationSummary(report) {
        if (report.locationPrecision === "precise") {
          return "Ubicacion precisa registrada; revisar solo en detalle.";
        }
        return report.locationText;
      }

      function privacyStatus(report) {
        if (!report.privacyNoticeVersion) {
          return "Registro histórico sin consentimiento versionado";
        }

        return "Aviso " + report.privacyNoticeVersion + " reconocido el " +
          formatDate(report.privacyAcknowledgedAt) + ". Consentimiento sensible: " +
          (report.sensitiveDataConsent ? "si" : "no requerido/no otorgado") + ".";
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
        byId("status-select").innerHTML = statusOptions;
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
          const selectedClass = state.selectedReportId === report.id ? " selected" : "";
          return '<article class="report-card' + selectedClass + '">' +
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
              '<div><strong>Ubicacion:</strong> ' + escapeHtml(locationSummary(report)) + '</div>' +
              (report.contactPhone ? '<div><strong>Telefono:</strong> ' + escapeHtml(maskPhone(report.contactPhone)) + '</div>' : '') +
              '<div><strong>Fecha:</strong> ' + escapeHtml(formatDate(report.createdAt)) + '</div>' +
              '<div><strong>Evidencias:</strong> ' + escapeHtml(report.evidenceCount) + '</div>' +
              '<div class="actions">' +
                '<button class="secondary" type="button" data-report-id="' + escapeHtml(report.id) + '">Revisar</button>' +
                '<a class="detail-link" href="/admin/report?id=' + encodeURIComponent(report.id) + '">Abrir página</a>' +
              '</div>' +
            '</div>' +
          '</article>';
        }).join("");

        for (const button of list.querySelectorAll("[data-report-id]")) {
          button.addEventListener("click", () => selectReport(button.dataset.reportId));
        }
      }

      function selectedReport() {
        return state.reports.find((report) => report.id === state.selectedReportId) || null;
      }

      function renderDetail() {
        const panel = byId("report-detail-panel");
        const report = selectedReport();

        if (!report) {
          panel.hidden = true;
          byId("status-message").textContent = "";
          byId("note-message").textContent = "";
          byId("history-list").innerHTML = "";
          byId("history-message").textContent = "";
          return;
        }

        panel.hidden = false;
        byId("detail-title").textContent = report.title;
        byId("status-select").value = report.status;
        byId("detail-fields").innerHTML =
          '<div><strong>Descripción:</strong> ' + escapeHtml(report.description) + '</div>' +
          '<div><strong>Categoría:</strong> ' + escapeHtml(categoryName(report.category)) + '</div>' +
          '<div><strong>Estado actual:</strong> ' + escapeHtml(statusName(report.status)) + '</div>' +
          '<div><strong>Prioridad:</strong> ' + escapeHtml(labels.priority[report.priority] || report.priority) + '</div>' +
          '<div><strong>Ubicación:</strong> ' + escapeHtml(report.locationText) + ' ' + (report.locationPrecision === "precise" ? '<span class="sensitive-tag">Dato sensible</span>' : '') + '</div>' +
          '<div><strong>Colonia:</strong> ' + escapeHtml(report.neighborhood || "Sin colonia") + '</div>' +
          '<div><strong>Zona:</strong> ' + escapeHtml(report.zone || "Sin zona") + '</div>' +
          (report.contactPhone ? '<div><strong>Telefono:</strong> ' + escapeHtml(report.contactPhone) + ' <span class="sensitive-tag">Dato sensible</span></div>' : '') +
          '<div><strong>Alias ciudadano:</strong> ' + escapeHtml(report.citizenAlias || "Ciudadano anonimo") + '</div>' +
          '<div><strong>Evidencias:</strong> ' + escapeHtml(report.evidenceCount) + (Number(report.evidenceCount) > 0 ? ' <span class="sensitive-tag">Dato sensible</span>' : '') + '</div>' +
          '<div><strong>Privacidad:</strong> ' + escapeHtml(privacyStatus(report)) + '</div>' +
          '<div><strong>Origen:</strong> ' + escapeHtml(labels.source[report.source] || report.source) + '</div>' +
          '<div><strong>Creado:</strong> ' + escapeHtml(formatDate(report.createdAt)) + '</div>' +
          '<div><strong>Actualizado:</strong> ' + escapeHtml(formatDate(report.updatedAt)) + '</div>' +
          '<div><strong>ID:</strong> ' + escapeHtml(report.id) + '</div>';
        renderHistory();
      }

      function renderHistory() {
        const message = byId("history-message");
        const list = byId("history-list");
        const report = selectedReport();

        if (!report) {
          return;
        }

        if (state.historyLoading) {
          message.className = "message";
          message.textContent = "Cargando historial...";
          list.innerHTML = "";
          return;
        }

        if (state.history.length === 0) {
          message.className = "message";
          message.textContent = "Este reporte todavía no tiene seguimiento interno registrado.";
          list.innerHTML = '<div class="empty">Sin historial interno por ahora.</div>';
          return;
        }

        message.className = "message";
        message.textContent = state.history.length + " eventos registrados";
        list.innerHTML = state.history.map((event) => {
          const isNote = event.type === "internal_note";
          const typeLabel = isNote ? "Nota interna" : "Cambio de estado interno";
          const transition = isNote
            ? ""
            : '<div class="timeline-meta"><strong>Estado interno:</strong> ' +
              escapeHtml(statusName(event.previousStatus)) + " a " + escapeHtml(statusName(event.newStatus)) +
              '</div>';
          const note = event.note
            ? '<div class="timeline-note"><strong>Nota:</strong> ' + escapeHtml(event.note) + '</div>'
            : "";

          return '<article class="timeline-item ' + (isNote ? "note" : "status") + '">' +
            '<div class="timeline-type">' + escapeHtml(typeLabel) + '</div>' +
            '<div class="timeline-meta"><time datetime="' + escapeHtml(event.createdAt) + '">' +
              escapeHtml(formatDate(event.createdAt)) + '</time> · Origen local: ' + escapeHtml(event.actor) + '</div>' +
            transition +
            note +
          '</article>';
        }).join("");
      }

      async function loadHistory(reportId) {
        state.historyLoading = true;
        state.history = [];
        renderHistory();

        const response = await fetchJson("/api/report-history?id=" + encodeURIComponent(reportId));
        state.history = response.events || [];
        state.historyLoading = false;
        renderHistory();
      }

      function selectReport(id) {
        state.selectedReportId = id;
        state.history = [];
        state.historyLoading = true;
        byId("status-message").className = "message";
        byId("status-message").textContent = "";
        byId("note-message").className = "message";
        byId("note-message").textContent = "";
        byId("note-field-message").textContent = "";
        byId("note-text").value = "";
        updateNoteCounter();
        renderReports();
        renderDetail();
        byId("report-detail-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        loadHistory(id).catch((error) => {
          state.historyLoading = false;
          state.history = [];
          byId("history-message").className = "message error";
          byId("history-message").textContent = error.message || "No se pudo cargar el historial.";
          byId("history-list").innerHTML = "";
        });
      }

      function closeDetail() {
        state.selectedReportId = null;
        state.history = [];
        state.historyLoading = false;
        renderReports();
        renderDetail();
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

        if (state.selectedReportId && !state.reports.some((report) => report.id === state.selectedReportId)) {
          state.selectedReportId = null;
        }

        fillSelects();
        updateStats();
        renderReports();
        renderDetail();
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
          citizenAlias: text(data.get("citizenAlias")).trim(),
          contactPhone: text(data.get("contactPhone")).trim(),
          locationPrecision: text(data.get("locationPrecision")).trim(),
          privacyNoticeVersion,
          privacyAcknowledged: data.get("privacyAcknowledged") === "on",
          sensitiveDataConsent: data.get("sensitiveDataConsent") === "on"
        };

        if (!payload.neighborhood) delete payload.neighborhood;
        if (!payload.zone) delete payload.zone;
        if (!payload.citizenAlias) delete payload.citizenAlias;
        if (!payload.contactPhone) delete payload.contactPhone;

        return payload;
      }

      async function submitReport(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const message = byId("form-message");
        const privacyMessage = byId("privacy-field-message");
        const button = byId("report-submit");
        message.className = "message";
        privacyMessage.textContent = "";

        if (!byId("privacy-acknowledged").checked) {
          privacyMessage.textContent = "Debes reconocer el aviso antes de enviar el reporte.";
          message.textContent = "";
          return;
        }

        message.textContent = "Guardando reporte...";
        button.disabled = true;

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
        } finally {
          button.disabled = false;
        }
      }

      async function submitStatus(event) {
        event.preventDefault();
        const report = selectedReport();
        const message = byId("status-message");
        const button = byId("status-submit");

        if (!report) {
          return;
        }

        message.className = "message";
        message.textContent = "Actualizando estado...";
        button.disabled = true;

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

          state.selectedReportId = response.report.id;
          await loadData();
          await loadHistory(response.report.id);
          message.className = "message success";
          message.textContent = response.noop
            ? "El estado interno ya era ese. No se agrego historial sin nota."
            : "Estado actualizado para seguimiento interno local.";
        } catch (error) {
          message.className = "message error";
          message.textContent = error.message || "No se pudo actualizar el estado.";
        } finally {
          button.disabled = false;
        }
      }

      function updateNoteCounter() {
        const value = byId("note-text").value;
        byId("note-counter").textContent = value.length + " de 500 caracteres";
      }

      async function submitNote(event) {
        event.preventDefault();
        const report = selectedReport();
        const note = byId("note-text").value.trim();
        const message = byId("note-message");
        const fieldMessage = byId("note-field-message");
        const button = byId("note-submit");

        if (!report) {
          return;
        }

        fieldMessage.textContent = "";
        message.className = "message";

        if (!note) {
          fieldMessage.textContent = "La nota interna no puede estar vacia.";
          message.textContent = "";
          return;
        }

        if (note.length > 500) {
          fieldMessage.textContent = "La nota interna debe tener 500 caracteres o menos.";
          message.textContent = "";
          return;
        }

        button.disabled = true;
        message.textContent = "Guardando nota interna...";

        try {
          const response = await fetchJson("/api/reports?id=" + encodeURIComponent(report.id), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              note
            })
          });

          state.selectedReportId = response.report.id;
          await loadHistory(response.report.id);
          byId("note-text").value = "";
          updateNoteCounter();
          message.className = "message success";
          message.textContent = "Nota interna agregada al historial.";
        } catch (error) {
          message.className = "message error";
          message.textContent = error.message || "No se pudo guardar la nota interna.";
        } finally {
          button.disabled = false;
        }
      }

      for (const id of ["filter-category", "filter-status", "filter-priority"]) {
        byId(id).addEventListener("change", renderReports);
      }

      byId("report-form").addEventListener("submit", submitReport);
      byId("status-form").addEventListener("submit", submitStatus);
      byId("note-form").addEventListener("submit", submitNote);
      byId("note-text").addEventListener("input", updateNoteCounter);
      byId("close-detail").addEventListener("click", closeDetail);

      loadData().catch(() => {
        byId("list-message").className = "message error";
        byId("list-message").textContent = "No se pudieron cargar los reportes locales.";
      });
    </script>
  </body>
</html>`;
}
