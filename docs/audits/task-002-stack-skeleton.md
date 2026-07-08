# Auditoria TASK 002: Stack y esqueleto tecnico

Fecha: 2026-07-08

## Objetivo

Elegir stack inicial, crear app minima ejecutable, definir scripts de validacion y agregar tipos base del dominio.

## Estado encontrado

- El proyecto tenia documentacion fundacional.
- No existia `package.json`.
- No habia stack tecnico definido.
- Git seguia sin funcionar como repositorio valido en este directorio.

## Archivos creados

- `package.json`
- `.gitignore`
- `tsconfig.json`
- `src/types/domain.ts`
- `src/lib/domain-constants.mjs`
- `src/server/index.mjs`
- `scripts/validate-project.mjs`
- `scripts/build-check.mjs`
- `tests/domain-contract.test.mjs`
- `docs/project/technical-stack.md`
- `docs/audits/task-002-stack-skeleton.md`

## Archivos modificados

- `README.md`
- `PROJECT_STATE.md`
- `AGENTS.md`
- `docs/project/architecture-draft.md`
- `docs/roadmap/roadmap-mvp.md`

## Decisiones tomadas

- Stack inicial: Node.js sin dependencias externas.
- TypeScript queda como contrato de dominio en `src/types/domain.ts`.
- Las pruebas usan `node --test`.
- `npm run lint` ejecuta una validacion estructural propia.
- `npm run build` ejecuta un chequeo de runtime y constantes base.
- No se agregaron dependencias ni framework.
- El servidor escucha en `127.0.0.1` por defecto para desarrollo local.

## Riesgos

- No hay compilacion real de TypeScript porque no se instalo `typescript`.
- El servidor es solo un esqueleto tecnico, no un MVP funcional.
- La base de datos sigue pendiente.
- Git no esta operativo.

## Validaciones ejecutadas

- `npm run lint`: paso.
- `npm run build`: paso.
- `npm test`: paso, 2 pruebas pasaron.
- `PORT=3001 npm run dev`: paso con permiso fuera del sandbox.
- `curl -sS http://127.0.0.1:3001/health`: paso y devolvio `ok: true`, 9 categorias y 6 estados.

Notas:

- `npm run dev` fallo primero en puerto 3000 porque el puerto estaba ocupado.
- `npm run dev` tambien fallo dentro del sandbox en 3001 por `EPERM`; se valido con permiso escalado.

## Recomendaciones

- TASK 003 debe convertir los contratos en modelo operativo y seeds locales.
- Si se decide instalar TypeScript real, hacerlo en una task explicita con validacion de compilacion.
- Corregir o inicializar Git antes de trabajo colaborativo intensivo.
