# Borrador de modelo de datos

Este documento propone un modelo inicial. No es un esquema definitivo de base de datos.

## Report

Representa un problema urbano reportado por un ciudadano.

Campos sugeridos:

- `id`: identificador unico.
- `title`: resumen corto generado o capturado.
- `description`: descripcion enviada por el ciudadano.
- `categoryId`: referencia a `Category`.
- `statusId`: referencia a `Status`.
- `locationId`: referencia a `Location`.
- `reporterId`: referencia opcional a `Reporter`.
- `source`: canal de origen, por ejemplo `whatsapp`, `manual` o `seed`.
- `sourceMessageId`: identificador externo futuro del mensaje.
- `receivedAt`: fecha y hora de recepcion.
- `validatedAt`: fecha y hora de validacion, si aplica.
- `closedAt`: fecha y hora de cierre, si aplica.
- `priority`: prioridad inicial manual o calculada.
- `notes`: notas internas administrativas.

Notas:

- El reporte debe poder existir aunque falte informacion.
- La prioridad no debe confundirse con compromiso de solucion.
- El reporte ciudadano y su validacion administrativa deben mantenerse separados.

## Reporter

Representa a la persona que envia un reporte. Debe ser opcional para permitir reportes anonimos o con datos minimos.

Campos sugeridos:

- `id`: identificador unico.
- `displayName`: nombre visible opcional.
- `phoneHash`: hash del telefono si el canal lo requiere.
- `phoneLast4`: ultimos digitos opcionales para soporte operativo.
- `consentFlags`: permisos o consentimientos registrados.
- `createdAt`: fecha de primer contacto.

Notas:

- Evitar guardar telefonos completos si no son necesarios.
- Disenar con privacidad desde el inicio.

## Category

Representa el tipo de problema urbano.

Campos sugeridos:

- `id`: identificador unico.
- `name`: nombre ciudadano, por ejemplo `Bache`.
- `slug`: identificador estable.
- `description`: explicacion interna.
- `isActive`: permite desactivar categorias sin borrar historial.
- `sortOrder`: orden de presentacion.

Categorias iniciales sugeridas:

- Bache.
- Basura.
- Fuga de agua.
- Alumbrado.
- Drenaje.
- Banqueta danada.
- Calle peligrosa.
- Senalizacion.
- Otro.

## Location

Representa donde ocurre el problema.

Campos sugeridos:

- `id`: identificador unico.
- `latitude`: coordenada opcional.
- `longitude`: coordenada opcional.
- `addressText`: direccion o referencia escrita.
- `neighborhood`: colonia opcional.
- `municipality`: municipio opcional.
- `state`: estado opcional.
- `country`: pais.
- `accuracyMeters`: precision de la ubicacion si existe.
- `source`: `shared_location`, `manual_text`, `admin_adjusted` u otro.

Notas:

- Aceptar ubicaciones aproximadas.
- Registrar si la ubicacion fue ajustada por administracion.

## Status

Representa el estado del reporte dentro de la plataforma.

Campos sugeridos:

- `id`: identificador unico.
- `name`: nombre visible.
- `slug`: identificador estable.
- `description`: significado operativo.
- `isTerminal`: indica si el estado cierra el flujo interno.

Estados iniciales sugeridos:

- `new`: recibido.
- `in_review`: en revision.
- `validated`: validado.
- `needs_info`: requiere informacion.
- `duplicate`: duplicado.
- `closed`: cerrado internamente.

Notas:

- Estos estados son internos de la plataforma.
- No implican resolucion oficial por una autoridad.

## Evidence

Representa archivos o datos que respaldan un reporte.

Campos sugeridos:

- `id`: identificador unico.
- `reportId`: referencia a `Report`.
- `type`: `photo`, `video`, `text`, `location`, `document`.
- `url`: ubicacion del archivo si aplica.
- `storageKey`: llave interna futura.
- `caption`: texto asociado.
- `capturedAt`: fecha de captura si se conoce.
- `receivedAt`: fecha de recepcion.
- `metadata`: datos tecnicos opcionales.

Notas:

- La evidencia visual es importante, pero no todos los reportes tendran foto.
- El almacenamiento real debe decidirse cuando exista stack.

## DuplicateGroup

Entidad opcional futura para agrupar reportes del mismo problema.

Campos sugeridos:

- `id`: identificador unico.
- `canonicalReportId`: reporte principal.
- `reason`: motivo del agrupamiento.
- `confidence`: confianza manual o automatica.
- `createdAt`: fecha de creacion.

Notas:

- En MVP puede manejarse manualmente con estado `duplicate`.
- La deteccion automatica queda para fase 2.

## AdminUser

Entidad futura para personas que administran reportes.

Campos sugeridos:

- `id`: identificador unico.
- `name`: nombre.
- `email`: correo.
- `role`: rol operativo.
- `isActive`: estado de acceso.
- `createdAt`: fecha de creacion.

Notas:

- No implementar login hasta que el MVP lo requiera.
- Separar roles administrativos de reporteros ciudadanos.

## Municipality/Zone

Entidad futura para agrupar reportes por area operativa.

Campos sugeridos:

- `id`: identificador unico.
- `name`: nombre de municipio, colonia, distrito o zona.
- `type`: `municipality`, `neighborhood`, `district`, `custom_zone`.
- `parentId`: referencia opcional para jerarquia.
- `boundaryGeoJson`: poligono futuro.

Notas:

- Puede iniciar como texto en `Location`.
- Las zonas estructuradas deben agregarse cuando haya necesidad real de analisis geografico.
