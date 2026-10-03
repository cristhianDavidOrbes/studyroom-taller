# Verificación del reporte de sesión

La implementación conserva las palabras reconocidas por participante y tiempo, el chat y los recursos compartidos; el reporte permite buscar, exportar y hacer preguntas privadas sobre sus fuentes. La transcripción se prepara automáticamente para cada participante al entrar y registra su micrófono cuando está encendido, con indicador visible y control para pausar. Al terminar se consulta desde **Mi aprendizaje → sesión**. La descarga completa incluye una página HTML y los originales disponibles; no hay cuestionarios.

Las comprobaciones utilizan cuentas y archivos de prueba propios. No se capturó el micrófono, escritorio ni archivos personales del usuario.

## Publicación actual — 2026-10-02, hora de Bogotá

[release.json](release.json) identifica los commits publicados por componente y su verificación en GitHub Actions. [production-api.json](production-api.json) recoge 17 comprobaciones del sitio público con dos participantes de prueba, Firebase, LiveKit, la API de Render, almacenamiento privado, Whisper, OCR y Qwen locales a través de ngrok.

Ambos participantes activan automáticamente su transcripción al entrar a la sala, sin abrir Voz ni confirmar un diálogo. Cada uno publica un micrófono sintético mediante una sola solicitud de audio. Se comprueban palabras y tiempos, idempotencia y orden cronológico aunque un fragmento posterior llegue primero. El reporte completo es accesible para ambos; un usuario ajeno no puede verlo. Las consultas personales permanecen privadas. La activación automática mantiene un indicador y un control para pausar, y respeta el permiso de micrófono del navegador.

El mismo recorrido verifica imágenes y documentos originales, OCR y texto extraído, resumen, puntos clave y preguntas con IA. El ZIP descargado por el segundo participante conserva los originales byte por byte, la conversación completa y los tiempos por palabra. Su página funciona sin recursos externos; las referencias del resumen son legibles tanto allí como en la aplicación. No existen cuestionarios ni rutas activas para generarlos o responderlos.

Las capturas `production-desktop.png`, `production-mobile.png` y `offline-report-*.png` corresponden a este recorrido real. `landing-*.png` y `setup-desktop.png` muestran la portada y el acceso inicial publicados. La descarga del instalador se comprueba por firma de archivo y SHA256, sin ejecutarlo: descargarlo no desbloquea el acceso; la detección de la herramienta instalada sí lo hace. En este navegador aislado la salud de la herramienta nativa se simula con una respuesta HTTP identificada como tal; la [verificación del instalador](../desktop-installer.json) conserva el alcance de sus 50 comprobaciones separadas.

[automatic-transcription-browser.json](automatic-transcription-browser.json) añade ocho comprobaciones aisladas del hook real para activación automática, pausa y respuestas antiguas entre salas. Los registros `production-api-first.json` y `production-api-second.json`, si están presentes, son intentos históricos fallidos previos a los arreglos; el resultado vigente es exclusivamente `production-api.json`. Las cuentas y archivos generados por la prueba se retiran al terminar, conservando únicamente registros históricos sintéticos.

## Evidencia histórica y comprobaciones de componentes

- [Voz local y túnel público](../../../apps/ai-gateway/speech-verification.json): Whisper real reconoce una frase española sintética y devuelve palabras con tiempos.
- [OCR real](ocr.json): lectura local del texto de una imagen generada de prueba.
- [API y preguntas](../session-report-api.json): consentimiento, identidad, idempotencia, pérdidas, cierre, aislamiento de reportes/archivos, extracción y errores de generación.
- [Base y permisos](database.json): migraciones aplicadas, RLS y ausencia de lectura directa desde roles públicos; índices para consultas de reporte.
- [Storage privado](storage.json): formatos permitidos, incluido DOCX, y límite de tamaño.
- [Dos navegadores y servicios reales](browser.json): ocho verificaciones de voz, llamada, reporte, recursos y preguntas privadas.
- [Estados de interfaz aislados](ui-fixture.json): seis verificaciones adicionales de búsquedas, referencias legibles, errores honestos, privacidad y móvil.

El reconocimiento automático puede equivocarse. No se recupera audio anterior que nunca fue capturado; la cobertura identifica pendientes, pérdidas y participantes sin voz registrada. El OCR reconoce texto, sin prometer comprensión visual de fotos. Las cuotas gratuitas y el equipo local condicionan disponibilidad de IA; la llamada de LiveKit funciona por separado. Una prueba sintética con dos navegadores no certifica una llamada prolongada con cuatro dispositivos y redes físicas.

## Browser evidence — 2026-10-02

Esta sección conserva evidencia histórica del flujo anterior de activación manual. No prueba el cambio posterior a activación automática ni el nuevo instalador. Las verificaciones de publicación y del nuevo flujo se documentan por separado; no se reinterpretan las capturas antiguas como pruebas actuales.

`browser.json` records **eight passing checks against real services** using two isolated headless Chromium contexts. The application used the local API, PostgreSQL, Firebase Auth emulator, the configured LiveKit SFU, local Whisper speech recognition, private document storage, OCR and the local report-question model. The generated Spanish SAPI microphone, animated camera/canvas screen and PNG/text attachments were synthetic. No personal microphone, camera, desktop or files were captured.

The checks cover explicit voice consent, the published microphone reaching speech recognition with word timestamps, transcript delivery to another participant, one microphone request while camera/screen keep moving, consent revocation from another tab, opt-out with the call preserved, historical transcript/chat search, a completed private report question hidden from the other participant, and authorized stored resource previews on desktop/mobile. The actual recognizer returned 76 words from the repeated synthetic phrase. Recognition starts at the current microphone position and can contain errors; this is not evidence of perfect transcription or voices from participants who did not enable it.

`report-desktop.png` and `report-mobile.png` show that real session report. The PNG preview and its recognized-text section are visible; the text attachment supplies the independently checked phrase about base and height. The dedicated `ocr.json` records the OCR endpoint result. The automatic summary/key-points/quiz jobs were still waiting in these screenshots; the real-service browser test proves completion of the private report question, not completion of those three jobs. The API's separate tests and evidence cover their scheduling and context.

`ui-fixture.json` records **six separate UI checks** with real emulator login and test-only HTTP report/job/resource fixtures: original-word search and speaker filtering, safe escaped text, private image preview plus honest partial/unavailable resource notices, hidden identifiers in streamed question progress, readable authorized references that reveal filtered/paginated original sources, clearing across report navigation, and a 390-pixel layout without horizontal overflow. Navigation was checked beyond 100 interventions, 100 messages and 20 documents. These fixtures do not certify speech recognition, stored access or AI generation. Their two screenshots are named `ui-fixture-desktop.png` and `ui-fixture-mobile.png`.

The web build, strict TypeScript validation and **36 frontend unit tests** passed after the clock, remote-consent and readable-source fixes. Audio tests exercise PCM/WAV encoding, continuous resampling, the actual public Worklet processor, silence omission, bounded upload order/overflow/expiry, microphone reuse and cleanup. Consent tests cover new/equal/stale server timestamps. Eight source/component checks cover authorized intersection, exact IDs, accented/NFD aliases, unknown and incomplete references, references without brackets, preserved ordinary notes, room categories and escaped text/local anchors. The scripts live in `apps/web/tests/session-report.mjs` and `apps/web/tests/report-ui.mjs`.

The eight real-service checks and their screenshots preceded the citation-display change. Their source identifiers remain visible in the older real-service screenshot; the updated six-check UI evidence shows the final readable labels and navigation. The display change did not alter speech capture, media transport or the backend question request; those services were not unnecessarily rerun.

The desktop bridge in the real browser script is exclusively an HTTP 204 fixture. These tests do not certify native desktop drawing, physical hardware, Firefox media capture, production deployment, long calls or adverse network conditions. The report test creates and cleans up only its own test accounts/room/attachments; deletion is best effort, and historical rows may remain as synthetic records.

Other files in this directory (`database.json`, `storage.json`, `ocr.json`) were recorded by the corresponding backend/platform checks. No credentials, private resource URLs or personal transcript appear in the browser evidence.
