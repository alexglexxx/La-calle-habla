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
- `privacyNoticeVersion`: version del aviso operativo reconocido en reportes nuevos.
- `privacyAcknowledged`: indicador de reconocimiento del aviso.
- `privacyAcknowledgedAt`: fecha generada por servidor para el reconocimiento.
- `sensitiveDataConsent`: consentimiento explicito cuando se proporcionan datos opcionales sensibles.
- `containsSensitiveOptionalData`: indicador tecnico para telefono, ubicacion precisa o evidencia.
- `classificationStatus`: estado de clasificacion cuando el canal ciudadano no exige categoria.
- `intakeChannel`: canal normalizado de ingreso, por ejemplo `whatsapp_normalized`.
- `intakeSource`: flujo de origen, por ejemplo `fast_anonymous_report`.
- `phoneId`: identificador pseudonimo generado con HMAC para recurrencia local.
- `anonymousAlias`: alias corto visible, por ejemplo `Ciudadano anonimo · a8f2`.
- `locationDetails`: objeto extendido de ubicacion exacta, escrita, inferida o pendiente.
- `photoReference`: referencia segura de evidencia fotografica recibida por el proveedor.
- `evidenceReferences`: arreglo de evidencias normalizadas.
- `locationResolutionSummary`: texto administrativo sobre la resolucion de ubicacion.

Notas:

- El reporte debe poder existir aunque falte informacion.
- La prioridad no debe confundirse con compromiso de solucion.
- El reporte ciudadano y su validacion administrativa deben mantenerse separados.
- Reportes seed e historicos pueden no tener campos de consentimiento versionado.
- `privacyAcknowledgedAt` debe generarse por servidor, no por cliente.
- Los reportes expres anonimos pueden usar categoria tecnica `otro` con `classificationStatus: pending_classification` hasta revision administrativa.
- El numero original de WhatsApp no debe guardarse en `Report`; solo se conserva `phoneId`.

## Reporter

Representa a la persona que envia un reporte. Debe ser opcional para permitir reportes anonimos o con datos minimos.

Campos sugeridos:

- `id`: identificador unico.
- `displayName`: nombre visible opcional.
- `phoneId`: HMAC-SHA256 del identificador del remitente con `REPORTER_ID_SECRET`, si el canal requiere recurrencia operativa.
- `phoneLast4`: ultimos digitos opcionales para soporte operativo.
- `consentFlags`: permisos o consentimientos registrados.
- `createdAt`: fecha de primer contacto.

Notas:

- Evitar guardar telefonos completos si no son necesarios.
- Para el flujo expres anonimo no se guarda el numero original, los ultimos digitos ni el payload completo del proveedor.
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
- `source`: `whatsapp_shared`, `written_reference`, `inferred_from_reports`, `admin_adjusted` u otro.
- `originalReference`: texto original de referencia cuando exista.
- `normalizedReference`: version normalizada para comparacion interna.
- `resolutionStatus`: `exact`, `inferred` o `pending`.
- `confidence`: `high`, `medium`, `low` o `unknown`.
- `resolvedAt`: fecha de resolucion si aplica.
- `resolutionMethod`: metodo local usado.
- `supportingReportCount`: cantidad de antecedentes relacionados.

Notas:

- Aceptar ubicaciones aproximadas.
- Registrar si la ubicacion fue ajustada por administracion.
- La ubicacion precisa es opcional y requiere consentimiento sensible en el MVP local.
- La ubicacion compartida por WhatsApp se conserva como exacta y no se altera por inferencias posteriores.
- La referencia escrita puede quedar pendiente si no hay antecedentes suficientes.
- Una inferencia debe etiquetarse como aproximada y no presentarse como coordenada exacta confirmada.

## IntakeSession

Representa una sesion temporal del flujo expres anonimo. En la implementacion local actual se guarda en `data/runtime/report-intake-sessions.json`, archivo ignorado por Git.

Campos actuales:

- `phoneId`: identificador pseudonimo HMAC.
- `state`: `awaiting_privacy`, `awaiting_photo_or_location`, `awaiting_photo`, `awaiting_location` o `completed`.
- `startedAt`: fecha de inicio.
- `updatedAt`: fecha del ultimo mensaje valido.
- `expiresAt`: expiracion de la sesion incompleta.
- `privacyNoticeVersion`: actualmente `mvp-1`.
- `privacyAcknowledgedAt`: fecha generada por servidor.
- `photoReference`: referencia segura de la foto.
- `location`: ubicacion compartida, referencia escrita o inferencia local.
- `optionalDescription`: detalle adicional opcional.
- `reportId`: reporte creado cuando la sesion completa.
- `descriptionWindowUntil`: ventana breve para agregar detalle al mismo reporte.
- `processedMessages`: referencias minimas de `messageId` ya procesados.
- `completedReportTimestamps`: timestamps para rate limiting.

Notas:

- No debe guardar numero original, nombre de WhatsApp, foto de perfil, IP, user-agent ni payload completo del proveedor.
- Las sesiones incompletas expiran despues de 15 minutos.
- Los `messageId` se conservan temporalmente para idempotencia.

## IncomingCitizenMessage

Contrato normalizado independiente del proveedor para el motor conversacional.

Campos:

- `provider`: proveedor de origen, por ejemplo `whatsapp_simulator`.
- `senderReference`: identificador recibido por el adaptador para generar `phoneId`.
- `messageId`: identificador idempotente del mensaje.
- `timestamp`: fecha del mensaje.
- `type`: `action`, `image`, `location` o `text`.
- `action`: accion rapida, por ejemplo `continue_anonymous`.
- `image`: `mediaId`, `mimeType` y `sizeBytes`.
- `location`: `latitude`, `longitude`, `name` y `address`.
- `text`: cuerpo textual.

Notas:

- El contrato no guarda el payload completo de Meta.
- El adaptador real futuro debe normalizar el payload antes de llamar al dominio.
- El simulador usa referencias ficticias seguras y no descarga medios reales.

## CitizenReply

Respuesta normalizada que un adaptador puede enviar al canal ciudadano.

Campos:

- `type`: tipo de respuesta.
- `text`: mensaje corto.
- `quickActions`: acciones rapidas opcionales.

Notas:

- No debe incluir folio, UUID, `phoneId`, estado administrativo, historial ni enlaces a `/admin`.
- Las respuestas deben mantener una instruccion por mensaje y lenguaje no oficial.

## PrivacyConsent

Representa el reconocimiento tecnico del aviso operativo provisional del MVP. No es un sustituto de un aviso legal definitivo.

Campos actuales en reportes runtime nuevos:

- `privacyNoticeVersion`: actualmente `mvp-1`.
- `privacyAcknowledged`: debe ser `true` para crear reportes nuevos.
- `privacyAcknowledgedAt`: timestamp generado por servidor.
- `sensitiveDataConsent`: `true` cuando se proporciona telefono, ubicacion precisa o evidencia.
- `containsSensitiveOptionalData`: indicador tecnico derivado por servidor.

Notas:

- Las casillas del formulario no deben estar premarcadas.
- No se guarda IP, user-agent, fingerprint ni datos adicionales no solicitados.
- Los reportes historicos sin estos campos deben leerse como compatibles.
- La politica operativa esta en `docs/project/privacy-and-data-retention.md`.

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
- En el flujo expres anonimo, la foto es obligatoria para completar el reporte, pero se guarda solo una referencia segura mientras no exista descarga real de medios.
- Tipos MIME iniciales aceptados: `image/jpeg`, `image/png` e `image/webp`.
- `image/svg+xml`, HTML, scripts, rutas arbitrarias y referencias con separadores de ruta se rechazan.

## ReportHistoryEvent

Representa un evento interno de seguimiento asociado a un reporte. En la implementacion local actual se guarda en `data/runtime/report-history.json` y no modifica los seeds.

Campos actuales:

- `id`: identificador unico del evento.
- `reportId`: identificador del reporte asociado.
- `type`: `status_change` o `internal_note`.
- `createdAt`: fecha y hora ISO 8601 del evento.
- `actor`: origen local generico, actualmente `local_admin`.
- `note`: texto interno opcional en cambios de estado y requerido en notas internas.
- `previousStatus`: estado interno anterior cuando `type` es `status_change`.
- `newStatus`: estado interno nuevo cuando `type` es `status_change`.

Notas:

- El historial es seguimiento interno de La Calle Habla.
- No representa resolucion oficial ni respuesta automatica al ciudadano.
- No debe guardar telefonos, ubicacion nueva, evidencia ni nombres reales de administradores.
- Las notas internas locales tienen limite actual de 500 caracteres.
- Los eventos no se editan ni eliminan en el MVP local.

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
