# Validación en dispositivos y servicios reales

Este registro no sustituye pruebas ejecutadas. Marcar cada resultado sólo con fecha, versión, condiciones y evidencia.

## Llamada de 60 minutos (SUT-38 a SUT-41)

- Cuatro participantes en equipos y redes distintos, cámara/audio/chat/pantalla; repetir con la capacidad máxima admitida (inicialmente 4).
- Red de referencia por participante: 3 Mbps subida, 6 Mbps bajada, RTT de red <150 ms, pérdida <1%.
- Medir RTT WebRTC p95 <300 ms, congelamientos <1%, audio inteligible, desconexiones inesperadas=0.
- Probar UDP y TURN/TLS bloqueando UDP; cambiar Wi-Fi/datos; cortar la red cinco segundos. Medir recuperación ≤10 segundos después de restablecer conectividad útil.
- Reiniciar NestJS durante la llamada: audio/video siguen por LiveKit. Chat/señalamientos se reconectan y recuperan estado sin duplicar usuarios.
- Menú pequeño arriba a la derecha de la cámara: señalar/dibujar/borrar sobre pantalla compartida; coordenadas correctas con resoluciones distintas y barras negras; visible para los demás; rechaza acciones sin permiso.
- Herramientas de escritorio (ampliación solicitada el 2 de octubre): abrir el cuadro flotante, cambiar entre escritorio y otras aplicaciones, expandir/contraer y comprobar lápiz, borrador por objeto, borrar todo, figuras, color, grosor y texto con tamaño. Elegir **Pantalla completa** y verificar que el emisor y otro participante ven las mismas marcas. Contrastar con captura de pestaña/ventana; Esc e Interactuar deben devolver el control del escritorio sin borrar marcas. Verificar monitor y escala DPI en cada equipo.
- Repetir 60 minutos con una pregunta local y resumen/quiz en espera; registrar CPU/GPU/RAM/VRAM y calidad. Reducir carga de IA si afecta el audio.
- Registrar cuota inicial/final, reserva de minutos y ancho de banda; alertas 80%; agotamiento impide nuevos consumos sin cobro.

## Cuentas y datos

- Registro, credenciales inválidas, expiración/revocación; email real de recuperación en español, enlace vencido y no enumeración de cuentas.
- Dos usuarios distintos verifican privacidad de notas, archivos, salas, preguntas privadas e historial; usuario expulsado no conserva acceso.
- Restaurar copia de seguridad PostgreSQL en base vacía y verificar relaciones/documentos.
- Probar archivo inválido, sobredimensionado y cuota llena; eliminar archivo y comprobar su inaccesibilidad.
- Navegación con teclado, lector de pantalla, zoom200%, móvil estrecho, contraste y reducción de movimiento.

## IA local y recuperación

- Español, fidelidad a fuentes y quiz con respuestas comprobables; no atribuir audio que no se transcribió.
- PC apagado/suspendido, túnel caído, token inválido,429/503, timeout y cancelación: preservar datos, mostrar estado real y reintento, nunca usar proveedor de pago.
- Reiniciar API durante un trabajo; lease vencido recupera ejecución; resultados idempotentes.
- Verificar que el dominio ngrok no responde a inferencia sin secreto y Ollama no escucha en interfaces públicas.

## Despliegue gratuito

- Render Web Service Free y Static Site gratuito; Firebase Spark; Supabase Free; LiveKit Build; ngrok Free. No adjuntar tarjeta ni activar mejoras facturables.
- Revisar cuotas oficiales vigentes antes de publicar; comprobar variables secretas exclusivamente en servidor y ausencia de claves en bundle/repositorio.
- Validar cold start Render, HTTPS, CORS/orígenes y dominio Firebase autorizado.

Estado inicial: pendiente de ejecución real; las pruebas automáticas locales se registran separadamente.
