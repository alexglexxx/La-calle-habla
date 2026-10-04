# TASK-019 — Idempotencia durable del webhook WhatsApp

## Objetivo

Evitar que un reintento de Meta/WhatsApp o dos instancias concurrentes creen el mismo reporte dos veces.

## Implementado

- Claim durable por `message_id` en Supabase.
- Estado `processing` antes de ejecutar el intake.
- Reintentos del mismo `message_id` se reconocen como duplicados.
- Mensajes que quedan atorados en `processing` durante más de 5 minutos pueden ser recuperados.
- Estados finales `processed`, `rejected` o `failed`.
- El webhook conserva respuesta HTTP 200 para eventos procesables y reporta el resultado por mensaje.
- El claim no almacena el número telefónico crudo.
- Si Supabase no está configurado, el módulo se desactiva de forma segura para mantener el simulador local.

## No activado

- Comunicación con dependencias.
- Órdenes de trabajo.
- Acuse institucional.
- Estado oficial de resolución.
- Reparaciones o evidencia de obra terminada.

## Siguiente frontera

TASK-020 debe cerrar la ruta de evidencia real:

Meta media → descarga validada → Supabase Storage privado → `report_evidence`.

Después: prueba end-to-end controlada y lectura operativa desde Supabase.
