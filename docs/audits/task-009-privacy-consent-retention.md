# Auditoria TASK 009: Privacidad, consentimiento y retencion local de datos

Fecha: 2026-07-12

## Objetivo

Crear la primera politica operativa provisional de privacidad, consentimiento y retencion local de datos para La Calle Habla, aplicando avisos claros en el flujo de captura y señales de datos sensibles en administracion.

Esta implementacion no se presenta como cumplimiento legal definitivo. Es una base operativa del MVP que requiere revision legal antes de operar con datos ciudadanos reales o produccion.

## Diagnostico inicial

Antes de esta task el proyecto tenia:

- Reportes seed ficticios.
- Creacion local de reportes por `POST /api/reports`.
- Persistencia runtime JSON ignorada por Git.
- Panel local `/admin`.
- Detalle local `/admin/report?id=REPORT_ID`.
- Cambios de estado internos.
- Notas internas e historial persistente por reporte.
- 43 pruebas al cierre de TASK 008.

No tenia:

- Politica formal de privacidad o retencion.
- Aviso visible antes de enviar reportes.
- Reconocimiento versionado del aviso.
- Consentimiento explicito para datos opcionales sensibles.
- Identificacion administrativa de datos sensibles.

## Decisiones tomadas

- Crear `docs/project/privacy-and-data-retention.md` como politica operativa provisional del MVP.
- Usar version estable `mvp-1` para el aviso operativo.
- Centralizar la version en `src/services/report-service.mjs` como `PRIVACY_NOTICE_VERSION`.
- Exigir `privacyAcknowledged: true` y `privacyNoticeVersion: "mvp-1"` para reportes nuevos.
- Generar `privacyAcknowledgedAt` del lado servidor.
- Exigir `sensitiveDataConsent: true` solo cuando el reporte incluya telefono, ubicacion precisa o evidencia.
- Mantener compatibilidad con seeds y reportes runtime historicos sin campos de privacidad.
- No implementar borrado automatico, login, analytics, proveedores externos ni deploy.

## Clasificacion de datos

La politica documenta cuatro grupos:

- Bajo riesgo: categoria, descripcion general sin datos personales, estado interno, fechas generales y prioridad interna.
- Personales o sensibles: telefono, ubicacion precisa, fotografias con personas/placas/domicilios/rostros, nombres en descripcion, informacion de contacto y notas internas con datos personales.
- Tecnicos: ID de reporte, ID de eventos, timestamps, version del aviso, indicadores de consentimiento y origen tecnico.
- Prohibidos o innecesarios: contrasenas, datos bancarios, identificaciones oficiales, CURP, RFC, informacion medica, datos biometricos, informacion de menores, credenciales y documentos oficiales completos.

## Version del aviso

```text
mvp-1
```

La interfaz usa esta version al crear reportes y el servidor la valida antes de persistir.

## Contrato agregado al reporte

Reportes runtime nuevos pueden incluir:

- `contactPhone`
- `locationPrecision`
- `privacyNoticeVersion`
- `privacyAcknowledged`
- `privacyAcknowledgedAt`
- `sensitiveDataConsent`
- `containsSensitiveOptionalData`

`privacyAcknowledgedAt`, `id`, `status`, `createdAt` y `updatedAt` son generados o controlados por servidor.

## Reglas de consentimiento

- `privacyAcknowledged` debe ser `true`.
- `privacyNoticeVersion` debe ser `mvp-1`.
- `privacyAcknowledgedAt` se ignora si viene del cliente y se reemplaza por la hora del servidor.
- `sensitiveDataConsent` se exige solo si hay `contactPhone`, `locationPrecision: "precise"` o `evidenceCount > 0`.
- Las casillas del formulario no estan premarcadas.
- No hay consentimiento de marketing.

## Compatibilidad con seeds y reportes historicos

- No se modificaron seeds.
- Los reportes seed siguen sin campos de consentimiento versionado.
- Los reportes runtime historicos sin privacidad siguen siendo legibles.
- La interfaz muestra “Registro histórico sin consentimiento versionado” en lugar de marcar esos registros como invalidos.

## Minimizacion aplicada

- Telefono sigue siendo opcional.
- Ubicacion precisa sigue siendo opcional.
- Evidencia sigue siendo opcional.
- La ubicacion aproximada puede ser suficiente.
- No se piden nombres completos ni identificaciones.
- Las cards generales no muestran telefono completo.
- Las cards generales no exponen ubicacion precisa; reservan el detalle para revision necesaria.
- Las notas internas no duplican automaticamente descripcion, telefono, ubicacion ni evidencia.

## Cambios en la interfaz

En `/admin`:

- Aviso corto visible antes del envio.
- Explicacion ampliada local con `details`.
- Casilla de reconocimiento del aviso.
- Casilla de consentimiento para datos opcionales sensibles.
- Campos opcionales marcados como tales.
- Campo de telefono opcional sensible.
- Selector de precision de ubicacion.
- Mensajes de validacion cercanos al aviso.
- Prevencion de doble envio.
- Minimizacion visual en cards.

En `/admin` y `/admin/report?id=REPORT_ID`:

- Datos sensibles identificados con etiqueta textual.
- Version del aviso y fecha de reconocimiento en detalle.
- Estado historico cuando no hay consentimiento versionado.
- Advertencia administrativa: “Consulta únicamente los datos necesarios para revisar el reporte. No copies información personal a notas internas.”

## Estrategia provisional de retencion

Documentada en `docs/project/privacy-and-data-retention.md`:

- No hay borrado automatico en esta task.
- No se borran datos existentes.
- Reportes seed son ficticios y versionados.
- Reportes runtime son datos locales de prueba.
- Se recomienda revisar runtime al cierre de ciclos de prueba.
- Se recomienda no conservar datos sensibles de prueba mas de 30 dias salvo razon documentada.
- Cualquier eliminacion futura debe considerar reportes, overrides e historial relacionados.
- No se deben borrar seeds ni codigo fuente.

## Seguridad

- No se agregaron dependencias.
- No se agregaron proveedores externos.
- No se agregaron cookies, analytics, IP logging ni fingerprinting.
- No se exponen archivos `data/runtime` como estaticos.
- La interfaz escapa contenido antes de pintar.
- El backend valida payloads y rechaza estructuras inesperadas en creacion local.
- `/admin` sigue siendo local y sin login.

## Pruebas agregadas

Se agregaron o actualizaron pruebas para:

- Aviso corto en formulario.
- Identificacion de campos opcionales.
- Casillas no premarcadas.
- Rechazo sin reconocimiento del aviso.
- Rechazo de version invalida.
- Timestamp de reconocimiento generado por servidor.
- No confiar en timestamp enviado por cliente.
- Consentimiento sensible solo cuando hay telefono, ubicacion precisa o evidencia.
- Campos sensibles opcionales.
- Seeds funcionando sin cambios.
- Reportes historicos sin version.
- Reportes nuevos con version y reconocimiento.
- Historial TASK 008 sin regresion.
- Notas internas sin copia automatica de datos personales.
- Cards sin telefono completo.
- Detalle con estado de privacidad.
- HTML escapado en interfaz.
- Endpoints existentes.
- Runtime ignorado.
- Interfaz no gubernamental y sin promesa de resolucion.
- Explicacion ampliada accesible.
- Validaciones estructurales mobile-first sin overflow horizontal evidente.
- Sin dependencias externas.

## Resultados reales

Ejecutado durante implementacion:

- `node /home/alexglex/alex-legacy-engine/scripts/startup-check.mjs ale`: paso.
- `node /home/alexglex/alex-legacy-engine/scripts/recall.mjs "La Calle Habla"`: paso, sin resultados.
- `git status --short` inicial: sin cambios.
- `git log --oneline -5`: ultimo commit inicial `ca81765 feat: add local report history and internal notes`.
- `npm test`: paso, 51 pruebas, 51 pass, 0 fail.

Validaciones finales se registran al cierre de la task.

Validacion final:

- `npm run lint`: paso, `Project validation passed.`
- `npm run build`: paso, `Build check passed.`
- `npm test`: paso, 51 pruebas, 51 pass, 0 fail.
- `git diff --check`: paso, sin salida.
- `git diff --stat`: 12 archivos modificados en el stat y 2 archivos nuevos no incluidos por ser untracked.
- `git status --short`: muestra cambios esperados de TASK 009 y dos archivos nuevos.
- `git status --ignored --short data/runtime`: muestra runtime existente ignorado (`report-overrides.json`, `report-updates.json`, `reports.json`).
- `git diff --name-only -- src/data data/seeds`: sin salida; seeds intactos.
- `git diff -- package.json`: sin salida; no se agregaron dependencias.
- `git check-ignore -v data/runtime/report-history.json`: confirma `.gitignore:8:data/runtime/*.json`.
- `ss -ltnp`: mostro procesos Node existentes en puertos `4184`, `4173` y `4174`.
- `readlink -f /proc/.../cwd`: los tres procesos Node pertenecen a `/home/alexglex/legion`, no a este repositorio.

## Archivos modificados

- `src/services/report-service.mjs`
- `src/server/admin-page.mjs`
- `src/server/report-detail-page.mjs`
- `src/types/domain.ts`
- `tests/domain-contract.test.mjs`
- `PROJECT_STATE.md`
- `README.md`
- `docs/roadmap/roadmap-mvp.md`
- `docs/project/data-model-draft.md`
- `docs/project/technical-stack.md`
- `docs/project/mvp-scope.md`
- `docs/project/product-principles.md`

## Archivos creados

- `docs/project/privacy-and-data-retention.md`
- `docs/audits/task-009-privacy-consent-retention.md`

## Limitaciones

- No hay aviso legal definitivo.
- No hay login ni control de acceso real en `/admin`.
- No hay borrado automatico ni herramienta de eliminacion selectiva.
- Persistencia JSON local no es adecuada para produccion.
- El MVP no puede ejercer procedimientos legales de derechos de datos hasta que exista definicion legal y operativa.

## Riesgos

- Si `/admin` se expone fuera de localhost, datos sensibles runtime podrian quedar accesibles.
- Las personas pueden escribir datos prohibidos dentro de texto libre pese a la advertencia.
- Las notas internas pueden contener datos personales si el operador las copia manualmente.
- El almacenamiento local depende de la seguridad del equipo donde corre el MVP.

## Pendientes legales

- Revision legal antes de datos reales.
- Aviso de privacidad definitivo.
- Responsable legal, domicilio y contacto si aplica.
- Procedimientos de acceso, correccion, eliminacion y oposicion cuando correspondan.
- Politica legal de retencion.
- Seguridad y acceso administrativo antes de produccion.

## Siguiente task recomendada

TASK 010: proteccion local de `/admin` y criterios de acceso antes de exponer administracion fuera de localhost, sin agregar integraciones externas ni deploy.
