# Project State

## Proyecto

Nombre: La Calle Habla

Fecha de arranque: 2026-07-08

Estado: Modelo operativo local con seeds

## Objetivo MVP

Crear una plataforma minima para recibir o simular reportes ciudadanos de problemas urbanos, ordenarlos en una base de datos y permitir revision administrativa basica con estados, categorias, evidencia y ubicacion.

El MVP debe validar el flujo ciudadano y administrativo antes de integrar WhatsApp real, mapas, IA o deploy productivo.

## Estado operativo actual

El proyecto ya expone datos locales de lectura con seeds:

- Categorias.
- Estados.
- Reportes ciudadanos ficticios.
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

TASK 004: crear captura simulada de reportes con escritura local controlada, sin WhatsApp real y sin base de datos externa.

## Riesgos

- Git no esta operativo en el directorio actual.
- No hay framework web ni base de datos definidos.
- TypeScript esta definido como contrato, pero aun no hay compilacion con `tsc`.
- Los datos actuales son seeds en memoria; no hay persistencia real.
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
- Persistencia local o base de datos para reportes creados por usuarios.
