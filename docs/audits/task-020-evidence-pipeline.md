# Task 020 — Evidencia real

## Objetivo

Cerrar el circuito de evidencia fotográfica del canal WhatsApp sin exponer archivos públicamente:

WhatsApp → Meta Media → validación → Supabase Storage privado → report_evidence.

## Implementado

- Recuperación de media mediante Graph API.
- Descarga autenticada desde Meta.
- Límite máximo de 5 MB.
- Validación de MIME permitido.
- Validación adicional de firma binaria JPEG/PNG/WebP.
- Hash SHA-256 de la evidencia.
- Ruta determinista y segura dentro de `report-evidence`.
- Upload server-side al bucket privado.
- Registro de metadata en `report_evidence`.
- No se genera URL pública.
- El token de Meta queda exclusivamente en entorno server-side.

## No activado

- Comunicación institucional.
- Envío a dependencias.
- Órdenes de trabajo.
- Confirmación institucional.
- Estado resuelto/atendido por dependencia.
- Evidencia de reparación institucional.

## Pendiente de prueba real

La prueba de punta a punta requiere un `META_ACCESS_TOKEN` válido y un mensaje real de WhatsApp/Meta. No se simula una evidencia como si fuera una prueba real.
