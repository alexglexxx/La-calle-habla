# Stack tecnico inicial

Fecha de decision: 2026-07-08

## Decision

La Calle Habla mantiene el core de dominio independiente, pero la experiencia web pasa a Next.js a partir de TASK 013:

- Node.js 20 o superior.
- Next.js para la experiencia web publica y administrativa.
- TypeScript como contrato de tipos de dominio.
- El core de dominio, intake y adaptadores de integracion permanecen independientes de React/Next.js.
- Pruebas con `node --test`.
- Scripts de validacion propios en `scripts/`.

## Por que este stack

El proyecto ya supero la etapa en la que una vista HTML minima aporta suficiente valor. Next.js pasa a ser la capa de experiencia para construir el portal publico de mapa y el dashboard administrativo profesional, mientras el dominio permanece desacoplado para no convertir la UI en el motor del negocio.

La decision no bloquea migrar a un framework web. Solo establece una base ejecutable y verificable.

## Scripts

- `npm run dev`: levanta el servidor local en `127.0.0.1`.
- `npm start`: levanta el servidor local en `127.0.0.1`.
- `npm run lint`: valida estructura, documentos y contratos minimos.
- `npm run build`: ejecuta chequeo de runtime y constantes base.
- `npm test`: ejecuta pruebas con Node test runner.
- `npm run simulate:report-intake`: ejecuta simulador local del flujo expres anonimo sin conectar WhatsApp real.

## Estructura inicial

- `src/server/`: servidor local minimo.
- `src/server/admin-page.mjs`: vista administrativa legacy/local durante la migracion.
- `src/app/` o estructura equivalente de Next.js: experiencia web publica y administrativa.
- `src/components/`: componentes visuales reutilizables de mapa, HUD, tarjetas, filtros y admin.
- `src/services/`: dominio y servicios independientes de la UI.
- `src/server/report-detail-page.mjs`: vista auxiliar de detalle, cambio de estado, notas internas e historial.
- `src/lib/`: constantes y logica compartida.
- `src/data/`: seeds locales de categorias, estados y reportes.
- `src/services/`: servicios internos de consulta, estadisticas, privacidad, historial e ingreso expres anonimo.
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

El contrato de ingreso expres es compatible con WhatsApp, pero no instala SDK, no crea webhook productivo, no descarga medios desde Meta y no llama servicios externos.

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

## Ingreso expres anonimo

`src/services/report-intake-service.mjs` implementa el motor conversacional local independiente del proveedor.

Capacidades:

- Contrato normalizado `IncomingCitizenMessage` para `action`, `image`, `location` y `text`.
- Respuesta normalizada `CitizenReply`.
- Flujo Foto -> ubicacion compartida -> listo.
- Flujo Foto -> referencia escrita -> listo.
- Orden flexible: ubicacion o referencia tambien pueden llegar antes de la foto.
- Descripcion opcional posterior dentro de una ventana breve.
- Categoria interna pendiente de clasificacion sin preguntarla al ciudadano.
- Sesiones temporales en `data/runtime/report-intake-sessions.json`.
- Idempotencia por `messageId`.
- Rate limiting local por `phoneId`.
- Normalizacion deterministica de calles y referencias.
- Inferencia local de ubicacion usando reportes anteriores con coordenadas.
- Distancia Haversine y agrupacion en radio inicial de 150 metros.

La identidad pseudonima se genera con:

```text
phoneId = HMAC-SHA256(REPORTER_ID_SECRET, normalizedWhatsAppSender)
```

`REPORTER_ID_SECRET` debe estar en variables de entorno y no debe versionarse. Si falta, el motor falla de forma segura. Las pruebas y el simulador inyectan un secreto ficticio.

## Persistencia local

Los reportes creados por `POST /api/reports` se guardan en `data/runtime/reports.json`.

Los overrides de estado se guardan en `data/runtime/report-overrides.json`.

El historial local se guarda en `data/runtime/report-history.json`.

Las sesiones del flujo expres anonimo se guardan en `data/runtime/report-intake-sessions.json`.

Los archivos runtime estan ignorados por Git porque pueden contener datos variables de desarrollo. Las pruebas usan `LCH_RUNTIME_REPORTS_FILE`, `LCH_REPORT_OVERRIDES_FILE` y `LCH_REPORT_HISTORY_FILE` para aislar datos temporales.

Las pruebas del ingreso expres tambien usan `LCH_REPORT_INTAKE_SESSIONS_FILE` para aislar sesiones temporales.

## Criterio de esta decision

TASK 013 formaliza la migracion a Next.js por una necesidad concreta: portal publico de mapa + dashboard admin profesional + territorio delimitado + visualizacion de prioridad. La migracion debe conservar el core y evitar duplicar reglas de negocio.

- Necesidad concreta.
- Impacto en el MVP.
- Cambios de estructura propuestos.
- Validaciones nuevas.
- Auditoria en `docs/audits/`.

## Direccion visual TASK 013

- Portal publico: mapa-first, territorio delimitado, iconografia propia tipo videojuego/HUD, animacion discreta y exploracion sencilla.
- Admin: misma cartografia y territorio, pero con jerarquia visual sobria, filtros operativos, historial, acciones y analitica.
- La alerta principal debe ser basada en datos y explicable; rojo/pulso solo cuando el modelo de prioridad la justifique.
