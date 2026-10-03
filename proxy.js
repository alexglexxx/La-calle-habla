import { NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Autenticacion administrativa requerida.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="La Calle Habla Admin"' }
  });
}

export function proxy(request) {
  if (!request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const isLocal = ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname);
  if (isLocal && process.env.ADMIN_AUTH_REQUIRED !== "true") return NextResponse.next();

  const username = process.env.ADMIN_USERNAME || "";
  const password = process.env.ADMIN_PASSWORD || "";
  if (!username || !password) return unauthorized();

  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return unauthorized();

  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return unauthorized();
    if (decoded.slice(0, separator) !== username || decoded.slice(separator + 1) !== password) return unauthorized();
    return NextResponse.next();
  } catch {
    return unauthorized();
  }
}

export const config = { matcher: ["/admin/:path*"] };
