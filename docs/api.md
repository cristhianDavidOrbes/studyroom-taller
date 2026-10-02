# API de StudyRoom

La API NestJS conserva datos y permisos en PostgreSQL, autentica con Firebase y entrega tokens de LiveKit únicamente a miembros autorizados. El navegador nunca recibe el secreto de Supabase, el secreto del gateway ni las credenciales de LiveKit. La documentación interactiva está en `/api/docs`; el contrato funcional compartido está en `implementation-contract.md`.

## Ejecutar y verificar

Desde la raíz, con PostgreSQL y Firebase Auth emulator disponibles:

```sh
npm ci
npm run db:migrate --workspace @studyroom/api
npm run build --workspace @studyroom/api
npm run start --workspace @studyroom/api
npm run test --workspace @studyroom/api
node --test tests/api.integration.mjs
node apps/api/scripts/verify-queue-timezone.cjs
```

`apps/api/.env` contiene la configuración local y está ignorado por Git. `NODE_ENV=production` rechaza explícitamente `FIREBASE_AUTH_EMULATOR_HOST`. Los identificadores de proyecto deben coincidir con los tokens de Firebase. En Windows hay que detener la API antes de ejecutar `prisma generate`, porque Windows mantiene abierto su motor nativo.

Variables de servidor: `DATABASE_URL`, `DIRECT_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON` o credenciales ADC; `WEB_ORIGIN` (orígenes separados por comas), `PORT`; `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STORAGE_BUCKET`; `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`; `AI_GATEWAY_URL`, `AI_GATEWAY_TOKEN`. Solo el entorno local puede usar HTTP para el gateway en loopback; producción exige HTTPS.

## Identidad y permisos

Todas las rutas, excepto `/api/health` y la documentación, requieren `Authorization: Bearer <Firebase ID token>`. Firebase Admin verifica firma, proyecto, vencimiento y revocación. La validación tiene una caché máxima de 15 segundos, limitada además por el vencimiento del token; evita consultas al proveedor por cada punto de una anotación. El cierre de sesión revoca los tokens, elimina esa caché y desconecta los sockets del usuario. Los sockets vuelven a comprobar identidad y membresía en cada acción y revisan revocación cada 30 segundos.

Las funciones de anfitrión y moderador proceden de la membresía PostgreSQL. No se aceptan roles enviados por el cliente ni metadatos editables de Firebase. Las notas y preguntas privadas se consultan por usuario. No forman parte del contexto compartido, de los mensajes de socket de sala ni de las exportaciones de otra persona.

Las migraciones habilitan RLS en las 17 tablas de la aplicación y revocan permisos de `PUBLIC`, `anon` y `authenticated`. El login de ejecución `studyroom_api` recibe solamente SELECT/INSERT/UPDATE/DELETE sobre esas tablas y políticas exclusivas para ese rol. Debe crearse antes de migrar. Las migraciones usan una conexión administrativa separada; el proceso web no necesita permiso de crear tablas, esquemas ni roles.

## Operaciones

| Área | Rutas principales |
|---|---|
| Perfil | GET/PATCH `/me`; POST `/auth/logout` |
| Descubrimiento | GET `/rooms` con q, subject, modality, level, sort y recommended |
| Salas | GET/POST `/rooms`; GET/PATCH `/rooms/:id`; POST join, leave, close y cancel |
| Participantes | GET `/rooms/:id/members`; PATCH/DELETE `/rooms/:id/members/:uid`; POST invites |
| Colaboración | GET/POST messages; GET/PUT notes; GET/PUT timer; GET state; POST annotations |
| Documentos | GET/POST documents; GET documents/:docId/url; DELETE documents/:docId |
| Llamada | POST `/rooms/:id/media/token` |
| IA | POST `/rooms/:id/ai`; GET `/ai/jobs/:id`; POST cancel y `/ai/answers/:id/feedback` |
| Repaso | GET `/sessions`; GET `/sessions/:id`; GET export; POST artifacts; POST quiz/attempts |
| Voz | GET `/rooms/:id/transcription`; POST consent, audio y gaps bajo esa ruta |
| Reporte | GET `/sessions/:id/report`; GET `/sessions/:id/documents/:docId/url`; POST `/sessions/:id/questions` |
| Consumo | GET `/usage` |

Los errores usan `{message, code?, requestId?}`. Validación inválida devuelve 400; sesión inválida 401; permisos 403; inexistencia 404; capacidad o estado incompatible 409; cuota o frecuencia 429; proveedor sin configurar o no disponible 503. Los logs de fallos contienen identificador de solicitud y tipo de error, no cuerpo, credenciales ni conversación.

## Concurrencia, persistencia y documentos

Unirse y reducir capacidad se ejecutan con aislamiento serializable y reintento de conflictos: dos entradas simultáneas no ocupan la misma última plaza. El máximo inicial es cuatro participantes. Códigos privados se guardan con scrypt y salt; invitaciones usan tokens aleatorios, hash almacenado y vencimiento de 24 horas.

Mensajes se deduplican por sala, usuario y `clientId`. Estado del temporizador usa una hora final absoluta, por lo que reconectar no reinicia la cuenta. Las anotaciones requieren el `trackSid` de una pantalla activa verificada en LiveKit, coordenadas entre cero y uno, membresía y rol autorizado. Los medios de la llamada circulan por LiveKit. La transcripción optativa envía fragmentos independientes del micrófono propio a la API y al gateway local por ngrok, sin bloquear la conexión de medios. Reacciones y presencia están acotadas por frecuencia; varias pestañas cuentan como una identidad.

Documentos aceptan PDF, DOCX, texto UTF-8, PNG, JPEG o WebP, máximo 10 MB. Se verifica contenido y no solamente MIME declarado; los DOCX además se validan antes de descomprimir con límites de entradas y tamaño. El espacio se reserva transaccionalmente antes de cargar. Los objetos son privados y sus URLs firmadas vencen en 60 segundos. Se extrae texto de PDF/DOCX/texto y se reconoce texto de imágenes con Tesseract local; el resultado señala contenido parcial, ausencia de texto o indisponibilidad. El archivo original sigue disponible aunque falle OCR. Los enlaces firmados son credenciales temporales: quien posea uno podrá usarlo hasta su vencimiento.

## Cola de IA

La cola está en `AiJob`; se consume en el mismo proceso NestJS, con un bloqueo transaccional PostgreSQL global y una sola generación activa. La reserva de trabajo vence en cuatro minutos y se renueva cada 30 segundos. Una interrupción permite recuperar el trabajo después del vencimiento. Intentos y espera exponencial quedan guardados; después de cinco fallos se muestra un error y se permite solicitar otra vez. Cancelar detiene la lectura HTTP y conserva el estado cancelado.

Las comparaciones y reservas SQL usan explícitamente UTC para coincidir con `DateTime` de Prisma, incluso cuando PostgreSQL está configurado con America/Bogota. Un cierre ordenado libera sus propios trabajos antes de desconectar la base; un cierre inesperado conserva la recuperación por vencimiento.

Cerrar una sesión guarda su contexto y crea los trabajos idempotentes de resumen, puntos clave y quiz en la misma transacción. La transcripción requiere consentimiento propio y conserva palabras y tiempos devueltos por Whisper; no utiliza notas privadas ni inventa intervenciones. Los trabajos de síntesis esperan los fragmentos pendientes y procesan el contexto autorizado en fragmentos UTF-8 con reducción progresiva para mantener la ventana local de 4.096 tokens. Las preguntas sobre un reporte recuperan una selección acotada de fuentes relevantes con citas, conservando el reporte original íntegro. Una pregunta admite como máximo 1.000 bytes. Si el modelo no logra reducir o produce un quiz inválido, el trabajo falla explícitamente. Ver [contrato y estados de cobertura](session-report-api.md).

Las respuestas llegan en NDJSON y se muestran progresivamente. Solo se marca completado tras recibir el evento final; un corte no se presenta como respuesta terminada. Los quizzes se validan, sus soluciones no se transmiten por el progreso ni por las consultas públicas y solo se revelan después de responder. El gateway y Ollama se administran mediante `scripts/local-ai/`.

## Presupuesto gratuito

La API aplica márgenes inferiores al plan: 4.500 minutos de participante, 45 GB de descarga estimada de medios, 19.000 solicitudes/900 MB para ngrok, 900 MB de documentos, 4,5 GB de descargas y 450 MB de base de datos. Al 80% se generan advertencias. La base comprueba tamaño con una caché de 15 segundos; permite cierre/cancelación/eliminación para recuperar espacio.

LiveKit reserva duración y una estimación conservadora de 6 Mbps de descarga antes de emitir tokens. El mantenimiento retira conexiones al finalizar la reserva, al expulsar participantes o cerrar salas; conserva la vigilancia durante la vigencia del token. Si Render está caído o suspendido, la ejecución del mantenimiento se reanuda al arrancar; los límites estrictos de LiveKit Build siguen siendo el límite final del proveedor. Reservas y estimaciones de la aplicación se contrastan con los paneles antes del despliegue y durante las pruebas de llamada.

Para ngrok se reserva el máximo de la respuesta y se contabilizan bytes enviados y recibidos, incluida la estructura NDJSON y un margen de cabeceras. Las respuestas interrumpidas mantienen la reserva conservadora. Las URLs firmadas de Storage se contabilizan por descarga solicitada; repetir directamente una URL puede aumentar el consumo real, por lo que el panel del proveedor sigue siendo la referencia. No hay activación automática de facturación ni fallback a APIs pagadas.

## Evidencia y límites de la verificación

Las pruebas de `apps/api/test/` cubren autorización, códigos privados, límites de archivo/contexto, payloads ajenos, quiz sin revelar soluciones, reintento/cancelación del trabajador, guardas de base de datos y vencimiento de reservas. `tests/api.integration.mjs` prueba Firebase emulator y PostgreSQL reales, capacidad simultánea, chat idempotente, notas privadas, reconexión, invitaciones, historial y cierre.

El workflow usa un solo runner Ubuntu estándar y PostgreSQL efímero, sin claves cloud. Cancela ejecuciones anteriores, limita el trabajo a 15 minutos y conserva evidencia del navegador tres días. Los presupuestos y el bloqueo de gasto de la cuenta GitHub deben mantenerse configurados; al agotar minutos, las mismas pruebas se ejecutan localmente.

La llamada de 60 minutos con cuatro dispositivos/redes, UDP/TURN, cambio de red, reinicio de backend y carga de IA requiere evidencia real adicional. Las pruebas automatizadas no sustituyen esa aceptación ni verifican por sí mismas la entrega de correo real de Firebase.
### Registrar la migración inicial aplicada por administración

El rol de ejecución `studyroom_api` no debe migrar ni recibir DDL. Para una conexión
administrativa dedicada, el procedimiento preferido de Prisma 6 es
`prisma migrate resolve --applied 20261002050007_studyroom_initial`, seguido de
`prisma migrate status`; consultar la [guía oficial de baseline](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining).
Las migraciones posteriores se revisan y ejecutan con ese rol migrador antes de
desplegar la API. Su contraseña no se instala en Render ni se confirma en Git.

Para la instancia inicial cuyo SQL ya se aplicó mediante la API administrativa de
Supabase, `apps/api/prisma/baseline-existing.sql` permite registrar ese mismo estado
sin ejecutar de nuevo el DDL ni modificar filas de la aplicación. Lo genera
`node apps/api/scripts/generate-prisma-baseline.cjs` a partir de los bytes LF
confirmados de la migración; SHA256
`216f3d6e06c4ff0fa1bc8732091645921b6fc3c689a1cd9847c502fe9ce08b25`.
El script comprueba 13 tablas con RLS, 115 columnas con tipo y nulabilidad,
28 restricciones y 22 índices. Rechaza historial conflictivo, es idempotente y
revoca acceso público, `anon`, `authenticated` y `studyroom_api` al historial.
La validación comprueba existencia de restricciones e índices; no reemplaza la
revisión del SQL ya aplicado ni una comparación completa de deriva del esquema.
Se probó en PostgreSQL real tanto con historial existente como ausente, repitiendo
la operación y revirtiendo íntegramente cada ensayo.
