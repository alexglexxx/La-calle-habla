// Task 021 — presentation geometry for the public map.
// Street names/corridors are based on municipal planning references.
// Exact street geometry remains replaceable by an authoritative GeoJSON adapter.

export const MAP_ZONES = [
  { id: "marina", name: "Marina Vallarta", x: 0.16, y: 0.14, scale: 1.15 },
  { id: "hotel-north", name: "Zona Hotelera Norte", x: 0.42, y: 0.18, scale: 0.95 },
  { id: "fluvial", name: "Fluvial Vallarta", x: 0.61, y: 0.30, scale: 1.0 },
  { id: "pitillal", name: "El Pitillal", x: 0.75, y: 0.38, scale: 1.05 },
  { id: "versalles", name: "Versalles", x: 0.45, y: 0.47, scale: 0.95 },
  { id: "centro", name: "Zona Centro", x: 0.28, y: 0.68, scale: 1.12 },
  { id: "cinco-diciembre", name: "5 de Diciembre", x: 0.36, y: 0.57, scale: 0.9 },
  { id: "olimpica", name: "Olímpica", x: 0.59, y: 0.66, scale: 0.9 }
];

export const MAP_LANDMARKS = [
  { id: "malecon", name: "Malecón", x: 0.23, y: 0.76, kind: "waterfront", size: "large" },
  { id: "marina", name: "Marina Vallarta", x: 0.10, y: 0.12, kind: "marina", size: "large" },
  { id: "pitillal", name: "Pitillal", x: 0.77, y: 0.39, kind: "district", size: "medium" },
  { id: "rio-cuale", name: "Río Cuale", x: 0.27, y: 0.70, kind: "river", size: "medium" },
  { id: "rio-pitillal", name: "Río Pitillal", x: 0.69, y: 0.38, kind: "river", size: "medium" }
];

// Normalized presentation paths. Each path is deliberately independent from
// citizen-report coordinates so the visual skin can change without touching data.
export const MAP_STREETS = [
  { id: "medina", name: "Boulevard Francisco Medina Ascencio", className: "primary", points: "0.08,0.18 0.20,0.23 0.33,0.31 0.43,0.40 0.52,0.51 0.60,0.62 0.64,0.75" },
  { id: "francisco-villa", name: "Avenida Francisco Villa", className: "primary", points: "0.79,0.12 0.75,0.25 0.71,0.37 0.67,0.51 0.61,0.64 0.56,0.79 0.51,0.91" },
  { id: "mexico", name: "Avenida México", className: "primary", points: "0.87,0.21 0.76,0.29 0.64,0.39 0.52,0.48 0.41,0.58 0.31,0.69 0.22,0.82" },
  { id: "prisciliano", name: "Avenida Prisciliano Sánchez", className: "primary", points: "0.87,0.26 0.75,0.29 0.63,0.34 0.52,0.39 0.41,0.45 0.31,0.52" },
  { id: "fluvial", name: "Avenida Fluvial Vallarta", className: "collector", points: "0.32,0.29 0.45,0.28 0.57,0.29 0.68,0.31 0.78,0.35" },
  { id: "grandes-lagos", name: "Avenida Grandes Lagos", className: "collector", points: "0.38,0.18 0.48,0.23 0.57,0.27 0.66,0.30" },
  { id: "jesus-rodriguez", name: "Avenida Jesús Rodríguez Barba", className: "collector", points: "0.52,0.29 0.55,0.39 0.58,0.49 0.61,0.59" },
  { id: "tules", name: "Avenida Los Tules", className: "collector", points: "0.23,0.21 0.34,0.30 0.43,0.40 0.50,0.52" },
  { id: "colosio", name: "Libramiento Luis Donaldo Colosio", className: "primary", points: "0.88,0.06 0.83,0.18 0.76,0.31 0.68,0.45 0.60,0.59 0.50,0.73 0.39,0.88" },
  { id: "niza", name: "Calle Niza", className: "local", points: "0.38,0.27 0.45,0.33 0.52,0.39" },
  { id: "roma", name: "Calle Roma", className: "local", points: "0.42,0.25 0.49,0.31 0.56,0.37" },
  { id: "viena", name: "Calle Viena", className: "local", points: "0.53,0.22 0.58,0.30 0.63,0.38" },
  { id: "milan", name: "Calle Milán", className: "local", points: "0.57,0.24 0.61,0.31 0.66,0.38" },
  { id: "juarez", name: "Calle Juárez", className: "local", points: "0.23,0.61 0.31,0.65 0.39,0.69" },
  { id: "morelos", name: "Calle Morelos", className: "local", points: "0.25,0.65 0.33,0.69 0.41,0.73" },
  { id: "insurgentes", name: "Calle Insurgentes", className: "local", points: "0.25,0.70 0.34,0.73 0.42,0.77" }
];
