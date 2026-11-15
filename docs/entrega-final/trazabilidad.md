# Trazabilidad del incremento académico

Cada fila vincula una capacidad con implementación y prueba existente. «Código localizado» no equivale a una prueba de extremo a extremo. Las rutas apuntan a la copia académica.

| Requisito | Implementación principal | Evidencia automatizada o límite |
|---|---|---|
| FR-001, FR-002 | `apps/web/src/auth.tsx`, `apps/web/src/explore.tsx`, `apps/api/src/age.ts`, `apps/api/src/rooms.ts` | `apps/api/src/age.spec.ts`, `apps/api/test/authorization.spec.ts`; falta prueba de navegador con cuenta real |
| FR-003, FR-004 | `apps/api/src/rooms.ts`, `apps/api/src/controller.ts` | `apps/api/test/authorization.spec.ts`, `apps/api/test/identity.spec.ts`; integración con BD y Firebase aislados aprobó |
| FR-005 | `apps/api/src/realtime.ts`, `apps/api/src/events.ts`, `apps/web/src/room.tsx` | `tests/api.integration.mjs` aprobó reconexión de Socket.IO; la prueba de navegador `apps/web/tests/media-collaboration.mjs` queda pendiente |
| FR-006 | `apps/web/src/media.tsx`, `apps/api/src/rooms.ts` | Hay código y pruebas de navegador, pero falta llamada real documentada en dos dispositivos |
| FR-007 | `apps/api/src/rooms.ts`, `apps/api/src/controller.ts` | `apps/api/test/session-reports.spec.ts` e integración comprueban denegación de mensajes tras cerrar |
| FR-008, FR-010 | `apps/api/src/documents.ts`, `apps/web/src/room.tsx`, `apps/web/src/session-report.tsx` | `apps/api/test/document-report.spec.ts`; la extracción visual depende del modelo local y requiere prueba real |
| FR-009, FR-014 | `apps/api/src/transcription.ts`, `apps/web/src/transcription-audio.ts` | `apps/api/test/transcription.spec.ts`, `apps/web/src/transcription-audio.test.ts`; precisión lingüística no certificada |
| FR-011, FR-012 | `apps/web/src/session-report.tsx`, `apps/api/src/report-word.ts` | `apps/api/src/report-word.spec.ts`, `apps/web/src/report-sources.test.tsx`; verificar demo con datos nuevos |
| FR-013 | `apps/api/src/report-archive.ts`, `apps/api/src/report-word.ts` | `apps/api/test/report-archive.spec.ts` verifica orden, Word, rutas, archivos ausentes y ZIP íntegro |
| FR-015, FR-016 | `apps/api/src/ai.ts`, `apps/api/src/report-context.ts`, `apps/ai-gateway/src/server.ts` | `apps/api/test/report-context.spec.ts`, `apps/ai-gateway/test/`; respuesta real depende del PC local |

## Brechas conocidas

- Los documentos heredados `README.md` y `docs/implementation-contract.md` contienen referencias históricas a herramientas de dibujo y URLs antiguas. No se usan como prueba de la entrega actual; la limpieza de ese legado es trabajo separado.
- El cambio de fecha de nacimiento y edad mínima está en esta copia, pero no se afirma que esté desplegado.
- No hay evidencia nueva de llamada de 60 minutos ni de un flujo autenticado completo en producción.
- La contribución de otros integrantes y sus revisiones no puede deducirse de un único autor o de pruebas automatizadas.
- GitHub Actions no inició por una restricción de facturación de la cuenta; compilación, tipos, 198 pruebas unitarias y 18 escenarios de integración se ejecutaron localmente.
