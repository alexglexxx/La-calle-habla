# Auditoria TASK 013 — Next.js, territorio y prioridad operativa

Fecha: 2026-10-03

## Alcance implementado

- Next.js 16.3.8 + React 19.2 como capa web.
- App Router para portal publico y dashboard administrativo.
- Portal publico mapa-first con lenguaje visual HUD/videojuego, iconografia por categoria, filtros y detalle publico.
- Dashboard admin separado visualmente, con mapa operativo, filtros, cola y alerta principal.
- Proxy de Next.js para proteger /admin con Basic Auth temporal; localhost puede omitirla salvo ADMIN_AUTH_REQUIRED=true.
- Configuracion de territorio versionable en `src/config/territory.mjs`.
- Motor explicable de prioridad en `src/services/report-priority.mjs`.
- Proyeccion publica que evita exponer telefono, phoneId, notas internas y otros campos sensibles.
- Vercel conserva el webhook Meta existente como ruta especifica y deja que Next.js maneje la experiencia web.

## Decisiones visuales

Portal publico:
- mapa como protagonista;
- territorio delimitado;
- iconos compactos;
- actividad y estados visibles;
- animaciones discretas;
- responsive movil;
- reduced motion.

Admin:
- tono sobrio;
- indicadores KPI;
- cola operativa;
- mapa restringido al territorio;
- una sola alerta principal visible;
- alerta roja con pulso suave;
- razon de prioridad visible.

## Prioridad

El motor combina cantidad relacionada, antiguedad, peso de categoria, concentracion/reincidencia y estado. El resultado incluye score, banda y razones legibles.

La alerta principal no declara una emergencia oficial. Es una señal operativa interna de la plataforma.

## Privacidad

La capa publica recibe una proyeccion reducida. No debe importar directamente reportes privados desde componentes cliente.

## Limitaciones deliberadas

- La frontera territorial visual actual es un contrato/configuracion MVP; aun no usa un GeoJSON municipal autoritativo.
- Los puntos del mapa de esta task son una proyeccion determinista de demostracion; no sustituyen coordenadas reales.
- El proveedor GIS definitivo queda pendiente.
- La identidad administrativa definitiva queda pendiente; Basic Auth continua siendo barrera temporal.
- La persistencia Supabase y Meta real de Task 012 siguen pendientes de activacion.
- No se afirma que build/tests hayan sido ejecutados desde GitHub: el conector de repositorio permite escritura/lectura pero no ejecutar el runtime Node del repositorio.

## Criterio de salida

La Task 013 se considera **implementada en estructura y UI inicial**, pendiente de verificacion de runtime y de sustituir la cartografia de demostracion por el adaptador GIS real antes de produccion.
