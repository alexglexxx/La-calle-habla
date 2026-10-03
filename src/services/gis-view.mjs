import { LCH_TERRITORY, isInsideTerritory } from "../config/territory.mjs";

const DEFAULT_ZOOM = 13;
const TILE_SIZE = 256;

export function getReportCoordinates(report) {
  const latitude = Number(report?.locationDetails?.latitude);
  const longitude = Number(report?.locationDetails?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (!isInsideTerritory(latitude, longitude)) return null;

  return { latitude, longitude, source: "report_exact" };
}

export function projectCoordinateToViewport(latitude, longitude, territory = LCH_TERRITORY) {
  const { north, south, east, west } = territory.bounds;
  const x = (longitude - west) / (east - west);
  const y = 1 - (latitude - south) / (north - south);

  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y))
  };
}

function longitudeToTileX(longitude, zoom) {
  return ((longitude + 180) / 360) * 2 ** zoom;
}

function latitudeToTileY(latitude, zoom) {
  const radians = (latitude * Math.PI) / 180;
  return (
    (1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2
  ) * 2 ** zoom;
}

export function getMapTilePlan(territory = LCH_TERRITORY, zoom = DEFAULT_ZOOM) {
  const centerX = longitudeToTileX(territory.center.longitude, zoom);
  const centerY = latitudeToTileY(territory.center.latitude, zoom);
  const tileX = Math.floor(centerX);
  const tileY = Math.floor(centerY);

  return {
    zoom,
    center: territory.center,
    tiles: [-1, 0, 1].flatMap((dx) =>
      [-1, 0, 1].map((dy) => ({
        x: tileX + dx,
        y: tileY + dy,
        left: (tileX + dx - centerX) * TILE_SIZE,
        top: (tileY + dy - centerY) * TILE_SIZE
      }))
    )
  };
}

export function projectReportsToMap(reports) {
  return reports
    .map((report) => {
      const coordinates = getReportCoordinates(report);
      if (!coordinates) return null;

      return {
        ...report,
        coordinates,
        location: projectCoordinateToViewport(
          coordinates.latitude,
          coordinates.longitude
        ),
        locationSource: coordinates.source
      };
    })
    .filter(Boolean);
}
