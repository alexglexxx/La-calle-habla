import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const maplibreDist = path.dirname(require.resolve("maplibre-gl/package.json"));
const destination = path.join(process.cwd(), "public", "maplibre");

mkdirSync(destination, { recursive: true });

for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(
    path.join(maplibreDist, "dist", file),
    path.join(destination, file)
  );
}

console.log("MapLibre worker assets prepared in public/maplibre.");
