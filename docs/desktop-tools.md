# Herramientas de escritorio para todos los usuarios de Windows

El compañero de StudyRoom dibuja sobre el escritorio y otras aplicaciones. Es una aplicación WPF local y gratuita para Windows 10/11 con .NET Framework 4.8; no requiere SDK, Node, una cuenta de IA ni credenciales del proyecto. `Instalar-StudyRoom.exe` contiene el ejecutable, configuración, lanzadores e instrucciones incorporados: no depende del repositorio ni de rutas de este PC. El ZIP se conserva como respaldo opcional.

## Uso

**Acceso temporal para pruebas (3 de octubre de 2026):** la instalación del pizarrón es opcional. Iniciar sesión permite entrar a las salas, el perfil y los reportes sin comprobar la herramienta local. La descarga sigue disponible en la sala; quien ya la tenga instalada puede continuar dibujando al compartir pantalla. El requisito se conserva en `apps/web/src/App.tsx`, desactivado con `desktopInstallationRequired = false`, para poder reactivarlo cuando se decida.

**Estado de distribución:** el EXE directo todavía no tiene firma de un publicador reconocido. Microsoft Defender no encontró amenazas en la compilación comprobada, pero Smart App Control puede bloquearla por falta de confianza. El titular descartó Microsoft Store y autorizó publicar solo el componente Windows con MIT. La [firma directa](desktop-signing.md) se solicitó a SignPath Foundation; el formulario confirmó su envío, pero la aprobación y la firma siguen pendientes. StudyRoom conserva privados sus demás componentes. Un hash SHA-256 no sustituye la firma.

1. Descargar `Instalar-StudyRoom.exe` desde StudyRoom y **abrirlo una vez**. Instala los archivos propios para el usuario y espera en segundo plano. Guardar un ZIP en Descargas no instala ni ejecuta una aplicación; el navegador tampoco puede inspeccionar automáticamente esa carpeta.
2. Entrar a una sala y usar **Dibujar en el escritorio** para abrir la herramienta instalada, o **Primera vez / instalar** para ver las instrucciones. La instalación es opcional para entrar y probar StudyRoom mientras se revisa la firma. Con la herramienta instalada y conectada, al compartir pantalla aparece un botón verde de lápiz, de 58 × 58 unidades, arriba a la derecha. Inicia contraído y en **Interactuar**, sin interceptar el escritorio. Al entrar a Windows, el compañero se inicia solo en segundo plano mediante su entrada propia de usuario.
3. Abrir el botón, elegir lápiz, línea, flecha, rectángulo, elipse o texto y dibujar. El borrador elimina el objeto seleccionado completo. Hay color, grosor, tamaño de texto, deshacer, rehacer y borrado de todas las pantallas.
4. Pulsar **Escape** o **Interactuar con Windows** para volver a usar las aplicaciones. Contraer el panel también desactiva el dibujo. Arrastrar el encabezado mueve el panel; el selector cambia el monitor donde aparece.
5. Para mostrar las marcas a los participantes, compartir **Pantalla completa** desde el navegador. Compartir solamente una ventana o pestaña puede excluir la superposición del escritorio. La herramienta nunca inicia una captura, cámara o micrófono.

Los botones y desplegables del menú siguen disponibles mientras se dibuja. No hace falta pulsar Escape para cambiar a borrador, otro color, grosor o tamaño de texto. El lienzo no activa su ventana al pulsarlo y excluye de su región nativa el panel, los desplegables abiertos y el diálogo de texto, incluso si cambia el orden de ventanas. Al terminar un trazo se libera la captura del ratón; si se pierde la captura se descarta la vista previa pendiente.

Las marcas permanecen solo en memoria. La × oculta el panel cuando no se comparte; durante una presentación lo devuelve contraído para evitar cerrarlo por accidente. **Salir completamente** en el icono del área de notificación cierra el programa deliberadamente.

## Abrir desde el botón web

El instalador único, `Instalar-Herramientas.cmd` del ZIP de respaldo y **Integrar con StudyRoom** dentro del panel comparten la misma instalación nativa. Copia únicamente sus archivos a `%LOCALAPPDATA%\StudyRoom\Herramientas`, crea un acceso directo del usuario, registra `studyroom-tools://open` en `HKCU\Software\Classes` y añade `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\StudyRoomTools` con la ruta exacta del ejecutable y `--background`. Inicia el compañero oculto para atender la presentación. No solicita administrador, no modifica políticas de ejecución ni necesita scripts PowerShell.

Antes de modificar la instalación verifica los hashes de los siete recursos incorporados, las rutas y la propiedad de registros existentes. No sobrescribe un protocolo o entrada de inicio pertenecientes a otra aplicación. Para actualizar el paquete anterior que ya esté activo, solo puede cerrar el ejecutable instalado cuya ruta, sesión de Windows, registro propio y hash conocido coincidan; nunca termina otros procesos por su nombre. Las versiones nuevas aceptan un evento local propio de salida y la versión publicada anterior se termina únicamente tras esas comprobaciones. Esa actualización aún debe abrirse por el usuario: una página no puede ejecutar una descarga silenciosamente.

Después el navegador puede pedir confirmación para abrir la aplicación externa. La aplicación acepta únicamente el URI literal `studyroom-tools://open`, sin consultas, rutas, comandos o tokens. Las opciones locales explícitas `--install`, `--uninstall`, `--background` y `--demo` son independientes del protocolo. Una segunda apertura manual muestra la instancia existente y vuelve a Interactuar; no duplica los lienzos.

## Mostrar y ocultar al compartir

StudyRoom envía una señal cada dos segundos a `http://127.0.0.1:8790/v1/sharing`: `{sessionId: UUID, active: boolean}`. No incluye pantalla, audio, documentos, nombres ni credenciales. El compañero escucha **solo loopback**, exige origen exacto `https://studyroom-sut.onrender.com` (o localhost/127.0.0.1:5173 para desarrollo), Host exacto, JSON válido y campos permitidos. Rechaza orígenes ausentes/ajenos y limita cuerpo a 512 bytes, cabeceras a 4096 bytes y cuatro clientes simultáneos. No realiza conexiones externas.

Para la preparación inicial, `GET /v1/health` devuelve exclusivamente `{"app":"StudyRoom.Tools","version":"1.1.0","ready":true}` con los mismos controles de Host y Origin. Su preflight solo permite GET; la consulta rechaza cuerpos, otras rutas y parámetros, no admite credenciales y no abre ventanas ni crea o renueva presentaciones. La página confirma la aplicación activa, no la presencia de un archivo descargado.

La primera presentación abre el botón contraído; los pulsos posteriores no cambian la herramienta ni el foco. Al detener la última presentación se ocultan panel, lienzos y ventana de texto, se libera el ratón y se eliminan marcas e historial. Sin pulsos durante ocho segundos también se oculta. Cada pestaña usa su propio identificador; una no cierra otra presentación activa. Un identificador detenido queda bloqueado diez segundos para que una petición tardía no lo reabra.

El navegador puede pedir permiso de acceso a aplicaciones/dispositivos locales. La aplicación respeta ese permiso; no se altera la seguridad del navegador. Si el compañero está apagado o el permiso se deniega, la videollamada continúa y se puede abrir manualmente. Si se elige **Salir completamente**, hay que iniciarlo otra vez para recuperar la apertura automática.

Para retirar la integración, cerrar las herramientas y ejecutar `Desinstalar-Herramientas.cmd` desde la carpeta instalada o el ZIP de respaldo. Solo elimina su protocolo, acceso directo, archivos conocidos y entrada de inicio si sigue apuntando exactamente a su ejecutable. Si Windows mantiene un archivo en uso, informa qué operación falta y se puede repetir desde el respaldo tras cerrar la aplicación. Nunca elimina recursivamente carpetas del usuario; conserva registros ajenos y rechaza enlaces a otras carpetas.

## Monitores, DPI y límites

Cada monitor tiene su propio lienzo y coordenadas normalizadas. El proceso solicita DPI por monitor V2 y coloca los lienzos sobre los límites físicos de cada pantalla. Al cambiar la disposición de monitores vuelve a Interactuar. Las marcas se ajustan al nuevo tamaño del monitor identificado, pero un mismo trazo no cruza de un monitor a otro: se inicia otro en la segunda pantalla.

Deshacer/rehacer actúa en el monitor usado más recientemente; el borrado general afecta a todos. Se conservan hasta 30 cambios, con un tope adicional de memoria; máximo 300 objetos y 100.000 puntos por monitor, 3.000 puntos por trazo y 200 caracteres por texto. El borrador de texto usa el área aproximada del bloque.

No puede dibujar sobre el escritorio seguro de UAC, la pantalla de bloqueo ni garantizar superposición en aplicaciones con pantalla completa exclusiva. La visibilidad exacta en la transmisión y las combinaciones de monitores/DPI necesitan ensayo en los equipos de los participantes.

## Construcción, pruebas y distribución

```powershell
.\scripts\desktop\build.ps1 -Test
.\scripts\desktop\package.ps1
```

Para comprobar solo el puente y el instalador sin crear ventanas, ejecutar `build.ps1 -HeadlessTest`. Sus 65 controles hacen peticiones HTTP reales en un puerto aislado, comprueban que consultar salud no cambia las presentaciones, verifican todos los recursos del EXE sin ejecutar su entrada principal y prueban reglas de propiedad de inicio/actualización con datos sintéticos. No escriben el registro, instalan archivos del usuario ni cierran procesos. `-Test` añade estos controles a las pruebas de dibujo existentes.

La construcción usa el compilador incluido con .NET Framework y bibliotecas de Windows; no descarga dependencias de pago. Los 53 controles comprueban geometría, borrador, historial, protocolo exacto, expiración/múltiples presentaciones, pulsos tardíos, respuestas HTTP reales del puente local (Origin, Host, límites y preflight) y estilos/regiones nativos del lienzo. Los 10 controles nuevos usan una ventana nativa siempre oculta, sin enviar entrada ni tomar el foco: verifican que el panel y los desplegables quedan fuera de la región de dibujo, que el área anterior se restaura al mover el menú y que el lienzo no activa su ventana. No sustituyen pruebas de interacción real del panel ni de captura de pantalla.

La salida principal es `apps/desktop/dist/Instalar-StudyRoom.exe`, con siete recursos incorporados; `StudyRoom-Herramientas.zip` contiene seis archivos operativos y `SHA256SUMS.txt` como respaldo. También se genera el hash de cada descarga. `package.ps1` copia ambos paquetes y sus hashes a `apps/web/public/desktop`. Excluyen fuentes, pruebas, archivos `.env`, datos de IA y credenciales. La web sirve estos archivos en `/desktop/`; no compila ni instala la aplicación dentro del navegador.

La aplicación no está firmada con un certificado comercial. Los avisos de Windows deben respetarse: no se cambian políticas ni se pide desactivar protecciones. El hash permite comparar la descarga con el paquete publicado; no reemplaza una firma de editor.

Para comprobar la interfaz sin exponer documentos, ejecutar `StudyRoom.Tools.exe --demo`. Abre un fondo de prueba neutro; el modo normal no muestra ese fondo. En ese modo los lienzos se exponen como ventanas para la inspección de accesibilidad. El programa no contiene automatización de entrada, red externa, captura de pantalla ni acceso a secretos.
