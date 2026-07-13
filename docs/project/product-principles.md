# Principios de producto

## Simple para ciudadanos

Reportar debe sentirse como mandar un mensaje normal. El sistema debe pedir solo lo necesario y guiar con preguntas cortas cuando falte informacion.

Para el flujo central del MVP, lo obligatorio debe ser solamente foto y ubicacion compartida o referencia escrita. No debe pedir nombre, telefono manual, cuenta, contrasena, folio publico, categoria obligatoria ni descripcion obligatoria.

## Util para administracion

Cada reporte debe quedar en una estructura que permita revisar, filtrar, priorizar y dar seguimiento. La utilidad administrativa depende de datos claros, no de interfaces complejas.

## Evidencia primero

Un reporte fuerte debe buscar cuatro elementos minimos:

- Foto o evidencia visual cuando exista.
- Ubicacion.
- Fecha y hora.
- Categoria del problema cuando pueda clasificarse internamente.

La plataforma debe aceptar reportes incompletos, pero distinguir entre informacion recibida e informacion validada.

En el ingreso expres anonimo, la categoria se deja pendiente para revision administrativa con tal de no romper el criterio Foto -> ubicacion o calles -> listo.

## No prometer solucion gubernamental automatica

La Calle Habla puede organizar reportes y evidencia, pero no debe afirmar que una autoridad resolvera el problema por el simple hecho de reportarlo.

## Separar reporte ciudadano de resolucion oficial

El estado interno del reporte debe distinguir entre:

- Lo que reporta el ciudadano.
- Lo que valida la plataforma.
- Lo que una autoridad podria reconocer o resolver en el futuro.

Esa separacion evita confundir evidencia ciudadana con tramite oficial.

## Evitar burocracia innecesaria

El producto debe evitar formularios largos, requisitos excesivos y lenguaje administrativo pesado. La prioridad es capturar informacion util sin bloquear al ciudadano.

## Movil desde el inicio

El canal ciudadano principal es movil. Cualquier vista publica o administrativa debe funcionar bien en telefono, especialmente para revisar reportes, evidencia y ubicaciones en campo.

## Lenguaje ciudadano

El sistema debe usar palabras claras: bache, basura, fuga, lampara fundida, banqueta rota. Las categorias tecnicas pueden existir internamente, pero el ciudadano debe ver lenguaje directo.

## Transparencia de limites

La plataforma debe explicar con claridad cuando un reporte fue recibido, cuando fue revisado y cuando solo existe como evidencia ciudadana. No debe inflar el alcance del sistema.

## Privacidad minima desde el MVP

La plataforma debe pedir solo los datos necesarios para revisar un reporte. Telefono, ubicacion precisa y evidencia deben seguir siendo opcionales y requerir consentimiento explicito cuando se proporcionan.

El aviso de privacidad del MVP debe ser claro, corto y visible antes de enviar. No debe presentarse como cumplimiento legal definitivo hasta tener revision legal.

La administracion debe consultar solo lo necesario y evitar copiar datos personales a notas internas.

Cuando el canal sea WhatsApp, La Calle Habla debe tratar el reporte como anonimo dentro del sistema: no guardar el numero original, usar `phoneId` pseudonimo con secreto y mostrar solo alias corto. Esto no debe presentarse como anonimato absoluto frente a Meta.
