import http from "node:http";
import { fileURLToPath } from "node:url";
import { resolveRoute } from "./routes.mjs";

const port = Number.parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "127.0.0.1";
const maxBodyBytes = 32 * 1024;

function sendRoute(response, route) {
  response.writeHead(route.statusCode, route.headers);
  response.end(route.body);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body, null, 2)
  };
}

export function readRequestBody(request, limitBytes = maxBodyBytes) {
  return new Promise((resolve) => {
    const chunks = [];
    let totalBytes = 0;
    let tooLarge = false;

    request.on("data", (chunk) => {
      totalBytes += chunk.length;

      if (totalBytes > limitBytes) {
        tooLarge = true;
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      if (tooLarge) {
        resolve({
          ok: false,
          route: json(413, {
            ok: false,
            error: "payload_too_large",
            message: `Request body must be ${limitBytes} bytes or fewer.`
          })
        });
        return;
      }

      resolve({
        ok: true,
        rawBody: Buffer.concat(chunks).toString("utf8")
      });
    });

    request.on("error", () => {
      resolve({
        ok: false,
        route: json(400, {
          ok: false,
          error: "request_body_error",
          message: "Could not read request body."
        })
      });
    });
  });
}

export async function handleRequest(request) {
  const method = request.method || "GET";
  const requestUrl = request.url || "/";

  if (method === "POST" || method === "PATCH") {
    const bodyResult = await readRequestBody(request);

    if (!bodyResult.ok) {
      return bodyResult.route;
    }

    return resolveRoute(method, requestUrl, {
      rawBody: bodyResult.rawBody,
      headers: request.headers
    });
  }

  return resolveRoute(method, requestUrl, {
    headers: request.headers
  });
}

export function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const route = await handleRequest(request);
      sendRoute(response, route);
    } catch (error) {
      sendRoute(
        response,
        json(500, {
          ok: false,
          error: "internal_server_error",
          message: error instanceof Error ? error.message : "Unexpected server error."
        })
      );
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = createServer();

  server.listen(port, host, () => {
    console.log(`La Calle Habla local data server listening on http://${host}:${port}`);
  });
}
