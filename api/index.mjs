import { resolveRoute } from "../src/server/routes.mjs";

const MAX_BODY_BYTES = 32 * 1024;

async function readBody(request) {
  if (request.method !== "POST" && request.method !== "PATCH") {
    return { ok: true, rawBody: "" };
  }

  const contentLength = Number(request.headers["content-length"]);

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      route: {
        statusCode: 413,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          ok: false,
          error: "payload_too_large",
          message: "Request body must be " + MAX_BODY_BYTES + " bytes or fewer."
        })
      }
    };
  }

  const chunks = [];
  let total = 0;

  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += bytes.byteLength;

    if (total > MAX_BODY_BYTES) {
      return {
        ok: false,
        route: {
          statusCode: 413,
          headers: { "content-type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            ok: false,
            error: "payload_too_large",
            message: "Request body must be " + MAX_BODY_BYTES + " bytes or fewer."
          })
        }
      };
    }

    chunks.push(bytes);
  }

  return {
    ok: true,
    rawBody: Buffer.concat(chunks).toString("utf8")
  };
}

function writeRoute(response, route) {
  response.statusCode = route.statusCode;
  for (const [key, value] of Object.entries(route.headers || {})) {
    response.setHeader(key, value);
  }
  response.end(route.body ?? "");
}

export default async function handler(request, response) {
  try {
    const body = await readBody(request);

    if (!body.ok) {
      writeRoute(response, body.route);
      return;
    }

    const route = await resolveRoute(
      request.method,
      request.url,
      {
        rawBody: body.rawBody,
        headers: request.headers
      }
    );

    writeRoute(response, route);
  } catch (error) {
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({
      ok: false,
      error: "internal_server_error",
      message: error instanceof Error ? error.message : "Unexpected server error."
    }));
  }
}
