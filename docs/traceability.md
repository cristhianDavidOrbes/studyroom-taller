# Trazabilidad de StudyRoom

Generado 2026-10-02T05:36:34.680Z. Fuente: [inventario Jira](jira-requirements.json), SHA-256 `f1c015464517e42491eb4d8f84bb3cf6a3566f7bf4d38c6030140120a5131955`.

Se relacionan **657 incidencias: 7 épicas, 50 historias, 150 tareas y 450 actividades**. Cada historia tiene 3 tareas y 9 actividades; no hay claves duplicadas ni elementos huérfanos. El JSON conserva texto completo normalizado y hash de cada descripción original, relaciones Jira reales y relación semántica tarea→historia. No se redujo el alcance del inventario.

**Código presente no equivale a aceptación completada.** Cada historia expone por separado `implemented`, `automatedVerified`, `manualPending` y `acceptanceComplete`. La existencia de un archivo solo confirma su ubicación: las pruebas y su alcance se enumeran explícitamente. Las tareas/actividades de calidad permanecen parciales mientras falten pruebas reales; ninguna incidencia se marca terminada ni se modifica Jira desde este generador.

[Mapa detallado de las 657 incidencias](traceability.json) · [Contrato](implementation-contract.md) · [Guía de aceptación manual](acceptance-manual.md).

## Historias y estado de verificación

Todas conservan como pendientes la validación del despliegue gratuito y la evaluación completa de accesibilidad. La tabla muestra además las puertas específicas.

| Historia | Implementación | Verificación automática | Pendiente específico |
|---|---|---|---|
| [SUT-2](https://studyroomd.atlassian.net/browse/SUT-2) Registro e inicio de sesión | Código presente | Parcial; ver escenarios JSON | auth |
| [SUT-3](https://studyroomd.atlassian.net/browse/SUT-3) Onboarding y perfil del estudiante | Código presente | Parcial; ver escenarios JSON | auth |
| [SUT-4](https://studyroomd.atlassian.net/browse/SUT-4) Recuperación de contraseña | Código presente | Sin prueba específica | auth |
| [SUT-5](https://studyroomd.atlassian.net/browse/SUT-5) Gestión de sesión y cierre seguro | Código presente | Parcial; ver escenarios JSON | auth |
| [SUT-6](https://studyroomd.atlassian.net/browse/SUT-6) Editar intereses y preferencias de estudio | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-7](https://studyroomd.atlassian.net/browse/SUT-7) Diseño responsive y accesible | Código presente | Parcial; ver escenarios JSON |  |
| [SUT-8](https://studyroomd.atlassian.net/browse/SUT-8) Preferencias de notificaciones | Código presente | Parcial; ver escenarios JSON | auth |
| [SUT-10](https://studyroomd.atlassian.net/browse/SUT-10) Explorar, buscar y filtrar salas | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-11](https://studyroomd.atlassian.net/browse/SUT-11) Ver tarjetas y detalle de una sala | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-12](https://studyroomd.atlassian.net/browse/SUT-12) Filtrar por materia, modalidad y nivel | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-13](https://studyroomd.atlassian.net/browse/SUT-13) Ordenar salas por relevancia y actividad | Código presente | Sin prueba específica | roomFlows |
| [SUT-14](https://studyroomd.atlassian.net/browse/SUT-14) Ver salas recomendadas según intereses | Código presente | Sin prueba específica | roomFlows |
| [SUT-15](https://studyroomd.atlassian.net/browse/SUT-15) Consultar salas programadas | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-16](https://studyroomd.atlassian.net/browse/SUT-16) Gestionar estados vacíos y sin resultados | Código presente | Sin prueba específica | roomFlows |
| [SUT-18](https://studyroomd.atlassian.net/browse/SUT-18) Unirse, salir y controlar capacidad | Código presente | Parcial; ver escenarios JSON | collaboration |
| [SUT-19](https://studyroomd.atlassian.net/browse/SUT-19) Crear una sala de estudio | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-20](https://studyroomd.atlassian.net/browse/SUT-20) Editar datos de una sala | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-21](https://studyroomd.atlassian.net/browse/SUT-21) Configurar privacidad y código de acceso | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-22](https://studyroomd.atlassian.net/browse/SUT-22) Invitar participantes mediante enlace | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-23](https://studyroomd.atlassian.net/browse/SUT-23) Gestionar roles de anfitrión y moderador | Código presente | Parcial; ver escenarios JSON | collaboration |
| [SUT-24](https://studyroomd.atlassian.net/browse/SUT-24) Programar una sala futura | Código presente | Parcial; ver escenarios JSON | roomFlows |
| [SUT-25](https://studyroomd.atlassian.net/browse/SUT-25) Cerrar o cancelar una sala | Código presente | Parcial; ver escenarios JSON | collaboration |
| [SUT-27](https://studyroomd.atlassian.net/browse/SUT-27) Persistir usuarios, salas y sesiones | Código presente | Parcial; ver escenarios JSON | restore |
| [SUT-28](https://studyroomd.atlassian.net/browse/SUT-28) Exponer API segura para StudyRoom | Código presente | Parcial; ver escenarios JSON | auth |
| [SUT-29](https://studyroomd.atlassian.net/browse/SUT-29) Autorizar acciones según el rol | Código presente | Parcial; ver escenarios JSON | storage, collaboration |
| [SUT-30](https://studyroomd.atlassian.net/browse/SUT-30) Gestionar migraciones y datos iniciales | Código presente | Parcial; ver escenarios JSON | restore |
| [SUT-31](https://studyroomd.atlassian.net/browse/SUT-31) Configurar almacenamiento de archivos | Código presente | Parcial; ver escenarios JSON | storage |
| [SUT-32](https://studyroomd.atlassian.net/browse/SUT-32) Registrar errores y eventos relevantes | Código presente | Parcial; ver escenarios JSON | auth |
| [SUT-33](https://studyroomd.atlassian.net/browse/SUT-33) Automatizar pruebas, calidad e integración continua | Código presente | Parcial; ver escenarios JSON | ci |
| [SUT-35](https://studyroomd.atlassian.net/browse/SUT-35) Participantes en tiempo real | Código presente | Parcial; ver escenarios JSON | collaboration |
| [SUT-36](https://studyroomd.atlassian.net/browse/SUT-36) Chat grupal en tiempo real | Código presente | Parcial; ver escenarios JSON | collaboration |
| [SUT-37](https://studyroomd.atlassian.net/browse/SUT-37) Reacciones y levantar la mano | Código presente | Sin prueba específica | collaboration |
| [SUT-38](https://studyroomd.atlassian.net/browse/SUT-38) Videollamada grupal | Código presente | Parcial; ver escenarios JSON | media, recovery |
| [SUT-39](https://studyroomd.atlassian.net/browse/SUT-39) Controles de micrófono, cámara y dispositivos | Código presente | Sin prueba específica | media, recovery |
| [SUT-40](https://studyroomd.atlassian.net/browse/SUT-40) Compartir pantalla | Código presente | Sin prueba específica | media, recovery |
| [SUT-41](https://studyroomd.atlassian.net/browse/SUT-41) Señalar en pantalla desde el menú de cámara | Código presente | Parcial; ver escenarios JSON | media, recovery, annotations |
| [SUT-42](https://studyroomd.atlassian.net/browse/SUT-42) Compartir y consultar documentos | Código presente | Parcial; ver escenarios JSON | storage |
| [SUT-43](https://studyroomd.atlassian.net/browse/SUT-43) Crear notas privadas durante la sesión | Código presente | Parcial; ver escenarios JSON | collaboration |
| [SUT-44](https://studyroomd.atlassian.net/browse/SUT-44) Usar temporizador y modo de enfoque | Código presente | Parcial; ver escenarios JSON | collaboration |
| [SUT-46](https://studyroomd.atlassian.net/browse/SUT-46) Configurar el proveedor de IA de forma desacoplada | Código presente | Parcial; ver escenarios JSON | aiTunnel, aiQuality, aiRecovery |
| [SUT-47](https://studyroomd.atlassian.net/browse/SUT-47) Hacer preguntas directas a la IA | Código presente | Parcial; ver escenarios JSON | aiTunnel, aiQuality, aiRecovery |
| [SUT-48](https://studyroomd.atlassian.net/browse/SUT-48) Invocar la IA desde el chat con @IA | Código presente | Sin prueba específica | aiTunnel, aiQuality, aiRecovery |
| [SUT-49](https://studyroomd.atlassian.net/browse/SUT-49) Enviar contexto autorizado de chat y documentos | Código presente | Parcial; ver escenarios JSON | storage, aiQuality |
| [SUT-50](https://studyroomd.atlassian.net/browse/SUT-50) Controlar límites de uso, errores y costos de IA | Código presente | Parcial; ver escenarios JSON | aiTunnel, aiRecovery, media |
| [SUT-51](https://studyroomd.atlassian.net/browse/SUT-51) Valorar y reportar respuestas de IA | Código presente | Sin prueba específica | feedback |
| [SUT-53](https://studyroomd.atlassian.net/browse/SUT-53) Finalizar y almacenar una sesión | Código presente | Parcial; ver escenarios JSON | history |
| [SUT-54](https://studyroomd.atlassian.net/browse/SUT-54) Generar resumen automático | Código presente | Parcial; ver escenarios JSON | aiQuality, aiTunnel, aiRecovery, history |
| [SUT-55](https://studyroomd.atlassian.net/browse/SUT-55) Generar puntos clave y acuerdos | Código presente | Parcial; ver escenarios JSON | aiQuality, aiTunnel, aiRecovery, history |
| [SUT-56](https://studyroomd.atlassian.net/browse/SUT-56) Generar un quiz de repaso | Código presente | Parcial; ver escenarios JSON | aiQuality, history |
| [SUT-57](https://studyroomd.atlassian.net/browse/SUT-57) Consultar historial y reporte de aprendizaje | Código presente | Parcial; ver escenarios JSON | history |

## Qué significa cada puerta pendiente

- **deployment:** DEPLOYMENT_FREE: comprobar Render Free, HTTPS, cold start, orígenes Firebase/CORS, planes gratuitos y límites en los paneles reales. Un despliegue local no satisface esta puerta.
- **accessibility:** ACCESSIBILITY: lector de pantalla, navegación completa con teclado, zoom 200%, contraste y dispositivos móviles reales; el smoke test solo cubre una parte.
- **auth:** AUTH_PRODUCTION: correo real de recuperación, enlace vencido, sesión revocada entre dispositivos y validación Firebase de producción.
- **media:** MEDIA_60_MIN: cuatro dispositivos/redes reales, 60 minutos, RTT p95<300ms, congelamientos<1%, sin desconexiones; repetir con inferencia local.
- **recovery:** MEDIA_RECOVERY: UDP bloqueado/TURN-TLS, Wi-Fi→datos, corte5s y recuperación≤10s; reinicio API conservando medios, chat y señales recuperan estado.
- **annotations:** ANNOTATIONS_REAL: señalamientos visibles para otros participantes sobre la pantalla compartida, resoluciones distintas, teclado y permisos reales; no hay pizarra separada.
- **storage:** STORAGE_REAL: subida/descarga/eliminación autorizadas en Supabase privado con dos usuarios, documento inválido, cuota y URL vencida; comprobar extracción de PDFs.
- **restore:** RESTORE: restaurar un respaldo PostgreSQL en una base vacía y validar relaciones; la migración aplicada no sustituye una restauración.
- **aiTunnel:** AI_TUNNEL: llamada desde Render por HTTPS ngrok al PC, 401 público sin secreto, PC suspendido/apagado y túnel caído; sin fallback facturable.
- **aiQuality:** AI_QUALITY: evaluar español, fidelidad y quizzes con material real variado; tres muestras correctas no son una evaluación estadística.
- **aiRecovery:** AI_DURABLE: reiniciar API durante trabajo y recuperar lease vencido sin duplicar resultado; validar cola y cancelación con motor real.
- **roomFlows:** ROOM_FLOWS: completar positivo y negativo de cada filtro, recomendación, invitación, fecha y transición desde la interfaz con usuarios distintos.
- **collaboration:** COLLABORATION_REAL: dos clientes de sala prueban presencia, reacciones, mano, chat, notas privadas y timer bajo desconexión/reconexión.
- **ci:** CI_REMOTE: ejecutar el workflow en el repositorio conectado con límites gratuitos, retención y bloqueo de gasto; las pruebas locales no prueban GitHub Actions.
- **feedback:** AI_FEEDBACK: usuario autorizado valora/reporta respuesta completa; comprobar persistencia, deduplicación, rechazo de valoración ajena e interfaz.
- **history:** HISTORY_REAL: exportación JSON/Markdown, filtros/fechas, privacidad, intento de quiz y reporte coherente en sesiones y usuarios reales.

## Evidencias y límites

El mapa incluye pruebas unitarias API, integración Firebase Auth emulator/PostgreSQL, navegador, coordenadas de pantalla y seguridad/cola del gateway. Los resultados de navegador se leen de su JSON real al regenerar, conservando un fallo si el último registro falló. La inferencia local se verifica contra su modelo/digest y muestras guardadas. Los resultados de API comunicados por el agente principal se identifican como tales; no se inventan ejecuciones de CI o de producción.

No existe aceptación automática de todos los criterios por aprobar una suite: faltan, según la historia, casos específicos de ranking, correo real, Storage, medios, valoración y resultados de cierre con motor real. Una llamada de 60 minutos con cuatro equipos/redes, recuperación/TURN y carga de IA requiere evidencia propia. La cuenta Free y sus cuotas deben comprobarse en cada proveedor.

Regenerar desde la raíz con `npm run traceability`. El script falla si cambia el inventario, encuentra huérfanos o deja una historia sin sus 3 tareas/9 actividades; actualizar el mapeo y conservar siempre los requisitos nuevos.
