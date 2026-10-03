# Verificación del reporte de sesión

La implementación conserva las palabras reconocidas por participante y tiempo, el chat y los recursos compartidos; el reporte permite buscar, exportar y hacer preguntas privadas sobre sus fuentes. La transcripción se prepara automáticamente para cada participante al entrar y registra su micrófono cuando está encendido, con indicador visible y control para pausar. Al terminar se consulta desde **Mi aprendizaje → sesión**. La descarga completa incluye una página HTML y los originales disponibles; no hay cuestionarios.

Las comprobaciones utilizan cuentas y archivos de prueba propios. No se capturó el micrófono, escritorio ni archivos personales del usuario.

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
