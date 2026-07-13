# TASK-010 - Reporte expres anonimo

Fecha: 2026-07-13

## Objetivo

Implementar el flujo ciudadano central de La Calle Habla para registrar un problema urbano en menos de un minuto mediante un contrato compatible con WhatsApp:

- Foto -> ubicacion compartida -> listo.
- Foto -> calles, colonia o referencia -> listo.

El flujo tambien acepta ubicacion o referencia antes de la foto. No pide nombre, telefono manual, login, contrasena, folio publico, categoria obligatoria ni descripcion obligatoria.

## Diagnostico inicial

El proyecto ya tenia:

- Node.js nativo sin dependencias externas.
- Reportes seed y runtime.
- `POST /api/reports`.
- `/admin` y `/admin/report?id=REPORT_ID`.
- Overrides de estado.
- Historial local de TASK-008.
- Privacidad, consentimiento y retencion de TASK-009.
- Runtime ignorado por Git.

No existian credenciales, webhook publico, numero productivo ni proveedor real de WhatsApp. Por eso la implementacion se hizo como dominio y simulador local, no como integracion real.

## Flujo definitivo

Mensajes principales:

- Inicio: "Al continuar, aceptas que guardemos la foto y ubicacion para revisar este reporte. No somos una dependencia de gobierno."
- Accion: "Continuar anonimo".
- Si falta ubicacion: "Comparte la ubicacion o escribe la calle, cruce, colonia o una referencia."
- Si falta foto: "Ahora envia una foto del problema."
- Completo: "Listo, recibimos tu reporte. Gracias por ayudar a que la calle hable."
- Aclaracion: "Se registro para revision interna. Esto no representa una denuncia oficial ni garantiza su resolucion."
- Descripcion opcional: "Listo. Si quieres, puedes enviar un detalle adicional."

La descripcion posterior se agrega al mismo reporte dentro de una ventana breve y no crea un segundo reporte.

## Razon para evitar formularios

El flujo ciudadano objetivo es conversacional y de menos de un minuto. Un formulario tradicional pediria campos que la task excluye: categoria obligatoria, descripcion obligatoria, nombre, telefono manual o folio. La categoria queda como `pending_classification` para revision administrativa.

## Anonimato y limite frente a Meta

La Calle Habla no guarda ni muestra el numero original recibido por el adaptador. Genera:

```text
phoneId = HMAC-SHA256(REPORTER_ID_SECRET, normalizedWhatsAppSender)
```

`phoneId` es pseudonimo irreversible dentro del sistema bajo una clave secreta. No es anonimato absoluto porque WhatsApp/Meta si procesa y conoce el numero al operar el canal.

## Contrato normalizado

`IncomingCitizenMessage` contiene:

- `provider`.
- `senderReference`.
- `messageId`.
- `timestamp`.
- `type`: `action`, `image`, `location` o `text`.
- `action`, `image`, `location` o `text` segun corresponda.

`CitizenReply` contiene:

- `type`.
- `text`.
- `quickActions` opcionales.

El dominio no depende del payload completo de Meta.

## Sesiones

Las sesiones se guardan en `data/runtime/report-intake-sessions.json`, ignorado por Git.

Campos principales:

- `phoneId`.
- `state`.
- `startedAt`.
- `updatedAt`.
- `expiresAt`.
- `privacyNoticeVersion`.
- `privacyAcknowledgedAt`.
- `photoReference`.
- `location`.
- `optionalDescription`.
- `reportId`.
- `descriptionWindowUntil`.
- `processedMessages`.
- `completedReportTimestamps`.

No se guarda numero original, nombre de WhatsApp, foto de perfil, IP, user-agent ni payload completo.

## Expiracion

Las sesiones incompletas expiran a los 15 minutos. Los mensajes validos actualizan `updatedAt` y `expiresAt`. Las sesiones completadas conservan lo necesario para idempotencia, descripcion opcional y rate limiting.

## Idempotencia

Cada `messageId` procesado se guarda como referencia minima por 24 horas. Un reintento con el mismo `messageId` devuelve la misma respuesta logica y no duplica reporte, foto, ubicacion ni descripcion.

## Rate limits

Valores actuales:

- 3 reportes completados por hora.
- 10 reportes completados por 24 horas.
- Una sesion incompleta activa por `phoneId`.
- Solo reportes completados cuentan.

Mensaje al alcanzar el limite:

```text
Ya recibimos varios reportes desde esta cuenta. Espera un poco antes de enviar otro.
Si existe peligro inmediato, comunicate con los servicios de emergencia correspondientes.
```

## Fotografia

El contrato acepta referencias de foto con:

- `mediaId`.
- `messageId`.
- `mimeType`.
- `timestamp`.
- `sizeBytes`.

Tipos permitidos:

- `image/jpeg`.
- `image/png`.
- `image/webp`.

Limite actual: 5 MB. Se rechazan SVG, HTML/scripts, MIME no permitidos, rutas arbitrarias y referencias con separadores de ruta. No se descarga desde Meta ni se analiza contenido visual.

## Ubicacion compartida

Cuando llegan coordenadas:

- `source: whatsapp_shared`.
- `resolutionStatus: exact`.
- `confidence: high`.
- `latitude` y `longitude` se conservan.

No se modifican coordenadas exactas por inferencias posteriores.

## Ubicacion escrita

Se conserva:

- Texto original.
- Referencia normalizada.
- Origen.
- Estado de resolucion.
- Confianza.

Sin antecedentes suficientes:

- `source: written_reference`.
- `resolutionStatus: pending`.
- `confidence: unknown` o `low`.
- Sin coordenadas inventadas.

## Normalizacion

La normalizacion es deterministica y solo interna. Maneja mayusculas, acentos, puntuacion, espacios, abreviaturas comunes y orden invertido de cruces. No altera el texto visible original.

## Agrupacion geografica

Se implemento Haversine sin dependencias externas. El radio inicial de agrupacion es 150 metros.

Regla de alta confianza:

- Referencia normalizada coincidente.
- Al menos dos antecedentes con coordenadas.
- Candidatos dentro del radio.
- Sin grupos contradictorios.

Si solo hay un antecedente, si los puntos estan lejos o si hay contradiccion, la ubicacion queda pendiente.

## Descripcion opcional

Despues de completar el reporte, un texto adicional dentro de la ventana breve actualiza `description` y `optionalDescription` del mismo reporte runtime. No crea otro reporte y no modifica automaticamente la ubicacion.

## Categoria pendiente

El reporte expres usa `category: "otro"` por compatibilidad con categorias existentes y agrega `classificationStatus: "pending_classification"`. La interfaz administrativa muestra "Categoria pendiente" para evitar clasificar falsamente el problema.

## Integracion con admin

En cards:

- Origen conversacional.
- Alias corto `Ciudadano anonimo · xxxx`.
- Fotografia referenciada.
- Ubicacion compartida, inferida o pendiente.
- Categoria pendiente cuando aplica.

En detalle:

- Alias anonimo.
- Referencia original.
- Origen de ubicacion.
- Estado de resolucion.
- Confianza.
- Coordenadas cuando existen.
- Cantidad de antecedentes relacionados.
- Evidencia.
- Aviso de privacidad.
- Texto de inferencia o pendiente.

No se muestra numero original, secreto, payload, sesion ni `phoneId` completo.

## Simulador

`npm run simulate:report-intake` ejecuta:

- Escenario A: foto + ubicacion compartida.
- Escenario B: foto + calles escritas.
- Escenario C: antecedentes geolocalizados y nueva referencia escrita inferida.

El simulador usa secreto ficticio, numeros ficticios, fotos ficticias, coordenadas ficticias y limpia sus propios archivos temporales.

## Seguridad

Implementado:

- HMAC-SHA256.
- Secreto desde entorno o inyeccion de prueba.
- Validacion de payload.
- Idempotencia.
- Rate limiting.
- Expiracion de sesiones.
- Limites de tamano.
- Validacion MIME.
- Validacion de coordenadas.
- Limites de texto.
- HTML tratado como texto.
- Runtime ignorado.
- Separacion del proveedor.
- Compatibilidad historica.

No implementado:

- WhatsApp real.
- SDK de Meta.
- Webhook productivo.
- Login.
- Firebase.
- Base de datos externa.
- Analytics.
- Mapas externos.
- Geocodificacion externa.
- IA.
- Deploy publico.

## Pruebas agregadas

Se agregaron pruebas en `tests/domain-contract.test.mjs` para:

- HMAC y secreto.
- Ausencia del numero original en sesiones.
- Aviso `mvp-1`.
- Foto + ubicacion en ambos ordenes.
- Foto + referencia en ambos ordenes.
- Reportes incompletos.
- Descripcion opcional sin duplicar.
- Validacion de MIME, tamano, media id y coordenadas.
- Idempotencia por `messageId`.
- Persistencia y expiracion de sesiones.
- Normalizacion de referencias.
- Haversine y agrupacion.
- Inferencia con antecedentes consistentes.
- Casos pendientes con un solo antecedente o contradiccion.
- Rate limiting.
- Regresiones de TASK-008, TASK-009, `POST /api/reports`, `/admin` y runtime ignorado.

## Resultados reales

Comandos ejecutados:

```bash
npm run lint
npm run build
npm test
npm run simulate:report-intake
git diff --check
git diff --stat
git status --short
git status --ignored --short data/runtime
git diff --name-only -- src/data data/seeds
git diff -- package.json package-lock.json
git check-ignore -v data/runtime/report-intake-sessions.json
ss -ltnp
```

Resultados:

- `npm run lint`: paso, `Project validation passed.`
- `npm run build`: paso, `Build check passed.`
- `npm test`: paso, 68 pruebas, 68 aprobadas, 0 fallidas.
- `npm run simulate:report-intake`: paso, 5 reportes conversacionales creados en entorno temporal, sin conexion real de WhatsApp.
- `git diff --check`: sin salida, sin errores de whitespace.
- `git diff --name-only -- src/data data/seeds`: sin salida; los seeds no cambiaron.
- `git diff -- package.json package-lock.json`: solo agrega `simulate:report-intake`; no hay dependencias nuevas ni `package-lock.json`.
- `git check-ignore -v data/runtime/report-intake-sessions.json`: coincide con `data/runtime/*.json`.
- `ss -ltnp`: no mostro servidor de `calle_habla`; los procesos Node escuchando estaban en `/home/alexglex/legion`.

## Archivos modificados

- `PROJECT_STATE.md`.
- `README.md`.
- `docs/project/architecture-draft.md`.
- `docs/project/data-model-draft.md`.
- `docs/project/mvp-scope.md`.
- `docs/project/privacy-and-data-retention.md`.
- `docs/project/product-principles.md`.
- `docs/project/technical-stack.md`.
- `docs/roadmap/roadmap-mvp.md`.
- `package.json`.
- `scripts/validate-project.mjs`.
- `scripts/simulate-report-intake.mjs`.
- `src/server/admin-page.mjs`.
- `src/server/report-detail-page.mjs`.
- `src/services/report-intake-service.mjs`.
- `src/services/report-service.mjs`.
- `src/services/runtime-report-store.mjs`.
- `src/types/domain.ts`.
- `tests/domain-contract.test.mjs`.
- `docs/audits/task-010-fast-anonymous-report-intake.md`.

## Limitaciones

- No hay conexion real con WhatsApp.
- No hay descarga ni almacenamiento real de imagenes.
- No hay mapa visual.
- La inferencia usa solo antecedentes locales existentes.
- La persistencia JSON no es apta para concurrencia alta.
- `/admin` sigue sin login y debe mantenerse local.

## Requisitos para WhatsApp real

Antes de integrar Meta:

- Elegir proveedor y documentar decision.
- Definir webhook publico controlado.
- Configurar credenciales fuera de Git.
- Configurar `REPORTER_ID_SECRET`.
- Implementar adaptador de payload Meta -> `IncomingCitizenMessage`.
- Descargar, validar y almacenar medios reales.
- Revisar legalmente privacidad y consentimiento.
- Proteger `/admin`.
- Definir retencion y eliminacion de evidencia real.

## Siguiente task recomendada

TASK-011: proteccion local de `/admin` y criterios minimos de acceso antes de exponer administracion fuera de localhost. No debe integrar todavia WhatsApp real, mapas, IA ni deploy.
