# IA local de StudyRoom

React solicita la ayuda al backend. El backend valida usuario, sala y contexto, crea el trabajo durable y llama por HTTPS al túnel ngrok. El túnel termina en esta puerta autenticada, que escucha únicamente en `127.0.0.1:8787`. Ollama permanece en `127.0.0.1:11434`. La llamada, cámara y pantalla continúan por LiveKit. Para la transcripción consentida se envían fragmentos del micrófono propio por la API al reconocimiento de voz local; el navegador nunca recibe el secreto del túnel.

El modelo aprobado para la implementación es **qwen3:4b-instruct**, Q4_K_M, aproximadamente 2,5 GB, Apache 2.0. Se eligió la variante instruct tras comprobar que el alias inicial `qwen3:4b` generaba razonamiento interno y agotaba la salida antes de responder con la versión instalada. La elección conserva la familia/tamaño y el presupuesto local. El modelo y su digest medido quedan en `model-verification.json`; no se altera ningún modelo preexistente del usuario.

## Iniciar en Windows

Desde la raíz del proyecto, con Node 22 o superior y dependencias instaladas:

```powershell
npm run build -w @studyroom/ai-gateway
.\scripts\local-ai\setup.ps1
.\scripts\local-ai\setup-speech.ps1
.\scripts\local-ai\start.ps1 -Tunnel
.\scripts\local-ai\check.ps1
```

Ollama debe estar instalado. El script inicia sus procesos ocultos, sin una ventana nueva, con `OLLAMA_NO_CLOUD=1`, concurrencia 1, un modelo cargado, contexto 4096 y cola interna acotada. Descarga el modelo si falta. Si detecta un Ollama que pertenece a otra aplicación, se detiene antes de modificarlo: cerrarlo desde el icono de Ollama permite aplicar los límites de StudyRoom. No cambia servicios, arranque automático, energía, firewall ni DNS del sistema.

ngrok se instaló desde Microsoft Store en el PC de esta implementación. En otro equipo puede instalarse con `winget install ngrok -s msstore`. Se reutiliza un authtoken ya configurado si existe. Si falta, ejecutar `setup.ps1 -ConfigureNgrok`; la entrada del authtoken es oculta y el archivo queda privado. El inicio usa un túnel HTTP normal, el dominio de desarrollo asignado y `--inspect=false`. No contrata AI Gateway, dominios ni Traffic Policies.

`start.ps1 -Tunnel` muestra la URL HTTPS y la guarda en `.local/public-url.json`. Guardar esa URL como `AI_GATEWAY_URL` en Render y copiar allí el valor de `AI_GATEWAY_SECRET` de `.env`, **solo en el backend**. El navegador no recibe el secreto. Los archivos `.env`, `.local`, credenciales y logs están excluidos de Git. El script aplica permisos de archivo restringidos al usuario Windows actual.

Para detener: `scripts/local-ai/stop.ps1`. Para detener solamente el túnel: añadir `-TunnelOnly`. Se verifica identificador, ruta y hora de inicio antes de parar cada proceso, incluido el reconocedor de voz. No se eliminan modelos ni datos.

## Speech-to-text local

`setup-speech.ps1` crea un entorno Python aislado en `.local/speech/venv`, instala `faster-whisper==1.2.1` y descarga el modelo MIT `Systran/faster-whisper-small`, revisión `536b0662742c02347bc0e980a01041f333bce120`, una sola vez. Esta instalación fijada requiere **Python 3.12 de 64 bits en Windows**, la combinación comprobada en este PC. Aunque faster-whisper admite versiones anteriores, NumPy 2.5.3 y PyAV 19.0.0 exigen Python 3.12 o posterior; no se prometen otras versiones sin verificar sus paquetes binarios. El script comprueba la versión antes de crear el entorno y vuelve a comprobarla si ya existe, antes de instalar paquetes. Un entorno incompatible no se borra automáticamente; debe recrearse con Python 3.12, conservando el modelo que reside en otra carpeta. El modelo multilingüe usa CPU int8 con dos hilos. La instalación consulta PyPI/Hugging Face; el reconocimiento posterior funciona con archivos locales y modo offline. No instala CUDA ni solicita suscripciones.

`Iniciar-IA.cmd` inicia también el trabajador en `127.0.0.1:8788`, oculto y autenticado. Este puerto no se publica: ngrok expone únicamente la puerta `8787`. Si la instalación falta, la IA de texto puede continuar y la transcripción devuelve indisponibilidad explícita. Ni audio ni texto reconocido se guardan en archivos temporales o registros de este trabajador; la API decide la persistencia autorizada de la transcripción.

`POST /v1/transcribe` requiere Bearer y `application/json`:

```json
{"audioBase64":"<WAV base64>","mimeType":"audio/wav","language":"es"}
```

Solo acepta WAV PCM16 mono a 16000 Hz, de 0,1 a 30 segundos (máximo 960256 bytes binarios, 1281000 bytes JSON). `language` puede ser `es`, `en` o `auto`; por defecto es `es`. Se rechazan URLs, formatos comprimidos, campos de modelo, instrucciones y muestras malformadas. El backend remite audio validado del participante autorizado, sin claves ni nombres al reconocedor.

La respuesta contiene `{text,language,durationMs,model:"faster-whisper-small",segments:[{startMs,endMs,text,words:[{startMs,endMs,word,probability}]}]}`. Estos tiempos se refieren al fragmento y la API los sitúa en la sesión. `task:"transcribe"` conserva el idioma original: no resume, traduce ni crea una intervención ficticia. La voz es reconocimiento automático y puede contener errores, especialmente con solapamiento, ruido o palabras técnicas; la probabilidad no garantiza exactitud. Un fragmento sin voz produce texto vacío y ningún segmento. La transcripción no contiene identificación automática de hablantes: la API atribuye cada micrófono al participante autenticado.

La transcripción y Qwen comparten una sola ranura de inferencia; como máximo se conservan cuatro solicitudes de voz entre activas y pendientes para admitir una sala de cuatro participantes sin ejecutar cuatro modelos a la vez. El trabajador también rechaza inferencia simultánea. Las pausas y memoria mínima existentes se aplican al reconocimiento. El tiempo máximo de puerta es 120 s; un timeout/desconexión deja el resultado fallido, sin texto inventado. El trabajador conserva su bloqueo hasta terminar la operación nativa que ya comenzó; no ofrece una cancelación inmediata del cálculo CTranslate2.

Los fragmentos cuentan en los mismos límites gratuitos de transferencia y solicitudes de ngrok. El audio PCM consume más transferencia que el texto: el plan gratuito no ofrece transcripción ilimitada. Se omite silencio en el cliente y se respeta el cupo, sin subir a un plan de pago. La conversación por LiveKit no espera al reconocimiento y continúa si el PC, modelo o túnel están apagados.

Errores adicionales: `ASR_OFFLINE` (503), `ASR_BUSY` (429 o 503), `ASR_TIMEOUT` (504), `INVALID_AUDIO` (400), `INVALID_ASR_RESULT` (502). La API debe conservar estado fallido/pendiente y distinguir cobertura parcial de una transcripción completa. `GET /v1/health` incluye `speech.ready`, modelo, pendientes y duración máxima; sigue siendo privado.

Prueba real sin acceder al micrófono: `scripts/local-ai/verify-speech.ps1` sintetiza una frase de comprobación con la voz de Windows en un WAV local, llama a la puerta autenticada y exige palabras y tiempos. Las pruebas unitarias del gateway y `python -m unittest discover -s apps/ai-gateway/speech -p test_worker.py` cubren formatos, límites, autenticación, Host/Origin, cola, fallos y resultado inválido. La voz sintética solo acredita el camino técnico; no certifica fidelidad en toda conversación humana.

Fuentes: [faster-whisper oficial](https://github.com/SYSTRAN/faster-whisper), [modelo small y licencia](https://huggingface.co/Systran/faster-whisper-small), [paquete publicado](https://pypi.org/project/faster-whisper/1.2.1/).

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
