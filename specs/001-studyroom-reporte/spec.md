# Especificación funcional: colaboración y reporte de StudyRoom

## Features principales

### 1. Acceso y perfil

- **FR-001:** La persona puede registrarse, iniciar sesión y completar un perfil con nombre y fecha de nacimiento válida.
- **FR-002:** El sistema muestra salas compatibles con su edad. **El servidor vuelve a calcular y comprobar la edad al entrar en una sala con edad mínima.**
- **FR-003:** Una persona ajena a una sala privada o sesión no puede leer mensajes, archivos ni reportes de ella.

### 2. Salas y sesión en vivo

- **FR-004:** Un usuario autenticado puede crear, encontrar y entrar a una sala dentro de su capacidad, privacidad, edad mínima y estado vigentes.
- **FR-005:** Los miembros intercambian mensajes y enlaces, ven archivos nuevos y reciben cambios de la sala sin recargar la página.
- **FR-006:** Los participantes pueden conectar cámara y micrófono y compartir pantalla en una sesión autorizada. Los fallos de medios se muestran sin fingir conexión.
- **FR-007:** El anfitrión puede cerrar la sesión; desde entonces no se aceptan nuevos mensajes ni adjuntos para ella.

### 3. Documentos y transcripción

- **FR-008:** Un miembro puede enviar archivos permitidos, verlos en la sala y abrirlos mediante acceso privado autorizado. La interfaz indica la carga mientras se abre un archivo.
- **FR-009:** Con el micrófono activo y la captura personal habilitada, el sistema registra voz reconocida con hablante e intervalo. **Los lapsos sin captura o fallidos no se sustituyen por texto inventado.**
- **FR-010:** El texto extraído de PDF, DOCX e imágenes se utiliza como contexto solo si está disponible; se muestra si la extracción fue parcial o falló.

### 4. Reporte de la sesión

- **FR-011:** Al finalizar, cada participante autorizado puede abrir una sola cronología que intercala voz reconocida, mensajes, enlaces, imágenes y archivos según el momento de origen.
- **FR-012:** El reporte identifica hablante o remitente, conserva el texto original reconocido y muestra cobertura de transcripción y disponibilidad de adjuntos.
- **FR-013:** El participante puede descargar un ZIP con un Word del reporte y los originales disponibles en `adjuntos/`, numerados en orden de envío. El Word enlaza los adjuntos incluidos. **Si falla la recuperación de un original disponible, no se entrega un ZIP incompleto.**
- **FR-014:** Si quedan lotes de voz pendientes al cerrar, se informa que el reporte se prepara y no se ofrece el ZIP hasta que terminen o quede registrado el fallo.

### 5. Consultas a la IA

- **FR-015:** Un participante autorizado puede preguntar al asistente por su reporte usando el contexto disponible de voz, chat, enlaces, texto extraído y síntesis compartida.
- **FR-016:** La respuesta distingue lo generado de las fuentes originales, informa cobertura parcial o indisponibilidad y excluye notas privadas y recursos ajenos.

## Escenarios de aceptación

1. **Acceso permitido:** un usuario con edad y acceso suficientes entra a una sala abierta y recibe mensajes y archivos nuevos sin recargar.
2. **Acceso denegado:** un usuario sin membresía o menor que la edad mínima intenta entrar o leer un reporte y el servidor rechaza la petición sin entregar datos.
3. **Orden cronológico:** una frase procesada tarde aparece en el reporte según cuándo se dijo, junto con mensajes, enlaces e imágenes en su orden original.
4. **Original eliminado:** el reporte conserva la referencia de un archivo eliminado y declara que ya no está disponible.
5. **Exportación:** el ZIP de una sesión cerrada incluye Word y adjuntos con enlaces relativos; si falta un original disponible, no se entrega archivo parcial.
6. **IA no disponible:** al apagarse el PC anfitrión o el túnel, el reporte existente sigue consultable y el asistente informa que no está disponible.

## Lo que NO se va a construir en esta iteración (Non-Goals)

- Cuestionarios o calificación automática.
- Reconstrucción de voz nunca capturada o garantía de transcripción perfecta palabra por palabra.
- Aplicación móvil nativa, pagos o proveedor de IA comercial.
- Instalación obligatoria de herramientas de dibujo para entrar a StudyRoom.
- Certificación de estabilidad de 60 minutos con cuatro equipos sin una prueba real documentada.
