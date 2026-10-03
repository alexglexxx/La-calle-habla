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


## TASK 012 completada: persistencia productiva y frontera WhatsApp/Meta

Objetivo:
- Definir Supabase como persistencia productiva.
- Preparar Storage privado para fotografías.
- Crear la frontera Meta -> IncomingCitizenMessage.
- Preparar compatibilidad con Vercel sin convertir el proyecto a Next.js.
- Usar FoodSPV 2.0 solamente como referencia del webhook, sin modificarlo.

Resultado:
- Migración Supabase en `supabase/migrations/20261003_task_012_initial.sql`.
- Bucket privado `report-evidence`, límite 5 MB y MIME de imágenes permitido.
- Unicidad para `processed_messages.message_id` y `reports.source_message_id`.
- Parser propio de Meta en `src/integrations/whatsapp/meta-webhook.mjs`.
- Descarga de media preparada en `src/integrations/whatsapp/meta-media.mjs`.
- Envío de texto preparado en `src/integrations/whatsapp/meta-sender.mjs`.
- Cliente REST server-side para Supabase.
- Función Vercel en `api/index.mjs`.
- Auditoría completa en `docs/audits/task-012-production-persistence-and-whatsapp-boundary.md`.

Pendiente para la siguiente activación:
- Seleccionar/crear el proyecto Supabase de La Calle Habla.
- Aplicar la migración y ejecutar query de prueba + advisors.
- Conectar el store de reportes/sesiones a Supabase.
- Probar media real y hash.
- Configurar credenciales Meta.
- Desplegar a Vercel y validar webhook end-to-end.


## TASK 013 implementada: plataforma web Next.js + territorio delimitado + prioridad operativa

Objetivo:

Construir la nueva experiencia web de La Calle Habla sobre Next.js, separando claramente dos superficies sobre el mismo dominio:

1. Portal publico: mapa urbano visual, exploratorio y con lenguaje visual inspirado en interfaces de videojuegos de mapa/HUD, sin convertirlo en un juego.
2. Dashboard administrativo: centro de operaciones serio, profesional y accionable para revisar, priorizar y dar seguimiento a reportes.

La experiencia completa debe trabajar sobre un territorio configurable y delimitado. La instalacion inicial se modelara para Puerto Vallarta, pero la arquitectura debe permitir cambiar municipio/zona sin reconstruir la aplicacion.

Principios de producto:

- El mapa es el protagonista del portal publico.
- El publico entra directamente al territorio configurado; no se presenta la Republica completa como mapa operativo.
- Fuera del territorio habilitado no se muestran reportes ni controles operativos.
- El limite geografico debe existir tanto en la UI como en reglas de backend; no depender solamente del recorte visual.
- Los iconos de categorias seran propios y consistentes: baches, alumbrado, basura, fugas, senalizacion, banquetas, areas verdes y otras categorias configurables.
- El lenguaje visual publico puede usar mapa estilizado, HUD, POI, agrupacion, animaciones discretas y estados visuales, manteniendo accesibilidad y credibilidad institucional.
- El dashboard admin reutiliza el mismo mapa y territorio, pero con una interfaz sobria y profesional.
- No convertir toda la interfaz en un videojuego: la metafora sirve para orientar y visualizar, no para trivializar problemas ciudadanos.

Territorio:

- Crear configuracion de municipio/zona con limites geograficos versionables.
- Definir geofence para validar reportes y consultas operativas.
- Definir comportamiento de zoom/pan para mantener al usuario dentro del territorio configurado.
- Preparar soporte futuro para colonias, zonas y otras divisiones administrativas.
- No hardcodear Puerto Vallarta en componentes de UI o logica de negocio; debe ser configuracion.

Portal publico:

- Ruta publica principal en Next.js.
- Mapa como elemento central.
- Agrupacion de reportes al alejar zoom y puntos individuales al acercar.
- Filtros simples por categoria/estado/periodo.
- Detalle publico de reporte sin telefono, phoneId, notas internas ni datos sensibles.
- Estadisticas publicas agregadas.
- Iconografia propia y leyenda clara.
- Responsive desde movil.
- Animaciones ligeras y respetuosas con prefers-reduced-motion.

Dashboard administrativo:

- Acceso protegido; no reutilizar Basic Auth como identidad productiva definitiva.
- Mapa operativo restringido al territorio asignado.
- Filtros por estado, categoria, antiguedad, zona, prioridad y responsable/dependencia cuando exista.
- Detalle completo para operador autorizado.
- Cambio de estado, asignacion, notas internas, evidencia e historial.
- Contadores y tendencias utiles, evitando graficas decorativas.
- Roles preparados para superadmin, operador y futura dependencia.
- Acciones destructivas o de cierre con confirmacion explicita.

Motor de prioridad/alerta:

Definir un modelo de prioridad explicable y auditable. No debe existir una "urgencia magica" sin explicar sus causas.

Factores iniciales candidatos:

- cantidad de reportes relacionados;
- antiguedad del reporte mas antiguo y antiguedad acumulada;
- reincidencia/concentracion geografica;
- categoria o severidad configurable;
- tendencia reciente.

El sistema debe producir razones legibles, por ejemplo: "37 reportes en 9 dias en esta zona".

La UI admin debe mostrar como maximo una alerta principal prominente a la vez: el principal punto de atencion segun el modelo vigente. Las demas prioridades permanecen accesibles en la cola.

La alerta principal:

- aparece como popup/panel rojo de alta visibilidad cuando corresponda;
- usa animacion de pulso suave grande -> pequena -> grande, no parpadeo agresivo;
- explica por que fue elevada;
- permite "Ver reportes" y enfocar el mapa en la zona;
- no declara emergencia oficial ni atribuye una obligacion a una dependencia;
- puede desaparecer temporalmente sin alterar la prioridad de los datos.

Arquitectura web:

- Next.js como framework de la experiencia web.
- Mantener el core de dominio e ingreso ciudadano independiente de la UI.
- Reutilizar contratos y servicios del dominio en lugar de duplicar reglas dentro de componentes.
- Preparar adaptadores para mapa y almacenamiento sin acoplar el dominio a un proveedor.
- La capa web no debe exponer service-role keys, phoneId, notas internas ni evidencia privada.
- El mapa publico y el admin consumiran datos mediante fronteras de lectura apropiadas.

Migracion:

- No destruir el servidor actual ni el flujo de WhatsApp/Meta preparado en Task 012.
- Migrar primero la experiencia web y los contratos necesarios.
- Mantener endpoints/compatibilidad durante la transicion cuando sea razonable.
- La persistencia productiva Supabase y la activacion real de Meta siguen siendo prerequisitos de produccion y se integraran sin contaminar la capa visual.
- FoodSPV 2.0 permanece estrictamente como referencia y no se modifica.

Validacion:

- Build y tests del proyecto.
- Verificacion visual en movil.
- Verificacion de que el mapa no navega fuera del territorio operativo.
- Verificacion de que reportes fuera de geofence no entren como reportes validos.
- Verificacion de que datos sensibles no aparecen en portal publico.
- Verificacion del agrupamiento y filtros del mapa.
- Verificacion del calculo de prioridad con casos reproducibles.
- Verificacion de que solo una alerta principal puede ocupar el foco visual.
- Verificacion de prefers-reduced-motion.
- Auditoria en docs/audits/task-013-next-territory-priority.md.

No incluido en Task 013:

- IA para decidir prioridades.
- Automatizacion de acciones gubernamentales.
- Prediccion de incidentes.
- Cobertura nacional.
- Multi-tenant completo de produccion.
- Login productivo definitivo si la decision de proveedor todavia no esta cerrada.
- Modificacion alguna de FoodSPV 2.0.

Impacto:

- Alto. Esta task define la identidad visual y operativa de producto que servira como base para la futura demostracion y venta institucional, sin sacrificar el motor de ingreso ciudadano ni la seguridad de datos.

## TASK 014 implementada: geofence operativo y datos geográficos seguros

Objetivo:

Convertir el territorio de TASK 013 en una regla real del dominio, evitando que el límite exista solamente como decoración de la interfaz.

Resultado:

- El contrato territorial usa bounds + point-in-polygon.
- `validateTerritoryLocation()` devuelve códigos explícitos para coordenadas inválidas y puntos fuera de zona.
- WhatsApp/ingreso ciudadano rechaza ubicaciones compartidas fuera del territorio habilitado.
- La resolución de referencias escritas ignora antecedentes geográficos fuera del territorio.
- Se agregaron pruebas automatizadas de frontera y flujo de ingreso.
- `npm run build` incorpora el check estructural de TASK 014.

No incluido:

- GeoJSON municipal autoritativo.
- Proveedor GIS definitivo.
- Geocodificación externa.
- Persistencia Supabase activa.

Siguiente paso natural: TASK 015 — adaptador GIS real y mapa con coordenadas reales, manteniendo el territorio como contrato independiente del proveedor.
