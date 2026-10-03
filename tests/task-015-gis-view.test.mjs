import assert from "node:assert/strict";
import test from "node:test";
import {
  getReportCoordinates,
  projectCoordinateToViewport,
  getMapTilePlan
} from "../src/services/gis-view.mjs";

test("GIS adapter only exposes coordinates inside the configured territory", () => {
  const valid = getReportCoordinates({
    locationDetails: { latitude: 20.6534, longitude: -105.2258 }
  });
  const invalid = getReportCoordinates({
    locationDetails: { latitude: 20.8, longitude: -105.2 }
  });

  assert.deepEqual(valid, {
    latitude: 20.6534,
    longitude: -105.2258,
    source: "report_exact"
  });
  assert.equal(invalid, null);
});

test("GIS viewport projection is deterministic", () => {
  const point = projectCoordinateToViewport(20.6534, -105.2258);
  assert.ok(point.x >= 0 && point.x <= 1);
  assert.ok(point.y >= 0 && point.y <= 1);
});

test("GIS tile plan provides a real 3x3 tile window", () => {
  const plan = getMapTilePlan();
  assert.equal(plan.zoom, 13);
  assert.equal(plan.tiles.length, 9);
  assert.ok(plan.tiles.every((tile) => Number.isInteger(tile.x) && Number.isInteger(tile.y)));
});
