# Auditoria TASK 005: POST seguro y persistencia local minima

Fecha: 2026-07-09

## Objetivo

Implementar `POST /api/reports` con validacion segura y persistencia minima en archivo JSON local, sin base de datos externa, sin WhatsApp real y sin dashboard.

## Que se creo

- Persistencia runtime en `data/runtime/reports.json`.
- Carpeta versionable `data/runtime/` con `.gitkeep`.
- Archivo runtime ignorado por Git con `data/runtime/*.json`.
- Store local en `src/services/runtime-report-store.mjs`.
- Creacion validada de reportes en `src/services/report-service.mjs`.
- Lectura segura de body HTTP en `src/server/index.mjs`.
- Soporte `POST /api/reports` en `src/server/routes.mjs`.
- Pruebas de creacion, validacion, persistencia, stats, filtros, JSON invalido y payload grande.

## Como funciona POST /api/reports

Acepta JSON con:

- `title`: requerido, 5 a 120 caracteres.
- `description`: requerido, 15 a 1000 caracteres.
- `category`: requerido, debe coincidir con slug, id o nombre de una categoria seed.
- `locationText`: requerido, 5 a 200 caracteres.
- `neighborhood` o `zone`: al menos uno requerido, 2 a 120 caracteres.
- `priority`: opcional, `low`, `normal`, `high` o `urgent`.
- `evidenceCount`: opcional, entero de 0 a 20.
- `citizenAlias`: opcional, maximo 80 caracteres.
- `source`: opcional, solo `manual`.

El servidor genera:

- `id`
- `status: new`
- `source: manual`
- `createdAt`
- `updatedAt`

El servidor rechaza `id`, `status`, `createdAt` y `updatedAt` enviados por el usuario.

## Persistencia local

Los reportes creados por POST se guardan en:

```text
data/runtime/reports.json
```

Los seeds permanecen intactos en `src/data/seed-reports.mjs`.

`GET /api/reports` y `GET /api/stats` combinan:

- Seeds.
- Reportes runtime creados localmente.

Para pruebas se puede cambiar la ruta con:

```bash
LCH_RUNTIME_REPORTS_FILE=/tmp/calle-habla-reports.json npm test
```

## Endpoints

- `GET /health`
- `GET /api/categories`
- `GET /api/statuses`
- `GET /api/reports`
- `GET /api/reports?id=REPORT_ID`
- `GET /api/reports?category=CATEGORIA`
- `GET /api/reports?status=STATUS`
- `GET /api/stats`
- `POST /api/reports`

## Ejemplos curl

Crear reporte valido:

```bash
curl -sS -X POST http://127.0.0.1:3001/api/reports \
  -H 'Content-Type: application/json' \
  --data '{
    "title": "Bache nuevo frente a tienda",
    "description": "Hay un bache profundo frente a la tienda y varios carros frenan de golpe para esquivarlo.",
    "category": "bache",
    "locationText": "Calle principal frente a tienda de abarrotes",
    "neighborhood": "Versalles",
    "priority": "high",
    "evidenceCount": 1,
    "citizenAlias": "Vecino prueba"
  }'
```

Consultar reportes:

```bash
curl -sS http://127.0.0.1:3001/api/reports
```

Consultar stats:

```bash
curl -sS http://127.0.0.1:3001/api/stats
```

Consultar por categoria:

```bash
curl -sS 'http://127.0.0.1:3001/api/reports?category=bache'
```

Probar error de categoria invalida:

```bash
curl -sS -X POST http://127.0.0.1:3001/api/reports \
  -H 'Content-Type: application/json' \
  --data '{
    "title": "Reporte prueba",
    "description": "Este reporte debe fallar porque la categoria no existe.",
    "category": "categoria-falsa",
    "locationText": "Lugar de prueba",
    "neighborhood": "Zona prueba"
  }'
```

## Riesgos

- La persistencia local no es transaccional ni apta para concurrencia alta.
- El archivo runtime puede contener datos variables de prueba o desarrollo.
- No hay autenticacion, rate limiting ni proteccion anti abuso.
- No existe politica completa de privacidad.
- No hay almacenamiento real de fotos; `evidenceCount` solo registra conteo declarado.

## Que queda pendiente

- Captura con experiencia de usuario.
- Dashboard administrativo.
- Base de datos real si el MVP lo requiere.
- Mapa.
- WhatsApp real.
- Validaciones de privacidad y retencion.
- Manejo robusto de concurrencia.

## Validaciones

- `npm run lint`: paso, `Project validation passed.`
- `npm run build`: paso, `Build check passed.`
- `npm test`: paso, 18 pruebas pasaron.
- `curl -sS http://127.0.0.1:3001/health`: paso, devolvio `reports: 10` antes del POST.
- `curl -sS http://127.0.0.1:3001/api/reports`: paso, devolvio `count: 10` antes del POST.
- `curl -sS http://127.0.0.1:3001/api/stats`: paso, devolvio `totalReports: 10` antes del POST.
- `POST /api/reports`: paso, creo `report-local-mrczpchs-soi8an`.
- `curl -sS http://127.0.0.1:3001/api/reports`: paso, devolvio `count: 11` despues del POST.
- `curl -sS http://127.0.0.1:3001/api/stats`: paso, devolvio `totalReports: 11` despues del POST.
- `curl -sS 'http://127.0.0.1:3001/api/reports?category=bache'`: paso, devolvio `count: 2`.
- POST con categoria falsa: paso, devolvio `validation_failed`.
- Reinicio del servidor: paso.
- `curl -sS http://127.0.0.1:3001/api/reports` despues del reinicio: paso, devolvio `count: 11`.
- `curl -sS http://127.0.0.1:3001/api/stats` despues del reinicio: paso, devolvio `totalReports: 11`.
- `cat data/runtime/reports.json`: confirmo que el reporte creado quedo persistido localmente.
