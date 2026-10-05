import fs from "node:fs";
import assert from "node:assert/strict";

const publicMap = fs.readFileSync("app/public-map.js", "utf8");
const publicView = fs.readFileSync("src/services/public-report-view.mjs", "utf8");

assert.match(publicMap, /real-map/);
assert.match(publicMap, /tile\.openstreetmap\.org/);
assert.match(publicMap, /leaflet/);
assert.match(publicMap, /coordinates\?\.latitude/);
assert.match(publicMap, /coordinates\?\.longitude/);
assert.match(publicMap, /MAX_ZOOM/);
assert.match(publicMap, /OpenStreetMap contributors/);
assert.doesNotMatch(publicMap, /city-atlas-map/);
assert.doesNotMatch(publicMap, /MAP_THEMES/);
assert.doesNotMatch(publicMap, /maplibre-gl/);
assert.doesNotMatch(publicView, /listWorkOrders/);
assert.doesNotMatch(publicView, /"resolved"/);

console.log("TASK 021 CHECK: OK");
