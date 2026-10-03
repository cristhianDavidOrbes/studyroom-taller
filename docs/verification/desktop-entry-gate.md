# Verificación del acceso sin instalación obligatoria

La obligación de instalar el pizarrón de Windows está temporalmente desactivada
para permitir probar la aplicación. El inicio de sesión y las comprobaciones de
perfil y permisos siguen aplicándose. Las herramientas del escritorio siguen
disponibles desde la sala como opción para quien las tenga instaladas.

`apps/web/tests/browser-smoke.mjs`, ejecutado por `.github/workflows/ci.yml`,
usa un User-Agent de Windows explícito incluso cuando CI corre en Linux. Su
fixture de `GET http://127.0.0.1:8790/v1/health` permanece desconectada durante
todo el recorrido: no simula una instalación válida ni usa una marca en
localStorage para aprobar el acceso. También intercepta y rechaza cualquier
solicitud del instalador, y exige que no se produzca ninguna.

El recorrido comprueba:

- La landing pública ofrece registro e inicio de sesión sin exigir instalación.
- Una cuenta nueva llega al perfil inicial y a las vistas autenticadas sin
  comprobación de instalación, descarga o pantalla de preparación.
- El acceso directo a `/salas/:id` conserva la ruta y sus parámetros aunque la
  herramienta local no esté disponible.
- Chat, notas persistidas tras recargar, temporizador, participantes e historial
  funcionan durante ese mismo recorrido sin instalación obligatoria.
- Se mantienen las comprobaciones de acceso con credenciales incorrectas,
  interfaz móvil, teclado, accesibilidad y recuperación de la vista de sala
  cuando falla su descarga.

Los recorridos independientes `media-collaboration.mjs`, `session-report.mjs` y
`report-ui.mjs` tampoco esperan la pantalla de preparación ni pulsan
«Continuar». Conservan sus fixtures de servicios y las comprobaciones de medios
y reportes posteriores al inicio de sesión. Estas pruebas no descargan ni
ejecutan el instalador de Windows; la compilación y las pruebas nativas se
realizan en el trabajo `desktop` separado.

Se validó localmente la sintaxis de los cuatro scripts actualizados. La
[ejecución de CI del cambio](https://github.com/cristhianDavidOrbes/studyroom/actions/runs/37127286569)
terminó correctamente, incluidos los recorridos de `browser-smoke.mjs` con
servicios aislados. Los recorridos independientes de medios y reportes
conservan su cobertura y sus resultados en `media-collaboration.json`,
`session-report.json` y `report-ui.json`; no se repitieron en esta ejecución.

El 3 de octubre de 2026 se comprobó además el build local y la web publicada en
Render: ocho casos por entorno, cero errores de página y ninguna solicitud a
la herramienta de Windows ni al instalador. Las identidades, salas y respuestas
API son fixtures en un navegador aislado; no se crearon cuentas reales ni se
capturaron medios. La evidencia está en `desktop-optional/local/browser.json`,
`desktop-optional/production/browser.json` y `desktop-optional/release.json`.

Las comprobaciones unitarias de detección e instalación se conservan para la
herramienta opcional. Si vuelve a exigirse la instalación para entrar, será
necesario adaptar estos recorridos al flujo de acceso que se habilite.
