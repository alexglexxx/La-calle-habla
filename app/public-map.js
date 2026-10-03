const CATEGORY_LABEL = {
  bache: "Baches",
  basura: "Basura",
  "fuga-de-agua": "Fugas de agua",
  alumbrado: "Alumbrado",
  "banqueta-danada": "Banquetas",
  "calle-peligrosa": "Calles",
  "semaforo-fallando": "Semáforos",
  "alcantarilla-destapada": "Alcantarillas",
  otro: "Otros"
};

const STATUS_LABEL = {
  resolved: "Reporte ciudadano resuelto",
  new: "Recibido",
  in_review: "En revisión",
  validated: "Validado",
  needs_info: "Requiere información"
};

const ZOOM = 13;
const TILE_SIZE = 256;

function longitudeToTileX(longitude) {
  return ((longitude + 180) / 360) * Math.pow(2, ZOOM);
}

function latitudeToTileY(latitude) {
  const radians = (latitude * Math.PI) / 180;
  return ((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * Math.pow(2, ZOOM);
}

export { CATEGORY_LABEL, STATUS_LABEL, ZOOM, TILE_SIZE, longitudeToTileX, latitudeToTileY };
