export const LCH_TERRITORY = {
  id: "puerto-vallarta",
  name: "Puerto Vallarta",
  state: "Jalisco",
  country: "Mexico",
  version: 2,
  // MVP presentation boundary. Replace with authoritative municipal GeoJSON
  // through the GIS adapter without changing the territory contract.
  bounds: {
    north: 20.742,
    south: 20.545,
    east: -105.145,
    west: -105.315
  },
  center: {
    latitude: 20.653,
    longitude: -105.225
  },
  boundary: [
    [20.742, -105.315],
    [20.724, -105.205],
    [20.705, -105.145],
    [20.630, -105.150],
    [20.545, -105.235],
    [20.565, -105.315]
  ]
};

function isFiniteCoordinate(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function pointOnSegment(latitude, longitude, start, end) {
  const epsilon = 1e-10;
  const cross =
    (longitude - start[1]) * (end[0] - start[0]) -
    (latitude - start[0]) * (end[1] - start[1]);

  if (Math.abs(cross) > epsilon) return false;

  return (
    latitude >= Math.min(start[0], end[0]) - epsilon &&
    latitude <= Math.max(start[0], end[0]) + epsilon &&
    longitude >= Math.min(start[1], end[1]) - epsilon &&
    longitude <= Math.max(start[1], end[1]) + epsilon
  );
}

function isInsideBoundary(latitude, longitude, boundary) {
  let inside = false;

  for (let index = 0, previous = boundary.length - 1; index < boundary.length; previous = index++) {
    const current = boundary[index];
    const previousPoint = boundary[previous];

    if (pointOnSegment(latitude, longitude, previousPoint, current)) {
      return true;
    }

    const intersects =
      (current[0] > latitude) !== (previousPoint[0] > latitude) &&
      longitude <
        ((previousPoint[1] - current[1]) * (latitude - current[0])) /
          (previousPoint[0] - current[0]) +
          current[1];

    if (intersects) inside = !inside;
  }

  return inside;
}

export function isInsideTerritory(latitude, longitude) {
  if (!isFiniteCoordinate(latitude, longitude)) return false;

  const { north, south, east, west } = LCH_TERRITORY.bounds;

  if (latitude > north || latitude < south || longitude > east || longitude < west) {
    return false;
  }

  return isInsideBoundary(latitude, longitude, LCH_TERRITORY.boundary);
}

export function validateTerritoryLocation(location) {
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  if (!isFiniteCoordinate(latitude, longitude)) {
    return {
      ok: false,
      code: "invalid_coordinates",
      message: "La ubicación no contiene coordenadas válidas."
    };
  }

  if (!isInsideTerritory(latitude, longitude)) {
    return {
      ok: false,
      code: "outside_territory",
      message: "La ubicación está fuera del territorio habilitado para La Calle Habla."
    };
  }

  return {
    ok: true,
    latitude,
    longitude
  };
}

export function clampToTerritory(latitude, longitude) {
  const { north, south, east, west } = LCH_TERRITORY.bounds;
  return {
    latitude: Math.min(north, Math.max(south, latitude)),
    longitude: Math.min(east, Math.max(west, longitude))
  };
}
