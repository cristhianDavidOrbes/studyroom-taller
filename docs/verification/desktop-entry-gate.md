# Verificación del acceso con herramientas de Windows

Los recorridos de navegador usan un User-Agent de Windows explícito incluso
cuando el ejecutor de CI es Linux. El navegador solicita realmente
`GET http://127.0.0.1:8790/v1/health`; una fixture aislada responde por ese único
endpoint. No existe una marca en localStorage que omita la comprobación.

`apps/web/tests/browser-smoke.mjs`, ejecutado por `.github/workflows/ci.yml`,
comprueba estos casos:

- La landing pública ofrece registro e inicio de sesión sin exigir instalación.
- Tras autenticar, una herramienta desconectada bloquea las vistas protegidas.
- Descargar el instalador no habilita el acceso ni demuestra una instalación.
- Se rechazan una aplicación distinta, una versión antigua y `ready: false`.
- Solo `{ app: "StudyRoom.Tools", version: "1.1.0", ready: true }` permite
  continuar a la URL original de la sala, conservando sus parámetros.
- Landing y pantalla de preparación se capturan en la evidencia de navegador.
  La landing se comprueba en tamaños de escritorio y móvil.

El archivo descargado durante la prueba es texto sintético con un nombre `.exe`,
nunca se ejecuta ni se guarda como instalación. Estas comprobaciones validan
la decisión de la página, no la instalación nativa de Windows. La compilación y
las pruebas nativas se ejecutan en el trabajo `desktop` separado.

Los recorridos independientes `media-collaboration.mjs`, `session-report.mjs` y
`report-ui.mjs` también reciben salud válida mediante la misma fixture para
alcanzar sus vistas protegidas. La primera activación del micrófono en los
recorridos de medios activa el micrófono directamente, sin un diálogo adicional.
La prueba de voz comprueba que no se captura un micrófono sin publicar y que
la transcripción comienza automáticamente para los dos participantes cuando
publican su audio. La fixture de salud no modifica el estado de transcripción.

Estado al preparar este cambio: se validó la sintaxis de los scripts; los
recorridos con servicios se ejecutan por CI o desde un entorno de prueba
preparado. Este documento describe cobertura, no afirma un resultado de
navegador que aún no se haya ejecutado. Los resultados de cada ejecución quedan
en `browser-smoke.json`, `media-collaboration.json`, `session-report.json` y
`report-ui.json`, respectivamente.
