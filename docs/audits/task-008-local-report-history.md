# Auditoria TASK 008: Historial local de cambios y notas internas

Fecha: 2026-07-12

## Objetivo

Agregar historial local persistente por reporte para cambios de estado interno y notas internas, sin modificar seeds, sin usuarios reales, sin login, sin integraciones externas y sin comunicar resolucion oficial.

## Alcance implementado

- Historial local persistente por reporte.
- Eventos `status_change` para cambios reales de estado interno.
- Eventos `internal_note` para notas internas sin cambio de estado.
- Endpoint de consulta `GET /api/report-history?id=REPORT_ID`.
- Extension de `PATCH /api/reports?id=REPORT_ID` para aceptar `status`, `note` o ambos.
- Linea de tiempo “Historial interno” en `/admin`.
- Linea de tiempo “Historial interno” en `/admin/report?id=REPORT_ID`.
- Validacion de notas internas con `trim`, rechazo de vacias y limite de 500 caracteres.
- Pruebas para persistencia, aislamiento por reporte, overrides, seeds intactos, payloads invalidos y HTML escapado en interfaz.

No se implemento login, usuarios reales, roles definitivos, Firebase, base de datos externa, WhatsApp, mapas, IA, subida real de imagenes, notificaciones, deploy, integraciones gubernamentales, edicion de historial ni resolucion oficial.

## Archivos modificados

- `src/services/runtime-report-store.mjs`
- `src/services/report-service.mjs`
- `src/server/routes.mjs`
- `src/server/admin-page.mjs`
- `src/server/report-detail-page.mjs`
- `src/types/domain.ts`
- `tests/domain-contract.test.mjs`
- `PROJECT_STATE.md`
- `README.md`
- `docs/roadmap/roadmap-mvp.md`
- `docs/project/data-model-draft.md`
- `docs/project/technical-stack.md`

## Archivos creados

- `docs/audits/task-008-local-report-history.md`

## Contrato del evento de historial

Cada evento persistido contiene:

```json
{
  "id": "history-local-...",
  "reportId": "report-pv-001",
  "type": "status_change",
  "createdAt": "2026-07-12T00:00:00.000Z",
  "actor": "local_admin",
  "note": "Texto interno opcional",
  "previousStatus": "validated",
  "newStatus": "in_review"
}
```

Para `internal_note`, `note` es requerido y no se guardan `previousStatus` ni `newStatus`.

Valores permitidos:

- `type`: `status_change`, `internal_note`.
- `actor`: `local_admin`.
- `previousStatus` y `newStatus`: slugs existentes de `seed-statuses`.

## Decision del endpoint

Se eligio `GET /api/report-history?id=REPORT_ID` en lugar de agregar `history` a `GET /api/reports?id=REPORT_ID`.

Motivo:

- Evita cambiar el contrato existente de detalle de reporte.
- Mantiene el historial como recurso local separado.
- Permite que `/admin` y `/admin/report` carguen historial bajo demanda.

`PATCH /api/reports?id=REPORT_ID` conserva `report` en la respuesta y agrega campos compatibles:

- `historyEvent`
- `changed`
- `noop`
- `message`

## Estrategia de persistencia

El historial se guarda en:

```text
data/runtime/report-history.json
```

El archivo esta cubierto por la regla existente de `.gitignore`:

```text
data/runtime/*.json
```

Comportamiento:

- Si el archivo no existe, se usa historial vacio.
- Si el archivo esta vacio o contiene `[]`, no falla.
- Antes de usar eventos guardados se valida estructura, tipo, actor, fecha, status y nota.
- Al agregar un evento se cargan los existentes, se valida el archivo completo y se guarda el arreglo completo con el nuevo evento.
- Los seeds no se modifican.
- Los overrides actuales siguen en `data/runtime/report-overrides.json`.

## Manejo del mismo estado

- Mismo estado sin nota: no crea evento, no guarda override innecesario y responde con `noop: true`.
- Mismo estado con nota valida: crea `internal_note`, no crea un cambio falso de estado y no guarda override innecesario.
- Estado distinto con nota valida: crea `status_change` con `previousStatus`, `newStatus` y `note`.

## Validaciones

`PATCH /api/reports?id=REPORT_ID` valida:

- `id` requerido.
- Reporte existente.
- JSON valido.
- Payload no vacio.
- Solo campos `status` y `note`.
- `status` debe ser texto y existir como estado interno.
- `note` debe ser texto.
- `note` se guarda con `trim`.
- `note` vacia se rechaza.
- `note` mayor a 500 caracteres se rechaza.
- Estructuras inesperadas se rechazan.

`GET /api/report-history?id=REPORT_ID` valida:

- Metodo `GET`.
- `id` requerido.
- Reporte existente.
- Estructura valida del archivo runtime antes de devolver eventos.
- Eventos ordenados cronologicamente y con desempate por `id`.

## Consideraciones de seguridad

- No se guardan nombres reales de administradores.
- `actor` es generico: `local_admin`.
- Las notas son texto plano y la interfaz las pinta con `escapeHtml`.
- No se guardan telefonos, ubicaciones nuevas ni evidencia dentro del historial.
- Los archivos runtime no se exponen como estaticos.
- `/admin` sigue siendo una vista local de prueba sin login.
- La interfaz muestra: “Este historial corresponde al seguimiento interno de La Calle Habla y no representa una resolución oficial.”

## Evidencia de que los seeds no se modifican

- La implementacion solo escribe en `data/runtime/report-overrides.json` y `data/runtime/report-history.json`.
- La prueba `updateReportStatus persists local status override for seed reports without changing seed` confirma que `seedReports` conserva `status` y `updatedAt` originales.
- `git diff --stat` no muestra cambios en `src/data/seed-reports.mjs`, `src/data/seed-categories.mjs` ni `src/data/seed-statuses.mjs`.

## Pruebas agregadas

Se agregaron pruebas para:

- Cambio valido de estado crea `status_change`.
- Evento contiene `reportId`, fecha, estado anterior y estado nuevo.
- Nota valida crea `internal_note`.
- Nota sin cambio de estado.
- Nota vacia.
- Nota demasiado larga.
- Tipo incorrecto de nota.
- Tipo incorrecto de status.
- Estado invalido sin historial.
- Reporte inexistente sin historial.
- Historial separado por reporte.
- Orden determinista.
- Persistencia por lectura posterior del store.
- Seeds intactos.
- Overrides existentes.
- Mismo estado sin nota como no-op.
- Mismo estado con nota como `internal_note`.
- HTML de nota escapado en interfaz.
- `/admin` y `/admin/report` contienen historial, advertencia, formulario de nota y estado vacio.
- Endpoints anteriores siguen respondiendo.
- Runtime de historial ignorado por Git.
- Estructura invalida de historial rechazada antes de uso.

## Comandos ejecutados

```bash
node /home/alexglex/alex-legacy-engine/scripts/startup-check.mjs ale
node /home/alexglex/alex-legacy-engine/scripts/recall.mjs "La Calle Habla"
git status --short
git log --oneline -5
npm run lint
npm run build
npm test
git diff --check
git status --ignored --short data/runtime
git diff --name-only src/data
git check-ignore -v data/runtime/report-history.json
ss -ltnp
readlink -f /proc/2877329/cwd
readlink -f /proc/3441234/cwd
readlink -f /proc/2450181/cwd
```

## Resultados reales

- `startup-check`: paso y cargo ALE, Handoff, Project State y Recall.
- `recall`: paso, sin resultados para “La Calle Habla”.
- `git status --short` inicial: sin cambios.
- `git log --oneline -5`: ultimo commit `377b80c feat: add report detail and status updates`.
- `npm run lint`: paso, `Project validation passed.`
- `npm run build`: paso, `Build check passed.`
- `npm test`: paso, 43 pruebas, 43 pass, 0 fail.
- `git diff --check`: paso, sin salida.
- `git status --ignored --short data/runtime`: muestra runtime existente ignorado (`report-overrides.json`, `report-updates.json`, `reports.json`).
- `git diff --name-only src/data`: sin salida; no hay cambios en seeds.
- `git check-ignore -v data/runtime/report-history.json`: confirma `.gitignore:8:data/runtime/*.json`.
- `ss -ltnp`: mostro procesos Node existentes en `127.0.0.1:4184`, `127.0.0.1:4173` y `127.0.0.1:4174`.
- `readlink -f /proc/.../cwd`: los tres procesos Node existentes pertenecen a `/home/alexglex/legion`, no a este repositorio.

## Limitaciones

- Persistencia JSON local no es apta para concurrencia alta.
- No hay login ni identidad real de administrador.
- No hay edicion ni eliminacion de eventos.
- No hay politica formal de retencion de notas.
- No hay prueba visual con navegador real; la interfaz se valida por HTML, contrato JS y endpoints.

## Riesgos pendientes

- Si se expone `/admin` fuera de localhost sin login, el historial interno podria quedar accesible.
- Las notas internas pueden contener informacion sensible si el operador la escribe manualmente; se requiere politica antes de datos reales.
- Un archivo runtime corrupto produce error controlado en consulta de historial hasta ser corregido manualmente.

## Siguiente task recomendada

TASK 009: definir criterios de privacidad y retencion de datos sensibles antes de integrar WhatsApp real, mapas, IA, deploy o exponer administracion fuera de local.
