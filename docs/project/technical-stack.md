# Stack tecnico inicial

Fecha de decision: 2026-07-08

## Decision

La Calle Habla inicia con un stack minimo sin dependencias externas:

- Node.js 20 o superior.
- Servidor HTTP nativo de Node para correr localmente.
- TypeScript como contrato de tipos de dominio.
- Pruebas con `node --test`.
- Scripts de validacion propios en `scripts/`.

## Por que este stack

El proyecto todavia esta validando modelo, flujo y decisiones de producto. Un stack sin framework reduce costo de arranque, evita dependencias tempranas y permite que futuras tasks elijan Next.js, base de datos, mapas o WhatsApp real con mejor informacion.

La decision no bloquea migrar a un framework web. Solo establece una base ejecutable y verificable.

## Scripts

- `npm run dev`: levanta el servidor local en `127.0.0.1`.
- `npm start`: levanta el servidor local en `127.0.0.1`.
- `npm run lint`: valida estructura, documentos y contratos minimos.
- `npm run build`: ejecuta chequeo de runtime y constantes base.
- `npm test`: ejecuta pruebas con Node test runner.

## Estructura inicial

- `src/server/`: servidor local minimo.
- `src/server/admin-page.mjs`: vista administrativa local servida como HTML, con detalle y cambio de estado.
- `src/server/report-detail-page.mjs`: vista auxiliar de detalle y cambio de estado.
- `src/lib/`: constantes y logica compartida.
- `src/data/`: seeds locales de categorias, estados y reportes.
- `src/services/`: servicios internos de consulta y estadisticas.
- `data/runtime/`: persistencia local ignorada por Git para reportes creados en desarrollo.
- `src/types/`: tipos de dominio en TypeScript.
- `tests/`: pruebas de contratos.
- `scripts/`: validaciones del proyecto.

## Limites de la decision

Esta task no implementa:

- WhatsApp real.
- Base de datos real.
- Dashboard real.
- Mapa.
- Login.
- IA.
- Deploy.

## Endpoints locales actuales

- `GET /health`
- `GET /api/categories`
- `GET /api/statuses`
- `GET /api/reports`
- `GET /api/reports?id=REPORT_ID`
- `GET /api/reports?category=CATEGORIA`
- `GET /api/reports?status=STATUS`
- `GET /api/stats`
- `POST /api/reports`
- `GET /admin`
- `GET /admin/report?id=REPORT_ID`
- `PATCH /api/reports?id=REPORT_ID`

## Vista administrativa local

`GET /admin` sirve HTML con CSS y JavaScript embebidos. La vista consume los endpoints locales existentes para cargar reportes, categorias, estados, estadisticas, revisar detalle, cambiar estado interno por `PATCH /api/reports?id=REPORT_ID` y crear reportes por `POST /api/reports`.

No usa dependencias externas, CDN, fuentes remotas ni framework frontend.

## Cambios de estado locales

`PATCH /api/reports?id=REPORT_ID` permite cambiar solo el estado interno de un reporte. Los cambios se guardan como overrides en `data/runtime/report-overrides.json` para no modificar seeds ni datos base.

## Persistencia local

Los reportes creados por `POST /api/reports` se guardan en `data/runtime/reports.json`.

Los overrides de estado se guardan en `data/runtime/report-overrides.json`.

Los archivos runtime estan ignorados por Git porque pueden contener datos variables de desarrollo. Las pruebas usan `LCH_RUNTIME_REPORTS_FILE` y `LCH_REPORT_OVERRIDES_FILE` para aislar datos temporales.

## Criterio para cambiar de stack

Antes de migrar a Next.js u otro framework, debe existir una task con:

- Necesidad concreta.
- Impacto en el MVP.
- Cambios de estructura propuestos.
- Validaciones nuevas.
- Auditoria en `docs/audits/`.
