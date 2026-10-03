import { resolveRoute } from "../src/server/routes.mjs";

const MAX_BODY_BYTES = 32 * 1024;

async function readBody(request) {
  if (request.method !== "POST" && request.method !== "PATCH") {
    return { ok: true, rawBody: "" };
  }

  const contentLength = Number(request.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      route: Response.json({
        ok: false,
        error: "payload_too_large",
        message: "Request body must be " + MAX_BODY_BYTES + " bytes or fewer."
      }, { status: 413 })
    };
  }

  const bytes = new Uint8Array(await request.arrayBuffer());

  if (bytes.byteLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      route: Response.json({
        ok: false,
        error: "payload_too_large",
        message: "Request body must be " + MAX_BODY_BYTES + " bytes or fewer."
      }, { status: 413 })
    };
  }

  return { ok: true, rawBody: new TextDecoder().decode(bytes) };
}

function toResponse(route) {
  return new Response(route.body, { status: route.statusCode, headers: route.headers });
}

export default async function handler(request) {
  try {
    const body = await readBody(request);
    if (!body.ok) return body.route;

    const route = await resolveRoute(request.method, request.url, {
      rawBody: body.rawBody,
      headers: Object.fromEntries(request.headers.entries())
    });

    return toResponse(route);
  } catch (error) {
    return Response.json({
      ok: false,
      error: "internal_server_error",
      message: error instanceof Error ? error.message : "Unexpected server error."
    }, { status: 500 });
  }
}
