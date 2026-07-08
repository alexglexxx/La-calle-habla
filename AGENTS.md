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

## Alcance actual

El proyecto tiene un esqueleto tecnico inicial con Node.js sin dependencias externas y contratos de dominio en TypeScript. Antes de implementar WhatsApp real, Firebase, dashboard, mapa, login, IA, deploy, pagos o automatizaciones externas, debe existir una decision documentada de alcance y una auditoria de task.

## Validacion esperada

Cuando aplique, reportar los comandos ejecutados y su resultado real. Los comandos base actuales son:

```bash
npm run lint
npm run build
npm test
```
