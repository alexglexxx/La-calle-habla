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

## TASK 004 sugerida: Captura simulada de reportes

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

## TASK 005 sugerida: Vista administrativa inicial

Objetivo:

- Listar reportes.
- Filtrar por estado, categoria y fecha.
- Ver detalle con evidencia y ubicacion.
- Cambiar estado y agregar nota interna.

Validar:

- Que un administrador pueda revisar reportes rapidamente.
- Que los cambios de estado queden claros.
- Que el lenguaje no sugiera resolucion gubernamental automatica.

Impacto:

- Alto. Convierte datos en operacion util.

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
