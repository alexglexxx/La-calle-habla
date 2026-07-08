import http from "node:http";
import { fileURLToPath } from "node:url";
import { resolveRoute } from "./routes.mjs";

const port = Number.parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "127.0.0.1";

export function createServer() {
  return http.createServer((request, response) => {
    const route = resolveRoute(request.method || "GET", request.url || "/");
    response.writeHead(route.statusCode, route.headers);
    response.end(route.body);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = createServer();

  server.listen(port, host, () => {
    console.log(`La Calle Habla local data server listening on http://${host}:${port}`);
  });
}
