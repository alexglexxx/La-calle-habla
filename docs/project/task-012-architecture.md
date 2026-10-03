# TASK-012 - Arquitectura de activación

## Flujo objetivo

Meta WhatsApp
    |
    v
La Calle Habla /api/webhook/whatsapp
    |
    +--> verificacion de firma
    |
    +--> normalizacion Meta
    |
    v
IncomingCitizenMessage
    |
    v
report-intake-service
    |
    +--> idempotencia
    +--> phoneId HMAC anonimo
    +--> sesion
    +--> reporte
    |
    +--> Supabase PostgreSQL
    |
    +--> Supabase Storage privado
    |
    v
Admin / Vercel

## Principio

FoodSPV 2.0 y La Calle Habla son sistemas separados.

FoodSPV aporta solamente un patron de frontera Meta ya probado. La Calle Habla tiene su propio adapter y sus propios contratos.

## Media

El mediaId de Meta no se considera almacenamiento permanente.

Secuencia productiva:

1. recibir mediaId;
2. pedir a Graph API la URL temporal;
3. descargar el contenido con el token;
4. validar MIME y tamaño reales;
5. calcular hash;
6. subir a bucket privado;
7. guardar storage_key en report_evidence.

## Idempotencia

Dos niveles:

- processed_messages.message_id evita procesar dos veces el mismo mensaje.
- reports.source_message_id aporta una segunda defensa contra duplicacion de reportes.

## Secretos

Meta:
- META_APP_SECRET
- META_WEBHOOK_VERIFY_TOKEN
- META_GRAPH_API_VERSION
- META_ACCESS_TOKEN

Supabase:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_REPORT_BUCKET

Admin:
- ADMIN_USERNAME
- ADMIN_PASSWORD

Ninguna clave debe entrar al cliente.

## Activacion posterior

1. seleccionar/crear proyecto Supabase de La Calle Habla;
2. aplicar migracion;
3. ejecutar query de prueba;
4. revisar advisors;
5. conectar persistencia de reportes y sesiones;
6. activar descarga de media;
7. probar webhook con payload real/simulado;
8. desplegar a Vercel;
9. configurar URL publica y verificacion Meta.

No activar produccion antes de probar reintentos del webhook.
