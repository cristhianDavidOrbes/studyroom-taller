# Guion de presentación de StudyRoom

**Duración objetivo:** 7 a 8 minutos, a un ritmo normal y con pausas breves para mostrar la pantalla.
**Antes de exponer:** abrir el repositorio académico y la aplicación; tener preparadas dos cuentas de prueba, una sala y un reporte de demostración creado con datos de prueba. Probar antes el micrófono, la cámara, LiveKit y la IA local. Si un servicio externo no responde, mostrar las pruebas y explicar el límite sin simular una sesión exitosa.

## 0:00–0:50 — Problema y usuarios

**Mostrar:** portada de StudyRoom y `docs/entrega-final/necesidad-y-clases.md`.

**Decir:** «Buenos días. Mi proyecto se llama StudyRoom. Parte de una necesidad concreta: cuando un grupo estudia a distancia, no basta con abrir una videollamada. También necesita compartir materiales y poder recuperar después qué se dijo, qué se escribió y qué archivos se enviaron. Si esa información queda separada, es difícil reconstruir una explicación o encontrar un recurso. Los usuarios principales son los estudiantes que participan en la sala y el anfitrión que la organiza. Antes de escribir requisitos, separé esa necesidad de las peticiones visibles, como “poner un botón” o “agregar IA”. Esa distinción fue una idea central de la clase sobre necesidades de usuarios.»

## 0:50–1:45 — Alcance y reglas

**Mostrar:** `specs/001-studyroom-reporte/spec.md` y la constitución.

**Decir:** «El alcance de esta entrega está escrito en una especificación con dieciséis requisitos verificables. Incluye acceso, salas, mensajes, archivos, videollamada, transcripción, reporte cronológico y preguntas a la IA. Las reglas más importantes están expresadas como condiciones: una persona debe estar autorizada para ver un reporte; la edad se calcula y valida en el servidor para cada sala; una sesión cerrada no acepta actividad nueva; y nunca se rellenan con palabras inventadas los fragmentos de audio que no se capturaron. También definí lo que queda fuera: cuestionarios, pagos, una app móvil nativa y la instalación obligatoria de una herramienta de dibujo. Esto evita que el proyecto crezca sin una decisión explícita.»

## 1:45–2:45 — Arquitectura de la aplicación web

**Mostrar:** tabla de arquitectura en `plan.md` y carpetas `apps/web`, `apps/api`, `apps/ai-gateway`.

**Decir:** «La interfaz está hecha con React, TypeScript y Vite. La API usa NestJS y aplica reglas y autorizaciones. PostgreSQL guarda usuarios, salas, mensajes, sesiones y transcripciones mediante Prisma; los archivos originales se almacenan de forma privada en Supabase. Firebase maneja la identidad y LiveKit transporta cámara, audio y pantalla. La IA se ejecuta en un computador local: el backend llega a un gateway autenticado por un túnel HTTPS de ngrok. Esta separación importa porque el navegador no debe tener claves del servidor. En clase vimos el recorrido de la interfaz al dato. Aquí una acción de la interfaz llega a la API, se valida, se guarda y solo entonces se anuncia a otros participantes. El resultado se comprueba leyendo otra vez el recurso, no solo viendo un mensaje de éxito.»

## 2:45–3:40 — Demostración de sala y comunicación

**Mostrar:** inicio de sesión, catálogo y sala preparada. Con la segunda cuenta enviar un mensaje, enlace y archivo.

**Decir:** «Ahora entro como participante. El catálogo muestra las salas a las que puedo acceder. Una sala puede definir capacidad, privacidad y edad mínima; la validación importante ocurre nuevamente en la API. Dentro de la sala, los mensajes, enlaces y archivos nuevos se reflejan sin recargar la página. Para eso se usan eventos en tiempo real, pero PostgreSQL sigue siendo la fuente de verdad: si hay una desconexión, el cliente recupera el estado guardado. La videollamada es un servicio separado de estos datos. Si el servicio de medios falla, la interfaz debe informar el problema y no aparentar que hay conexión.»

## 3:40–4:45 — Reporte cronológico

**Mostrar:** cerrar la sesión de prueba, abrir «Reportes» y recorrer la línea de tiempo.

**Decir:** «Este es el resultado principal. El reporte combina en una sola cronología la voz reconocida, el chat, los enlaces, las imágenes y los documentos. El orden usa el momento en que ocurrió cada evento. Esto evita que una frase aparezca al final solo porque el modelo tardó en transcribirla. Cada fragmento de voz conserva el nombre del hablante y su intervalo; cada archivo conserva quién lo compartió y cuándo. La transcripción es el resultado del reconocimiento automático, no una garantía de exactitud literal. Si se pierde audio, el reporte indica el hueco. Si se elimina un archivo, mantiene la referencia histórica, pero señala que el original ya no está disponible.»

## 4:45–5:40 — Word, ZIP e IA

**Mostrar:** descargar el ZIP de prueba, abrir el Word y la carpeta `adjuntos`; luego mostrar una pregunta al reporte.

**Decir:** «La exportación genera un ZIP con un documento Word y los adjuntos disponibles, numerados en el orden de envío. En el Word aparecen la conversación y los enlaces a los archivos incluidos; las imágenes pueden verse dentro del documento. Si falla la recuperación de un original disponible, el backend no entrega un ZIP incompleto. Después puedo preguntar a la IA sobre el reporte. La respuesta utiliza solo las fuentes a las que tengo permiso: voz, chat, enlaces, texto extraído de documentos e imágenes y síntesis compartida. Las notas privadas no forman parte de ese contexto. La IA depende de que el computador anfitrión y su túnel estén encendidos; si no lo están, el reporte guardado sigue siendo consultable.»

## 5:40–6:40 — HTTP, seguridad y calidad

**Mostrar:** `docs/entrega-final/trazabilidad.md`, una prueba de autorización y el panel Network si hay demo en vivo.

**Decir:** «Las clases de HTTP me ayudaron a interpretar la evidencia: una petición puede devolver 200 y aun así no haber guardado el cambio, por lo que verifico el estado después. Distingo 401, cuando falta identidad, de 403, cuando la persona está identificada pero no tiene permiso. HTTPS protege la comunicación, pero no reemplaza las reglas de acceso. Por eso la API comprueba membresía antes de entregar reportes o archivos privados. Los nombres de archivo y los límites de tamaño también se validan antes de crear el ZIP. En la interfaz, los errores se comunican sin mostrar secretos ni detalles internos.»

## 6:40–7:40 — Proceso SDD, pruebas y cierre

**Mostrar:** constitución, `spec.md`, `plan.md`, `tasks.md`, `verificacion.md` y el pull request académico.

**Decir:** «Para organizar el trabajo utilicé Spec-Driven Development con GitHub Spec Kit. La constitución fija reglas transversales; la especificación define qué debe hacer el sistema; el plan explica cómo encaja en la arquitectura; y las tareas muestran qué se verificó y qué sigue pendiente. La copia compila, pasa tipos y supera 198 pruebas unitarias: 26 de IA, 118 de API y 54 de web. Además, pasaron 18 escenarios de integración con Firebase Auth emulado y PostgreSQL local. Eso demuestra aspectos concretos del código, pero no reemplaza una prueba completa con dos dispositivos o una llamada de sesenta minutos. Esas limitaciones están escritas y no las presento como completadas. Las funcionalidades nuevas se desarrollaron en ramas separadas y se integraron por pull requests revisables, sin alterar el proyecto original. En conclusión, StudyRoom conecta la colaboración en vivo con un reporte consultable, y la entrega muestra tanto el producto como la evidencia y los límites de su verificación. Muchas gracias.»

## Respuestas breves para preguntas

- **¿Por qué no basta un 200?** Porque confirma la respuesta de una petición, no necesariamente que el dato quedó persistido o apareció correctamente al volver a consultar.
- **¿Por qué la edad se valida en la API?** Ocultar una sala en la interfaz no impide que alguien llame la API directamente.
- **¿La transcripción es exacta?** Conserva exactamente lo reconocido por el modelo, pero el modelo puede equivocarse o perder intervalos.
- **¿Qué ocurre si se apaga la IA local?** Las funciones nuevas de IA quedan indisponibles; el reporte ya guardado sigue visible.
- **¿Se ha probado una llamada de 60 minutos con cuatro equipos?** No en esta entrega. Está registrada como validación pendiente y no se deduce de las pruebas unitarias.
