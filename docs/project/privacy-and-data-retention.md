# Privacidad y retencion de datos del MVP

Fecha: 2026-07-12

## Naturaleza del documento

Este documento es una politica operativa provisional para el MVP local de La Calle Habla. No es un aviso de privacidad legal definitivo, no declara cumplimiento total con legislacion mexicana y debe revisarse legalmente antes de recibir datos ciudadanos reales, publicar el servicio, integrar WhatsApp, mapas, fotografias reales, login o proveedores externos.

## Proposito del tratamiento

La Calle Habla usa la informacion del reporte unicamente para:

- Registrar un problema urbano reportado por una persona.
- Ordenarlo por categoria, ubicacion aproximada, prioridad y estado interno.
- Permitir revision administrativa local.
- Conservar seguimiento interno y notas operativas.
- Validar el flujo del MVP antes de integraciones externas.

Enviar un reporte no crea un tramite oficial, no pertenece al gobierno y no garantiza resolucion.

## Informacion que recibe actualmente el MVP

Campos obligatorios actuales para crear un reporte local:

- `title`: resumen corto del problema.
- `description`: descripcion del problema.
- `category`: categoria ciudadana.
- `locationText`: referencia textual o ubicacion aproximada.
- `privacyNoticeVersion`: version del aviso operativo aceptado.
- `privacyAcknowledged`: reconocimiento explicito del aviso.

Campos opcionales actuales:

- `neighborhood`: colonia.
- `zone`: zona.
- `priority`: prioridad interna, con valor por defecto `normal`.
- `evidenceCount`: numero declarado de evidencias, con valor por defecto `0`.
- `citizenAlias`: alias ciudadano, con valor por defecto `Ciudadano anonimo`.
- `contactPhone`: telefono de contacto opcional.
- `locationPrecision`: `approximate` o `precise`, con valor por defecto `approximate`.
- `sensitiveDataConsent`: consentimiento explicito para datos opcionales sensibles cuando aplique.

Campos generados por el servidor:

- `id`.
- `status`.
- `createdAt`.
- `updatedAt`.
- `privacyAcknowledgedAt`.

## Clasificacion de datos

| Categoria | Datos | Uso permitido en el MVP | Regla |
| --- | --- | --- | --- |
| Bajo riesgo | Categoria, descripcion general sin datos personales, estado interno, fechas generales, prioridad interna | Ordenar y revisar reportes | Pedir solo lo necesario |
| Personales o sensibles | Telefono, ubicacion precisa, fotos con personas/placas/domicilios/rostros, nombres en descripcion, informacion de contacto, notas internas con datos personales | Solo si la persona los proporciona y son necesarios para revisar el reporte | Requiere consentimiento explicito cuando el campo opcional se usa |
| Tecnicos | ID de reporte, ID de eventos, timestamps, version del aviso, indicadores de consentimiento, origen tecnico | Auditoria local del MVP | Generados o normalizados por servidor cuando corresponda |
| Prohibidos o innecesarios | Contrasenas, datos bancarios, identificaciones oficiales, CURP, RFC, informacion medica, datos biometricos, informacion de menores, credenciales de acceso, documentos oficiales completos | No deben solicitarse ni incluirse | Advertir en interfaz y evitar nuevos campos para estos datos |

## Minimizacion

Reglas operativas:

- No pedir telefono como requisito.
- No pedir ubicacion exacta como requisito.
- No pedir evidencia como requisito.
- Permitir referencias aproximadas.
- No pedir nombre completo.
- No crear campos para identificaciones oficiales.
- No registrar consentimientos como texto libre.
- No copiar automaticamente descripcion, telefono, ubicacion o evidencia al historial.
- No guardar IP, user-agent, fingerprint ni datos adicionales no solicitados.
- No usar analytics, cookies publicitarias ni rastreo.

## Consentimiento y version del aviso

Version vigente:

```text
mvp-1
```

Para reportes nuevos creados por `POST /api/reports`:

- `privacyAcknowledged` debe ser `true`.
- `privacyNoticeVersion` debe coincidir con `mvp-1`.
- `privacyAcknowledgedAt` lo genera el servidor y no se confia en timestamps enviados por cliente.
- `sensitiveDataConsent` se exige solo si se proporciona telefono, ubicacion precisa o evidencia.
- Las casillas del formulario no deben estar premarcadas.

Reportes seed y reportes runtime historicos sin estos campos siguen siendo compatibles. En administracion se muestran como:

```text
Registro histórico sin consentimiento versionado
```

## Manejo por tipo de dato

### Ubicacion

La ubicacion textual aproximada es obligatoria para que el reporte sea util. La ubicacion precisa es opcional y se clasifica como sensible. En cards generales se debe evitar exponer ubicacion precisa; el detalle local queda reservado para revision necesaria.

### Telefono

El telefono es opcional y sensible. Solo debe solicitarse si la persona quiere que se pueda pedir informacion adicional. En listados generales debe mostrarse enmascarado o no mostrarse completo.

### Evidencia

En esta etapa no hay subida real de archivos. `evidenceCount` solo indica cantidad declarada. Si se declara evidencia, se trata como dato opcional sensible porque futuras fotos podrian contener personas, placas, domicilios o rostros.

### Descripcion

La descripcion debe enfocarse en el problema urbano. La interfaz advierte que no se incluyan contrasenas, datos bancarios, identificaciones oficiales, informacion medica ni datos de menores.

### Notas internas

Las notas internas son seguimiento operativo local. No son respuesta oficial al ciudadano. No deben copiar telefono, ubicacion precisa, evidencia ni otros datos personales salvo una necesidad documentada y futura. Actualmente tienen limite de 500 caracteres.

## Acceso administrativo local

`/admin` y `/admin/report?id=REPORT_ID` son herramientas locales de prueba:

- No tienen login.
- No deben exponerse publicamente.
- No son un sistema oficial.
- Deben mostrar advertencias para consultar solo lo necesario.

## Almacenamiento runtime actual

Archivos runtime locales:

- `data/runtime/reports.json`: reportes creados localmente.
- `data/runtime/report-overrides.json`: overrides de estado interno.
- `data/runtime/report-history.json`: historial y notas internas.

Estos archivos estan ignorados por Git mediante `data/runtime/*.json`. No deben versionarse porque pueden contener datos ciudadanos o de prueba.

## Ausencia de proveedores externos

El MVP actual no usa:

- WhatsApp real.
- Firebase.
- Base de datos externa.
- Mapas.
- Geocodificacion.
- IA.
- Analytics.
- Cookies publicitarias.
- Almacenamiento cloud.
- Deploy publico.

## Riesgos del almacenamiento JSON

- No es apto para concurrencia alta.
- Puede corromperse si se edita manualmente mal.
- No tiene cifrado ni control de acceso por usuario.
- No tiene borrado selectivo automatizado.
- Depende de controles locales del equipo que ejecuta el MVP.

## Retencion provisional

Esta politica no fija un plazo legal definitivo. Para pruebas locales del MVP:

- Mantener reportes runtime solo mientras sean necesarios para validar el flujo.
- Revisar datos runtime al cierre de cada ciclo de prueba.
- Evitar conservar datos sensibles de prueba mas alla de 30 dias salvo que exista una razon documentada.
- Antes de produccion, definir retencion legal, responsable, procedimiento de derechos y seguridad.

Reportes seed:

- Son ficticios y versionados.
- No deben borrarse como parte de limpieza runtime.

Reportes runtime:

- Son datos locales de prueba.
- Pueden incluir consentimiento versionado desde `mvp-1`.

Overrides e historial:

- Deben tratarse como relacionados al reporte.
- Si en el futuro se elimina un reporte, tambien deben considerarse sus overrides e historial.

Evidencias futuras:

- Requieren decision separada antes de subir o almacenar archivos reales.
- Deben evitar rostros, placas, domicilios o menores cuando no sean necesarios.

## Procedimiento manual seguro de limpieza local

No hay borrado automatico en esta task. Para limpiar un entorno local de prueba en una task futura:

1. Confirmar que se trata de datos runtime locales y que no se requieren para auditoria.
2. Hacer respaldo si existe una razon operativa documentada.
3. Revisar archivos involucrados:
   - `data/runtime/reports.json`
   - `data/runtime/report-overrides.json`
   - `data/runtime/report-history.json`
4. Eliminar solo registros runtime relacionados, nunca seeds ni codigo fuente.
5. Verificar que los endpoints sigan funcionando con seeds.
6. Registrar la limpieza en una auditoria.

No usar comandos amplios ni destructivos sin confirmacion explicita. No borrar `src/data/`.

## Limites de responsabilidad

- Esta politica es una base operativa del MVP.
- No sustituye asesoria legal.
- No declara cumplimiento legal definitivo.
- No crea relacion oficial con gobierno, municipio o ayuntamiento.
- No garantiza atencion, resolucion ni tramite oficial.

## Pendientes antes de produccion

- Revision legal del aviso de privacidad definitivo.
- Definir responsable legal, domicilio y medios de contacto reales, si aplica.
- Definir procedimientos para acceso, correccion, eliminacion y oposicion cuando correspondan.
- Definir retencion legal y tecnica.
- Definir seguridad para `/admin`.
- Definir almacenamiento seguro para evidencia real.
- Definir tratamiento de telefono y ubicacion si se integra WhatsApp o mapas.
