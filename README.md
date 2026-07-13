# La Calle Habla

La Calle Habla es una plataforma ciudadana para reportar problemas urbanos por WhatsApp y convertirlos en una base de datos viva de evidencia, ubicaciones, categorias, estados y seguimiento.

## Problema

Los reportes de baches, basura, fugas, alumbrado, drenaje, banquetas danadas y calles peligrosas suelen quedar dispersos en chats, redes sociales o quejas aisladas. Esa informacion se pierde o no se puede consultar de forma ordenada.

La Calle Habla busca organizar esos reportes para que ciudadanos, colonias, equipos civicos, candidatos, municipios o administradores puedan entender prioridades urbanas con datos claros.

## MVP

El MVP debe validar:

- Captura o simulacion de reportes ciudadanos.
- Categoria, ubicacion, fecha, evidencia y estado.
- Revision administrativa basica.
- Filtros por categoria, estado, fecha y zona.
- Separacion clara entre reporte ciudadano y resolucion oficial.

## Estado actual

Proyecto en etapa inicial con modelo operativo local, datos seed, captura local por POST, panel administrativo local y detalle de reportes.

Ya existe documentacion base en:

- `docs/project/`
- `docs/roadmap/`
- `docs/audits/`
- `PROJECT_STATE.md`

Stack inicial:

- Node.js 20 o superior.
- Servidor HTTP nativo de Node.
- TypeScript para contratos de dominio.
- Pruebas con `node --test`.
- Sin dependencias externas.

Ya existen endpoints locales para categorias, estados, reportes, estadisticas, creacion local de reportes, vista administrativa local con detalle, cambio de estado interno, notas internas, historial local por reporte y aviso operativo de privacidad del MVP.

Todavia no hay integracion real con WhatsApp, login ni dashboard productivo.

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm test
```

El servidor local expone:

- `/`
- `/admin`
- `/admin/report?id=report-pv-001`
- `/health`
- `/api/categories`
- `/api/statuses`
- `/api/reports`
- `/api/reports?id=report-pv-004`
- `/api/reports?category=bache`
- `/api/reports?status=validated`
- `/api/stats`
- `POST /api/reports`
- `PATCH /api/reports?id=REPORT_ID`
- `GET /api/report-history?id=REPORT_ID`

Crear reporte local:

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
    "evidenceCount": 0,
    "citizenAlias": "Vecino prueba",
    "privacyNoticeVersion": "mvp-1",
    "privacyAcknowledged": true,
    "sensitiveDataConsent": false
  }'
```

Los reportes creados localmente se guardan en `data/runtime/reports.json`, archivo ignorado por Git.

Panel local:

```text
http://127.0.0.1:3001/admin
```

La vista permite filtrar reportes, revisar contadores, seleccionar un reporte, ver su detalle, cambiar su estado interno, agregar notas internas, revisar historial interno y crear reportes locales desde navegador. El formulario muestra un aviso corto de privacidad, una explicacion ampliada local y casillas no premarcadas para reconocimiento del aviso y consentimiento de datos opcionales sensibles.

El detalle local permite revisar un reporte, cambiar su estado interno, agregar notas internas y consultar una linea de tiempo de seguimiento. Los cambios de estado se guardan como overrides en `data/runtime/report-overrides.json`, archivo ignorado por Git. El historial se guarda en `data/runtime/report-history.json`, archivo ignorado por Git.

Cambiar estado interno:

```bash
curl -sS -X PATCH 'http://127.0.0.1:3001/api/reports?id=report-pv-001' \
  -H 'Content-Type: application/json' \
  --data '{"status":"in_review"}'
```

Agregar nota interna sin cambiar estado:

```bash
curl -sS -X PATCH 'http://127.0.0.1:3001/api/reports?id=report-pv-001' \
  -H 'Content-Type: application/json' \
  --data '{"note":"Seguimiento interno local, sin resolucion oficial."}'
```

Consultar historial interno:

```bash
curl -sS 'http://127.0.0.1:3001/api/report-history?id=report-pv-001'
```

`PATCH /api/reports?id=REPORT_ID` solo acepta `status` y `note`. No permite editar titulo, categoria, ubicacion, origen, fechas, prioridad ni evidencias. Las notas tienen limite de 500 caracteres, se guardan como seguimiento interno y no son una respuesta oficial al ciudadano.

## Privacidad MVP

La politica operativa provisional esta en:

- `docs/project/privacy-and-data-retention.md`

Version vigente del aviso operativo:

```text
mvp-1
```

Para reportes nuevos, `POST /api/reports` requiere:

- `privacyNoticeVersion: "mvp-1"`
- `privacyAcknowledged: true`

El servidor genera `privacyAcknowledgedAt`; no confia en timestamps enviados por cliente.

`sensitiveDataConsent: true` solo se exige cuando el reporte incluye telefono, ubicacion precisa o evidencia. Estos datos siguen siendo opcionales. Esta politica no es un aviso legal definitivo y requiere revision legal antes de operar con datos ciudadanos reales o produccion.

## Como continuar

1. Revisar `PROJECT_STATE.md`.
2. Revisar los documentos en `docs/project/`.
3. Revisar la decision tecnica en `docs/project/technical-stack.md`.
4. Ejecutar la siguiente task sugerida en `docs/roadmap/roadmap-mvp.md`.
5. Mantener auditoria de cada task en `docs/audits/`.

## Advertencia

Este proyecto esta en etapa inicial. No hay integracion real con WhatsApp, mapas, IA, login, deploy ni dependencias gubernamentales. La plataforma no promete que una autoridad resolvera automaticamente los reportes.
