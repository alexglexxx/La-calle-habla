# Alcance MVP

## MVP minimo

El MVP de La Calle Habla debe probar si los ciudadanos pueden enviar reportes urbanos por WhatsApp y si el equipo administrador puede convertir esos mensajes en registros ordenados.

El MVP minimo debe permitir:

- Recibir o simular reportes con texto, foto, ubicacion aproximada y categoria.
- Guardar reportes en una base de datos.
- Revisar reportes en una vista administrativa simple.
- Cambiar estados basicos del reporte.
- Consultar reportes por categoria, fecha, estado y zona.
- Mostrar aviso operativo de privacidad antes de crear reportes locales.
- Registrar reconocimiento versionado del aviso para reportes nuevos.
- Visualizar una base inicial de reportes en formato lista y, si el stack ya lo permite, mapa simple.

## Flujo ciudadano inicial

1. El ciudadano envia un mensaje por WhatsApp o por un canal simulado equivalente durante desarrollo.
2. El sistema solicita o detecta informacion minima: descripcion, categoria, ubicacion y foto cuando exista.
3. El sistema confirma que el reporte fue recibido.
4. El reporte queda registrado con fecha, evidencia y estado inicial.

El flujo debe ser corto y tolerante a errores. El ciudadano no debe llenar formularios largos.

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
- Estados basicos: nuevo, en revision, validado, duplicado, cerrado.
- Categorias urbanas iniciales.
- Evidencia con foto opcional.
- Ubicacion como coordenadas o texto aproximado.
- Vista administrativa basica.
- Exportacion simple o consulta basica de datos si aporta validacion.
- Politica operativa provisional de privacidad y retencion para pruebas locales.

## Que queda fuera del MVP

- Integracion real con WhatsApp Business API.
- Integracion real con Firebase, mapas externos o servicios pagados antes de decidir stack.
- Login robusto con roles avanzados.
- Inteligencia artificial para clasificar reportes.
- Deteccion automatica de duplicados.
- Promesas de resolucion oficial.
- Automatizaciones politicas.
- Pagos.
- Deploy productivo.
- Aviso de privacidad legal definitivo sin revision legal.
- Captura obligatoria de telefono, ubicacion precisa o evidencia.

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
