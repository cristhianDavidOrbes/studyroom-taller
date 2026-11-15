# StudyRoom

> **Copia académica de Ingeniería Web (15-11-2026):** empieza por [la guía de entrega](docs/entrega-final/README.md), que enlaza la constitución SDD, la especificación, el plan, las tareas, las pruebas y un guion oral de más de cinco minutos. Los enlaces y resultados históricos que aparecen más abajo pertenecen al proyecto previo; no prueban que los cambios de esta copia estén desplegados.

StudyRoom reúne salas de estudio, videollamada, chat, documentos, notas privadas, temporizador y ayuda de IA ejecutada en tu PC. La interfaz está en español. El alcance original está conservado en las **657 incidencias Jira**: 7 épicas, 50 historias, 150 tareas y 450 actividades.

**Abrir la aplicación:** [studyroom-sut.onrender.com](https://studyroom-sut.onrender.com). La interfaz y la API están publicadas en Render; la IA depende de que este PC y su túnel sigan encendidos.

El proyecto contiene la aplicación y sus pruebas. La aceptación de todas las incidencias requiere además completar las validaciones de servicios y dispositivos reales: no se consideran terminadas por existir código. Consulta el [mapa de trazabilidad](docs/traceability.md), su [detalle por incidencia](docs/traceability.json) y el [protocolo de aceptación](docs/acceptance-manual.md).

## Arquitectura

| Componente | Implementación |
|---|---|
| Interfaz | React 18, TypeScript y Vite; Render Static Site |
| API y eventos | NestJS, Socket.IO y OpenAPI; Render Web Service Free |
| Identidad | Firebase Authentication Spark, correo/contraseña y recuperación |
| Datos y archivos | PostgreSQL/Prisma y Storage privado de Supabase Free |
| Cámara, audio y pantalla | WebRTC mediante LiveKit Cloud Build Free |
| IA | Render → HTTPS ngrok Free → gateway autenticado del PC → Ollama local |
| Voz y lectura de imágenes | Whisper small local con palabras y tiempos; OCR Tesseract en español e inglés |
| Trabajos de IA | Cola durable PostgreSQL, un consumidor dentro de la API |

El modelo local seleccionado tras probarlo es **qwen3:4b-instruct Q4_K_M**, aproximadamente 2,5 GB, Apache 2.0. Solo se procesa una inferencia simultánea con contexto de texto 4096. Audio, cámara y pantalla compartida de la llamada viajan por LiveKit. La transcripción se prepara automáticamente para cada participante al entrar: cuando enciende su micrófono, fragmentos separados de esa misma pista pasan por la API y ngrok a Whisper local. La llamada sigue funcionando mientras se procesan; un indicador muestra el estado y la pestaña Voz permite pausarla.

Al terminar una reunión, sus participantes pueden consultar una cronología única de voz reconocida, mensajes e imágenes o archivos compartidos. La descarga contiene un documento Word con esa cronología y una carpeta `adjuntos` con los originales disponibles, enlazados desde el Word. Las preguntas al reporte usan la voz registrada, el chat y el texto extraído de los recursos. El reconocimiento de voz puede cometer errores y depende de que el equipo de IA local esté conectado; los intervalos fallidos se indican en el informe.

La aplicación limita consumo y presenta espera/indisponibilidad al agotar recursos. El presupuesto de servicios se mantiene en $0 con planes Free/Spark/Build, sin mejoras automáticas ni proveedor de IA de pago. Las cuotas de los paneles siguen siendo la referencia: no se promete uso ilimitado ni una disponibilidad que los planes gratuitos no ofrecen.

## Ejecutar en este PC

Si este checkout ya tiene archivos `.env` configurados, conservarlos. Los comandos siguientes sirven para preparar un checkout nuevo. Requisitos: Node.js 22–24, npm y PostgreSQL; el archivo Docker Compose permite crear PostgreSQL local. Ollama y ngrok se usan para la IA; su instalación/administración está en la [guía local de IA](apps/ai-gateway/local-ai.md).

1. Instalar las dependencias fijadas en el lockfile y preparar los archivos locales:

   ```powershell
   npm ci
   if (!(Test-Path apps/api/.env)) { Copy-Item apps/api/.env.example apps/api/.env }
   if (!(Test-Path apps/web/.env)) { Copy-Item apps/web/.env.example apps/web/.env }
   ```

2. Para una base local, crear un archivo `.env` en la raíz con `LOCAL_DATABASE_PASSWORD` y una contraseña aleatoria propia. Usar esa misma contraseña en `DATABASE_URL` y `DIRECT_URL` de `apps/api/.env`, con host `127.0.0.1` y puerto `54322`. El archivo de ejemplo indica dónde reemplazarla. Con una contraseña que incluya caracteres especiales, codificar esos caracteres en la URL. Los `.env` están excluidos de Git.

   ```powershell
   docker compose up -d postgres
   npm run db:migrate -w @studyroom/api
   npm run db:seed -w @studyroom/api
   ```

   El seed es idempotente, crea salas de ejemplo y se prohíbe en producción. No crea una cuenta Firebase: el registro se hace desde la interfaz. Para usar Supabase en lugar de la base local, configurar las conexiones de servidor con TLS verificado; usar un rol restringido para la API y otro para migraciones, como explica [la guía de API](docs/api.md).

3. Para desarrollo sin cuentas reales, `apps/api/.env` utiliza `FIREBASE_PROJECT_ID=demo-studyroom` y `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`. En `apps/web/.env` usar:

   ```dotenv
   VITE_API_URL=/api
   VITE_FIREBASE_PROJECT_ID=demo-studyroom
   VITE_USE_FIREBASE_EMULATOR=true
   VITE_FIREBASE_AUTH_EMULATOR_URL=http://127.0.0.1:9099
   ```

   En una terminal iniciar el emulador:

   ```powershell
   npm run emulators
   ```

4. En otra terminal iniciar API e interfaz:

   ```powershell
   npm run dev
   ```

   Abrir [StudyRoom local](http://localhost:5173). La [salud de API](http://localhost:3000/api/health), la [documentación OpenAPI](http://localhost:3000/api/docs) y el [panel del emulador](http://localhost:4000) permiten verificar conexiones. Las cuentas del emulador son locales; no se deben usar credenciales personales reales allí.

Para documentos y videollamada, completar las variables de Supabase Storage y LiveKit en `apps/api/.env`. La aplicación informa cuando un servicio aún no está configurado. Las claves de servidor permanecen en la API. Firebase de producción requiere su proyecto real, credencial de servicio, proveedor email/contraseña habilitado y dominios autorizados; producción rechaza explícitamente el emulador.

## Conectar la IA del PC

En este PC puedes hacer doble clic en [Iniciar-IA.cmd](Iniciar-IA.cmd) para arrancar el modelo y su conexión. [Detener-IA.cmd](Detener-IA.cmd) detiene los procesos de StudyRoom. La consola indica cuándo la IA está lista; mantener el PC despierto mientras se use.

```powershell
npm run build -w @studyroom/ai-gateway
.\scripts\local-ai\setup.ps1
.\scripts\local-ai\start.ps1 -Tunnel
.\scripts\local-ai\check.ps1
```

La configuración genera un secreto privado. Copiar el valor de `AI_GATEWAY_SECRET` de `apps/ai-gateway/.env` como `AI_GATEWAY_TOKEN` en el backend. Para el backend local, `AI_GATEWAY_URL=http://127.0.0.1:8787`; para Render, usar la URL HTTPS que muestra el script. Nunca incluir el secreto en una variable `VITE_*`, en Git o en el navegador.

Si ngrok aún no tiene una cuenta configurada, ejecutar `setup.ps1 -ConfigureNgrok`: solicita el authtoken mediante entrada oculta. Un authtoken existente se reutiliza sin mostrarlo. Solo se expone el gateway autenticado; Ollama escucha en loopback con sus funciones cloud desactivadas.

El PC debe permanecer encendido, despierto y conectado. `pause.ps1 -Mode background` aplaza nuevos resúmenes para reservar recursos a la llamada; `-Mode all` pausa toda generación nueva; `-Mode resume` reanuda. `stop.ps1` detiene únicamente los procesos registrados por StudyRoom. Los modelos y datos se conservan.

La [guía de IA](apps/ai-gateway/local-ai.md) documenta autenticación, NDJSON, cancelación, prioridad, errores, límites y verificación. [La evidencia de inferencia local](apps/ai-gateway/model-verification.json) incluye digest, licencia, muestras reales y tiempos. [La evidencia del túnel](apps/ai-gateway/tunnel-verification.json) distingue conexión del agente de una solicitud pública verificada; no son equivalentes.

## Usar StudyRoom

1. Registrarse, completar perfil e intereses y explorar salas. Buscar por tema o aplicar filtros y recomendaciones.
2. Crear una sala pública o privada, definir capacidad (máximo inicial cuatro) y duración. Compartir invitación o programarla para más adelante.
3. Entrar a la sala y conectar la videollamada. Cámara y micrófono se activan cuando tú lo decides. Dispositivos permite escoger entradas/salida y descargar mediciones de calidad.
4. Compartir pantalla. En el menú de la cámara, quien comparte o modera puede activar el puntero/lápiz y borrar señales. Las señales aparecen sobre ese mismo contenido para los demás.
5. Usar chat, levantar la mano, reaccionar, consultar documentos, guardar notas privadas y coordinar el timer de enfoque/descanso. Los anfitriones administran roles y expulsiones.
6. Preguntar en la pestaña del asistente seleccionando qué chat/documentos incluir. `@IA` en el chat solicita ayuda compartida. Las notas privadas no se envían al asistente. Las solicitudes muestran espera, progreso, error o cancelación según el estado real.
7. En **Voz → Transcribir mi voz**, cada participante puede habilitar el reconocimiento de su micrófono. La transcripción conserva las palabras reconocidas, su hablante y tiempos; muestra errores y cobertura parcial. No se captura automáticamente la voz de quien no lo active.
8. Finalizar la sesión y abrir **Mi aprendizaje → Reporte** para consultar y exportar la transcripción, chat, imágenes y documentos compartidos, resumen y puntos clave. En **Consultar este reporte** puedes hacer preguntas privadas sobre esas fuentes. Las notas privadas no forman parte del reporte compartido. El sistema no genera ni muestra cuestionarios.

La [revisión de copias anteriores](docs/legacy-studyroom-review.md) documenta qué se encontró y qué se aprovechó. La voz que nunca se capturó en sesiones antiguas no puede reconstruirse. El reconocimiento automático puede equivocarse; los fallos no se sustituyen por texto inventado. Consulta [el contrato de reportes y voz](docs/session-report-api.md).

## Pruebas y trazabilidad

```powershell
npm run build
npm run typecheck
npm test
node --test tests/api.integration.mjs
node apps/web/tests/browser-smoke.mjs
npm run traceability
```

La integración necesita API, PostgreSQL y Firebase emulator activos. El navegador necesita además la interfaz en el puerto 5173 y Chromium instalado (`npx playwright install chromium`). En Windows, detener la API antes de regenerar Prisma para evitar que el sistema bloquee su motor nativo. No detener el gateway para compilar API.

La [configuración CI](.github/workflows/ci.yml) ejecuta build, tipos, pruebas y auditoría, usa PostgreSQL efímero y el emulador, limita duración y conserva evidencia por tres días. Una ejecución local verde no acredita la ejecución remota del workflow. Mantener el presupuesto de GitHub en cero y ejecutar localmente si se agota el cupo gratuito.

La trazabilidad relaciona las 657 incidencias, sus fuentes, archivos y escenarios. Conserva como pendientes la llamada de 60 minutos con cuatro equipos/redes, TURN y reconexión, carga simultánea de IA, correo real, recuperación operacional completa y cuotas reales. Se probó un [respaldo lógico y restauración aislada](docs/backup-restore.md) de las 13 tablas, con cinco filas existentes y hashes coincidentes; no incluye objetos Storage ni cuentas Firebase. Los resultados automáticos no cierran Jira por sí solos.

## Publicar en Render

La API ya está desplegada en [Render](https://studyroom-sut-api.onrender.com/api/health). La prueba registrada el **2 de octubre de 2026 a las 06:23 UTC** aprobó siete comprobaciones con Firebase real, PostgreSQL de Supabase mediante TLS, subida y descarga firmada de Storage privado, rechazo de descarga pública, token LiveKit autorizado, cierre de sesión y **Render → ngrok público → IA de este PC**, con respuesta guardada. Ver [evidencia final del backend desplegado](docs/verification/cloud-smoke.json). Esta prueba no acredita una llamada prolongada.

[La interfaz publicada](https://studyroom-sut.onrender.com) pasó el recorrido final del navegador a las **06:25 UTC**: seis etapas que comprueban acceso y registro/perfil, recuperación tras una descarga de vista fallida, sala/chat/notas persistidas, temporizador/personas e historial/móvil/teclado. La revisión automatizada de siete vistas/estados detectó cero violaciones en las reglas de accesibilidad inspeccionadas; la cuenta temporal fue eliminada y su sala cerrada. Ver [resultados y capturas del sitio publicado](docs/verification/web-production/README.md) y [evidencia de publicación y planes](docs/verification/deployment.json). Estos ensayos no certifican toda la accesibilidad ni estabilidad de llamadas con dispositivos físicos. [render.yaml](render.yaml) define el Web Service Free y el Static Site. Configurar los secretos en Render; ninguna credencial está incluida en la plantilla.

- Migrar la base con la conexión administrativa y arrancar API con el rol restringido. Supabase Storage usa un bucket privado.
- Configurar Firebase Spark sin emulador y autorizar el dominio real del sitio. Las variables `VITE_FIREBASE_*` son configuración del cliente; las credenciales de servicio son exclusivas de la API.
- Copiar las credenciales LiveKit Build y la URL/token del gateway local a la API. Comprobar desde Render que la IA pública exige autenticación y puede generar una respuesta.
- Mantener `WEB_ORIGIN` y `VITE_API_URL` alineados con las URL reales. Verificar HTTPS, reconexión Socket.IO, cold start y recuperación tras suspensión del servicio gratuito.
- Consultar los paneles antes de aceptar llamadas: márgenes de la aplicación no sustituyen el consumo real del proveedor. No activar facturación, mejoras de plan ni recursos basados solo en créditos temporales.

Los procedimientos de permisos, cola durable, almacenamiento, cuotas y recuperación están en [docs/api.md](docs/api.md). Los contratos compartidos están en [docs/implementation-contract.md](docs/implementation-contract.md). Los requisitos originales permanecen en [docs/jira-requirements.json](docs/jira-requirements.json).
