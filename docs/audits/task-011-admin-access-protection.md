# TASK-011 - Proteccion local de administracion

Fecha: 2026-10-03

## Objetivo

Reducir el riesgo de exponer accidentalmente el panel administrativo y las APIs que contienen o modifican reportes antes de cualquier tunel publico o deploy.

## Decision

Se eligio una barrera deliberadamente simple para el MVP:

- Desarrollo local en localhost: acceso sin login para conservar el flujo rapido.
- Host no-loopback: Basic Auth obligatoria.
- Puede forzarse Basic Auth tambien en localhost con `ADMIN_AUTH_REQUIRED=true`.
- Sin credenciales configuradas, el acceso administrativo externo se bloquea en lugar de degradar a acceso abierto.
- Las credenciales se leen exclusivamente desde variables de entorno.

## Superficie protegida

Quedan protegidos:

- `/admin`
- `/admin/*`
- `/api/reports`
- `/api/stats`
- `/api/report-history`

Quedan publicos los endpoints no administrativos como:

- `/health`
- `/api/categories`
- `/api/statuses`

La razon es que categorias y estados no exponen reportes ciudadanos, mientras que reportes, estadisticas, historial y operaciones de administracion si pueden contener datos que deben quedar bajo control.

## Comportamiento

1. La peticion identifica si la ruta es administrativa.
2. Si llega desde localhost y no se fuerza autenticacion, continua.
3. Si llega con un Host publico/no-loopback, exige Basic Auth.
4. Si faltan `ADMIN_USERNAME` o `ADMIN_PASSWORD`, devuelve `503 admin_auth_not_configured`.
5. Si hay credenciales configuradas pero no son validas, devuelve `401 admin_auth_required` con el desafio Basic Auth.
6. La comparacion de credenciales usa comparacion de tiempo constante cuando las longitudes coinciden.
7. El password nunca se escribe en el repositorio.

## Archivos

- `src/server/admin-auth.mjs`: politica y validacion de acceso.
- `src/server/routes.mjs`: aplica la barrera a las rutas administrativas.
- `tests/domain-contract.test.mjs`: pruebas de localhost, Host publico, credenciales ausentes y credenciales validas.
- `.env.example`: variables necesarias y advertencias.
- `README.md`: instrucciones operativas.
- `PROJECT_STATE.md`: estado actualizado.
- `docs/roadmap/roadmap-mvp.md`: TASK-011 marcada como completada.

## Seguridad y limites

Basic Auth no es identidad productiva. Para cualquier acceso fuera de localhost debe existir HTTPS; nunca se debe enviar una contraseña por una conexion HTTP publica.

Esta task no implementa:

- login con proveedor externo;
- sesiones;
- roles;
- revocacion de sesiones;
- MFA;
- almacenamiento de usuarios;
- WhatsApp/Meta;
- base de datos productiva;
- almacenamiento de imagenes;
- deploy publico.

## Verificacion

Se agregaron pruebas automatizadas al contrato de dominio para verificar:

- clasificacion correcta de rutas administrativas;
- acceso local por defecto;
- bloqueo de Host publico sin credenciales;
- respuesta explicita cuando faltan credenciales;
- rechazo de credenciales ausentes;
- acceso exitoso con Basic Auth valida.

La ejecucion final de `npm test`, `npm run lint` y `npm run build` debe hacerse en el runtime local del repositorio despues de estos commits; no se presenta aqui como ejecutada si no existe un runner disponible para este repositorio.

## Criterio de cierre

TASK-011 queda implementada: la administracion ya no queda accidentalmente abierta cuando el servidor recibe peticiones con un Host no-loopback. La siguiente task puede ocuparse de la frontera de persistencia productiva y del adaptador de WhatsApp sin mezclar esas responsabilidades con el control de acceso administrativo.
