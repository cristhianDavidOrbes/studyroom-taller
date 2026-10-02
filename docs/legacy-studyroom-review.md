# Revisión de las copias anteriores de StudyRoom

Revisión del 2 de octubre de 2026. Se buscaron carpetas y proyectos con el nombre StudyRoom, manifiestos de aplicaciones y archivos relacionados en las ubicaciones accesibles del disco C:, incluyendo el perfil, Escritorio, Descargas, Documentos y temporales. Algunas carpetas protegidas del sistema no permiten lectura. Se inspeccionó código y documentación; no se ejecutaron aplicaciones antiguas ni se abrieron bases de datos, adjuntos de usuarios o secretos de esas copias.

| Copia | Resultado relevante |
|---|---|
| `C:\Users\crist\.gemini\antigravity\scratch\studyroom` | Tiene pantallas y estructuras de transcripción/reporte. `useHandySTT.ts` usa Web Speech API del navegador; el proveedor local `transcribeAudio()` devuelve texto vacío y no hay emisor de audio conectado desde la interfaz. El camino Gemini requiere un proveedor externo. No es una integración local completa de voz. |
| `C:\Users\crist\Desktop\studyroom-mvp-fixed.html` | Prototipo HTML sin SpeechRecognition, MediaRecorder, Whisper ni integración de transcripción. |
| `C:\Users\crist\Downloads\studyroom-mvp-fixed.html` | Copia idéntica del HTML del Escritorio. SHA-256 de ambas: `1d31586078b24d58150f422dc2ff6cf3fa7051d3666f6d1922b262e7e0131798`. |
| Arquitectura y entregables anteriores en `Documents\Codex\2026-09-08` | Documentación y planificación; no aportan una aplicación adicional con speech-to-text. |
| `StudyRoom-Herramientas` del Escritorio | Herramienta de dibujo publicada para Windows; no es un motor de transcripción. |

La copia antigua aportó la organización por sesión, hablante y tiempo y la presentación histórica de reportes. Se implementó el reconocimiento local real en el proyecto actual, con Whisper, audio del micrófono propio, consentimiento, palabras con tiempos, autorización por sesión y estados de cobertura. No se reutilizaron endpoints sin autenticación, deduplicación que eliminaba frases repetidas ni reportes genéricos que afirmaban haber registrado audio inexistente.

El reporte actual conserva transcripción reconocida, chat y registros de archivos/imágenes; extrae texto de PDF, DOCX, texto e imágenes compatibles mediante OCR local. La síntesis y las preguntas usan esas fuentes verificables. Una conversación anterior cuyo audio nunca se capturó no puede recuperarse a partir de estas copias.

Evidencia de voz real: [speech-verification.json](../apps/ai-gateway/speech-verification.json). Evidencia de OCR: [ocr.json](verification/session-report/ocr.json). Contrato de reportes: [session-report-api.md](session-report-api.md).
