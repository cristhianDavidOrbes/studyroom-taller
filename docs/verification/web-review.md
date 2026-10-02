# Revisión de las superficies web de StudyRoom

Revisión funcional de las 50 historias del snapshot Jira, junto a sus tareas y actividades. Esta revisión comprueba que el alcance tiene un flujo de producto implementado; las pruebas y sus límites se registran por separado. No convierte automáticamente los 657 registros en “Done”.

| Historias | Implementación y comprobación |
|---|---|
| SUT-2,3 | Firebase email/contraseña, registro real, sincronización del perfil, onboarding. Chromium comprobó credenciales inválidas, alta y perfil persistido. Corregida una carrera que podía reemplazar el nombre inicial. |
| SUT-4 | Envío de recuperación con Firebase, respuesta sin enumeración de cuentas, formulario de nueva contraseña y manejo de código inválido/vencido. La entrega de correo real y sus cuotas requiere evidencia del proyecto Firebase. |
| SUT-5 | Persistencia de sesión del navegador, logout local y revocación por API. El refresco de token ya no desmonta una videollamada. |
| SUT-6,8 | Perfil editable, intereses, nivel, avisos en aplicación/correo persistidos. Avisos esenciales de acción y seguridad permanecen visibles. |
| SUT-7 | Diseño de escritorio/móvil, formularios con etiquetas, diálogos nativos con foco, navegación por teclado, estados vacíos/error/carga. Verificación de viewport 390px sin desbordamiento; revisión visual de capturas. |
| SUT-10–16 | Búsqueda, materia/modalidad/nivel, orden, recomendación, programadas, detalle y recuperación ante vacío/error. Consulta al API con TanStack Query, sin datos simulados del navegador. |
| SUT-18–25 | Crear/editar, privacidad/código, invitación, roles, capacidad, entrada/salida, programación y cierre/cancelación. Acciones según rol y errores del servidor. Anfitrión puede gestionar su sala programada; consulta periódica actualiza su apertura. |
| SUT-27–33 | La web utiliza API autenticada y servicios persistentes implementados por backend; no almacena secretos de servicios. Build estricto y scripts E2E están conectados al CI. Infraestructura/migraciones/autorización/cuotas requieren las pruebas del backend, no se consideran verificadas solo por existir pantallas. |
| SUT-35–37 | Socket.IO con reingreso y snapshot, participantes, chat, reacciones/mano. Mensajes conservan clave idempotente al reintentar. Chromium comprobó participantes/chat persistido. |
| SUT-38–40 | LiveKit independiente de REST/Socket.IO, cámara/micrófono/dispositivos, pantalla, simulcast/adaptiveStream/dynacast y modo solo audio reversible. Dos navegadores recibieron pistas sintéticas a través del SFU real. |
| SUT-41 | Menú compacto arriba a la derecha de la cámara, puntero/lápiz/color/borrado, posición normalizada respecto al contenido, teclado y permisos. Corregido recorte del menú en cámaras compactas. Ensayo real de SFU y eventos comprobó punto entre dos tamaños, rechazo a participante, permiso tras moderación, borrado y fin de pantalla. |
| SUT-42,43 | Archivos con carga autorizada, vista firmada y eliminación autorizada; notas privadas, guardado explícito/autoguardado, aviso de cambios, guardado al salir/cierre remoto y lectura en historial. La carga inicial de notas no puede sobreescribir un borrador en edición. |
| SUT-44 | Temporizador compartido, iniciar/pausar/restablecer, enfoque/pausa. Corregido reinicio accidental al pausar. Chromium comprobó cambio de estado. |
| SUT-46–50 | Solicitud al backend, contexto explícito de chat y hasta cinco archivos, @IA, cola/streaming/cancelación, estados de equipo desconectado/error y uso gratuito. No existe acceso directo del navegador a ngrok/Ollama ni fallback de pago. |
| SUT-51 | Valoración útil y reporte con motivo sobre respuesta completada, guardados por API. |
| SUT-53–57 | Cierre de sesión, trabajos automáticos, resumen/puntos/quiz, intentos/resultado, historial con fechas/búsqueda/exportación y notas propias. Generaciones pendientes se presentan como pendientes. Chromium comprobó cierre y acceso al historial. |

## Evidencia y límites

`web/browser-smoke.json` registra el ensayo de flujos reales contra la API y Firebase Auth emulator. `web/media-collaboration.json` registra dos contextos Chromium que enviaron cámara/micrófono **sintéticos** y una pantalla canvas **sintética** por LiveKit Cloud real. Las imágenes son cuentas y contenidos de prueba; no contienen cámara, micrófono, escritorio ni credenciales personales.

La comprobación adicional de SUT-7 y estados de error bloqueó una descarga del módulo de sala: se mostró una pantalla recuperable y el botón de recarga recuperó la sala al restaurar la conexión. `web/chunk-recovery.png` muestra el aviso. `web/accessibility.json` registra axe-core 4.13.0 sobre acceso, exploración escritorio/móvil, personas en sala, historial y perfil móvil: cero violaciones automáticas de las reglas WCAG A/AA inspeccionadas tras corregir contraste. Algunas comprobaciones visuales requieren juicio humano; esto no equivale a una certificación completa WCAG. `web/browser-cleanup.json` confirma cierre de la sala y eliminación de la cuenta temporal del ensayo local.

El ensayo de medios no demuestra cuatro dispositivos/redes independientes durante 60 minutos, inteligibilidad con micrófonos físicos, variaciones de red/TURN/TLS ni convivencia prolongada con inferencia local. Esos criterios siguen sujetos a la puerta de aceptación manual. Las pruebas de Firebase real/Supabase/ngrok y despliegue se documentan por separado en el directorio de verificación del proyecto.
