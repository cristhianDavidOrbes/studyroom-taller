# Verificación del reporte de sesión

La implementación conserva las palabras reconocidas por participante y tiempo, el chat y los recursos compartidos; el reporte permite buscar, exportar y hacer preguntas privadas sobre sus fuentes. Para registrar voz, cada participante activa **Voz → Transcribir mi voz** con su micrófono encendido. Al terminar se consulta desde **Mi aprendizaje → Reporte**.

Las comprobaciones utilizan cuentas y archivos de prueba propios. No se capturó el micrófono, escritorio ni archivos personales del usuario.

- [Voz local y túnel público](../../../apps/ai-gateway/speech-verification.json): Whisper real reconoce una frase española sintética y devuelve palabras con tiempos.
- [OCR real](ocr.json): lectura local del texto de una imagen generada de prueba.
- [API y preguntas](../session-report-api.json): consentimiento, identidad, idempotencia, pérdidas, cierre, aislamiento de reportes/archivos, extracción y errores de generación.
- [Base y permisos](database.json): migraciones aplicadas, RLS y ausencia de lectura directa desde roles públicos; índices para consultas de reporte.
- [Storage privado](storage.json): formatos permitidos, incluido DOCX, y límite de tamaño.

El reconocimiento automático puede equivocarse. No se recupera audio anterior que nunca fue capturado; la cobertura identifica pendientes, pérdidas y participantes sin voz registrada. El OCR reconoce texto, sin prometer comprensión visual de fotos. Las cuotas gratuitas y el equipo local condicionan disponibilidad de IA; la llamada de LiveKit funciona por separado. Una prueba sintética con dos navegadores no certifica una llamada prolongada con cuatro dispositivos y redes físicas.
