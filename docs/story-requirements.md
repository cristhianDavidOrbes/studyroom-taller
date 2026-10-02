## SUT-2 Registro e inicio de sesión

Historia de usuario
Como estudiante, quiero registrarme e iniciar sesión para acceder de forma segura a mis salas y recursos.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Usar Firebase Authentication Spark con email/contraseña y dominio de proveedor. NestJS valida firma, emisor, audiencia y vencimiento del JWT; asociar uid a perfil PostgreSQL mediante Prisma. Cubrir alta, acceso, credenciales inválidas y sincronización idempotente del perfil.



## SUT-3 Onboarding y perfil del estudiante

Historia de usuario
Como estudiante, quiero completar mi perfil e intereses para personalizar mi experiencia de estudio.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-4 Recuperación de contraseña

Historia de usuario
Como estudiante, quiero recuperar mi contraseña para volver a acceder a mi cuenta.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

La recuperación envía el correo real mediante Firebase Authentication Spark y permite definir una contraseña nueva desde el enlace. Usar plantillas en español y dominios autorizados gratuitos; probar correo recibido, enlace inválido/vencido, no enumeración de cuentas y exceso de cuota. La cuota Spark documentada es 150 correos de recuperación por día; no activar Blaze, SMTP de pago ni comprar dominio.



## SUT-5 Gestión de sesión y cierre seguro

Historia de usuario
Como estudiante, quiero cerrar mis sesiones para proteger mi cuenta en dispositivos compartidos.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Cerrar la sesión del cliente y aplicar la política de revocación de tokens/sesiones en NestJS y Firebase cuando corresponda. Probar expiración, logout y rechazo de sesión revocada sin añadir servicios de pago.



## SUT-6 Editar intereses y preferencias de estudio

Historia de usuario
Como estudiante, quiero actualizar mis intereses y preferencias para recibir contenido relevante.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-7 Diseño responsive y accesible

Historia de usuario
Como estudiante, quiero usar StudyRoom desde móvil o computador con una interfaz accesible.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-8 Preferencias de notificaciones

Historia de usuario
Como estudiante, quiero elegir qué notificaciones recibir para mantener el control de mis avisos.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-10 Explorar, buscar y filtrar salas

Historia de usuario
Como estudiante, quiero explorar, buscar y filtrar salas para encontrar una sesión adecuada.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-11 Ver tarjetas y detalle de una sala

Historia de usuario
Como estudiante, quiero ver el detalle de una sala para decidir si deseo unirme.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-12 Filtrar por materia, modalidad y nivel

Historia de usuario
Como estudiante, quiero filtrar por materia, modalidad y nivel para reducir resultados irrelevantes.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-13 Ordenar salas por relevancia y actividad

Historia de usuario
Como estudiante, quiero ordenar las salas para identificar primero las más útiles.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-14 Ver salas recomendadas según intereses

Historia de usuario
Como estudiante, quiero ver salas recomendadas según mi perfil para descubrir grupos compatibles.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-15 Consultar salas programadas

Historia de usuario
Como estudiante, quiero consultar salas futuras para planificar mi estudio.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-16 Gestionar estados vacíos y sin resultados

Historia de usuario
Como estudiante, quiero recibir orientación cuando no existan resultados para ajustar mi búsqueda.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-18 Unirse, salir y controlar capacidad

Historia de usuario
Como estudiante, quiero unirme o salir de una sala respetando su capacidad para participar correctamente.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Comprobar plazas de sala, autorización y cuota gratuita global antes de emitir token LiveKit. Evitar admisiones simultáneas que excedan capacidad. Si no hay recursos, mostrar el estado antes de entrar; al salir actualizar ocupación y consumo.



## SUT-19 Crear una sala de estudio

Historia de usuario
Como estudiante, quiero crear una sala con sus datos básicos para organizar una sesión.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-20 Editar datos de una sala

Historia de usuario
Como anfitrión, quiero editar los datos de mi sala para mantenerla actualizada.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-21 Configurar privacidad y código de acceso

Historia de usuario
Como anfitrión, quiero definir privacidad y código de acceso para controlar quién entra a mi sala.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-22 Invitar participantes mediante enlace

Historia de usuario
Como anfitrión, quiero compartir un enlace de invitación para convocar a otros estudiantes.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-23 Gestionar roles de anfitrión y moderador

Historia de usuario
Como anfitrión, quiero asignar roles para administrar la colaboración de manera ordenada.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-24 Programar una sala futura

Historia de usuario
Como estudiante, quiero programar una sala para reunir a mi grupo en una fecha definida.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-25 Cerrar o cancelar una sala

Historia de usuario
Como anfitrión, quiero cerrar o cancelar una sala para finalizar su disponibilidad.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-27 Persistir usuarios, salas y sesiones

Historia de usuario
Como equipo de producto, quiero persistir usuarios, salas y sesiones para conservar la información del servicio.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Persistir usuarios, salas y sesiones en PostgreSQL de Supabase Free mediante Prisma y conexión cifrada. Respaldar por exportación manual gratuita y probar restauración; no depender del disco efímero de Render. La base Free tiene 500 MB y puede pausarse tras una semana inactiva: documentar recuperación y comprobar tamaño antes del uso.



## SUT-28 Exponer API segura para StudyRoom

Historia de usuario
Como aplicación cliente, quiero consumir una API segura para operar las funciones de StudyRoom.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Desplegar NestJS como un solo Render Web Service con compute Free. Mantener CORS para el frontend gratuito, validación JWT/roles, secretos solo en servidor y endpoint de salud. Manejar el arranque en frío en la pantalla de entrada: Render duerme tras 15 minutos sin tráfico y puede tardar aproximadamente un minuto en arrancar; no simular actividad con pings para prometer disponibilidad.

La IA se ejecuta localmente con Ollama. Flujo: cliente React → NestJS en Render Free → HTTPS ngrok Free → servicio local autenticado → Ollama en 127.0.0.1:11434. Usar el dominio de desarrollo gratuito asignado por ngrok y un túnel HTTP normal, sin AI Gateway, Traffic Policy de pago ni créditos temporales. ngrok transporta texto/contexto y respuestas de IA; cámara, audio y pantalla permanecen en LiveKit. El computador que sirve Ollama debe estar encendido y conectado. Controlar 1 GB de transferencia y 20.000 solicitudes HTTP mensuales; al agotarse, mostrar IA pendiente o no disponible sin contratar un plan.



## SUT-29 Autorizar acciones según el rol

Historia de usuario
Como plataforma, quiero autorizar acciones por rol para proteger las funciones de cada participante.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Validar los JWT de Firebase Authentication y resolver autorización en NestJS contra los roles y pertenencia de PostgreSQL. Probar tokens inválidos/vencidos, acceso a otra sala y revocación.



## SUT-30 Gestionar migraciones y datos iniciales

Historia de usuario
Como equipo técnico, quiero gestionar migraciones y datos iniciales para desplegar entornos repetibles.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Ejecutar y versionar migraciones Prisma para Supabase Free sin one-off jobs o shell de pago de Render. Probar migración y restauración en local, seed idempotente y despliegue controlado sin crear otro Web Service que consuma horas gratuitas.



## SUT-31 Configurar almacenamiento de archivos

Historia de usuario
Como plataforma, quiero almacenar archivos de forma segura para compartir materiales de estudio.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Usar Supabase Storage Free con controles por usuario y sala, nombres no predecibles y URLs firmadas cuando corresponda. No usar el disco de Render para archivos persistentes. Cuotas: 1 GB de archivos, 5 GB de egreso no cacheado y 5 GB cacheado al mes; imponer límites de tamaño, verificar cuota antes de subir y permitir eliminación por el propietario.



## SUT-32 Registrar errores y eventos relevantes

Historia de usuario
Como equipo técnico, quiero registrar errores y eventos para diagnosticar problemas y mejorar el servicio.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Registrar errores y métricas básicas con logs incluidos y registros PostgreSQL acotados: tamaño, llamadas externas, minutos de participantes, consumo IA, latencia y reconexiones. Redactar secretos y aplicar retención configurable; sin observabilidad de pago.



## SUT-33 Automatizar pruebas, calidad e integración continua

Historia de usuario
Como equipo técnico, quiero automatizar verificaciones para detectar errores antes de publicar cambios.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Mantener Jest, Playwright y GitHub Actions con runners estándar. Repositorios privados GitHub Free tienen 2.000 minutos mensuales y 500 MB de artefactos; limitar retención y usar bloqueo de gasto o ejecución local al agotar la cuota. No publicar un repositorio privado para obtener gratuidad. Validar el despliegue Render Free y los límites de todos los proveedores como requisito de publicación.



## SUT-35 Participantes en tiempo real

Historia de usuario
Como estudiante, quiero ver los participantes conectados en tiempo real para saber con quién estudio.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-36 Chat grupal en tiempo real

Historia de usuario
Como estudiante, quiero enviar mensajes al grupo para colaborar durante la sesión.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-37 Reacciones y levantar la mano

Historia de usuario
Como estudiante, quiero usar reacciones y levantar la mano para comunicarme sin interrumpir.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-38 Videollamada grupal

Historia de usuario
Como estudiante, quiero participar en videollamadas para estudiar cara a cara con mi grupo.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Validar una sesión de al menos 60 minutos con 4 participantes en dispositivos y redes distintas, usando cámara, micrófono, chat y pantalla compartida. Esta es la carga mínima de validación; probar la capacidad configurada de cada sala antes de ampliarla.

Perfil de prueba normal: por participante, subida disponible de al menos 3 Mbps, bajada de al menos 6 Mbps, RTT de red menor de 150 ms y pérdida menor de 1%. Objetivos de aceptación: RTT WebRTC p95 menor de 300 ms, congelamientos de video inferiores al 1% del tiempo recibido, sin desconexiones inesperadas y audio inteligible. Medir con getStats, eventos SDK y evidencia de la sesión; son objetivos de prueba, no garantías del proveedor.

Validar UDP y TURN/TLS con UDP bloqueado, cambio de Wi-Fi a datos y un corte de red de 5 segundos. Mostrar reconexión y recuperar audio/video en un objetivo de 10 segundos tras restablecer una red utilizable; registrar el resultado real.

Habilitar simulcast, adaptiveStream y dynacast. Perfil inicial de cámara 540p/24 fps con reducción a 360p; pantalla hasta 720p/15 fps priorizando legibilidad. Ajustar bitrate a mediciones, priorizar voz y permitir solo audio cuando la red no soporte video.

Reiniciar/re desplegar la API en una llamada de prueba: la ruta de medios LiveKit debe seguir activa; chat, permisos nuevos y señalamientos deben mostrar pérdida temporal y resincronizarse al recuperarse Socket.IO, sin crear participantes duplicados.

Medir minutos por participante y bytes descargados por sala. LiveKit Build incluye 5.000 minutos de participante y 50 GB de salida al mes, con límite estricto y hasta 100 conexiones simultáneas. Alertar al 80% y reservar margen antes de admitir nuevas salas; si no hay cuota, informar antes de entrar, sin activar facturación.

Prueba de convivencia con IA local

Repetir la llamada de 4 participantes y 60 minutos mientras el PC ejecuta una generación local y tiene un resumen/quiz en espera. Mantener los objetivos de RTT, congelamientos, audio y reconexión; medir CPU/GPU y RAM/VRAM. Si no se cumplen, reducir carga y contexto de IA o diferir trabajos secundarios; no aceptar la videollamada sin esta evidencia.



## SUT-39 Controles de micrófono, cámara y dispositivos

Historia de usuario
Como estudiante, quiero controlar micrófono, cámara y dispositivos para gestionar mi participación.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Integrar controles de dispositivos del SDK LiveKit, permisos de navegador, selección/cambio de micrófono y cámara y estados de conexión. Activar cancelación de eco, reducción de ruido y control de ganancia del navegador cuando estén disponibles; conservar preferencia de silencio durante reconexión.



## SUT-40 Compartir pantalla

Historia de usuario
Como estudiante, quiero compartir mi pantalla para explicar material al grupo.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Compartir pantalla mediante getDisplayMedia y LiveKit WebRTC, con fin de captura, cambio de tamaño, legibilidad de texto y adaptación de bitrate. Probar cámara y audio simultáneos. No exigir capturar audio de sistema donde el navegador no lo soporte ni contratar un retransmisor.



## SUT-41 Señalar en pantalla desde el menú de cámara

Historia de usuario
Como estudiante, quiero abrir un menú pequeño en la esquina superior derecha del área de cámara y activar herramientas para señalar contenido en mi pantalla durante la sesión.

Dificultad estimada: Alta

Alcance funcional
El acceso está integrado en el área de cámara. Las herramientas actúan sobre el contenido de pantalla que se está mostrando durante la sesión, sin abrir un lienzo independiente.

Criterios de aceptación

El área de cámara muestra un menú compacto en su esquina superior derecha.

Al abrir el menú, el estudiante puede activar las herramientas de señalamiento.

El señalamiento se superpone al contenido de pantalla de la sesión.

El menú se puede cerrar y las herramientas se pueden desactivar sin interrumpir la cámara o la sesión.

El acceso respeta los permisos de la sesión y la interfaz informa los errores.

Las pruebas cubren apertura y cierre del menú, activación y desactivación, señalamiento sobre contenido y un caso de acceso no autorizado.

Visibilidad al compartir pantalla

Cuando el estudiante comparte pantalla, los señalamientos que realiza son visibles en tiempo real para los demás participantes de la misma sala.

Las señales se asocian a la pantalla compartida activa y respetan los permisos de la sesión.

Las pruebas verifican el flujo con al menos dos participantes y un intento de envío desde otra sala.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Mantener el menú pequeño arriba a la derecha del área de cámara. Los señalamientos se publican por Socket.IO solo para la sala y pantalla activa; usar coordenadas normalizadas, limitar eventos por segundo y resincronizar al reconectar. Los demás participantes deben verlos sobre el mismo contenido compartido.



## SUT-42 Compartir y consultar documentos

Historia de usuario
Como estudiante, quiero compartir y consultar documentos para trabajar sobre el mismo material.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Almacenar los documentos en Supabase Storage Free y los permisos/metadatos en PostgreSQL. Validar carga, consulta, acceso a otra sala, eliminación, tamaño máximo y cuota sin disco persistente o almacenamiento de pago.



## SUT-43 Crear notas privadas durante la sesión

Historia de usuario
Como estudiante, quiero tomar notas privadas para conservar mis apuntes.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-44 Usar temporizador y modo de enfoque

Historia de usuario
Como estudiante, quiero usar un temporizador para organizar periodos de estudio y descanso.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.



## SUT-46 Configurar el proveedor de IA de forma desacoplada

Historia de usuario
Como equipo técnico, quiero desacoplar el proveedor de IA para poder configurarlo sin afectar la aplicación.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Mantener un contrato de adaptador de IA desacoplado y configurar Ollama local mediante ngrok Free como proveedor inicial. Modelo y límites se verifican con el PC y panel ngrok; rechazar modelos cloud y mantener el secreto del servicio local en NestJS. Enviar únicamente contexto autorizado minimizado, sin claves ni datos personales innecesarios.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-47 Hacer preguntas directas a la IA

Historia de usuario
Como estudiante, quiero hacer preguntas a la IA para recibir apoyo mientras estudio.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-48 Invocar la IA desde el chat con @IA

Historia de usuario
Como estudiante, quiero invocar a la IA desde el chat para pedir ayuda sin salir de la conversación.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-49 Enviar contexto autorizado de chat y documentos

Historia de usuario
Como estudiante, quiero que la IA use contexto autorizado de la sesión para recibir respuestas relevantes.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-50 Controlar límites de uso, errores y costos de IA

Historia de usuario
Como equipo técnico, quiero controlar límites, errores y consumo para operar la IA de forma sostenible.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Establecer presupuesto $0 para IA. Consultar los límites gratuitos de solicitudes y transferencia de ngrok y medir RAM/VRAM y velocidad del modelo local; imponer cupos por usuario y globales, caché autorizada, límite de contexto/salida, concurrencia uno y reintento con backoff ante servidor ocupado. Nunca cambiar a modelo o API de pago al agotar cuota; mostrar espera y cuándo puede reintentarse sin inventar una respuesta.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-51 Valorar y reportar respuestas de IA

Historia de usuario
Como estudiante, quiero valorar respuestas de IA para ayudar a mejorar su utilidad.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-53 Finalizar y almacenar una sesión

Historia de usuario
Como anfitrión, quiero finalizar y almacenar una sesión para conservar su resultado.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Al finalizar, persistir estado y contexto autorizado antes de encolar trabajos idempotentes en PostgreSQL. La cola se consume dentro del proceso NestJS Render Free con concurrencia acotada; reanudar tras reinicio o arranque. Mostrar pendiente, procesando, completado o error sin perder la sesión.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-54 Generar resumen automático

Historia de usuario
Como estudiante, quiero recibir un resumen automático para repasar lo estudiado.

Dificultad estimada: Alta

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Generar resumen mediante Ollama local mediante ngrok Free con el contexto autorizado de la sesión y guardar resultado y fuentes. Mantener cola durable PostgreSQL y reintentos sin duplicar resultados; comprobar qué contenido existe realmente y no inventar una transcripción del audio.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-55 Generar puntos clave y acuerdos

Historia de usuario
Como estudiante, quiero consultar puntos clave y acuerdos para dar continuidad al trabajo del grupo.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Generar puntos clave y acuerdos mediante Ollama local mediante ngrok Free a partir del contexto autorizado persistido. Usar cola PostgreSQL, idempotencia y referencias a la sesión; validar fidelidad de los acuerdos y tratar falta de contexto o cuota.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-56 Generar un quiz de repaso

Historia de usuario
Como estudiante, quiero generar un quiz para comprobar mi comprensión después de la sesión.

Dificultad estimada: Media

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Generar y almacenar quiz y respuestas con Ollama local mediante ngrok Free sobre el contenido autorizado de la sesión. Validar formato y respuesta correcta, idempotencia, autorización y estados de cuota. Mantener cola PostgreSQL y recuperación de trabajos.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-57 Consultar historial y reporte de aprendizaje

Historia de usuario
Como estudiante, quiero revisar mi historial y reporte de aprendizaje para conocer mi progreso.

Dificultad estimada: Baja

Criterios de aceptación

La función está disponible para el rol autorizado.

La interfaz muestra estados de carga, éxito y error.

La información se valida y persiste o sincroniza cuando corresponde.

Las pruebas cubren el flujo principal y una condición de error.

Criterio transversal de entrega gratuita

Presupuesto de servicios: $0. Mantener únicamente los planes gratuitos, sin facturación por consumo ni cambios automáticos a planes de pago. Toda función y criterio de las épicas, historias, tareas y actividades sigue siendo obligatorio; una cuota agotada produce un estado informado de espera o indisponibilidad y nunca un cargo. Revalidar las cuotas del proveedor antes del despliegue.

Arquitectura y cuotas obligatorias: SUT-26; cumplir también la épica y todas las tareas y actividades relacionadas.

Criterios adicionales de implementación y validación

Consultar historial y reporte en PostgreSQL de Supabase Free, con filtros y permisos. Los trabajos pendientes por pausa de Render o cuota IA aparecen claramente; no presentar una generación pendiente como resultado final.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.

