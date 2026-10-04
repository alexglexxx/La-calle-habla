import fs from "node:fs";
import assert from "node:assert/strict";

const publicMap = fs.readFileSync("app/public-map.js", "utf8");
const theme = fs.readFileSync("src/config/map-theme.mjs", "utf8");
const streets = fs.readFileSync("src/config/map-streets.mjs", "utf8");
const mapView = fs.readFileSync("src/services/map-view.mjs", "utf8");
const publicView = fs.readFileSync("src/services/public-report-view.mjs", "utf8");

assert.match(publicMap, /MAP_THEMES/);
assert.match(publicMap, /city-atlas-map/);
assert.doesNotMatch(publicMap, /tile\.openstreetmap\.org/);
assert.doesNotMatch(publicMap, /osm-layer/);
assert.match(theme, /lch-default/);
assert.match(theme, /institucional/);
assert.match(streets, /Boulevard Francisco Medina Ascencio/);
assert.match(streets, /Avenida Francisco Villa/);
assert.match(streets, /Avenida Prisciliano Sánchez/);
assert.match(mapView, /getPublicMapModel/);
assert.match(publicView, /getPublicMapModel/);
assert.doesNotMatch(publicView, /listWorkOrders/);
assert.doesNotMatch(publicView, /"resolved"/);

console.log("TASK 021 CHECK: OK");
