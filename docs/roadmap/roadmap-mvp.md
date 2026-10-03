# Roadmap MVP

## Prioridad general

La prioridad es validar el flujo de reporte y administracion antes de conectar integraciones externas. Primero se debe demostrar que el dato ciudadano puede capturarse, ordenarse y consultarse.

## TASK 002 completada: Stack y esqueleto tecnico

Objetivo:

- Elegir stack inicial.
- Crear app minima si no existe.
- Definir scripts de validacion.
- Crear tipos base para Report, Category, Status, Location y Evidence.

Resultado:

- Stack inicial con Node.js sin dependencias externas.
- Servidor local minimo.
- Contratos de dominio en TypeScript.
- Scripts `dev`, `start`, `lint`, `build` y `test`.
- Auditoria en `docs/audits/task-002-stack-skeleton.md`.

Validar:

- Que el proyecto corre localmente.
- Que lint, build o tests existan cuando aplique.
- Que las decisiones tecnicas queden documentadas.

Impacto:

- Alto. Sin base tecnica clara las siguientes tasks pueden desviarse.

## TASK 003 completada: Modelo de datos y semillas locales

Objetivo:

- Convertir el borrador de datos en tipos o esquema real.
- Crear categorias y estados iniciales.
- Agregar reportes de ejemplo sin integrar WhatsApp real.

Validar:

- Que los datos se puedan consultar.
- Que los estados no prometan resolucion oficial.
- Que las categorias usen lenguaje ciudadano.

Impacto:

- Alto. Permite construir dashboard y flujo con datos concretos.

Resultado:

- Seeds locales de categorias, estados y reportes.
- Servicio interno de reportes.
- Endpoints GET para categorias, estados, reportes y estadisticas.
- Auditoria en `docs/audits/task-003-local-data-model.md`.

## TASK 004 completada: Git baseline y remoto

Resultado:

- Git local inicializado.
- Rama `main`.
- Baseline commit creado.
- Remote GitHub conectado y push inicial realizado.

## TASK 005 completada: POST seguro y persistencia local minima

Objetivo:

- Crear `POST /api/reports`.
- Validar payload ciudadano.
- Persistir reportes locales en JSON ignorado por Git.
- Mantener seeds intactos.
- Reflejar reportes creados en `GET /api/reports` y `GET /api/stats`.

Resultado:

- `POST /api/reports` disponible.
- Persistencia en `data/runtime/reports.json`.
- Store runtime separado de seeds.
- Pruebas de validacion, creacion, filtros, stats y payload grande.
- Auditoria en `docs/audits/task-005-post-local-persistence.md`.

## TASK 006 completada: Captura local o vista administrativa minima

Objetivo:

- Crear un flujo local o formulario interno para simular reportes ciudadanos.
- Capturar descripcion, categoria, ubicacion aproximada y evidencia opcional.
- Guardar reportes con estado inicial.

Validar:

- Que un reporte incompleto pueda recibirse sin romper el sistema.
- Que la administracion distinga recibido de validado.
- Que el flujo sea usable en movil.

Impacto:

- Alto. Valida el comportamiento ciudadano sin depender de WhatsApp real.

Resultado:

- Vista local en `GET /admin`.
- Contadores rapidos.
- Filtros por categoria, estado y prioridad.
- Lista de reportes en cards.
- Formulario funcional conectado a `POST /api/reports`.
- Auditoria en `docs/audits/task-006-local-admin-view.md`.

## TASK 007 completada: Detalle y cambio de estado local

Objetivo:

- Ver detalle de reporte.
- Cambiar estado.
- Guardar el cambio como seguimiento interno local.

Validar:

- Que un administrador pueda revisar reportes rapidamente.
- Que los cambios de estado queden claros.
- Que el lenguaje no sugiera resolucion gubernamental automatica.

Impacto:

- Alto. Convierte datos en operacion util.

Resultado:

- Panel de detalle dentro de `GET /admin`.
- Vista local `GET /admin/report?id=REPORT_ID`.
- Boton de revision desde cards de `/admin`.
- `PATCH /api/reports?id=REPORT_ID` para cambio de estado interno.
- Persistencia de overrides en `data/runtime/report-overrides.json`.
- Auditoria en `docs/audits/task-007-report-detail-status-update.md`.

## TASK 008 completada: Historial local de cambios

Objetivo:

- Conservar historial de cambios de estado y notas por reporte.
- Mostrar una linea de tiempo local.
- Mantener separacion entre reporte ciudadano, validacion interna y resolucion oficial.

Validar:

- Que el historial persiste tras reinicio.
- Que no se modifica el seed original.
- Que la interfaz no comunica resolucion gubernamental.

Resultado:

- `PATCH /api/reports?id=REPORT_ID` registra eventos `status_change` para cambios reales de estado.
- `PATCH /api/reports?id=REPORT_ID` permite `note` para notas internas sin cambiar estado.
- `GET /api/report-history?id=REPORT_ID` devuelve historial cronologico por reporte.
- Historial persistente en `data/runtime/report-history.json`, ignorado por Git.
- Linea de tiempo “Historial interno” en `/admin` y `/admin/report?id=REPORT_ID`.
- Auditoria en `docs/audits/task-008-local-report-history.md`.

## TASK 009 completada: Privacidad y retencion antes de canales reales

Objetivo:

- Definir criterios de privacidad y retencion para datos sensibles antes de integrar WhatsApp real, fotos reales, mapas, login o exponer administracion fuera de local.
- Documentar que datos pueden guardarse, por cuanto tiempo y con que controles minimos.
- Revisar lenguaje de interfaz para mantener separacion entre seguimiento interno y resolucion oficial.

Validar:

- Que ubicacion, evidencia, telefono y notas internas tengan tratamiento documentado.
- Que `/admin` siga siendo local mientras no exista decision de seguridad.
- Que la siguiente implementacion tecnica no avance integraciones externas sin estas decisiones.

Resultado:

- Politica operativa provisional en `docs/project/privacy-and-data-retention.md`.
- Clasificacion de datos por riesgo.
- Version de aviso `mvp-1`.
- `POST /api/reports` exige reconocimiento del aviso para reportes nuevos.
- El servidor genera `privacyAcknowledgedAt`.
- Consentimiento sensible requerido solo para telefono, ubicacion precisa o evidencia.
- Aviso corto y explicacion ampliada dentro de `/admin`.
- Detalle administrativo identifica datos sensibles y registros historicos sin consentimiento versionado.
- Auditoria en `docs/audits/task-009-privacy-consent-retention.md`.

## TASK 010 completada: Reporte expres anonimo con foto y ubicacion

Objetivo:

- Construir el flujo ciudadano central compatible con WhatsApp sin conectar todavia Meta ni un webhook productivo.
- Permitir reportar con foto y ubicacion compartida o referencia escrita, en cualquier orden.
- Mantener anonimato operativo dentro de La Calle Habla mediante `phoneId` pseudonimo con HMAC.
- Agregar sesiones temporales, idempotencia, rate limiting, resolucion local de referencias y simulador reproducible.

Validar:

- Que Foto -> ubicacion -> listo y Foto -> calles -> listo funcionen sin tercer paso obligatorio.
- Que descripcion y categoria no sean obligatorias para el ciudadano.
- Que no se guarde el numero original ni se muestre `phoneId` completo.
- Que los reportes aparezcan en `/admin` con alias anonimo y ubicacion exacta, inferida o pendiente.

Resultado:

- Contrato normalizado `IncomingCitizenMessage` y respuesta `CitizenReply`.
- Servicio `src/services/report-intake-service.mjs` independiente del proveedor.
- Sesiones persistentes en `data/runtime/report-intake-sessions.json`, ignorado por Git.
- `phoneId` generado con HMAC-SHA256 y `REPORTER_ID_SECRET`.
- Idempotencia por `messageId` y rate limiting local por `phoneId`.
- Normalizacion determinista de referencias, Haversine y agrupacion local de antecedentes.
- Simulador `npm run simulate:report-intake`.
- Auditoria en `docs/audits/task-010-fast-anonymous-report-intake.md`.

## TASK 011 completada: Proteccion local de administracion

Objetivo:

- Definir y aplicar criterios minimos de acceso local a `/admin` antes de exponer la administracion fuera de localhost.
- Mantener el alcance sin login productivo complejo hasta que exista decision documentada.
- Reducir riesgo de acceso accidental a reportes runtime, telefono, ubicacion, evidencia, historial y sesiones de ingreso.

Validar:

- Que `/admin` siga claramente identificado como herramienta local.
- Que no se agreguen proveedores externos ni deploy.
- Que cualquier proteccion local sea reversible y documentada para el MVP.

### Resultado

- Se creo src/server/admin-auth.mjs con Basic Auth para administracion.
- /admin, /admin/report, /api/reports, /api/stats y /api/report-history requieren acceso administrativo fuera de localhost.
- Si las credenciales no estan configuradas, el acceso externo se bloquea con error explicito.
- ADMIN_AUTH_REQUIRED=true permite forzar autenticacion tambien en localhost.
- Las credenciales viven solo en variables de entorno; .env.example documenta la configuracion.
- Se agregaron pruebas de localhost, Host publico, credenciales ausentes y credenciales validas.
- No se agregaron proveedores externos, deploy, WhatsApp, mapas ni login productivo.

### Limitaciones conocidas

- Basic Auth es una barrera de MVP, no el sistema de identidad definitivo.
- Para uso por tunel publico debe usarse HTTPS y una contraseña fuerte.
- La administracion sigue pensada para un operador controlado; roles, sesiones, revocacion y auditoria de autenticacion quedan para una fase posterior.

## Fase posterior

Despues de las primeras tasks, considerar:

- Mapa basico de reportes.
- Webhook real de WhatsApp.
- Almacenamiento real de imagenes.
- Deteccion manual de duplicados.
- Exportes y estadisticas.
- Login administrativo.

## Criterios antes de integraciones externas

No integrar WhatsApp, mapas, IA o deploy hasta validar:

- Modelo de datos estable para reportes.
- Flujo administrativo minimo.
- Politica basica de privacidad.
- Estados claros y no oficiales.
- Scripts de validacion reproducibles.
