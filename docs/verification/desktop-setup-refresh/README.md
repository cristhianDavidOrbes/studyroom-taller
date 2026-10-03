# Instalación, detección y entrada a StudyRoom

Esta revisión responde a dos fallos diferentes: la página entraba automáticamente al detectar la herramienta y Windows bloqueaba el instalador sin firma por no poder verificar su publicador.

La pantalla ahora confirma **La aplicación ya está instalada** y espera **Continuar**. Conserva el destino original, muestra cuatro pasos de instalación y explica los bloqueos de Windows. La comprobación inicial tiene un tiempo máximo y deja un estado estable; se puede reintentar o volver a abrir la herramienta. Descargar un archivo o recibir la respuesta de otra aplicación nunca habilita la entrada.

`local/browser.json` y sus capturas documentan ocho verificaciones del componente real en un navegador aislado con respuestas de prueba para autenticación, perfil y salud de la herramienta. Comprueban escritorio y móvil, descarga sin instalar, éxito sin redirección, Continuar con destino intacto, recarga y aplicación incorrecta. Estas pruebas no instalan ni ejecutan el instalador.

Cuando esté presente, `production/browser.json` documenta la misma revisión del sitio publicado. Su último caso retira la simulación de salud y consulta el puente real ya instalado, únicamente mediante GET de salud y con permiso de conexión local en ese navegador de prueba. No inicia el dibujo ni captura pantalla, cámara o micrófono. Las cuentas y perfiles siguen siendo respuestas aisladas de prueba; no se envían credenciales personales.

El instalador ahora confirma que su aplicación hija responde antes de anunciar éxito. Las comprobaciones de ese comportamiento se ejecutan con el puente y datos de prueba, sin modificar la instalación del usuario. El [diagnóstico de firma](../desktop-signing-diagnosis.json) y el [escaneo de Defender](../desktop-defender-scan.json) distinguen autenticidad del publicador y detección de amenazas. Que un escaneo no encuentre amenazas no proporciona una firma ni garantiza el resultado de otros antivirus.

La distribución sin firma sigue pudiendo ser bloqueada por Smart App Control. La [preparación de Microsoft Store](../../desktop-store.md) es un borrador técnico validado, **no publicable ni instalable para clientes** hasta disponer de identidad real, comprobar su ejecución y obtener certificación/firma de Microsoft. No se desactivaron protecciones ni se añadieron exclusiones o certificados para evitar el bloqueo.
