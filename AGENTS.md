# Instrucciones para agentes

## Arranque obligatorio

Antes de iniciar cualquier task en este proyecto, ejecutar:

```bash
node /home/alexglex/alex-legacy-engine/scripts/startup-check.mjs ale
```

Mostrar exactamente:

```text
Context Loaded:
✓ ALE
✓ Handoff
✓ Project State
✓ Recall

Ready.
```

Cuando el tema sea La Calle Habla, ejecutar tambien:

```bash
node /home/alexglex/alex-legacy-engine/scripts/recall.mjs "La Calle Habla"
```

## Reglas de producto

- No inventar alcance politico sensible.
- No prometer que el gobierno resolvera reportes.
- Separar reporte ciudadano de resolucion oficial.
- Mantener lenguaje ciudadano, claro y directo.
- Priorizar movil desde el inicio.
- Evitar burocracia innecesaria.
- Tratar ubicacion, fotos y telefono como datos sensibles.

## Reglas de trabajo

- No copiar modelos de otros proyectos sin adaptar.
- No traer contenido de FoodSPV, Arranca, Legion u otros proyectos como base textual.
- Revisar `PROJECT_STATE.md` y `docs/project/` antes de implementar features.
- Documentar decisiones tecnicas y de producto.
- Cada task debe dejar auditoria en `docs/audits/`.
- Cada task debe terminar con comandos de validacion si aplica.
- No borrar archivos existentes sin instruccion explicita.
- No sobrescribir documentacion previa sin respaldo o razon documentada.
- No versionar datos runtime de ciudadanos o pruebas; `data/runtime/*.json` debe permanecer ignorado por Git.

## Alcance actual

El proyecto tiene Node.js sin dependencias externas, contratos de dominio en TypeScript, endpoints GET y `POST /api/reports` con persistencia local JSON. Antes de implementar WhatsApp real, Firebase, dashboard, mapa, login, IA, deploy, pagos o automatizaciones externas, debe existir una decision documentada de alcance y una auditoria de task.

## Validacion esperada

Cuando aplique, reportar los comandos ejecutados y su resultado real. Los comandos base actuales son:

```bash
npm run lint
npm run build
npm test
```
