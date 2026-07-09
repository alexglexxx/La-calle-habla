# Project State

## Proyecto

Nombre: La Calle Habla

Fecha de arranque: 2026-07-08

Estado: POST local con persistencia minima

## Objetivo MVP

Crear una plataforma minima para recibir o simular reportes ciudadanos de problemas urbanos, ordenarlos en una base de datos y permitir revision administrativa basica con estados, categorias, evidencia y ubicacion.

El MVP debe validar el flujo ciudadano y administrativo antes de integrar WhatsApp real, mapas, IA o deploy productivo.

## Estado operativo actual

El proyecto ya expone datos locales de lectura con seeds y permite crear reportes locales por POST:

- Categorias.
- Estados.
- Reportes ciudadanos ficticios.
- Reportes locales creados en desarrollo.
- Estadisticas basicas.

Endpoints disponibles:

- `GET /health`
- `GET /api/categories`
- `GET /api/statuses`
- `GET /api/reports`
- `GET /api/reports?id=REPORT_ID`
- `GET /api/reports?category=CATEGORIA`
- `GET /api/reports?status=STATUS`
- `GET /api/stats`
- `POST /api/reports`

Los reportes creados por POST se guardan en `data/runtime/reports.json`, ignorado por Git.

## Stack inicial

Decision actual:

- Node.js 20 o superior.
- Servidor HTTP nativo de Node para correr localmente.
- TypeScript como contrato de tipos de dominio.
- Pruebas con `node --test`.
- Scripts propios para validacion estructural y build check.
- Sin dependencias externas todavia.

La decision esta documentada en `docs/project/technical-stack.md`.

## Proxima task recomendada

TASK 006: crear una experiencia minima de captura o vista administrativa local sobre los endpoints existentes, sin WhatsApp real.

## Riesgos

- No hay framework web ni base de datos definidos.
- TypeScript esta definido como contrato, pero aun no hay compilacion con `tsc`.
- La persistencia local en JSON no es apta para concurrencia alta.
- WhatsApp real puede agregar friccion legal, tecnica y de costos si se integra demasiado pronto.
- Ubicacion, fotos y telefono pueden ser datos sensibles.
- El producto puede malinterpretarse como sistema oficial de gobierno si el lenguaje no es cuidadoso.

## Decisiones abiertas

- Base de datos.
- Framework web, si el MVP lo requiere.
- Proveedor de WhatsApp.
- Proveedor de mapas.
- Politica de privacidad.
- Criterios de anonimato.
- Definicion exacta de roles administrativos.
- Si el MVP continuara con JSON local o migrara a base de datos.
