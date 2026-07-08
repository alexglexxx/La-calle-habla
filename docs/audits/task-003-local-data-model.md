# Auditoria TASK 003: Modelo operativo local y seeds

Fecha: 2026-07-08

## Objetivo

Convertir el modelo de datos en una estructura operativa local con seeds, servicios internos y endpoints GET para validar el flujo basico de reportes ciudadanos sin base de datos, WhatsApp real ni dashboard.

## Que se creo

- Seeds de categorias en `src/data/seed-categories.mjs`.
- Seeds de estados en `src/data/seed-statuses.mjs`.
- Seeds de reportes urbanos en `src/data/seed-reports.mjs`.
- Servicio local de reportes en `src/services/report-service.mjs`.
- Rutas HTTP en `src/server/routes.mjs`.
- Tipo operativo `LocalSeedReport` en `src/types/domain.ts`.
- Pruebas para seeds, servicio, estadisticas y rutas.

## Endpoints disponibles

- `GET /health`
- `GET /api/categories`
- `GET /api/statuses`
- `GET /api/reports`
- `GET /api/reports?id=REPORT_ID`
- `GET /api/reports?category=CATEGORIA`
- `GET /api/reports?status=STATUS`
- `GET /api/stats`

## Decisiones tecnicas

- No se agregaron dependencias externas.
- No se agrego base de datos.
- No se implemento `POST`.
- Los datos seed viven en archivos `.mjs` para poder ejecutarse con Node.js directamente.
- Los filtros aceptan slug, id o nombre cuando aplica.
- El servidor se separo en `routes.mjs` para probar endpoints sin abrir sockets durante `npm test`.
- Los reportes usan datos ficticios y alias ciudadanos, sin datos personales reales.

## Datos seed

Se agregaron 10 reportes creibles para contexto urbano de Puerto Vallarta:

- Bache peligroso.
- Lampara publica fundida.
- Basura acumulada.
- Fuga de agua.
- Banqueta rota.
- Arbol obstruyendo paso.
- Ruido excesivo.
- Semaforo fallando.
- Zona insegura.
- Alcantarilla destapada.

## Como probar manualmente

Levantar servidor:

```bash
PORT=3001 npm run dev
```

Probar endpoints:

```bash
curl -sS http://127.0.0.1:3001/health
curl -sS http://127.0.0.1:3001/api/categories
curl -sS http://127.0.0.1:3001/api/statuses
curl -sS http://127.0.0.1:3001/api/reports
curl -sS 'http://127.0.0.1:3001/api/reports?id=report-pv-004'
curl -sS 'http://127.0.0.1:3001/api/reports?category=bache'
curl -sS 'http://127.0.0.1:3001/api/reports?status=validated'
curl -sS http://127.0.0.1:3001/api/stats
```

## Validaciones ejecutadas

- `npm run lint`: paso, `Project validation passed.`
- `npm run build`: paso, `Build check passed.`
- `npm test`: paso, 10 pruebas pasaron.
- `PORT=3001 npm run dev`: paso con servidor en `http://127.0.0.1:3001`.
- `curl -sS http://127.0.0.1:3001/health`: paso, devolvio 13 categorias, 6 estados y 10 reportes.
- `curl -sS http://127.0.0.1:3001/api/categories`: paso, devolvio 13 categorias.
- `curl -sS http://127.0.0.1:3001/api/statuses`: paso, devolvio 6 estados.
- `curl -sS http://127.0.0.1:3001/api/reports`: paso, devolvio 10 reportes.
- `curl -sS http://127.0.0.1:3001/api/stats`: paso, devolvio `totalReports: 10`.
- `curl -sS 'http://127.0.0.1:3001/api/reports?id=report-pv-004'`: paso, devolvio reporte de fuga de agua.
- `curl -sS 'http://127.0.0.1:3001/api/reports?category=bache'`: paso, devolvio 1 reporte.
- `curl -sS 'http://127.0.0.1:3001/api/reports?status=validated'`: paso, devolvio 4 reportes.

## Que queda pendiente

- Base de datos real.
- Captura simulada de reportes con escritura.
- Dashboard administrativo.
- Mapa.
- WhatsApp real.
- Politica de privacidad.
- Git operativo.

## Estado de Git

`git status --short` sigue fallando porque el directorio no es un repositorio Git valido:

```text
fatal: not a git repository (or any of the parent directories): .git
```

Comando seguro sugerido si este directorio es confirmado como raiz del proyecto:

```bash
git init
```
