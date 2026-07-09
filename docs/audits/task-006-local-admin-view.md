# Auditoria TASK 006: Vista administrativa local minima

Fecha: 2026-07-09

## Objetivo

Crear una vista administrativa local servida por el servidor Node existente para ver reportes, filtrar reportes y crear reportes desde navegador usando los endpoints actuales.

## Que se creo

- Vista HTML local en `src/server/admin-page.mjs`.
- Ruta `GET /admin`.
- Landing `/` actualizada con referencia a `/admin`.
- Filtros en navegador por categoria, estado y prioridad.
- Contadores rapidos:
  - Total de reportes.
  - Nuevos.
  - Validados.
  - Urgentes.
  - Reportes manuales/locales.
- Lista de reportes en cards moviles.
- Formulario local para crear reportes con `POST /api/reports`.
- Pruebas para validar que `/admin` responde HTML y no rompe APIs existentes.

## Ruta disponible

```text
http://127.0.0.1:3001/admin
```

## Como probar en navegador

Levantar servidor:

```bash
PORT=3001 npm run dev
```

Abrir:

```text
http://127.0.0.1:3001/admin
```

Desde la vista:

1. Revisar contadores.
2. Filtrar reportes por categoria, estado o prioridad.
3. Crear un reporte local desde el formulario.
4. Confirmar que aparece en la lista.
5. Confirmar que cambian los contadores.

## Como probar desde celular

La vista no depende de internet, CDN ni assets externos. Para probar desde celular se debe exponer el puerto local de forma segura desde el entorno donde corre Node.

Opciones posibles segun entorno:

- Usar port forwarding local del editor o VM hacia `127.0.0.1:3001`.
- Usar un tunel temporal autorizado por el operador del entorno.

No se configuro tunel en esta task.

## Endpoints consumidos

- `GET /api/categories`
- `GET /api/statuses`
- `GET /api/reports`
- `GET /api/stats`
- `POST /api/reports`

## Decisiones tecnicas

- Sin dependencias externas.
- Sin framework frontend.
- CSS y JavaScript embebidos en HTML servido por Node.
- Filtros aplicados en navegador para evitar ampliar API antes de necesitarlo.
- El formulario usa los mismos contratos y validaciones de `POST /api/reports`.
- La vista muestra aviso explicito: "Vista local de prueba. No es un sistema oficial de gobierno."

## Riesgos

- No hay login ni permisos; la vista es solo local.
- No hay proteccion anti abuso.
- No hay manejo avanzado de errores de red.
- La persistencia sigue siendo JSON local, no base de datos.
- No hay carga real de fotos; `evidenceCount` sigue siendo conteo declarado.

## Que queda pendiente

- Vista de detalle de reporte.
- Edicion de estado administrativo.
- Notas internas.
- Mapa.
- Login o proteccion local si se expone fuera de localhost.
- Pruebas visuales con navegador real.

## Validaciones

- `npm run lint`: paso, `Project validation passed.`
- `npm run build`: paso, `Build check passed.`
- `npm test`: paso, 20 pruebas pasaron.
- `curl -I http://127.0.0.1:3001/admin`: paso, `HTTP/1.1 200 OK` y `content-type: text/html; charset=utf-8`.
- `curl -sS http://127.0.0.1:3001/admin | head -40`: paso, devolvio HTML con titulo local.
- `curl -sS http://127.0.0.1:3001/health`: paso, devolvio `reports: 11` antes de la prueba de creacion de TASK 006.
- `curl -sS http://127.0.0.1:3001/api/reports`: paso, devolvio `count: 11` antes de la prueba de creacion.
- `curl -sS http://127.0.0.1:3001/api/stats`: paso, devolvio `totalReports: 11` antes de la prueba de creacion.
- `POST /api/reports`: paso, creo `report-local-mrd0wtuu-zf504k`.
- `curl -sS http://127.0.0.1:3001/api/reports`: paso, devolvio `count: 12` despues de la creacion.
- `curl -sS http://127.0.0.1:3001/api/stats`: paso, devolvio `totalReports: 12` despues de la creacion.
- `curl -sS 'http://127.0.0.1:3001/api/reports?category=basura'`: paso, devolvio `count: 2`.
- Reinicio del servidor: paso.
- `curl -sS http://127.0.0.1:3001/api/reports` despues del reinicio: paso, devolvio `count: 12`.
- `curl -sS http://127.0.0.1:3001/api/stats` despues del reinicio: paso, devolvio `totalReports: 12`.

No se abrio un navegador grafico desde esta sesion. El flujo del formulario se valido por el mismo endpoint `POST /api/reports` que usa la vista, y el HTML/JS de `/admin` fue validado con tests y curl.
