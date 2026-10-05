# Project State

## Proyecto

Nombre: La Calle Habla

Fecha de arranque: 2026-07-08

Estado actual: TASK-024 implementada. MVP mapa-first sobre Next.js con cartografía real de Puerto Vallarta mediante Leaflet + OpenStreetMap raster, reportes ciudadanos con coordenadas reales, filtros y selección de reportes; Supabase productivo preparado y webhook WhatsApp con evidencia e idempotencia durable.

## Objetivo MVP

Crear una plataforma mínima para recibir reportes ciudadanos de problemas urbanos, ordenarlos en una base de datos y permitir revisión administrativa básica con estados, categorías, evidencia y ubicación.

El MVP debe validar el flujo ciudadano y administrativo antes de activar cualquier comunicación o gestión institucional.

## Estado operativo actual

- Portal público mapa-first.
- Dashboard administrativo protegido.
- Territorio MVP delimitado para Puerto Vallarta.
- Motor de prioridad explicable y una alerta primaria.
- Proyección pública sin datos sensibles.
- Geometría GIS versionada y mapa con coordenadas reales cuando existen.
- Cartografía pública real con Leaflet + tiles raster de OpenStreetMap.
- Reportes visibles como puntos sobre calles reales.
- Filtros por categoría y selección/tap de reportes conservados.
- Supabase productivo La-calle-habla creado y migraciones principales aplicadas.
- RLS habilitado en las tablas operativas.
- Storage report-evidence privado con límite de 5 MB y JPEG/PNG/WebP.
- Persistencia de reportes y eventos de historial preparada para Supabase.
- Webhook Meta/WhatsApp normalizado.
- Evidencia multimedia conectada a Storage privado.
- Idempotencia durable por message_id en Supabase para soportar reintentos y múltiples instancias.
- El flujo local sigue disponible para simulación/desarrollo.
- Los cambios de estado administrativos siguen siendo internos y no representan resolución oficial.

## TASK 012 — frontera WhatsApp/Meta y persistencia productiva

Implementada la arquitectura de frontera:

- Verificación de webhook Meta.
- Validación HMAC x-hub-signature-256.
- Normalización de mensajes.
- Descarga de media preparada.
- Cliente REST Supabase server-only.
- Contrato de tablas y Storage privado.
- Función compatible con Vercel.

## TASK 013 — experiencia web

Implementada la primera capa web profesional:

- Portal público mapa-first.
- Dashboard admin sobrio.
- KPIs, filtros, cola y panel de detalle.
- Motor de prioridad separado del componente visual.
- Proxy de acceso administrativo.
- Proyección pública sanitizada.

## TASK 014 — frontera territorial

Implementada y versionada la validación territorial:

- Bounds + polígono.
- Rechazo de ubicaciones fuera del territorio.
- Validación de referencias geográficas inferidas.
- Pruebas de frontera.

Limitación deliberada: la geometría sigue siendo una representación MVP versionada, no un límite municipal autoritativo.

## TASK 015 — GIS

Implementada la primera capa GIS real:

- Coordenadas reales de reportes.
- Plan de tiles OSM.
- Marcadores dinámicos.
- Sin coordenadas inventadas para reportes públicos.
- Proyección pública sanitizada.

La cartografía del MVP usa tiles raster OSM para priorizar compatibilidad y funcionamiento móvil.

## TASK 016 — arquitectura de atención

Preparada la arquitectura de work orders sin activar gestión institucional.

No se consideran activos:
- envío a dependencias;
- correo institucional;
- acuses oficiales;
- reparación;
- evidencia de obra;
- estado oficial de resolución.

## TASK 017 — endurecimiento Supabase

Aplicados índices y controles de persistencia server-only.

## TASK 018 — conexión real de persistencia

- Proyecto Supabase La-calle-habla creado.
- Migraciones iniciales y hardening aplicados.
- Índices de FK corregidos.
- Vercel configurado con SUPABASE_URL y SUPABASE_REPORT_BUCKET.
- Persistencia de reportes e historial conectada al flujo de servidor.
- RLS y Storage privado verificados a nivel de esquema.
- Sin activación institucional.

Nota: SUPABASE_SERVICE_ROLE_KEY sigue siendo una credencial server-only y debe existir en Vercel antes de considerar completa la ejecución real del backend.

## TASK 019 — idempotencia durable del webhook

Implementada:

- Claim de message_id antes de procesar.
- Estado processing.
- Detección durable de duplicados.
- Recuperación de claims atascados después de 5 minutos.
- Estados finales processed, rejected y failed.
- El webhook evita reprocesar el mismo evento en reintentos de Meta.
- No se almacena el número telefónico crudo como parte del claim.

## TASK 020 — evidencia real

Implementada:

- Media de WhatsApp → descarga validada → Supabase Storage privado → report_evidence.
- Persistencia idempotente por media id.
- Protección contra descargas/subidas duplicadas.
- Token de Meta documentado como server-only.
- Check estructural del pipeline.

## TASK 021 — mapa temático / arquitectura visual

Implementada como exploración visual y posteriormente superada por el enfoque de cartografía real del MVP.

La decisión actual es priorizar mapa real y funcional antes de retomar cualquier piel temática avanzada.

## TASK 022 — cartografía OSM real

Implementada la recuperación del mapa real de Puerto Vallarta sobre OpenStreetMap.

## TASK 023 — MapLibre vectorial

Implementada y posteriormente descartada para el MVP por problemas de carga/compatibilidad en el entorno móvil. No forma parte del renderer actual.

## TASK 024 — MVP cartográfico funcional

Implementada:

- Retiro de MapLibre del renderer público.
- Leaflet como renderer simple y estable.
- Tiles raster reales de OpenStreetMap.
- Puerto Vallarta con calles reales.
- Reportes como puntos sobre coordenadas reales.
- Filtros por categoría.
- Tap/click de reporte para ver qué ocurrió.
- Zoom y regreso a Puerto Vallarta.
- Límites territoriales conservados.
- Estilos móviles dedicados para evitar contenedores/mapas en blanco.
- Check estructural actualizado para la nueva arquitectura.

## Próxima frontera

Prueba end-to-end controlada del MVP completo: entrada de reporte → persistencia → evidencia → aparición pública en el mapa → selección desde móvil.

Después: migración progresiva de las lecturas operativas restantes desde JSON local hacia Supabase y endurecimiento final antes de sumar funcionalidades secundarias.

## No activar todavía

- Comunicación con dependencias.
- Órdenes de trabajo reales.
- Acuse institucional.
- Estado oficial de resolución.
- Reparaciones.
- Evidencia de obra terminada.
- Cualquier lenguaje que presente La Calle Habla como sistema oficial de gobierno.

## Visión de producto

La capa pública podrá evolucionar a un mapa temático ilustrado: geografía neutral e inmutable, con una capa visual intercambiable por municipio/tema. Los reportes ciudadanos permanecerán dinámicos sobre esa base.
