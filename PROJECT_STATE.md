# Project State

## Proyecto

Nombre: La Calle Habla

Fecha de arranque: 2026-07-08

Estado: TASK-012 preparada: frontera Meta/WhatsApp + persistencia Supabase + adaptador Vercel

## Objetivo MVP

Crear una plataforma minima para recibir o simular reportes ciudadanos de problemas urbanos, ordenarlos en una base de datos y permitir revision administrativa basica con estados, categorias, evidencia y ubicacion.

El MVP debe validar el flujo ciudadano y administrativo antes de integrar WhatsApp real, mapas, IA o deploy productivo.

## Estado operativo actual

El proyecto ya expone datos locales de lectura con seeds, permite crear reportes locales por POST, tiene una vista administrativa local, permite cambiar estado interno, conserva historial local por reporte, aplica una politica operativa provisional de privacidad del MVP y cuenta con un motor interno de ingreso exprés anónimo compatible con WhatsApp:

- Categorias.
- Estados.
- Reportes ciudadanos ficticios.
- Reportes locales creados en desarrollo.
- Estadisticas basicas.
- Panel local en `/admin`.
- Detalle local dentro de `/admin` y ruta auxiliar `/admin/report?id=REPORT_ID`.
- Cambios de estado internos con `PATCH /api/reports?id=REPORT_ID`.
- Notas internas con `PATCH /api/reports?id=REPORT_ID`.
- Historial interno cronologico con `GET /api/report-history?id=REPORT_ID`.
- Aviso corto de privacidad en el formulario local.
- Reconocimiento versionado `mvp-1` para reportes nuevos.
- Consentimiento explicito para telefono, ubicacion precisa o evidencia.
- Clasificacion y retencion provisional documentadas en `docs/project/privacy-and-data-retention.md`.
- Contrato normalizado de mensajes ciudadanos.
- Sesiones temporales por `phoneId` pseudonimo.
- Flujo Foto -> ubicacion compartida o referencia escrita -> listo.
- Idempotencia por `messageId`, rate limiting local y resolucion determinista de referencias.
- Simulador local `npm run simulate:report-intake`.

Endpoints disponibles:

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

Los reportes creados por POST se guardan en `data/runtime/reports.json`, ignorado por Git. Los cambios de estado se guardan como overrides en `data/runtime/report-overrides.json`, tambien ignorado por Git. El historial interno se guarda en `data/runtime/report-history.json`, tambien ignorado por Git. Las sesiones del ingreso expres se guardan en `data/runtime/report-intake-sessions.json`, tambien ignorado por Git.

## Stack inicial

Decision actual:

- Node.js 20 o superior.
- Servidor HTTP nativo de Node para correr localmente.
- TypeScript como contrato de tipos de dominio.
- Pruebas con `node --test`.
- Scripts propios para validacion estructural y build check.
- Sin dependencias externas todavia.

La decision esta documentada en `docs/project/technical-stack.md`.

## TASK 012 completada: persistencia productiva y frontera WhatsApp/Meta

Se preparó exclusivamente en La Calle Habla la arquitectura para Supabase, Storage privado, frontera Meta/WhatsApp y función Node compatible con Vercel.

FoodSPV 2.0 no fue modificado.

Pendiente de activación: proyecto Supabase objetivo, migración aplicada, pruebas contra Supabase, credenciales Meta, prueba real del webhook y deploy público.

## Riesgos

- No hay framework web ni base de datos definidos.
- TypeScript esta definido como contrato, pero aun no hay compilacion con `tsc`.
- La persistencia local en JSON no es apta para concurrencia alta.
- La vista `/admin` usa Basic Auth como barrera de MVP cuando se accede fuera de localhost; no es identidad productiva.
- Los cambios de estado son internos de la plataforma y no implican resolucion oficial.
- WhatsApp real puede agregar friccion legal, tecnica y de costos si se integra demasiado pronto.
- Ubicacion, fotos y telefono pueden ser datos sensibles.
- El producto puede malinterpretarse como sistema oficial de gobierno si el lenguaje no es cuidadoso.

## Decisiones abiertas

- Base de datos.
- Framework web, si el MVP lo requiere.
- Proveedor de WhatsApp.
- Adaptador real de WhatsApp/Meta cuando existan credenciales, webhook publico y decision documentada.
- Proveedor de mapas.
- Aviso de privacidad legal definitivo.
- Criterios de anonimato.
- Definicion exacta de roles administrativos.
- Si el MVP continuara con JSON local o migrara a base de datos.
- Politica legal de retencion y eliminacion antes de produccion.
