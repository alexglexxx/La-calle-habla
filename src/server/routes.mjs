import {
  createReport,
  getReportById,
  getReportStats,
  listCategories,
  listReports,
  listStatuses
} from "../services/report-service.mjs";

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
        message: "POST /api/reports requires a JSON body."
      })
    };
  }

  if (!shouldParseJson) {
    return {
      ok: false,
      response: json(400, {
        ok: false,
        error: "expected_json",
        message: "POST /api/reports expects JSON."
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
      <p>Health check: <code>/health</code></p>
      <p>Reportes seed: <code>/api/reports</code></p>
      <p>Estadisticas: <code>/api/stats</code></p>
    </main>
  </body>
</html>`;
}

export function resolveRoute(method, requestUrl, routeOptions = {}) {
  const url = new URL(requestUrl, "http://127.0.0.1");

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

    if (method !== "GET") {
      return json(405, {
        ok: false,
        error: "method_not_allowed"
      });
    }

    const id = url.searchParams.get("id");
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

  return json(404, {
    ok: false,
    error: "not_found"
  });
}
