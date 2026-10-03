# TASK-012 - Persistencia productiva y frontera WhatsApp/Meta

Fecha: 2026-10-03

## Alcance

Esta task modifica exclusivamente La Calle Habla.

FoodSPV 2.0 se uso solo como referencia de arquitectura para revisar su webhook existente. No se modifica, no se reutiliza su logica de negocio y no se agregan cambios a ese repositorio.

## Persistencia preparada

Supabase queda definido como backend productivo:

- PostgreSQL para reportes, evidencia, historial, sesiones e idempotencia.
- Storage privado report-evidence para fotografias.
- RLS habilitado en todas las tablas de aplicacion.
- Sin politicas de cliente en esta task.
- Acceso servidor mediante SUPABASE_SERVICE_ROLE_KEY.
- Unicidad de source_message_id y message_id para idempotencia atomica.
- La fotografia no se guarda en PostgreSQL; solo referencia durable, MIME, tamano, hash y media_id.

Supabase documenta buckets privados para activos sensibles y signed URLs para acceso temporal. Ver:
https://supabase.com/docs/guides/storage/buckets/fundamentals
https://supabase.com/docs/guides/storage/serving/downloads

## Frontera WhatsApp

Se agrega una frontera propia:

Meta webhook -> verificacion/firma -> parser -> IncomingCitizenMessage -> report-intake-service.

Normaliza:

- texto;
- foto;
- ubicacion;
- botones/acciones.

El motor de ingreso no conoce payloads Meta.

## Media

Queda preparada la secuencia:

Meta mediaId -> Graph media URL -> descarga -> validacion real -> Supabase Storage.

El archivo se valida contra MIME real y limite de 5 MB antes del almacenamiento.

## Vercel

Se agrega una funcion Node compatible con Vercel. Mantiene resolveRoute como capa HTTP y no convierte el proyecto a Next.js.

Vercel soporta funciones Node con interfaz Request/Response:
https://vercel.com/blog/evolving-vercel-functions

## No activado

- No hay cuenta Meta real conectada.
- No hay tokens reales.
- No se creo un proyecto Supabase desde esta task.
- No se modifica FoodSPV 2.0.
- No hay deploy automatico a Vercel.
- El store JSON sigue siendo el runtime local.
- No se publican fotografias.

## Verificacion pendiente

No se presenta npm test, npm run lint ni npm run build como ejecutados porque el conector GitHub no ejecuta el runtime Node del repositorio.

Cuando exista el proyecto Supabase objetivo, se debe aplicar la migracion, ejecutar una query de prueba y revisar advisors.

## Criterio de cierre

TASK-012 queda preparada en La Calle Habla para la siguiente etapa de activacion controlada de Supabase, Meta/WhatsApp y Vercel.
