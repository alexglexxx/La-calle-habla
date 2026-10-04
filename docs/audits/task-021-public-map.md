# Task 021 — El mapa de La Calle Habla

Estado: implementado y desplegado.

## Objetivo

Separar definitivamente la geografía del estilo visual:

Ciudadano -> mapa vectorial estático -> reportes vivos.

La capa visual puede cambiar por municipio/cliente sin alterar:
- territorio
- coordenadas
- reportes
- prioridades
- datos internos

## Implementado

- Atlas vectorial personalizado en lugar del renderer de tiles OSM.
- Red vial de presentación con corredores y nombres municipales relevantes.
- Zonas y landmarks visuales.
- Reportes ciudadanos como capa dinámica independiente.
- Zoom progresivo 0.85x–3.2x.
- Landmarks más grandes en zoom lejano y más discretos al acercarse.
- Filtros por categoría.
- Un único alerta rojo primario de atención.
- Selector de tema:
  - La Calle Habla
  - Institucional
- Separación de datos/geografía/piel visual.
- Eliminación del estado público de "resolved" proveniente de work orders: el portal vuelve a ser informativo y no promete atención institucional.

## Fuente y licencia

La nomenclatura/corredores viales usados como referencia incluyen vialidades identificadas en documentación municipal de Puerto Vallarta. El adaptador de geometría está preparado para sustituir esta geometría de presentación por un GeoJSON autoritativo sin cambiar el contrato del mapa.

OpenStreetMap sigue siendo una fuente compatible para una futura carga vectorial detallada; sus datos están bajo ODbL y deben mantenerse sus atribuciones/requisitos cuando se incorporen datos OSM derivados.

## Siguiente evolución

El siguiente salto de precisión debe ser reemplazar la geometría de presentación por un dataset vectorial municipal/OSM procesado y versionado, conservando exactamente la misma API de `map-view.mjs`.

No se activa ninguna comunicación con dependencias, orden de trabajo, correo institucional, acuse ni resolución.
