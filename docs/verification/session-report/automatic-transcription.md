# Transcripción automática al ingresar

`automatic-transcription-browser.json` registra ocho comprobaciones en Chromium
sin ventana visible. Se importó el hook real de la aplicación en una página
temporal ignorada, con dos identidades y respuestas de API simuladas. No hubo
cuentas reales, acceso al micrófono, cámara, escritorio ni motores de audio.

- Antes de ingresar a la sala no se solicita activar la transcripción.
- Al ingresar, cada participante envía automáticamente una activación, sin
  otra confirmación ni clic en el control de voz.
- Las actualizaciones manuales y periódicas no repiten esa activación.
- Pausar permanece pausado y no modifica la voz de la otra persona.
- Cambiar de sala activa la nueva sala; las respuestas de consulta y activación
  de la anterior se retuvieron y liberaron después de pausar la nueva. No
  cambiaron sus datos, errores ni estado de pausa.
- Los contadores instrumentados verificaron cero solicitudes de media real.
- Montar con membresía ya disponible bajo StrictMode de desarrollo deja un
  estado estable, sin bucles durante las consultas ni después de pausar.
- Montar normalmente con membresía ya disponible envía una activación.

React StrictMode en desarrollo vuelve a montar los efectos: en el caso de
membresía ya disponible se observaron dos escrituras iniciales con la misma
intención `enabled: true`. Esto se registra expresamente en la evidencia;
el montaje normal envía una. La idempotencia del backend y el reconocimiento
de audio se verifican en otras pruebas, no con estas respuestas simuladas.

La transcripción solo captura audio cuando la llamada proporciona un micrófono
encendido. Esta verificación comprueba el inicio automático y su estado;
no utiliza el micrófono del equipo ni certifica la exactitud de palabras.
