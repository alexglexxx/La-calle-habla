# Borrador de arquitectura

Este documento describe una arquitectura inicial posible para La Calle Habla. No implementa integraciones reales.

## Componentes principales

## Stack tecnico inicial

La base tecnica actual usa Node.js sin dependencias externas, un servidor HTTP minimo, contratos de dominio en TypeScript y pruebas con `node --test`.

Esta decision esta documentada en `docs/project/technical-stack.md` y puede cambiar en una task futura si el MVP requiere un framework web.

### Canal WhatsApp

WhatsApp sera el canal ciudadano principal. En desarrollo temprano puede simularse con formularios, seeds o endpoints internos antes de conectar una API real.

Responsabilidades futuras:

- Recibir texto, fotos y ubicacion.
- Enviar confirmaciones simples.
- Pedir informacion faltante.

### Webhook/backend

El backend recibira eventos del canal ciudadano o entradas manuales durante el MVP.

Responsabilidades:

- Normalizar mensajes entrantes.
- Crear reportes.
- Asociar evidencia.
- Ejecutar validaciones basicas.
- Exponer datos para dashboard y administracion.

### Base de datos

La base de datos guardara reportes, categorias, estados, ubicaciones y evidencia.

Responsabilidades:

- Mantener historial de reportes.
- Permitir filtros por estado, categoria, fecha y zona.
- Separar datos ciudadanos de notas administrativas.

### Dashboard web

El dashboard sera la herramienta de revision administrativa.

Responsabilidades:

- Listar reportes.
- Filtrar y buscar.
- Ver evidencia y ubicacion.
- Cambiar estado.
- Registrar notas internas.

### Mapa

El mapa debe visualizar reportes por ubicacion cuando exista suficiente informacion geografica.

Responsabilidades futuras:

- Mostrar puntos de reportes.
- Filtrar por categoria y estado.
- Ayudar a detectar concentraciones.

No se debe integrar un proveedor de mapas antes de decidir stack y necesidades reales del MVP.

### Sistema de estados

El sistema de estados debe describir el flujo interno del reporte:

- Recibido.
- En revision.
- Validado.
- Requiere informacion.
- Duplicado.
- Cerrado internamente.

Los estados no deben implicar que una autoridad resolvio el problema.

## Capacidades futuras

### Clasificador IA

Puede ayudar a sugerir categoria, resumen y prioridad. Debe ser asistente, no autoridad final.

### Detector de duplicados

Puede agrupar reportes cercanos por ubicacion, texto, categoria y fecha. En MVP puede resolverse manualmente.

### Generador de reportes estadisticos

Puede producir resumenes por colonia, categoria, periodo y tendencia. Debe basarse en datos trazables.

## Arquitectura sugerida por etapas

### Etapa fundacional

- Documentacion.
- Modelo de datos borrador.
- Estructura base de carpetas.
- Sin integraciones externas.

### MVP tecnico

- App web o backend simple segun stack elegido.
- Registro manual o simulado de reportes.
- Persistencia local o base de datos elegida.
- Dashboard administrativo basico.

### Integracion real

- Webhook de WhatsApp.
- Almacenamiento de evidencia.
- Mapa.
- Deploy controlado.

## Decisiones abiertas

- Framework web definitivo.
- Base de datos.
- Proveedor de WhatsApp.
- Proveedor de mapas.
- Politica de privacidad y retencion de datos.
- Nivel de anonimato permitido.
