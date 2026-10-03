export const LCH_TERRITORY = {
  id: "puerto-vallarta",
  name: "Puerto Vallarta",
  state: "Jalisco",
  country: "Mexico",
  version: 1,
  // MVP presentation boundary. The map-provider adapter can replace this
  // with authoritative municipal GeoJSON without changing the UI contract.
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

export function isInsideTerritory(latitude, longitude) {
  const { north, south, east, west } = LCH_TERRITORY.bounds;
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude <= north &&
    latitude >= south &&
    longitude <= east &&
    longitude >= west
  );
}

export function clampToTerritory(latitude, longitude) {
  const { north, south, east, west } = LCH_TERRITORY.bounds;
  return {
    latitude: Math.min(north, Math.max(south, latitude)),
    longitude: Math.min(east, Math.max(west, longitude))
  };
}
