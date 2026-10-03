import {
  createReport,
  getReportById,
  getReportStats,
  listReportHistory,
  listCategories,
  listReports,
  listStatuses,
  updateReportStatus
} from "../services/report-service.mjs";
import { renderAdminPage } from "./admin-page.mjs";
import { renderReportDetailPage } from "./report-detail-page.mjs";
import { adminAuthResponse, isAdminRoute, isAdminAuthorized } from "./admin-auth.mjs";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body, null, 2)
  };
}

function html(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "text/html; charset=utf-8"
    },
    body
  };
}

function parseJsonBody(routeOptions) {
  if (routeOptions.body !== undefined) {
    return {
      ok: true,
      body: routeOptions.body
    };
  }

  const rawBody = String(routeOptions.rawBody || "");
  const trimmedBody = rawBody.trim();
  const contentType = String(routeOptions.headers?.["content-type"] || "");
  const shouldParseJson =
    contentType.toLowerCase().includes("application/json") ||
    trimmedBody.startsWith("{") ||
    trimmedBody.startsWith("[");

  if (!trimmedBody) {
    return {
      ok: false,
      response: json(400, {
        ok: false,
        error: "empty_body",
        message: "Request requires a JSON body."
      })
    };
  }

  if (!shouldParseJson) {
    return {
      ok: false,
      response: json(400, {
        ok: false,
        error: "expected_json",
        message: "Request expects JSON."
      })
    };
  }

  try {
    return {
      ok: true,
      body: JSON.parse(trimmedBody)
    };
  } catch {
    return {
      ok: false,
      response: json(400, {
        ok: false,
        error: "invalid_json",
        message: "Request body is not valid JSON."
      })
    };
  }
}

function landingPage() {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>La Calle Habla</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Arial, sans-serif;
        line-height: 1.5;
        color: #17202a;
        background: #f7f5ef;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      main {
        width: min(720px, 100%);
      }
      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 8vw, 4rem);
        line-height: 1;
      }
      p {
        margin: 0 0 16px;
        font-size: 1.05rem;
      }
      code {
        background: #e7e2d4;
        border-radius: 4px;
        padding: 2px 5px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>La Calle Habla</h1>
      <p>Modelo local operativo para reportes ciudadanos urbanos.</p>
      <p>Panel local: <code>/admin</code></p>
      <p>Health check: <code>/health</code></p>
      <p>Reportes seed: <code>/api/reports</code></p>
      <p>Estadisticas: <code>/api/stats</code></p>
    </main>
  </body>
</html>`;
}

export function resolveRoute(method, requestUrl, routeOptions = {}) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  const headers = routeOptions.headers || {};

  if (isAdminRoute(url.pathname) && !isAdminAuthorized(headers)) {
    return adminAuthResponse(headers);
  }

  if (url.pathname === "/health") {
    if (method !== "GET") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    return json(200, {
      ok: true,
      project: "La Calle Habla",
      status: "local-persistence",
      categories: listCategories().length,
      reportStatuses: listStatuses().length,
      reports: listReports().length
    });
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    if (method !== "GET") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    return html(200, landingPage());
  }

  if (url.pathname === "/admin") {
    if (method !== "GET" && method !== "HEAD") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    return html(200, renderAdminPage());
  }

  if (url.pathname === "/admin/report") {
    if (method !== "GET" && method !== "HEAD") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    return html(200, renderReportDetailPage());
  }

  if (url.pathname === "/api/categories") {
    if (method !== "GET") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    return json(200, {
      ok: true,
      categories: listCategories()
    });
  }

  if (url.pathname === "/api/statuses") {
    if (method !== "GET") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    return json(200, {
      ok: true,
      statuses: listStatuses()
    });
  }

  if (url.pathname === "/api/reports") {
    const id = url.searchParams.get("id");

    if (method === "POST") {
      const parsedBody = parseJsonBody(routeOptions);

      if (!parsedBody.ok) {
        return parsedBody.response;
      }

      try {
        const result = createReport(parsedBody.body);

        if (!result.ok) {
          return json(400, {
            ok: false,
            error: "validation_failed",
            errors: result.errors
          });
        }

        return json(201, {
          ok: true,
          report: result.report
        });
      } catch (error) {
        return json(500, {
          ok: false,
          error: "runtime_persistence_failed",
          message: error instanceof Error ? error.message : "Unexpected persistence error."
        });
      }
    }

    if (method === "PATCH") {
      if (!id) {
        return json(400, {
          ok: false,
          error: "missing_report_id",
          message: "PATCH /api/reports requires an id query parameter."
        });
      }

      const parsedBody = parseJsonBody(routeOptions);

      if (!parsedBody.ok) {
        return parsedBody.response;
      }

      try {
        const result = updateReportStatus(id, parsedBody.body);

        if (result.notFound) {
          return json(404, {
            ok: false,
            error: "report_not_found",
            id
          });
        }

        if (!result.ok) {
          return json(400, {
            ok: false,
            error: "validation_failed",
            errors: result.errors
          });
        }

        return json(200, {
          ok: true,
          report: result.report,
          historyEvent: result.historyEvent,
          changed: result.changed,
          noop: result.noop,
          message: result.message
        });
      } catch (error) {
        return json(500, {
          ok: false,
          error: "runtime_update_failed",
          message: error instanceof Error ? error.message : "Unexpected status update error."
        });
      }
    }

    if (method !== "GET") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");

    if (id) {
      const report = getReportById(id);

      if (!report) {
        return json(404, {
          ok: false,
          error: "report_not_found",
          id
        });
      }

      return json(200, {
        ok: true,
        report
      });
    }

    const reports = listReports({ category, status });

    return json(200, {
      ok: true,
      count: reports.length,
      reports
    });
  }

  if (url.pathname === "/api/stats") {
    if (method !== "GET") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    return json(200, {
      ok: true,
      stats: getReportStats()
    });
  }

  if (url.pathname === "/api/report-history") {
    if (method !== "GET") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    const id = url.searchParams.get("id");

    if (!id) {
      return json(400, {
        ok: false,
        error: "missing_report_id",
        message: "GET /api/report-history requires an id query parameter."
      });
    }

    const report = getReportById(id);

    if (!report) {
      return json(404, {
        ok: false,
        error: "report_not_found",
        id
      });
    }

    try {
      const events = listReportHistory(id);

      return json(200, {
        ok: true,
        reportId: id,
        count: events.length,
        events
      });
    } catch (error) {
      return json(500, {
        ok: false,
        error: "runtime_history_failed",
        message: error instanceof Error ? error.message : "Unexpected history persistence error."
      });
    }
  }

  return json(404, {
    ok: false,
    error: "not_found"
  });
}
