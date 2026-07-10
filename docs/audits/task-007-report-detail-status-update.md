# Auditoria TASK 007: Detalle de reporte y cambio de estado local

Fecha: 2026-07-09

## Objetivo

Agregar detalle de reporte y cambio de estado administrativo local para que `/admin` funcione como herramienta de revision interna, sin modificar seeds, sin dependencias externas, sin login y sin prometer resolucion oficial.

## Que se creo

- Panel de detalle dentro de `GET /admin`.
- Boton `Revisar` en cada card del panel local.
- Selector de estado y boton `Actualizar estado` dentro de `/admin`.
- Ruta auxiliar `GET /admin/report?id=REPORT_ID`.
- Endpoint `PATCH /api/reports?id=REPORT_ID`.
- Persistencia local de overrides en `data/runtime/report-overrides.json`.
- Funciones de servicio para validar y aplicar cambio de estado.
- Pruebas de API, vista, validaciones, payload grande y persistencia de overrides.

## Endpoint PATCH elegido

Se eligio:

```text
PATCH /api/reports?id=REPORT_ID
```

Mantiene consistencia con:

```text
GET /api/reports?id=REPORT_ID
```

Payload permitido:

```json
{
  "status": "in_review"
}
```

## Overrides

Los seeds no se modifican. Los cambios de estado se guardan como overrides en:

```text
data/runtime/report-overrides.json
```

Cada override conserva:

- `reportId`
- `status`
- `updatedAt`

`listReports()`, `getReportById()`, `listReportsByStatus()` y `getReportStats()` aplican los overrides antes de responder.

## Campos editables

Solo puede cambiar:

- `status`

Campos rechazados en esta task:

- `id`
- `category`
- `source`
- `createdAt`
- `updatedAt`
- `title`
- `description`
- `locationText`
- `priority`
- `evidenceCount`
- cualquier otro campo que no sea `status`

## Como probar con curl

Levantar servidor:

```bash
PORT=3001 npm run dev
```

Ver reporte:

```bash
curl -sS 'http://127.0.0.1:3001/api/reports?id=report-pv-001'
```

Cambiar estado:

```bash
curl -sS -X PATCH 'http://127.0.0.1:3001/api/reports?id=report-pv-001' \
  -H 'Content-Type: application/json' \
  --data '{"status":"in_review"}'
```

Confirmar cambio:

```bash
curl -sS 'http://127.0.0.1:3001/api/reports?id=report-pv-001'
curl -sS 'http://127.0.0.1:3001/api/reports?status=in_review'
curl -sS http://127.0.0.1:3001/api/stats
```

Probar error:

```bash
curl -sS -X PATCH 'http://127.0.0.1:3001/api/reports?id=report-pv-001' \
  -H 'Content-Type: application/json' \
  --data '{"status":"inventado"}'
```

Probar campo prohibido:

```bash
curl -sS -X PATCH 'http://127.0.0.1:3001/api/reports?id=report-pv-001' \
  -H 'Content-Type: application/json' \
  --data '{"status":"validated","title":"No debe permitir cambiar titulo"}'
```

## Como probar en /admin

1. Abrir `http://127.0.0.1:3001/admin`.
2. Tocar `Revisar` en cualquier reporte.
3. Confirmar que se muestran titulo, descripcion, categoria, estado, prioridad, ubicacion, colonia, zona, alias ciudadano, evidencias, origen, fechas e id.
4. Cambiar el selector de estado.
5. Tocar `Actualizar estado`.
6. Confirmar mensaje de exito.
7. Confirmar que lista, contadores y detalle reflejan el cambio.

La vista muestra: "Este cambio solo actualiza el seguimiento interno local. No confirma resolución por autoridad."

## Riesgos

- No hay login ni permisos; `/admin` debe mantenerse como herramienta local.
- JSON local no es apto para concurrencia alta.
- Solo se guarda el ultimo override por reporte, no un historial completo.
- Exponer `/admin` fuera de localhost requiere una decision de seguridad documentada.

## Pendientes

- Historial local de cambios.
- Roles o proteccion de administracion.
- Mapa o agrupacion geoespacial.
- Politica de privacidad antes de manejar fotos o telefono reales.

## Resultado de validaciones

- `npm run lint`: paso, `Project validation passed.`
- `npm run build`: paso, `Build check passed.`
- `npm test`: paso, 30 pruebas pasaron.
- `curl -I http://127.0.0.1:3001/admin`: paso, `HTTP/1.1 200 OK`.
- `curl -sS http://127.0.0.1:3001/admin`: paso, devolvio HTML del panel local con detalle y PATCH.
- `head -60 /tmp/calle-admin.html`: paso, confirmo HTML inicial de `/admin`.
- `curl -sS http://127.0.0.1:3001/health`: paso, `ok: true`, `reports: 12`.
- `curl -sS http://127.0.0.1:3001/api/reports`: paso, `count: 12`.
- `curl -sS http://127.0.0.1:3001/api/stats`: paso antes del cambio con `validated: 4`, `in_review: 2`.
- `PATCH /api/reports?id=report-pv-001` con `{"status":"in_review"}`: paso, devolvio `ok: true` y `status: in_review`.
- `PATCH /api/reports?id=report-pv-001` con `{"status":"inventado"}`: paso como error esperado, `400 validation_failed`.
- `PATCH /api/reports?id=report-pv-001` con `title`: paso como error esperado, `400 validation_failed`.
- `GET /api/reports?id=report-pv-001` despues del cambio: paso, `status: in_review`.
- `GET /api/reports?status=in_review` despues del cambio: paso, `count: 3` e incluye `report-pv-001`.
- `GET /api/stats` despues del cambio: paso, `in_review: 3`, `validated: 3`.
- Reinicio del servidor: paso.
- `GET /api/reports?id=report-pv-001` despues del reinicio: paso, conserva `status: in_review`.
- `GET /api/stats` despues del reinicio: paso, conserva `in_review: 3`, `validated: 3`.

No se abrio navegador grafico desde esta sesion. El flujo visual se valido con HTML servido, JS presente, endpoint PATCH, GET de detalle y persistencia tras reinicio.
