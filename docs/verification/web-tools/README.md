# Herramientas web y vínculo con el menú de Windows

Ensayo completado **2026-10-02 09:05 UTC** contra Vite/API locales, Firebase Auth emulator y el SFU LiveKit configurado real. Dos navegadores Chromium aislados enviaron **cámara, micrófono y pantalla sintéticos**. No se capturó ningún dispositivo físico ni el escritorio personal.

`media-collaboration.json` registra siete comprobaciones aprobadas:

1. Acceso e instrucciones de herramientas Windows para ambos participantes antes de compartir; URI exacta `studyroom-tools://open` sin secretos y descarga del ZIP indicada.
2. Dos conexiones reales al SFU con recepción de las dos cámaras sintéticas.
3. Pantalla canvas sintética recibida por el segundo navegador.
4. Puntero normalizado y rechazo de herramientas web a un participante sin permiso.
5. Cambio a moderador, señalamiento por teclado y receptor móvil de 430 px.
6. Rectángulo, óvalo, línea, flecha y lápiz transmitidos con color/grosor, texto seguro con tamaño, visible en emisor y receptor; borrado individual sin eliminar las otras marcas.
7. Limpieza de marcas y detención de pantalla.

El ensayo también comprobó el ciclo de vida del vínculo de escritorio usando **un stub HTTP 204 solo para el puente local**: cámara/micrófono no enviaron solicitudes; ver una pantalla remota tampoco; compartir la pantalla propia sí renovó el permiso temporal y detenerla envió `active:false`. La aplicación Windows real y su reapertura/ocultamiento se verifican por separado. Este stub no reemplaza el SFU, la API ni los eventos de anotaciones, que fueron reales.

Las capturas `full-tools-desktop.png`, `full-tools-receiver-mobile.png` y `media-mobile.png` fueron revisadas visualmente. Se corrigió el recorte lateral del menú de la cámara y se conservaron proporciones al cambiar el tamaño de la pantalla receptora.

Build de producción correcto y **16 pruebas unitarias** aprobadas en cuatro archivos: coordenadas/letterboxing, geometría/borrado, SVG/texto seguro, guía de captura desconocida en Firefox/Zen y vínculo local con tiempo máximo, limpieza idempotente y recuperación. El vínculo solo envía un UUID aleatorio y un booleano; no envía identidad, sala, credenciales, audio, video ni capturas.

La primera conexión local permite hasta diez segundos para el permiso del navegador, sin detener medios; las siguientes expiran a los 750 ms y no se solapan. La renovación ocurre cada dos segundos. Fin de pista, salida y desmontaje envían liberación best-effort; la aplicación nativa aplica su propia expiración de ocho segundos. No se abren protocolos externos automáticamente ni se omiten permisos del navegador. Compatibilidad de permisos locales basada en [la documentación de MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Local_network_access).

Estos resultados no demuestran una llamada de cuatro dispositivos físicos durante 60 minutos, ni verifican captura del menú nativo a través de Zen en un monitor real. Esa aceptación permanece separada de este ensayo sintético.
