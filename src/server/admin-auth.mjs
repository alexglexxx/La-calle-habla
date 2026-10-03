import { timingSafeEqual } from "node:crypto";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function configuredCredentials() {
  const username = String(process.env.ADMIN_USERNAME || "");
  const password = String(process.env.ADMIN_PASSWORD || "");

  return username && password ? { username, password } : null;
}

function hostWithoutPort(value) {
  const host = String(value || "").trim().toLowerCase();

  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end >= 0 ? host.slice(1, end) : host;
  }

  const colonCount = (host.match(/:/g) || []).length;
  if (colonCount === 1) {
    return host.split(":")[0];
  }

  return host;
}

function isLoopbackRequest(headers) {
  const host = hostWithoutPort(headers?.host);
  return !host || LOOPBACK_HOSTS.has(host);
}

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function parseBasicAuthorization(value) {
  const header = String(value || "");

  if (!header.toLowerCase().startsWith("basic ")) {
    return null;
  }

  try {
    const decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
    const separator = decoded.indexOf(":");

    if (separator < 0) {
      return null;
    }

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}

export function isAdminRoute(pathname) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/reports" ||
    pathname === "/api/stats" ||
    pathname === "/api/report-history"
  );
}

export function isAdminAuthorized(headers = {}) {
  const explicitlyRequired = String(process.env.ADMIN_AUTH_REQUIRED || "").toLowerCase() === "true";
  const authenticationRequired = explicitlyRequired || !isLoopbackRequest(headers);

  if (!authenticationRequired) {
    return true;
  }

  const credentials = configuredCredentials();

  if (!credentials) {
    return false;
  }

  const supplied = parseBasicAuthorization(headers.authorization);

  if (!supplied) {
    return false;
  }

  return (
    constantTimeEqual(supplied.username, credentials.username) &&
    constantTimeEqual(supplied.password, credentials.password)
  );
}

export function adminAuthResponse(headers = {}) {
  const explicitlyRequired = String(process.env.ADMIN_AUTH_REQUIRED || "").toLowerCase() === "true";
  const authenticationRequired = explicitlyRequired || !isLoopbackRequest(headers);
  const credentials = configuredCredentials();

  if (authenticationRequired && !credentials) {
    return {
      statusCode: 503,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      },
      body: JSON.stringify({
        ok: false,
        error: "admin_auth_not_configured",
        message: "Admin access is locked until ADMIN_USERNAME and ADMIN_PASSWORD are configured."
      })
    };
  }

  return {
    statusCode: 401,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "www-authenticate": 'Basic realm="La Calle Habla Admin", charset="UTF-8"'
    },
    body: JSON.stringify({
      ok: false,
      error: "admin_auth_required",
      message: "Admin authentication is required."
    })
  };
}
