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
- `src/server/admin-page.mjs`: vista administrativa local servida como HTML, con detalle, cambio de estado, notas internas, historial y aviso operativo de privacidad.
- `src/server/report-detail-page.mjs`: vista auxiliar de detalle, cambio de estado, notas internas e historial.
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
- `GET /api/report-history?id=REPORT_ID`

## Vista administrativa local

`GET /admin` sirve HTML con CSS y JavaScript embebidos. La vista consume los endpoints locales existentes para cargar reportes, categorias, estados, estadisticas, revisar detalle, cambiar estado interno por `PATCH /api/reports?id=REPORT_ID`, agregar notas internas, consultar historial por `GET /api/report-history?id=REPORT_ID` y crear reportes por `POST /api/reports`.

No usa dependencias externas, CDN, fuentes remotas ni framework frontend.

El formulario de creacion local muestra un aviso corto de privacidad, una explicacion ampliada local y casillas no premarcadas para:

- reconocimiento del aviso operativo `mvp-1`;
- consentimiento para datos opcionales sensibles cuando se proporciona telefono, ubicacion precisa o evidencia.

## Privacidad operativa MVP

La version vigente del aviso operativo esta centralizada en `src/services/report-service.mjs` como `PRIVACY_NOTICE_VERSION` y actualmente vale:

```text
mvp-1
```

`POST /api/reports` requiere para reportes nuevos:

- `privacyNoticeVersion: "mvp-1"`;
- `privacyAcknowledged: true`.

El servidor genera `privacyAcknowledgedAt` usando su hora local de ejecucion. Si el cliente envia un timestamp, no se usa como fuente confiable.

`sensitiveDataConsent` se exige solo cuando se envia alguno de estos datos opcionales:

- `contactPhone`;
- `locationPrecision: "precise"`;
- `evidenceCount` mayor que `0`.

Los reportes seed y reportes runtime historicos sin campos de privacidad siguen siendo legibles.

## Cambios de estado locales

`PATCH /api/reports?id=REPORT_ID` permite cambiar el estado interno de un reporte y agregar una nota interna opcional. Los cambios de estado se guardan como overrides en `data/runtime/report-overrides.json` para no modificar seeds ni datos base. Cada cambio real de estado agrega un evento `status_change` en el historial local.

Si se envia el mismo estado sin nota, la respuesta es estable y no crea evento de historial. Si se envia el mismo estado con una nota valida, se registra un evento `internal_note` sin fingir un cambio de estado.

## Historial interno local

`GET /api/report-history?id=REPORT_ID` devuelve eventos cronologicos por reporte:

- `status_change`: incluye `previousStatus` y `newStatus`.
- `internal_note`: incluye `note`.

Todos los eventos incluyen `id`, `reportId`, `type`, `createdAt` y `actor: local_admin`. El actor es generico porque el proyecto no implementa login, usuarios reales ni roles definitivos.

Las notas internas se tratan como texto plano, se recortan con `trim`, rechazan contenido vacio y tienen limite de 500 caracteres. La interfaz escapa HTML antes de pintar notas.

## Persistencia local

Los reportes creados por `POST /api/reports` se guardan en `data/runtime/reports.json`.

Los overrides de estado se guardan en `data/runtime/report-overrides.json`.

El historial local se guarda en `data/runtime/report-history.json`.

Los archivos runtime estan ignorados por Git porque pueden contener datos variables de desarrollo. Las pruebas usan `LCH_RUNTIME_REPORTS_FILE`, `LCH_REPORT_OVERRIDES_FILE` y `LCH_REPORT_HISTORY_FILE` para aislar datos temporales.

## Criterio para cambiar de stack

Antes de migrar a Next.js u otro framework, debe existir una task con:

- Necesidad concreta.
- Impacto en el MVP.
- Cambios de estructura propuestos.
- Validaciones nuevas.
- Auditoria en `docs/audits/`.
