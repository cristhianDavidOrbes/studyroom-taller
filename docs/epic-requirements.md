## SUT-1 Experiencia y acceso

Épica funcional del MVP de StudyRoom. Agrupa historias de usuario relacionadas con experiencia y acceso.

Arquitectura de entrega gratuita
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Condición obligatoria de costo cero

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Aplicar límites, controles y fuentes definidos en SUT-26.



## SUT-9 Descubrimiento de salas

Épica funcional del MVP de StudyRoom. Agrupa historias de usuario relacionadas con descubrimiento de salas.

Arquitectura de entrega gratuita
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Condición obligatoria de costo cero

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Aplicar límites, controles y fuentes definidos en SUT-26.



## SUT-17 Gestión de salas

Épica funcional del MVP de StudyRoom. Agrupa historias de usuario relacionadas con gestión de salas.

Arquitectura de entrega gratuita
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Condición obligatoria de costo cero

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Aplicar límites, controles y fuentes definidos en SUT-26.



## SUT-26 Fundaciones técnicas

Épica funcional del MVP de StudyRoom. Agrupa historias de usuario relacionadas con fundaciones técnicas.

Arquitectura de entrega gratuita
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Condición obligatoria de costo cero

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Límites y controles obligatorios

Render: workspace gratuito y una API Free, 750 horas de instancia al mes compartidas. Sin método de pago para evitar cargos de transferencia/build; verificar cupos reales del workspace. Frontend Static Site gratuito y subdominios de proveedor; no comprar dominios.

Supabase Free: 500 MB de base y 1 GB de archivos; 5 GB de egreso no cacheado más 5 GB cacheado. Exportaciones y restauración manual gratuitas; la base puede pausarse tras una semana de inactividad.

Firebase Authentication Spark: email/contraseña, JWT y correos de recuperación predeterminados (150 diarios). Sin Blaze, SMS de pago ni SMTP contratado.

LiveKit Cloud Build: 5.000 minutos por participante y 50 GB de salida mensuales, hasta 100 conexiones. Los límites gratuitos son estrictos; registrar consumo y reservar margen. Cuatro participantes durante 60 minutos consumen 240 minutos; 20 sesiones así consumen 4.800, antes de considerar el límite de tráfico.

Ollama local y ngrok Free: ejecutar solo modelos locales con licencia que permita uso gratuito, con modo cloud desactivado. Controlar cuotas ngrok y capacidad del PC; no depender de APIs de pago o créditos temporales.

Toda dependencia operativa debe conservar presupuesto $0: repositorio y CI gratuitos, ningún worker/cron de pago, ninguna réplica de pago ni actualización automática de planes. Advertir sobre cuotas antes de admitir uso adicional.

IA local mediante ngrok

La IA se ejecuta localmente con Ollama. Flujo: cliente React → NestJS en Render Free → HTTPS ngrok Free → servicio local autenticado → Ollama en 127.0.0.1:11434. Usar el dominio de desarrollo gratuito asignado por ngrok y un túnel HTTP normal, sin AI Gateway, Traffic Policy de pago ni créditos temporales. ngrok transporta texto/contexto y respuestas de IA; cámara, audio y pantalla permanecen en LiveKit. El computador que sirve Ollama debe estar encendido y conectado. Controlar 1 GB de transferencia y 20.000 solicitudes HTTP mensuales; al agotarse, mostrar IA pendiente o no disponible sin contratar un plan.

Fuentes oficiales de la planificación (verificadas el 1 de octubre de 2026)

Render: planes gratuitos y límites

Supabase Free

LiveKit Build

LiveKit: cuotas y límites estrictos

LiveKit: reconexión y TURN

LiveKit: flujo adaptativo

LiveKit: simulcast y Dynacast

Firebase: Spark

Firebase: límites de autenticación

Firebase: recuperación de contraseña

ngrok: límites gratuitos

GitHub Actions: uso gratuito

GitHub: presupuesto y bloqueo

Servicio de IA local y validación

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.

Fuentes de IA local

Ollama: API local y autenticación

Ollama: ngrok, modo local y límites de recursos

Ollama: API chat

Qwen3 4B: modelo y licencia

ngrok: cuotas de plan Free



## SUT-34 Colaboración en sala

Épica funcional del MVP de StudyRoom. Agrupa historias de usuario relacionadas con colaboración en sala.

Arquitectura de entrega gratuita
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Condición obligatoria de costo cero

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Validación obligatoria de estabilidad y fluidez

Validar una sesión de al menos 60 minutos con 4 participantes en dispositivos y redes distintas, usando cámara, micrófono, chat y pantalla compartida. Esta es la carga mínima de validación; probar la capacidad configurada de cada sala antes de ampliarla.

Perfil de prueba normal: por participante, subida disponible de al menos 3 Mbps, bajada de al menos 6 Mbps, RTT de red menor de 150 ms y pérdida menor de 1%. Objetivos de aceptación: RTT WebRTC p95 menor de 300 ms, congelamientos de video inferiores al 1% del tiempo recibido, sin desconexiones inesperadas y audio inteligible. Medir con getStats, eventos SDK y evidencia de la sesión; son objetivos de prueba, no garantías del proveedor.

Validar UDP y TURN/TLS con UDP bloqueado, cambio de Wi-Fi a datos y un corte de red de 5 segundos. Mostrar reconexión y recuperar audio/video en un objetivo de 10 segundos tras restablecer una red utilizable; registrar el resultado real.

Habilitar simulcast, adaptiveStream y dynacast. Perfil inicial de cámara 540p/24 fps con reducción a 360p; pantalla hasta 720p/15 fps priorizando legibilidad. Ajustar bitrate a mediciones, priorizar voz y permitir solo audio cuando la red no soporte video.

Reiniciar/re desplegar la API en una llamada de prueba: la ruta de medios LiveKit debe seguir activa; chat, permisos nuevos y señalamientos deben mostrar pérdida temporal y resincronizarse al recuperarse Socket.IO, sin crear participantes duplicados.

Medir minutos por participante y bytes descargados por sala. LiveKit Build incluye 5.000 minutos de participante y 50 GB de salida al mes, con límite estricto y hasta 100 conexiones simultáneas. Alertar al 80% y reservar margen antes de admitir nuevas salas; si no hay cuota, informar antes de entrar, sin activar facturación.

IA local mediante ngrok

La IA se ejecuta localmente con Ollama. Flujo: cliente React → NestJS en Render Free → HTTPS ngrok Free → servicio local autenticado → Ollama en 127.0.0.1:11434. Usar el dominio de desarrollo gratuito asignado por ngrok y un túnel HTTP normal, sin AI Gateway, Traffic Policy de pago ni créditos temporales. ngrok transporta texto/contexto y respuestas de IA; cámara, audio y pantalla permanecen en LiveKit. El computador que sirve Ollama debe estar encendido y conectado. Controlar 1 GB de transferencia y 20.000 solicitudes HTTP mensuales; al agotarse, mostrar IA pendiente o no disponible sin contratar un plan.

Fuentes oficiales de la planificación (verificadas el 1 de octubre de 2026)

LiveKit Build

LiveKit: cuotas y límites estrictos

LiveKit: reconexión y TURN

LiveKit: flujo adaptativo

LiveKit: simulcast y Dynacast

ngrok: límites gratuitos

Prueba de convivencia con IA local

Repetir la llamada de 4 participantes y 60 minutos mientras el PC ejecuta una generación local y tiene un resumen/quiz en espera. Mantener los objetivos de RTT, congelamientos, audio y reconexión; medir CPU/GPU y RAM/VRAM. Si no se cumplen, reducir carga y contexto de IA o diferir trabajos secundarios; no aceptar la videollamada sin esta evidencia.



## SUT-45 IA para el estudio

Épica funcional del MVP de StudyRoom. Agrupa historias de usuario relacionadas con ia para el estudio.

Arquitectura de entrega gratuita
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Condición obligatoria de costo cero

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Criterios de ejecución

Establecer presupuesto $0 para IA. Consultar los límites gratuitos de solicitudes y transferencia de ngrok y medir RAM/VRAM y velocidad del modelo local; imponer cupos por usuario y globales, caché autorizada, límite de contexto/salida, concurrencia uno y reintento con backoff ante servidor ocupado. Nunca cambiar a modelo o API de pago al agotar cuota; mostrar espera y cuándo puede reintentarse sin inventar una respuesta.

Fuentes oficiales de la planificación (verificadas el 1 de octubre de 2026)

Render: planes gratuitos y límites

Supabase Free

Implementación obligatoria de IA local

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.

Fuentes de IA local

Ollama: API local y autenticación

Ollama: ngrok, modo local y límites de recursos

Ollama: API chat

Qwen3 4B: modelo y licencia

ngrok: cuotas de plan Free



## SUT-52 Cierre y aprendizaje

Épica funcional del MVP de StudyRoom. Agrupa historias de usuario relacionadas con cierre y aprendizaje.

Arquitectura de entrega gratuita
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono. Guardar sesión y resultados en PostgreSQL y documentos en Supabase Storage Free.

Condición obligatoria de costo cero

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Criterios de ejecución

Establecer presupuesto $0 para IA. Consultar los límites gratuitos de solicitudes y transferencia de ngrok y medir RAM/VRAM y velocidad del modelo local; imponer cupos por usuario y globales, caché autorizada, límite de contexto/salida, concurrencia uno y reintento con backoff ante servidor ocupado. Nunca cambiar a modelo o API de pago al agotar cuota; mostrar espera y cuándo puede reintentarse sin inventar una respuesta.

Fuentes oficiales de la planificación (verificadas el 1 de octubre de 2026)

Render: planes gratuitos y límites

Supabase Free

Implementación obligatoria de IA local

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.

Fuentes de IA local

Ollama: API local y autenticación

Ollama: ngrok, modo local y límites de recursos

Ollama: API chat

Qwen3 4B: modelo y licencia

ngrok: cuotas de plan Free

