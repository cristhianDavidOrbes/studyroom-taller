# Verificación del sitio publicado

Sitio: https://studyroom-sut.onrender.com/

Último ensayo: **2026-10-02 06:25:20 UTC**, web publicada `215df63` y API `ac6b817` (revisiones confirmadas por el proceso de despliegue). Chromium accedió al sitio público con Firebase Authentication real y la API publicada; no usó emulador ni respuestas simuladas de la aplicación.

- `browser-smoke.json`: seis etapas aprobadas — credenciales inválidas, cuenta temporal/perfil, recuperación de descarga de sala, sala/chat/notas persistidas, temporizador/personas, historial/móvil/teclado. Cero errores inesperados del navegador.
- `accessibility.json`: axe-core 4.13.0 sobre siete vistas/estados, incluidos exploración vacía y móvil. Cero violaciones automáticas en las reglas WCAG A/AA inspeccionadas. Las reglas marcadas como incompletas aún requieren valoración humana.
- `browser-cleanup.json`: sala del ensayo cerrada (201) y cuenta Firebase temporal eliminada (200). La limpieza solo actuó sobre la cuenta y sala creadas por este ensayo; los registros de sesión permanecen como datos de prueba del backend.
- `access-desktop.png`, `explore-desktop.png`, `explore-mobile.png`, `room-desktop.png`: capturas del sitio publicado, revisadas visualmente. El perfil y contenido son de prueba.
- `chunk-recovery.png`: recuperación visible tras bloquear intencionalmente una única descarga del módulo de sala. Al permitirla de nuevo, el botón de recarga recuperó la sala. No hay recargas automáticas en bucle.

El ensayo anterior en `before-empty-contrast-fix/` pasó los flujos funcionales y detectó un contraste insuficiente en `.empty > p`: `#819087` sobre `#f8faf8` (3,19:1). Se corrigió a `#42563f` (7,60:1 sobre el mismo fondo); el ensayo final confirmó el estado vacío sin violaciones de contraste en escritorio y móvil.

No se activó cámara, micrófono ni captura de escritorio físicos. Este recorrido no demuestra la puerta manual de cuatro dispositivos durante 60 minutos ni una certificación completa de accesibilidad. El ensayo separado con medios sintéticos y SFU real está en `../web/media-collaboration.json`.
