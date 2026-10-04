import { existsSync, readFileSync } from "node:fs";

const required = [
  "src/services/gis-view.mjs",
  "app/public-map.js",
  "src/services/public-report-view.mjs"
];

for (const file of required) {
  if (!existsSync(file)) throw new Error(`TASK 015 missing ${file}`);
}

const gis = readFileSync("src/services/gis-view.mjs", "utf8");
for (const token of ["getReportCoordinates", "projectCoordinateToViewport", "getMapTilePlan"]) {
  if (!gis.includes(token)) throw new Error(`TASK 015 GIS adapter missing ${token}`);
}

const view = readFileSync("src/services/public-report-view.mjs", "utf8");
if (!view.includes("projectReportsToMap")) throw new Error("TASK 015 public projection is not using GIS coordinates");

const map = readFileSync("app/public-map.js", "utf8");
if (!map.includes("city-atlas-map") && !map.includes("tile.openstreetmap.org") && !map.includes("tiles.openfreemap.org")) {
  throw new Error("TASK 015 public map layer missing");
}
if (!view.includes("projectReportsToMap")) {
  throw new Error("TASK 015 public map is not backed by real report coordinates");
}

console.log("TASK 015 structural check passed.");
