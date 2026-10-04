import { LCH_TERRITORY } from "../config/territory.mjs";
import { MAP_LANDMARKS, MAP_STREETS, MAP_ZONES } from "../config/map-streets.mjs";

export function getPublicMapModel(themeId = "lch-default") {
  return {
    version: 1,
    themeId,
    territory: LCH_TERRITORY,
    streets: MAP_STREETS,
    zones: MAP_ZONES,
    landmarks: MAP_LANDMARKS
  };
}

export function clampMapZoom(value) {
  const zoom = Number(value);
  if (!Number.isFinite(zoom)) return 1;
  return Math.max(0.85, Math.min(3.2, zoom));
}
