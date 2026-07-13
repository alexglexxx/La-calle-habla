# Alcance MVP

## MVP minimo

El MVP de La Calle Habla debe probar si los ciudadanos pueden enviar reportes urbanos por WhatsApp y si el equipo administrador puede convertir esos mensajes en registros ordenados.

El MVP minimo debe permitir:

- Recibir o simular reportes expres anonimos con foto y ubicacion compartida o referencia escrita.
- Guardar reportes en una base de datos.
- Revisar reportes en una vista administrativa simple.
- Cambiar estados basicos del reporte.
- Consultar reportes por categoria, fecha, estado y zona.
- Mostrar aviso operativo de privacidad antes de crear reportes locales.
- Registrar reconocimiento versionado del aviso para reportes nuevos.
- Usar categoria pendiente de clasificacion cuando el canal ciudadano no la solicite.
- Visualizar una base inicial de reportes en formato lista y, si el stack ya lo permite, mapa simple.

## Flujo ciudadano inicial

1. El ciudadano acepta continuar anonimo en el canal conversacional.
2. El ciudadano envia foto y ubicacion compartida, o foto y referencia escrita, en cualquier orden.
3. El sistema confirma que el reporte fue recibido para revision interna.
4. El reporte queda registrado con fecha, evidencia, ubicacion exacta, inferida o pendiente, y estado inicial.

El flujo debe ser corto y tolerante a errores. El ciudadano no debe llenar formularios largos, proporcionar nombre, escribir telefono, elegir categoria ni recibir folio publico.

## Flujo administrativo inicial

1. Un administrador revisa reportes entrantes.
2. Valida si el reporte tiene informacion suficiente.
3. Ajusta categoria o ubicacion si es necesario.
4. Cambia el estado del reporte.
5. Filtra reportes para detectar prioridades o problemas repetidos.

El flujo administrativo inicial no debe intentar reemplazar un sistema gubernamental formal.

## Que entra en el MVP

- Modelo de datos inicial para reportes urbanos.
- Registro manual o simulado de reportes.
- Motor de ingreso expres anonimo compatible con WhatsApp mediante contrato normalizado.
- Sesiones temporales, idempotencia y rate limiting local por identificador pseudonimo.
- Normalizacion local de referencias escritas y resolucion determinista usando antecedentes con coordenadas.
- Estados basicos: nuevo, en revision, validado, duplicado, cerrado.
- Categorias urbanas iniciales.
- Evidencia con foto obligatoria en el flujo expres.
- Ubicacion como coordenadas compartidas, texto aproximado o inferencia local marcada.
- Vista administrativa basica.
- Exportacion simple o consulta basica de datos si aporta validacion.
- Politica operativa provisional de privacidad y retencion para pruebas locales.

## Que queda fuera del MVP

- Integracion real con WhatsApp Business API.
- Integracion real con Firebase, mapas externos o servicios pagados antes de decidir stack.
- Descarga real de medios desde Meta.
- Login robusto con roles avanzados.
- Inteligencia artificial para clasificar reportes.
- Deteccion automatica de duplicados.
- Promesas de resolucion oficial.
- Automatizaciones politicas.
- Pagos.
- Deploy productivo.
- Aviso de privacidad legal definitivo sin revision legal.
- Captura obligatoria de telefono, ubicacion precisa o evidencia.
- Folios publicos, seguimiento publico o promesas de atencion oficial.

## Fase 2

La fase 2 puede incluir:

- Webhook real de WhatsApp.
- Dashboard con mapa operativo.
- Clasificador automatico de categoria.
- Deteccion de duplicados por ubicacion, texto y evidencia.
- Estadisticas por colonia, zona, categoria y periodo.
- Reportes descargables para ciudadanos, municipios o equipos de trabajo.
- Usuarios administradores con permisos.
- Flujo de seguimiento publico limitado.
- Priorizacion por recurrencia, impacto y antiguedad.
