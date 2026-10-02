# Herramientas de escritorio para todos los usuarios de Windows

El compañero de StudyRoom dibuja sobre el escritorio y otras aplicaciones. Es una aplicación WPF local y gratuita para Windows 10/11 con .NET Framework 4.8; no requiere SDK, Node, una cuenta de IA ni credenciales del proyecto. El ZIP distribuido contiene el ejecutable y los lanzadores, sin depender del repositorio ni de rutas de este PC.

## Uso

1. Descargar `StudyRoom-Herramientas.zip` desde StudyRoom y **extraer todo** su contenido.
2. Hacer doble clic en `Iniciar-Herramientas.cmd`. Aparece un botón verde de lápiz, de 58 × 58 unidades, arriba a la derecha. Inicia contraído y en **Interactuar**, sin interceptar el escritorio.
3. Abrir el botón, elegir lápiz, línea, flecha, rectángulo, elipse o texto y dibujar. El borrador elimina el objeto seleccionado completo. Hay color, grosor, tamaño de texto, deshacer, rehacer y borrado de todas las pantallas.
4. Pulsar **Escape** o **Interactuar con Windows** para volver a usar las aplicaciones. Contraer el panel también desactiva el dibujo. Arrastrar el encabezado mueve el panel; el selector cambia el monitor donde aparece.
5. Para mostrar las marcas a los participantes, compartir **Pantalla completa** desde el navegador. Compartir solamente una ventana o pestaña puede excluir la superposición del escritorio. La herramienta nunca inicia una captura, cámara o micrófono.

Los botones y desplegables del menú siguen disponibles mientras se dibuja. No hace falta pulsar Escape para cambiar a borrador, otro color, grosor o tamaño de texto. El lienzo no activa su ventana al pulsarlo y excluye de su región nativa el panel, los desplegables abiertos y el diálogo de texto, incluso si cambia el orden de ventanas. Al terminar un trazo se libera la captura del ratón; si se pierde la captura se descarta la vista previa pendiente.

Las marcas permanecen solo en memoria. La × oculta el panel cuando no se comparte; durante una presentación lo devuelve contraído para evitar cerrarlo por accidente. **Salir completamente** en el icono del área de notificación cierra el programa deliberadamente.

## Abrir desde el botón web

Hacer doble clic una vez en `Instalar-Herramientas.cmd`. También se puede usar **Integrar con StudyRoom** dentro del panel. El instalador nativo copia únicamente sus archivos a `%LOCALAPPDATA%\StudyRoom\Herramientas`, crea un acceso directo del usuario y registra `studyroom-tools://open` en `HKCU\Software\Classes`. Inicia el compañero oculto en segundo plano para atender la presentación. No solicita administrador, no modifica políticas de ejecución y no agrega autoinicio de Windows. No necesita ejecutar scripts PowerShell. Tras reiniciar el PC, abrir las herramientas una vez.

Después el navegador puede pedir confirmación para abrir la aplicación externa. La aplicación acepta únicamente el URI literal `studyroom-tools://open`, sin consultas, rutas, comandos o tokens. Las opciones locales explícitas `--install`, `--uninstall`, `--background` y `--demo` son independientes del protocolo. Una segunda apertura manual muestra la instancia existente y vuelve a Interactuar; no duplica los lienzos.

## Mostrar y ocultar al compartir

StudyRoom envía una señal cada dos segundos a `http://127.0.0.1:8790/v1/sharing`: `{sessionId: UUID, active: boolean}`. No incluye pantalla, audio, documentos, nombres ni credenciales. El compañero escucha **solo loopback**, exige origen exacto `https://studyroom-sut.onrender.com` (o localhost/127.0.0.1:5173 para desarrollo), Host exacto, JSON válido y campos permitidos. Rechaza orígenes ausentes/ajenos y limita cuerpo a 512 bytes, cabeceras a 4096 bytes y cuatro clientes simultáneos. No realiza conexiones externas.

La primera presentación abre el botón contraído; los pulsos posteriores no cambian la herramienta ni el foco. Al detener la última presentación se ocultan panel, lienzos y ventana de texto, se libera el ratón y se eliminan marcas e historial. Sin pulsos durante ocho segundos también se oculta. Cada pestaña usa su propio identificador; una no cierra otra presentación activa. Un identificador detenido queda bloqueado diez segundos para que una petición tardía no lo reabra.

El navegador puede pedir permiso de acceso a aplicaciones/dispositivos locales. La aplicación respeta ese permiso; no se altera la seguridad del navegador. Si el compañero está apagado o el permiso se deniega, la videollamada continúa y se puede abrir manualmente. Si se elige **Salir completamente**, hay que iniciarlo otra vez para recuperar la apertura automática.

Para retirar la integración, cerrar las herramientas y ejecutar `Desinstalar-Herramientas.cmd` **desde la carpeta original del ZIP extraído**. Solo elimina su registro, acceso directo y archivos conocidos. Si Windows mantiene un archivo en uso, informa qué operación falta y se puede repetir tras cerrar la aplicación. Nunca elimina recursivamente carpetas del usuario. Una clave de protocolo existente que no tenga la marca de propiedad de StudyRoom se conserva.

## Monitores, DPI y límites

Cada monitor tiene su propio lienzo y coordenadas normalizadas. El proceso solicita DPI por monitor V2 y coloca los lienzos sobre los límites físicos de cada pantalla. Al cambiar la disposición de monitores vuelve a Interactuar. Las marcas se ajustan al nuevo tamaño del monitor identificado, pero un mismo trazo no cruza de un monitor a otro: se inicia otro en la segunda pantalla.

Deshacer/rehacer actúa en el monitor usado más recientemente; el borrado general afecta a todos. Se conservan hasta 30 cambios, con un tope adicional de memoria; máximo 300 objetos y 100.000 puntos por monitor, 3.000 puntos por trazo y 200 caracteres por texto. El borrador de texto usa el área aproximada del bloque.

No puede dibujar sobre el escritorio seguro de UAC, la pantalla de bloqueo ni garantizar superposición en aplicaciones con pantalla completa exclusiva. La visibilidad exacta en la transmisión y las combinaciones de monitores/DPI necesitan ensayo en los equipos de los participantes.

## Construcción, pruebas y distribución

```powershell
.\scripts\desktop\build.ps1 -Test
.\scripts\desktop\package.ps1
```

La construcción usa el compilador incluido con .NET Framework y bibliotecas de Windows; no descarga dependencias de pago. Los 53 controles comprueban geometría, borrador, historial, protocolo exacto, expiración/múltiples presentaciones, pulsos tardíos, respuestas HTTP reales del puente local (Origin, Host, límites y preflight) y estilos/regiones nativos del lienzo. Los 10 controles nuevos usan una ventana nativa siempre oculta, sin enviar entrada ni tomar el foco: verifican que el panel y los desplegables quedan fuera de la región de dibujo, que el área anterior se restaura al mover el menú y que el lienzo no activa su ventana. No sustituyen pruebas de interacción real del panel ni de captura de pantalla.

La salida es `apps/desktop/dist/StudyRoom-Herramientas.zip`, con seis archivos operativos y `SHA256SUMS.txt`. También se genera el hash del ZIP. El archivo de distribución excluye fuentes, pruebas, archivos `.env`, datos de IA y credenciales. La publicación web copia ese ZIP y su hash a `/desktop/`; no compila la aplicación en el navegador.

La aplicación no está firmada con un certificado comercial. Los avisos de Windows deben respetarse: no se cambian políticas ni se pide desactivar protecciones. El hash permite comparar la descarga con el paquete publicado; no reemplaza una firma de editor.

Para comprobar la interfaz sin exponer documentos, ejecutar `StudyRoom.Tools.exe --demo`. Abre un fondo de prueba neutro; el modo normal no muestra ese fondo. En ese modo los lienzos se exponen como ventanas para la inspección de accesibilidad. El programa no contiene automatización de entrada, red externa, captura de pantalla ni acceso a secretos.
