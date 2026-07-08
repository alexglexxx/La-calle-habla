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

Proyecto en etapa inicial con modelo operativo local y datos seed.

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

Ya existen endpoints locales de lectura para categorias, estados, reportes y estadisticas.

Todavia no hay captura real de reportes, integracion real con WhatsApp ni dashboard administrativo.

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm test
```

El servidor local expone:

- `/`
- `/health`
- `/api/categories`
- `/api/statuses`
- `/api/reports`
- `/api/reports?id=report-pv-004`
- `/api/reports?category=bache`
- `/api/reports?status=validated`
- `/api/stats`

## Como continuar

1. Revisar `PROJECT_STATE.md`.
2. Revisar los documentos en `docs/project/`.
3. Revisar la decision tecnica en `docs/project/technical-stack.md`.
4. Ejecutar la TASK 004 sugerida en `docs/roadmap/roadmap-mvp.md`.
5. Mantener auditoria de cada task en `docs/audits/`.

## Advertencia

Este proyecto esta en etapa inicial. No hay integracion real con WhatsApp, mapas, IA, login, deploy ni dependencias gubernamentales. La plataforma no promete que una autoridad resolvera automaticamente los reportes.
