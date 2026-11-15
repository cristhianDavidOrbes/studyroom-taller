# Plan técnico: colaboración y reporte de StudyRoom

**Rama de documentación:** `docs/artefactos-sdd-entrega`. Las funcionalidades se integraron desde ramas `feature/*` mediante PR separados; ver `docs/entrega-final/flujo-git.md`.
**Fecha:** 2026-11-15
**Especificación:** [spec.md](spec.md)

## Resumen

StudyRoom es un proyecto existente. El incremento académico formaliza y verifica acceso, sala, archivos, transcripción, reporte Word/ZIP y consulta a IA. Conserva la arquitectura actual; cualquier corrección requiere un requisito identificable y una prueba de regresión. La documentación no convierte código heredado en funcionalidad verificada.

## Contexto técnico

| Capa | Implementación actual | Responsabilidad |
|---|---|---|
| Interfaz | React 18, TypeScript, Vite, React Query | Formularios, sala, carga/error, cronología y descarga |
| Identidad | Firebase Authentication | Identidad del usuario; la API verifica token y permisos |
| API | NestJS, TypeScript, Socket.IO | Reglas, validaciones, eventos y HTTP coherente |
| Datos | PostgreSQL, Prisma, Supabase Storage privado | Usuarios, salas, membresías, mensajes, sesiones, voz y archivos |
| Medios | LiveKit | Cámara, audio y pantalla; no se almacena la llamada completa |
| IA | Gateway local, Ollama, Whisper, OCR y ngrok | Respuestas y extracción, con límites y fallos visibles |
| Pruebas | Jest, Vitest, Playwright, PostgreSQL y emulador Firebase | Casos de éxito, error, permisos y regresión |

## Flujo de extremo a extremo

1. El navegador obtiene identidad Firebase; la API autentica y calcula edad desde la fecha registrada.
2. La API filtra salas y vuelve a comprobar edad, estado, capacidad y membresía en operaciones sensibles.
3. Las mutaciones se guardan en PostgreSQL antes de anunciarse por Socket.IO. Tras reconectar, el cliente recupera el estado del servidor.
4. Los archivos pasan validación de formato y tamaño antes de Storage privado. Texto extraído y original se conservan por separado.
5. La voz del micrófono activo se procesa en lotes temporizados. Fallos y huecos quedan explícitos.
6. El reporte autorizado ordena por instante de origen y separa transcripción de síntesis.
7. La exportación genera Word/ZIP con nombres saneados, rutas relativas y límites de tamaño; no entrega ZIP parcial.
8. La pregunta al reporte utiliza solo fuentes permitidas e informa contexto parcial o falta de IA.

## Datos, contratos y HTTP

Las entidades relevantes `User`, `Room`, `Membership`, `Message`, `Document`, `Session`, `TranscriptSegment` y `SessionDocument` viven en `apps/api/prisma/schema.prisma`; las migraciones están versionadas. Los contratos se documentan en `docs/api.md` y `docs/session-report-api.md` y se contrastan con `apps/api/src/controller.ts`. No se agrega un almacén paralelo.

Las lecturas usan `GET`; creación y trabajos, `POST`; cambios parciales, `PATCH`. HTTP 401, 403, 404, 409 y 5xx describen el resultado real. HTTPS protege el canal, pero no sustituye autorización. Las claves de Storage y del gateway nunca se incluyen en la configuración pública del navegador.

## Comprobación de la constitución

| Regla | Decisión |
|---|---|
| Alcance | Solo FR-001 a FR-016; sin cuestionarios ni instalación obligatoria de dibujo |
| Integridad | Persistencia antes de eventos; deduplicación y cronología por tiempo de origen |
| Acceso | Token y membresía en API; recursos privados mediante autorización temporal |
| Privacidad | Excluir notas privadas y secretos de la IA y del ZIP |
| Evidencia | Pruebas automáticas más demo; llamada prolongada exige prueba manual |

## Riesgos y límites

- La IA depende del PC y ngrok; un reporte ya guardado debe seguir disponible si se desconecta.
- El reconocimiento de voz puede equivocarse; no es acta literal garantizada.
- Los planes gratuitos pueden suspender servicios o agotar cuota; el estado debe ser visible.
- La copia contiene cambios que no están desplegados. No se usará la web publicada como evidencia de esos cambios.
- Documentos antiguos pueden describir funciones retiradas. La especificación y el código actual se contrastan antes de afirmar cobertura.

## Secuencia de verificación

Instalar dependencias → generar Prisma → compilar → comprobar tipos → pruebas unitarias → integración aislada con PostgreSQL y Firebase → demo con dos cuentas de sala a ZIP y pregunta → revisar HTTP y persistencia tras recarga → pull request y revisión.
