# IA local de StudyRoom

React solicita la ayuda al backend. El backend valida usuario, sala y contexto, crea el trabajo durable y llama por HTTPS al túnel ngrok. El túnel termina en esta puerta autenticada, que escucha únicamente en `127.0.0.1:8787`. Ollama permanece en `127.0.0.1:11434`. Audio, cámara y pantalla continúan por LiveKit; no atraviesan esta ruta.

El modelo aprobado para la implementación es **qwen3:4b-instruct**, Q4_K_M, aproximadamente 2,5 GB, Apache 2.0. Se eligió la variante instruct tras comprobar que el alias inicial `qwen3:4b` generaba razonamiento interno y agotaba la salida antes de responder con la versión instalada. La elección conserva la familia/tamaño y el presupuesto local. El modelo y su digest medido quedan en `model-verification.json`; no se altera ningún modelo preexistente del usuario.

## Iniciar en Windows

Desde la raíz del proyecto, con Node 22 o superior y dependencias instaladas:

```powershell
npm run build -w @studyroom/ai-gateway
.\scripts\local-ai\setup.ps1
.\scripts\local-ai\start.ps1 -Tunnel
.\scripts\local-ai\check.ps1
```

Ollama debe estar instalado. El script inicia sus procesos ocultos, sin una ventana nueva, con `OLLAMA_NO_CLOUD=1`, concurrencia 1, un modelo cargado, contexto 4096 y cola interna acotada. Descarga el modelo si falta. Si detecta un Ollama que pertenece a otra aplicación, se detiene antes de modificarlo: cerrarlo desde el icono de Ollama permite aplicar los límites de StudyRoom. No cambia servicios, arranque automático, energía, firewall ni DNS del sistema.

ngrok se instaló desde Microsoft Store en el PC de esta implementación. En otro equipo puede instalarse con `winget install ngrok -s msstore`. Se reutiliza un authtoken ya configurado si existe. Si falta, ejecutar `setup.ps1 -ConfigureNgrok`; la entrada del authtoken es oculta y el archivo queda privado. El inicio usa un túnel HTTP normal, el dominio de desarrollo asignado y `--inspect=false`. No contrata AI Gateway, dominios ni Traffic Policies.

`start.ps1 -Tunnel` muestra la URL HTTPS y la guarda en `.local/public-url.json`. Guardar esa URL como `AI_GATEWAY_URL` en Render y copiar allí el valor de `AI_GATEWAY_SECRET` de `.env`, **solo en el backend**. El navegador no recibe el secreto. Los archivos `.env`, `.local`, credenciales y logs están excluidos de Git. El script aplica permisos de archivo restringidos al usuario Windows actual.

Para detener: `scripts/local-ai/stop.ps1`. Para detener solamente el túnel: añadir `-TunnelOnly`. Se verifica identificador, ruta y hora de inicio antes de parar cada proceso. No se eliminan modelos ni datos.

## Contrato de integración

`GET /health` devuelve únicamente `{status:"ok"}`. `GET /v1/health` requiere `Authorization: Bearer <secreto>` y devuelve disponibilidad del modelo, digest, cola, memoria libre y uso aproximado. No usar sondeos frecuentes desde Internet: consumen la cuota de ngrok.

`POST /v1/generate`, con el mismo encabezado y `Content-Type: application/json`:

```json
{"prompt":"Pregunta con contexto autorizado","system":"Instrucción del tutor","maxTokens":512,"stream":false,"priority":"interactive"}
```

La respuesta es `{text,model,usage:{inputTokens,outputTokens,totalDurationMs,tokensPerSecond,firstTokenMs}}`. El backend debe guardar procedencia del contexto, resultado y estado del trabajo. No enviar claves, notas privadas de otros usuarios ni documentos fuera de la sala autorizada. No se ejecutan herramientas sugeridas por el modelo.

Con `stream:true`, la respuesta es NDJSON:

```json
{"type":"delta","text":"Primera parte"}
{"type":"delta","text":" de la respuesta."}
{"type":"done","model":"qwen3:4b-instruct","usage":{"inputTokens":40,"outputTokens":20,"totalDurationMs":900,"tokensPerSecond":70,"firstTokenMs":150}}
```

Una desconexión o cancelación aborta la solicitud a Ollama y libera la cola. Si falla después de comenzar el flujo se emite `{type:"error",code,message,retryAfter?}`. La aplicación no debe tratar los fragmentos anteriores como una respuesta completa. No se transmiten campos de razonamiento interno. El cliente requiere el evento `done` para confirmar éxito.

| Código | HTTP | Comportamiento del backend |
|---|---:|---|
| UNAUTHORIZED | 401 | Corregir el secreto; no reintentar repetidamente |
| INVALID_INPUT / INVALID_JSON | 400 | Corregir datos |
| CONTEXT_TOO_LONG / BODY_TOO_LARGE | 413 | Dividir contexto, conservar referencias |
| RATE_LIMIT / QUEUE_FULL | 429 | Esperar `Retry-After`; mantener trabajo pendiente |
| QUOTA_EXCEEDED | 429 | Esperar/revisar cuota; ninguna API de pago |
| AI_OFFLINE / MODEL_NOT_READY / AI_BUSY | 503 | Reintento limitado con espera progresiva |
| AI_PAUSED / LOW_MEMORY | 503 | Esperar a liberar recursos del PC |
| QUOTA_STORAGE_UNAVAILABLE | 503 | Revisar espacio/permisos del registro de cuotas; no se admite nueva inferencia sin persistencia |
| AI_TIMEOUT | 504 | Ofrecer cancelación o reintento |
| INVALID_UPSTREAM / OUTPUT_LIMIT | 502 | No publicar un resultado incompleto |

El backend mantiene la cola durable PostgreSQL. Esta cola local es solo un límite de concurrencia y no conserva consultas al reiniciar; los trabajos se recuperan en el backend.

## Límites y llamada

- Modelo fijo en código; no se aceptan parámetros de URL, modelo, archivos, herramientas ni rutas de administración.
- Una inferencia activa, hasta 8 en espera, preguntas por delante de trabajos secundarios con un turno de fondo después de tres interactivas para evitar espera indefinida.
- Cuerpo máximo 16 KiB. Salida máxima 1024 tokens. Contexto de 4096 tokens. La suma de bytes UTF-8 de `prompt + system`, tokens máximos de salida y reserva de plantilla de 256 debe caber en 4096. Es una cota deliberadamente conservadora, no un conteo del tokenizador. Nunca se trunca contexto en silencio.
- 12 generaciones/minuto, 120 segundos máximos incluyendo cola, dos hilos CPU, memoria libre mínima de 2 GB, modelo descargado de memoria tras 60 segundos inactivo.
- `pause.ps1 -Mode background` aplaza nuevas generaciones secundarias durante la llamada; `-Mode all` aplaza todas, `-Mode resume` reanuda. La escasez de RAM también impide nuevas generaciones. Una inferencia en curso se cancela desde la aplicación.
- Contadores mensuales durables de solicitudes, entrada/salida y tokens; reserva de respuesta antes de admitir trabajo para impedir sobreasignación. Tras una caída, las reservas pendientes se cobran conservadoramente como bytes enviados. Nunca se registran prompts, respuestas ni secretos en logs.
- El reemplazo atómico del registro reintenta bloqueos breves de archivo en Windows. Si persiste el fallo, la salud muestra `persistenceHealthy:false` y se rechazan nuevas generaciones; un fallo de limpieza de reserva no derriba el servidor. Al poder escribir nuevamente, se guardan los contadores acumulados antes de reanudar.
- Umbral local máximo 18.000 solicitudes y 900 MB/mes, por debajo de 20.000 y 1 GB de ngrok Free. Alerta al 80%. Un vigilante local detiene el túnel al alcanzar el umbral sin consumir solicitudes HTTP adicionales.

Los contadores incluyen tráfico que llega a esta puerta y una estimación de cabeceras; no son el sistema de facturación de ngrok ni cubren otros túneles o tráfico detenido antes del PC. Revisar el panel del proveedor y mantener el plan Free. Estos controles no prometen uso ilimitado. El PC debe seguir encendido, despierto y conectado; una suspensión interrumpe IA, mientras los medios LiveKit tienen su propia conexión.

## Verificación

`npm test -w @studyroom/ai-gateway` ejecuta pruebas de autenticación, validación, límites de modelo/contexto, streaming, caída del motor, respuesta inválida, timeout, cuota persistente, prioridad, cancelación y pausa.

`scripts/local-ai/verify.ps1` ejecuta inferencia real y guarda muestras de español, resumen fiel, quiz, tiempos y GPU en `model-verification.json`. `verify.ps1 -PublicTunnel` repite por la URL pública y guarda `tunnel-verification.json`. La comprobación de español/fidelidad debe revisarse manualmente; tres muestras no constituyen una evaluación estadística.

`node scripts/local-ai/verify-public.mjs` comprueba el túnel HTTPS público: acceso privado sin credencial rechazado (401), salud autenticada y respuesta NDJSON completa. Incluye reintento limitado frente a un fallo de DNS transitorio. Esta verificación pasó en el PC y quedó registrada en `tunnel-verification.json`.

La aceptación de estabilidad exige además una llamada de 60 minutos con cuatro dispositivos/redes reales, IA trabajando, métricas WebRTC, reconexión y TURN/TLS. Las pruebas unitarias y la velocidad local no demuestran por sí solas la fluidez de esa llamada. Ver matriz de requisitos del proyecto.

Fuentes oficiales consultadas: [Ollama chat](https://docs.ollama.com/api/chat), [controles de recursos y modo local](https://docs.ollama.com/faq), [qwen3:4b-instruct](https://ollama.com/library/qwen3:4b-instruct), [ngrok Free](https://ngrok.com/docs/pricing-limits/free-plan-limits), [CLI ngrok](https://ngrok.com/docs/gateway/agent/cli).
