# Portada y preparación de las herramientas

Verificación en Chromium sin ventana visible, con respuestas de autenticación,
perfil, descarga y herramienta local simuladas. No se crearon cuentas reales,
no se capturó el escritorio del usuario y no se ejecutó ni instaló la herramienta.

La portada y la preparación se revisaron a 1440 × 1000 y a 390 × 844. Las cuatro
capturas muestran datos de ejemplo y ambos tamaños pasaron la comprobación de
desbordamiento horizontal. Se corrigió el desbordamiento de una figura decorativa
en la primera revisión móvil antes de guardar la evidencia final.

`browser.json` registra cinco comprobaciones:

- La portada es pública y no consulta la herramienta del equipo.
- El enlace para crear una cuenta abre directamente el formulario de registro.
- Después de iniciar sesión, la instalación es obligatoria y se conserva la ruta solicitada.
- Descargar el archivo no autoriza la entrada ni se interpreta como una instalación.
- Una respuesta válida de `/v1/health` permite continuar al destino original;
  termina el sondeo y no inicia ninguna sesión de dibujo.

Se añadieron nueve pruebas unitarias sobre la identidad y versión del ayudante,
el sistema operativo, los tiempos de espera, las peticiones sin solapar, la pausa
al ocultar la página, la limpieza de solicitudes y los destinos seguros. Las
12 pruebas enfocadas, que incluyen las tres pruebas previas de la ayuda de
escritorio, pasaron. La compilación y la comprobación de tipos también pasaron.

Estas pruebas validan el comportamiento de la página. La instalación y la
integración nativa del archivo EXE se verifican por separado.
