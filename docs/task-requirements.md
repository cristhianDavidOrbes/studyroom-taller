## SUT-58 Implementar interfaz: Registro e inicio de sesión

Tecnologías propuestas: Frontend con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-2

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-2 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Usar Firebase Authentication Spark con email/contraseña y dominio de proveedor. NestJS valida firma, emisor, audiencia y vencimiento del JWT; asociar uid a perfil PostgreSQL mediante Prisma. Cubrir alta, acceso, credenciales inválidas y sincronización idempotente del perfil.



## SUT-60 Implementar servicios y datos: Registro e inicio de sesión

Tecnologías propuestas: API de identidad con NestJS, JWT de Firebase Authentication Spark y PostgreSQL usando Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-2

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-2 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Usar Firebase Authentication Spark con email/contraseña y dominio de proveedor. NestJS valida firma, emisor, audiencia y vencimiento del JWT; asociar uid a perfil PostgreSQL mediante Prisma. Cubrir alta, acceso, credenciales inválidas y sincronización idempotente del perfil.



## SUT-61 Validar calidad e integración: Registro e inicio de sesión

Tecnologías propuestas: Pruebas con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-2

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-2 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Usar Firebase Authentication Spark con email/contraseña y dominio de proveedor. NestJS valida firma, emisor, audiencia y vencimiento del JWT; asociar uid a perfil PostgreSQL mediante Prisma. Cubrir alta, acceso, credenciales inválidas y sincronización idempotente del perfil.



## SUT-62 Implementar interfaz: Onboarding y perfil del estudiante

Tecnologías propuestas: Frontend con React 18 y TypeScript.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-3

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-3 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-63 Implementar servicios y datos: Onboarding y perfil del estudiante

Tecnologías propuestas: API de identidad con NestJS, JWT de Firebase Authentication Spark y PostgreSQL usando Prisma.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-3

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-3 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-64 Validar calidad e integración: Onboarding y perfil del estudiante

Tecnologías propuestas: Pruebas con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-3

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-3 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-65 Implementar interfaz: Recuperación de contraseña

Tecnologías propuestas: Frontend con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-4

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-4 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

La recuperación envía el correo real mediante Firebase Authentication Spark y permite definir una contraseña nueva desde el enlace. Usar plantillas en español y dominios autorizados gratuitos; probar correo recibido, enlace inválido/vencido, no enumeración de cuentas y exceso de cuota. La cuota Spark documentada es 150 correos de recuperación por día; no activar Blaze, SMTP de pago ni comprar dominio.



## SUT-66 Implementar servicios y datos: Recuperación de contraseña

Tecnologías propuestas: API de identidad con NestJS, JWT de Firebase Authentication Spark y PostgreSQL usando Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-4

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-4 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

La recuperación envía el correo real mediante Firebase Authentication Spark y permite definir una contraseña nueva desde el enlace. Usar plantillas en español y dominios autorizados gratuitos; probar correo recibido, enlace inválido/vencido, no enumeración de cuentas y exceso de cuota. La cuota Spark documentada es 150 correos de recuperación por día; no activar Blaze, SMTP de pago ni comprar dominio.



## SUT-67 Validar calidad e integración: Recuperación de contraseña

Tecnologías propuestas: Pruebas con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-4

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-4 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

La recuperación envía el correo real mediante Firebase Authentication Spark y permite definir una contraseña nueva desde el enlace. Usar plantillas en español y dominios autorizados gratuitos; probar correo recibido, enlace inválido/vencido, no enumeración de cuentas y exceso de cuota. La cuota Spark documentada es 150 correos de recuperación por día; no activar Blaze, SMTP de pago ni comprar dominio.



## SUT-68 Implementar interfaz: Gestión de sesión y cierre seguro

Tecnologías propuestas: Frontend con React 18 y TypeScript.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-5

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-5 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Cerrar la sesión del cliente y aplicar la política de revocación de tokens/sesiones en NestJS y Firebase cuando corresponda. Probar expiración, logout y rechazo de sesión revocada sin añadir servicios de pago.



## SUT-69 Implementar servicios y datos: Gestión de sesión y cierre seguro

Tecnologías propuestas: API de identidad con NestJS, JWT de Firebase Authentication Spark y PostgreSQL usando Prisma.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-5

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-5 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Cerrar la sesión del cliente y aplicar la política de revocación de tokens/sesiones en NestJS y Firebase cuando corresponda. Probar expiración, logout y rechazo de sesión revocada sin añadir servicios de pago.



## SUT-70 Validar calidad e integración: Gestión de sesión y cierre seguro

Tecnologías propuestas: Pruebas con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-5

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-5 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Cerrar la sesión del cliente y aplicar la política de revocación de tokens/sesiones en NestJS y Firebase cuando corresponda. Probar expiración, logout y rechazo de sesión revocada sin añadir servicios de pago.



## SUT-71 Implementar interfaz: Editar intereses y preferencias de estudio

Tecnologías propuestas: Frontend con React 18 y TypeScript.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-6

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-6 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-72 Implementar servicios y datos: Editar intereses y preferencias de estudio

Tecnologías propuestas: API de identidad con NestJS, JWT de Firebase Authentication Spark y PostgreSQL usando Prisma.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-6

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-6 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-73 Validar calidad e integración: Editar intereses y preferencias de estudio

Tecnologías propuestas: Pruebas con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-6

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-6 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-74 Implementar interfaz: Diseño responsive y accesible

Tecnologías propuestas: Frontend con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-7

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-7 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-75 Implementar servicios y datos: Diseño responsive y accesible

Tecnologías propuestas: API de identidad con NestJS, JWT de Firebase Authentication Spark y PostgreSQL usando Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-7

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-7 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-76 Validar calidad e integración: Diseño responsive y accesible

Tecnologías propuestas: Pruebas con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-7

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-7 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-77 Implementar interfaz: Preferencias de notificaciones

Tecnologías propuestas: Frontend con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-8

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-8 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-78 Implementar servicios y datos: Preferencias de notificaciones

Tecnologías propuestas: API de identidad con NestJS, JWT de Firebase Authentication Spark y PostgreSQL usando Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-8

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-8 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-79 Validar calidad e integración: Explorar, buscar y filtrar salas

Tecnologías propuestas: Pruebas de búsqueda con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-10

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-10 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-80 Implementar interfaz: Ver tarjetas y detalle de una sala

Tecnologías propuestas: Interfaz de catálogo con React 18, TypeScript y React Query.
Dificultad estimada: Baja.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-11

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-11 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-81 Validar calidad e integración: Preferencias de notificaciones

Tecnologías propuestas: Pruebas con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Los correos de recuperación usan las plantillas y el dominio predeterminado de Firebase, sin SMTP propio ni compra de dominio.

Historia relacionada: SUT-8

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-8 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-82 Implementar servicios y datos: Ver tarjetas y detalle de una sala

Tecnologías propuestas: API de consulta y filtros con NestJS, PostgreSQL y Prisma.
Dificultad estimada: Baja.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-11

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-11 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-83 Implementar interfaz: Explorar, buscar y filtrar salas

Tecnologías propuestas: Interfaz de catálogo con React 18, TypeScript y React Query.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-10

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-10 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-84 Implementar servicios y datos: Explorar, buscar y filtrar salas

Tecnologías propuestas: API de consulta y filtros con NestJS, PostgreSQL y Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-10

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-10 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-85 Validar calidad e integración: Ver tarjetas y detalle de una sala

Tecnologías propuestas: Pruebas de búsqueda con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-11

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-11 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-86 Implementar interfaz: Filtrar por materia, modalidad y nivel

Tecnologías propuestas: Interfaz de catálogo con React 18, TypeScript y React Query.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-12

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-12 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-87 Implementar servicios y datos: Filtrar por materia, modalidad y nivel

Tecnologías propuestas: API de consulta y filtros con NestJS, PostgreSQL y Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-12

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-12 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-88 Validar calidad e integración: Filtrar por materia, modalidad y nivel

Tecnologías propuestas: Pruebas de búsqueda con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-12

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-12 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-89 Implementar interfaz: Ordenar salas por relevancia y actividad

Tecnologías propuestas: Interfaz de catálogo con React 18, TypeScript y React Query.
Dificultad estimada: Baja.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-13

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-13 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-90 Implementar servicios y datos: Ordenar salas por relevancia y actividad

Tecnologías propuestas: API de consulta y filtros con NestJS, PostgreSQL y Prisma.
Dificultad estimada: Baja.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-13

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-13 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-91 Validar calidad e integración: Ordenar salas por relevancia y actividad

Tecnologías propuestas: Pruebas de búsqueda con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-13

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-13 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-92 Implementar interfaz: Ver salas recomendadas según intereses

Tecnologías propuestas: Interfaz de catálogo con React 18, TypeScript y React Query.
Dificultad estimada: Alta.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-14

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-14 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-93 Implementar servicios y datos: Ver salas recomendadas según intereses

Tecnologías propuestas: API de consulta y filtros con NestJS, PostgreSQL y Prisma.
Dificultad estimada: Alta.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-14

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-14 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-94 Validar calidad e integración: Ver salas recomendadas según intereses

Tecnologías propuestas: Pruebas de búsqueda con Jest y Playwright.
Dificultad estimada: Alta.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-14

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-14 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-95 Implementar interfaz: Consultar salas programadas

Tecnologías propuestas: Interfaz de catálogo con React 18, TypeScript y React Query.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-15

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-15 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-96 Implementar servicios y datos: Consultar salas programadas

Tecnologías propuestas: API de consulta y filtros con NestJS, PostgreSQL y Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-15

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-15 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-97 Validar calidad e integración: Consultar salas programadas

Tecnologías propuestas: Pruebas de búsqueda con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-15

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-15 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-98 Implementar interfaz: Gestionar estados vacíos y sin resultados

Tecnologías propuestas: Interfaz de catálogo con React 18, TypeScript y React Query.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-16

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-16 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-99 Implementar servicios y datos: Gestionar estados vacíos y sin resultados

Tecnologías propuestas: API de consulta y filtros con NestJS, PostgreSQL y Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-16

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-16 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-100 Validar calidad e integración: Gestionar estados vacíos y sin resultados

Tecnologías propuestas: Pruebas de búsqueda con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React consulta la API NestJS en Render Free mediante HTTPS. Las salas y filtros se consultan en PostgreSQL de Supabase Free con índices y Prisma. Optimizar consultas y caché local acotada dentro de la única instancia; no provisionar Redis o réplicas de pago.

Historia relacionada: SUT-16

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-16 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-101 Implementar interfaz: Unirse, salir y controlar capacidad

Tecnologías propuestas: Formularios y vistas con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-18

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-18 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Comprobar plazas de sala, autorización y cuota gratuita global antes de emitir token LiveKit. Evitar admisiones simultáneas que excedan capacidad. Si no hay recursos, mostrar el estado antes de entrar; al salir actualizar ocupación y consumo.



## SUT-102 Implementar servicios y datos: Unirse, salir y controlar capacidad

Tecnologías propuestas: API de salas con NestJS, PostgreSQL, Prisma y control de acceso.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-18

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-18 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Comprobar plazas de sala, autorización y cuota gratuita global antes de emitir token LiveKit. Evitar admisiones simultáneas que excedan capacidad. Si no hay recursos, mostrar el estado antes de entrar; al salir actualizar ocupación y consumo.



## SUT-103 Validar calidad e integración: Unirse, salir y controlar capacidad

Tecnologías propuestas: Pruebas de reglas de negocio con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-18

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-18 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Comprobar plazas de sala, autorización y cuota gratuita global antes de emitir token LiveKit. Evitar admisiones simultáneas que excedan capacidad. Si no hay recursos, mostrar el estado antes de entrar; al salir actualizar ocupación y consumo.



## SUT-104 Validar calidad e integración: Editar datos de una sala

Tecnologías propuestas: Pruebas de reglas de negocio con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-20

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-20 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-105 Implementar interfaz: Crear una sala de estudio

Tecnologías propuestas: Formularios y vistas con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-19

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-19 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-106 Implementar interfaz: Configurar privacidad y código de acceso

Tecnologías propuestas: Formularios y vistas con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-21

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-21 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-107 Implementar servicios y datos: Crear una sala de estudio

Tecnologías propuestas: API de salas con NestJS, PostgreSQL, Prisma y control de acceso.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-19

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-19 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-108 Implementar servicios y datos: Configurar privacidad y código de acceso

Tecnologías propuestas: API de salas con NestJS, PostgreSQL, Prisma y control de acceso.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-21

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-21 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-109 Validar calidad e integración: Crear una sala de estudio

Tecnologías propuestas: Pruebas de reglas de negocio con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-19

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-19 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-110 Validar calidad e integración: Configurar privacidad y código de acceso

Tecnologías propuestas: Pruebas de reglas de negocio con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-21

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-21 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-111 Implementar interfaz: Editar datos de una sala

Tecnologías propuestas: Formularios y vistas con React 18 y TypeScript.
Dificultad estimada: Baja.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-20

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-20 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-112 Implementar interfaz: Invitar participantes mediante enlace

Tecnologías propuestas: Formularios y vistas con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-22

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-22 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-113 Implementar servicios y datos: Editar datos de una sala

Tecnologías propuestas: API de salas con NestJS, PostgreSQL, Prisma y control de acceso.
Dificultad estimada: Baja.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-20

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-20 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-114 Implementar servicios y datos: Invitar participantes mediante enlace

Tecnologías propuestas: API de salas con NestJS, PostgreSQL, Prisma y control de acceso.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-22

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-22 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-115 Validar calidad e integración: Invitar participantes mediante enlace

Tecnologías propuestas: Pruebas de reglas de negocio con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-22

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-22 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-116 Implementar interfaz: Gestionar roles de anfitrión y moderador

Tecnologías propuestas: Formularios y vistas con React 18 y TypeScript.
Dificultad estimada: Alta.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-23

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-23 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-117 Implementar servicios y datos: Gestionar roles de anfitrión y moderador

Tecnologías propuestas: API de salas con NestJS, PostgreSQL, Prisma y control de acceso.
Dificultad estimada: Alta.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-23

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-23 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-118 Validar calidad e integración: Gestionar roles de anfitrión y moderador

Tecnologías propuestas: Pruebas de reglas de negocio con Jest y Playwright.
Dificultad estimada: Alta.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-23

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-23 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-119 Implementar interfaz: Programar una sala futura

Tecnologías propuestas: Formularios y vistas con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-24

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-24 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-120 Implementar servicios y datos: Programar una sala futura

Tecnologías propuestas: API de salas con NestJS, PostgreSQL, Prisma y control de acceso.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-24

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-24 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-121 Validar calidad e integración: Programar una sala futura

Tecnologías propuestas: Pruebas de reglas de negocio con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-24

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-24 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-122 Implementar interfaz: Cerrar o cancelar una sala

Tecnologías propuestas: Formularios y vistas con React 18 y TypeScript.
Dificultad estimada: Baja.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-25

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-25 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-123 Implementar servicios y datos: Cerrar o cancelar una sala

Tecnologías propuestas: API de salas con NestJS, PostgreSQL, Prisma y control de acceso.
Dificultad estimada: Baja.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-25

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-25 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-124 Validar calidad e integración: Cerrar o cancelar una sala

Tecnologías propuestas: Pruebas de reglas de negocio con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
React llama a NestJS en Render Free para crear o administrar salas. NestJS conserva su estado en PostgreSQL de Supabase Free y emite tokens de LiveKit Cloud Build solo a participantes autorizados. Aplicar capacidad de sala y admisión según la cuota gratuita global; el PC del anfitrión no aloja la sala ni retransmite el video.

Historia relacionada: SUT-25

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-25 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-125 Implementar interfaz: Persistir usuarios, salas y sesiones

Tecnologías propuestas: Modelo de datos con PostgreSQL y Prisma.
Dificultad estimada: Alta.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-27

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-27 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Persistir usuarios, salas y sesiones en PostgreSQL de Supabase Free mediante Prisma y conexión cifrada. Respaldar por exportación manual gratuita y probar restauración; no depender del disco efímero de Render. La base Free tiene 500 MB y puede pausarse tras una semana inactiva: documentar recuperación y comprobar tamaño antes del uso.



## SUT-126 Implementar servicios y datos: Persistir usuarios, salas y sesiones

Tecnologías propuestas: Servicios REST con NestJS, OpenAPI y JWT.
Dificultad estimada: Alta.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-27

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-27 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Persistir usuarios, salas y sesiones en PostgreSQL de Supabase Free mediante Prisma y conexión cifrada. Respaldar por exportación manual gratuita y probar restauración; no depender del disco efímero de Render. La base Free tiene 500 MB y puede pausarse tras una semana inactiva: documentar recuperación y comprobar tamaño antes del uso.



## SUT-127 Validar calidad e integración: Autorizar acciones según el rol

Tecnologías propuestas: Calidad y entrega con Jest, Playwright y GitHub Actions.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-29

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-29 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Validar los JWT de Firebase Authentication y resolver autorización en NestJS contra los roles y pertenencia de PostgreSQL. Probar tokens inválidos/vencidos, acceso a otra sala y revocación.



## SUT-128 Validar calidad e integración: Persistir usuarios, salas y sesiones

Tecnologías propuestas: Calidad y entrega con Jest, Playwright y GitHub Actions.
Dificultad estimada: Alta.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-27

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-27 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Persistir usuarios, salas y sesiones en PostgreSQL de Supabase Free mediante Prisma y conexión cifrada. Respaldar por exportación manual gratuita y probar restauración; no depender del disco efímero de Render. La base Free tiene 500 MB y puede pausarse tras una semana inactiva: documentar recuperación y comprobar tamaño antes del uso.



## SUT-129 Implementar interfaz: Gestionar migraciones y datos iniciales

Tecnologías propuestas: Modelo de datos con PostgreSQL y Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-30

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-30 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Ejecutar y versionar migraciones Prisma para Supabase Free sin one-off jobs o shell de pago de Render. Probar migración y restauración en local, seed idempotente y despliegue controlado sin crear otro Web Service que consuma horas gratuitas.



## SUT-130 Implementar interfaz: Exponer API segura para StudyRoom

Tecnologías propuestas: Modelo de datos con PostgreSQL y Prisma.
Dificultad estimada: Alta.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-28

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-28 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Desplegar NestJS como un solo Render Web Service con compute Free. Mantener CORS para el frontend gratuito, validación JWT/roles, secretos solo en servidor y endpoint de salud. Manejar el arranque en frío en la pantalla de entrada: Render duerme tras 15 minutos sin tráfico y puede tardar aproximadamente un minuto en arrancar; no simular actividad con pings para prometer disponibilidad.

La IA se ejecuta localmente con Ollama. Flujo: cliente React → NestJS en Render Free → HTTPS ngrok Free → servicio local autenticado → Ollama en 127.0.0.1:11434. Usar el dominio de desarrollo gratuito asignado por ngrok y un túnel HTTP normal, sin AI Gateway, Traffic Policy de pago ni créditos temporales. ngrok transporta texto/contexto y respuestas de IA; cámara, audio y pantalla permanecen en LiveKit. El computador que sirve Ollama debe estar encendido y conectado. Controlar 1 GB de transferencia y 20.000 solicitudes HTTP mensuales; al agotarse, mostrar IA pendiente o no disponible sin contratar un plan.



## SUT-131 Implementar servicios y datos: Gestionar migraciones y datos iniciales

Tecnologías propuestas: Servicios REST con NestJS, OpenAPI y JWT.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-30

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-30 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Ejecutar y versionar migraciones Prisma para Supabase Free sin one-off jobs o shell de pago de Render. Probar migración y restauración en local, seed idempotente y despliegue controlado sin crear otro Web Service que consuma horas gratuitas.



## SUT-132 Implementar servicios y datos: Exponer API segura para StudyRoom

Tecnologías propuestas: Servicios REST con NestJS, OpenAPI y JWT.
Dificultad estimada: Alta.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-28

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-28 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Desplegar NestJS como un solo Render Web Service con compute Free. Mantener CORS para el frontend gratuito, validación JWT/roles, secretos solo en servidor y endpoint de salud. Manejar el arranque en frío en la pantalla de entrada: Render duerme tras 15 minutos sin tráfico y puede tardar aproximadamente un minuto en arrancar; no simular actividad con pings para prometer disponibilidad.

La IA se ejecuta localmente con Ollama. Flujo: cliente React → NestJS en Render Free → HTTPS ngrok Free → servicio local autenticado → Ollama en 127.0.0.1:11434. Usar el dominio de desarrollo gratuito asignado por ngrok y un túnel HTTP normal, sin AI Gateway, Traffic Policy de pago ni créditos temporales. ngrok transporta texto/contexto y respuestas de IA; cámara, audio y pantalla permanecen en LiveKit. El computador que sirve Ollama debe estar encendido y conectado. Controlar 1 GB de transferencia y 20.000 solicitudes HTTP mensuales; al agotarse, mostrar IA pendiente o no disponible sin contratar un plan.



## SUT-133 Validar calidad e integración: Gestionar migraciones y datos iniciales

Tecnologías propuestas: Calidad y entrega con Jest, Playwright y GitHub Actions.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-30

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-30 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Ejecutar y versionar migraciones Prisma para Supabase Free sin one-off jobs o shell de pago de Render. Probar migración y restauración en local, seed idempotente y despliegue controlado sin crear otro Web Service que consuma horas gratuitas.



## SUT-134 Validar calidad e integración: Exponer API segura para StudyRoom

Tecnologías propuestas: Calidad y entrega con Jest, Playwright y GitHub Actions.
Dificultad estimada: Alta.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-28

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-28 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Desplegar NestJS como un solo Render Web Service con compute Free. Mantener CORS para el frontend gratuito, validación JWT/roles, secretos solo en servidor y endpoint de salud. Manejar el arranque en frío en la pantalla de entrada: Render duerme tras 15 minutos sin tráfico y puede tardar aproximadamente un minuto en arrancar; no simular actividad con pings para prometer disponibilidad.

La IA se ejecuta localmente con Ollama. Flujo: cliente React → NestJS en Render Free → HTTPS ngrok Free → servicio local autenticado → Ollama en 127.0.0.1:11434. Usar el dominio de desarrollo gratuito asignado por ngrok y un túnel HTTP normal, sin AI Gateway, Traffic Policy de pago ni créditos temporales. ngrok transporta texto/contexto y respuestas de IA; cámara, audio y pantalla permanecen en LiveKit. El computador que sirve Ollama debe estar encendido y conectado. Controlar 1 GB de transferencia y 20.000 solicitudes HTTP mensuales; al agotarse, mostrar IA pendiente o no disponible sin contratar un plan.



## SUT-135 Implementar interfaz: Autorizar acciones según el rol

Tecnologías propuestas: Modelo de datos con PostgreSQL y Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-29

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-29 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Validar los JWT de Firebase Authentication y resolver autorización en NestJS contra los roles y pertenencia de PostgreSQL. Probar tokens inválidos/vencidos, acceso a otra sala y revocación.



## SUT-136 Implementar interfaz: Configurar almacenamiento de archivos

Tecnologías propuestas: Modelo de datos con PostgreSQL y Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-31

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-31 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Usar Supabase Storage Free con controles por usuario y sala, nombres no predecibles y URLs firmadas cuando corresponda. No usar el disco de Render para archivos persistentes. Cuotas: 1 GB de archivos, 5 GB de egreso no cacheado y 5 GB cacheado al mes; imponer límites de tamaño, verificar cuota antes de subir y permitir eliminación por el propietario.



## SUT-137 Implementar servicios y datos: Configurar almacenamiento de archivos

Tecnologías propuestas: Servicios REST con NestJS, OpenAPI y JWT.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-31

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-31 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Usar Supabase Storage Free con controles por usuario y sala, nombres no predecibles y URLs firmadas cuando corresponda. No usar el disco de Render para archivos persistentes. Cuotas: 1 GB de archivos, 5 GB de egreso no cacheado y 5 GB cacheado al mes; imponer límites de tamaño, verificar cuota antes de subir y permitir eliminación por el propietario.



## SUT-138 Implementar servicios y datos: Autorizar acciones según el rol

Tecnologías propuestas: Servicios REST con NestJS, OpenAPI y JWT.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-29

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-29 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Validar los JWT de Firebase Authentication y resolver autorización en NestJS contra los roles y pertenencia de PostgreSQL. Probar tokens inválidos/vencidos, acceso a otra sala y revocación.



## SUT-139 Validar calidad e integración: Configurar almacenamiento de archivos

Tecnologías propuestas: Calidad y entrega con Jest, Playwright y GitHub Actions.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-31

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-31 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Usar Supabase Storage Free con controles por usuario y sala, nombres no predecibles y URLs firmadas cuando corresponda. No usar el disco de Render para archivos persistentes. Cuotas: 1 GB de archivos, 5 GB de egreso no cacheado y 5 GB cacheado al mes; imponer límites de tamaño, verificar cuota antes de subir y permitir eliminación por el propietario.



## SUT-140 Implementar interfaz: Registrar errores y eventos relevantes

Tecnologías propuestas: Modelo de datos con PostgreSQL y Prisma.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-32

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-32 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Registrar errores y métricas básicas con logs incluidos y registros PostgreSQL acotados: tamaño, llamadas externas, minutos de participantes, consumo IA, latencia y reconexiones. Redactar secretos y aplicar retención configurable; sin observabilidad de pago.



## SUT-141 Implementar servicios y datos: Registrar errores y eventos relevantes

Tecnologías propuestas: Servicios REST con NestJS, OpenAPI y JWT.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-32

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-32 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Registrar errores y métricas básicas con logs incluidos y registros PostgreSQL acotados: tamaño, llamadas externas, minutos de participantes, consumo IA, latencia y reconexiones. Redactar secretos y aplicar retención configurable; sin observabilidad de pago.



## SUT-142 Validar calidad e integración: Registrar errores y eventos relevantes

Tecnologías propuestas: Calidad y entrega con Jest, Playwright y GitHub Actions.
Dificultad estimada: Media.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-32

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-32 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Registrar errores y métricas básicas con logs incluidos y registros PostgreSQL acotados: tamaño, llamadas externas, minutos de participantes, consumo IA, latencia y reconexiones. Redactar secretos y aplicar retención configurable; sin observabilidad de pago.



## SUT-143 Implementar interfaz: Automatizar pruebas, calidad e integración continua

Tecnologías propuestas: Modelo de datos con PostgreSQL y Prisma.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-33

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-33 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Mantener Jest, Playwright y GitHub Actions con runners estándar. Repositorios privados GitHub Free tienen 2.000 minutos mensuales y 500 MB de artefactos; limitar retención y usar bloqueo de gasto o ejecución local al agotar la cuota. No publicar un repositorio privado para obtener gratuidad. Validar el despliegue Render Free y los límites de todos los proveedores como requisito de publicación.



## SUT-144 Implementar servicios y datos: Automatizar pruebas, calidad e integración continua

Tecnologías propuestas: Servicios REST con NestJS, OpenAPI y JWT.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-33

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-33 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Mantener Jest, Playwright y GitHub Actions con runners estándar. Repositorios privados GitHub Free tienen 2.000 minutos mensuales y 500 MB de artefactos; limitar retención y usar bloqueo de gasto o ejecución local al agotar la cuota. No publicar un repositorio privado para obtener gratuidad. Validar el despliegue Render Free y los límites de todos los proveedores como requisito de publicación.



## SUT-145 Validar calidad e integración: Automatizar pruebas, calidad e integración continua

Tecnologías propuestas: Calidad y entrega con Jest, Playwright y GitHub Actions.
Dificultad estimada: Baja.

Arquitectura aplicable
API NestJS en un único Web Service Render Free, con HTTPS y Socket.IO. React se publica como Render Static Site gratuito usando los subdominios proporcionados. PostgreSQL y archivos se alojan en Supabase Free. Firebase Authentication Spark gestiona email/contraseña y recuperación; NestJS valida el JWT y autoriza roles con el perfil en PostgreSQL. Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Procesamiento asíncrono mediante una cola durable en PostgreSQL de Supabase Free y un consumidor acotado dentro del mismo proceso NestJS en Render Free. Guardar estado, intentos, bloqueo con vencimiento e idempotencia; recuperar trabajos tras reinicios y al volver a activarse la API. Ollama local mediante ngrok Free produce las respuestas, resúmenes y quizzes mediante un adaptador desacoplado. Este diseño sustituye RabbitMQ y workers separados preservando el procesamiento asíncrono; los trabajos pueden quedar pendientes mientras Render duerme.

Historia relacionada: SUT-33

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-33 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Mantener Jest, Playwright y GitHub Actions con runners estándar. Repositorios privados GitHub Free tienen 2.000 minutos mensuales y 500 MB de artefactos; limitar retención y usar bloqueo de gasto o ejecución local al agotar la cuota. No publicar un repositorio privado para obtener gratuidad. Validar el despliegue Render Free y los límites de todos los proveedores como requisito de publicación.



## SUT-146 Implementar interfaz: Participantes en tiempo real

Tecnologías propuestas: Cliente en tiempo real con React 18, TypeScript y Socket.IO.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-35

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-35 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-147 Implementar servicios y datos: Participantes en tiempo real

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-35

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-35 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-148 Validar calidad e integración: Participantes en tiempo real

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-35

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-35 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-149 Implementar interfaz: Chat grupal en tiempo real

Tecnologías propuestas: Cliente en tiempo real con React 18, TypeScript y Socket.IO.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-36

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-36 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-150 Implementar servicios y datos: Chat grupal en tiempo real

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-36

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-36 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-151 Validar calidad e integración: Chat grupal en tiempo real

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-36

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-36 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-152 Implementar interfaz: Reacciones y levantar la mano

Tecnologías propuestas: Cliente en tiempo real con React 18, TypeScript y Socket.IO.
Dificultad estimada: Baja.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-37

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-37 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-153 Implementar servicios y datos: Reacciones y levantar la mano

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Baja.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-37

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-37 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-154 Implementar servicios y datos: Controles de micrófono, cámara y dispositivos

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-39

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-39 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Integrar controles de dispositivos del SDK LiveKit, permisos de navegador, selección/cambio de micrófono y cámara y estados de conexión. Activar cancelación de eco, reducción de ruido y control de ganancia del navegador cuando estén disponibles; conservar preferencia de silencio durante reconexión.



## SUT-155 Validar calidad e integración: Reacciones y levantar la mano

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-37

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-37 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-156 Validar calidad e integración: Controles de micrófono, cámara y dispositivos

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-39

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-39 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Integrar controles de dispositivos del SDK LiveKit, permisos de navegador, selección/cambio de micrófono y cámara y estados de conexión. Activar cancelación de eco, reducción de ruido y control de ganancia del navegador cuando estén disponibles; conservar preferencia de silencio durante reconexión.



## SUT-157 Implementar interfaz: Videollamada grupal

Tecnologías propuestas: Cliente WebRTC con React 18, TypeScript y LiveKit SDK; Socket.IO para eventos de aplicación.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-38

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-38 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Validar una sesión de al menos 60 minutos con 4 participantes en dispositivos y redes distintas, usando cámara, micrófono, chat y pantalla compartida. Esta es la carga mínima de validación; probar la capacidad configurada de cada sala antes de ampliarla.

Perfil de prueba normal: por participante, subida disponible de al menos 3 Mbps, bajada de al menos 6 Mbps, RTT de red menor de 150 ms y pérdida menor de 1%. Objetivos de aceptación: RTT WebRTC p95 menor de 300 ms, congelamientos de video inferiores al 1% del tiempo recibido, sin desconexiones inesperadas y audio inteligible. Medir con getStats, eventos SDK y evidencia de la sesión; son objetivos de prueba, no garantías del proveedor.

Validar UDP y TURN/TLS con UDP bloqueado, cambio de Wi-Fi a datos y un corte de red de 5 segundos. Mostrar reconexión y recuperar audio/video en un objetivo de 10 segundos tras restablecer una red utilizable; registrar el resultado real.

Habilitar simulcast, adaptiveStream y dynacast. Perfil inicial de cámara 540p/24 fps con reducción a 360p; pantalla hasta 720p/15 fps priorizando legibilidad. Ajustar bitrate a mediciones, priorizar voz y permitir solo audio cuando la red no soporte video.

Reiniciar/re desplegar la API en una llamada de prueba: la ruta de medios LiveKit debe seguir activa; chat, permisos nuevos y señalamientos deben mostrar pérdida temporal y resincronizarse al recuperarse Socket.IO, sin crear participantes duplicados.

Medir minutos por participante y bytes descargados por sala. LiveKit Build incluye 5.000 minutos de participante y 50 GB de salida al mes, con límite estricto y hasta 100 conexiones simultáneas. Alertar al 80% y reservar margen antes de admitir nuevas salas; si no hay cuota, informar antes de entrar, sin activar facturación.

Prueba de convivencia con IA local

Repetir la llamada de 4 participantes y 60 minutos mientras el PC ejecuta una generación local y tiene un resumen/quiz en espera. Mantener los objetivos de RTT, congelamientos, audio y reconexión; medir CPU/GPU y RAM/VRAM. Si no se cumplen, reducir carga y contexto de IA o diferir trabajos secundarios; no aceptar la videollamada sin esta evidencia.



## SUT-158 Implementar interfaz: Compartir pantalla

Tecnologías propuestas: Cliente WebRTC con React 18, TypeScript y LiveKit SDK; Socket.IO para eventos de aplicación.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-40

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-40 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Compartir pantalla mediante getDisplayMedia y LiveKit WebRTC, con fin de captura, cambio de tamaño, legibilidad de texto y adaptación de bitrate. Probar cámara y audio simultáneos. No exigir capturar audio de sistema donde el navegador no lo soporte ni contratar un retransmisor.



## SUT-159 Implementar servicios y datos: Videollamada grupal

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-38

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-38 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Validar una sesión de al menos 60 minutos con 4 participantes en dispositivos y redes distintas, usando cámara, micrófono, chat y pantalla compartida. Esta es la carga mínima de validación; probar la capacidad configurada de cada sala antes de ampliarla.

Perfil de prueba normal: por participante, subida disponible de al menos 3 Mbps, bajada de al menos 6 Mbps, RTT de red menor de 150 ms y pérdida menor de 1%. Objetivos de aceptación: RTT WebRTC p95 menor de 300 ms, congelamientos de video inferiores al 1% del tiempo recibido, sin desconexiones inesperadas y audio inteligible. Medir con getStats, eventos SDK y evidencia de la sesión; son objetivos de prueba, no garantías del proveedor.

Validar UDP y TURN/TLS con UDP bloqueado, cambio de Wi-Fi a datos y un corte de red de 5 segundos. Mostrar reconexión y recuperar audio/video en un objetivo de 10 segundos tras restablecer una red utilizable; registrar el resultado real.

Habilitar simulcast, adaptiveStream y dynacast. Perfil inicial de cámara 540p/24 fps con reducción a 360p; pantalla hasta 720p/15 fps priorizando legibilidad. Ajustar bitrate a mediciones, priorizar voz y permitir solo audio cuando la red no soporte video.

Reiniciar/re desplegar la API en una llamada de prueba: la ruta de medios LiveKit debe seguir activa; chat, permisos nuevos y señalamientos deben mostrar pérdida temporal y resincronizarse al recuperarse Socket.IO, sin crear participantes duplicados.

Medir minutos por participante y bytes descargados por sala. LiveKit Build incluye 5.000 minutos de participante y 50 GB de salida al mes, con límite estricto y hasta 100 conexiones simultáneas. Alertar al 80% y reservar margen antes de admitir nuevas salas; si no hay cuota, informar antes de entrar, sin activar facturación.

Prueba de convivencia con IA local

Repetir la llamada de 4 participantes y 60 minutos mientras el PC ejecuta una generación local y tiene un resumen/quiz en espera. Mantener los objetivos de RTT, congelamientos, audio y reconexión; medir CPU/GPU y RAM/VRAM. Si no se cumplen, reducir carga y contexto de IA o diferir trabajos secundarios; no aceptar la videollamada sin esta evidencia.



## SUT-160 Implementar servicios y datos: Compartir pantalla

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-40

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-40 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Compartir pantalla mediante getDisplayMedia y LiveKit WebRTC, con fin de captura, cambio de tamaño, legibilidad de texto y adaptación de bitrate. Probar cámara y audio simultáneos. No exigir capturar audio de sistema donde el navegador no lo soporte ni contratar un retransmisor.



## SUT-161 Validar calidad e integración: Videollamada grupal

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-38

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-38 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Validar una sesión de al menos 60 minutos con 4 participantes en dispositivos y redes distintas, usando cámara, micrófono, chat y pantalla compartida. Esta es la carga mínima de validación; probar la capacidad configurada de cada sala antes de ampliarla.

Perfil de prueba normal: por participante, subida disponible de al menos 3 Mbps, bajada de al menos 6 Mbps, RTT de red menor de 150 ms y pérdida menor de 1%. Objetivos de aceptación: RTT WebRTC p95 menor de 300 ms, congelamientos de video inferiores al 1% del tiempo recibido, sin desconexiones inesperadas y audio inteligible. Medir con getStats, eventos SDK y evidencia de la sesión; son objetivos de prueba, no garantías del proveedor.

Validar UDP y TURN/TLS con UDP bloqueado, cambio de Wi-Fi a datos y un corte de red de 5 segundos. Mostrar reconexión y recuperar audio/video en un objetivo de 10 segundos tras restablecer una red utilizable; registrar el resultado real.

Habilitar simulcast, adaptiveStream y dynacast. Perfil inicial de cámara 540p/24 fps con reducción a 360p; pantalla hasta 720p/15 fps priorizando legibilidad. Ajustar bitrate a mediciones, priorizar voz y permitir solo audio cuando la red no soporte video.

Reiniciar/re desplegar la API en una llamada de prueba: la ruta de medios LiveKit debe seguir activa; chat, permisos nuevos y señalamientos deben mostrar pérdida temporal y resincronizarse al recuperarse Socket.IO, sin crear participantes duplicados.

Medir minutos por participante y bytes descargados por sala. LiveKit Build incluye 5.000 minutos de participante y 50 GB de salida al mes, con límite estricto y hasta 100 conexiones simultáneas. Alertar al 80% y reservar margen antes de admitir nuevas salas; si no hay cuota, informar antes de entrar, sin activar facturación.

Prueba de convivencia con IA local

Repetir la llamada de 4 participantes y 60 minutos mientras el PC ejecuta una generación local y tiene un resumen/quiz en espera. Mantener los objetivos de RTT, congelamientos, audio y reconexión; medir CPU/GPU y RAM/VRAM. Si no se cumplen, reducir carga y contexto de IA o diferir trabajos secundarios; no aceptar la videollamada sin esta evidencia.



## SUT-162 Validar calidad e integración: Compartir pantalla

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-40

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-40 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Compartir pantalla mediante getDisplayMedia y LiveKit WebRTC, con fin de captura, cambio de tamaño, legibilidad de texto y adaptación de bitrate. Probar cámara y audio simultáneos. No exigir capturar audio de sistema donde el navegador no lo soporte ni contratar un retransmisor.



## SUT-163 Implementar interfaz: Controles de micrófono, cámara y dispositivos

Tecnologías propuestas: Cliente WebRTC con React 18, TypeScript y LiveKit SDK; Socket.IO para eventos de aplicación.
Dificultad estimada: Alta.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-39

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-39 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Integrar controles de dispositivos del SDK LiveKit, permisos de navegador, selección/cambio de micrófono y cámara y estados de conexión. Activar cancelación de eco, reducción de ruido y control de ganancia del navegador cuando estén disponibles; conservar preferencia de silencio durante reconexión.



## SUT-164 Implementar interfaz: Señalar en pantalla desde el menú de cámara

Tecnologías propuestas: React 18 y TypeScript.
Dificultad estimada: Alta.

Alcance
Implementar un menú pequeño en la esquina superior derecha del área de cámara. Desde ese menú se abren herramientas para señalar sobre el contenido de pantalla de la sesión. Implementar apertura, cierre, activación y desactivación, superposición de señales y estados de error. El menú no debe interrumpir los controles de cámara o la sesión.

Arquitectura aplicable
La interfaz React gestiona el menú y la capa visual de señalamiento. La videollamada y la pantalla compartida mantienen su transporte WebRTC mediante LiveKit Cloud Build gratuito con STUN/TURN. El señalamiento utiliza una capa superpuesta al contenido existente.

Historia relacionada: SUT-41

Señalamiento compartido
Al compartir pantalla, publicar los señalamientos del emisor y representar los eventos recibidos sobre la pantalla correspondiente para los demás participantes de la sala. Ajustar las posiciones al tamaño mostrado para que todos vean la señal sobre el mismo contenido.

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-41 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Mantener el menú pequeño arriba a la derecha del área de cámara. Los señalamientos se publican por Socket.IO solo para la sala y pantalla activa; usar coordenadas normalizadas, limitar eventos por segundo y resincronizar al reconectar. Los demás participantes deben verlos sobre el mismo contenido compartido.



## SUT-165 Implementar servicios y datos: Señalamiento compartido desde el menú de cámara

Tecnologías propuestas: NestJS y Socket.IO para eventos de señalamiento; identidad y permisos de sala existentes.
Dificultad estimada: Alta.

Alcance
Sincronizar los señalamientos que el estudiante activa desde el menú pequeño situado en la esquina superior derecha del área de cámara. Mientras comparte pantalla, los demás participantes de la misma sala deben ver las señales sobre ese contenido en tiempo real.

Arquitectura aplicable
WebRTC y LiveKit Cloud Build gratuito transportan cámara y pantalla. Socket.IO distribuye eventos de señalamiento asociados a la sala, el emisor y la pantalla compartida activa. Las coordenadas se expresan respecto al contenido para mantener su posición cuando cada participante lo muestra a distinto tamaño. Reutilizar autorización de sala y evitar que un emisor envíe señales a otra sala. La instancia única Render Free distribuye los eventos sin Redis ni réplicas de pago.

Historia relacionada: SUT-41

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-41 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Mantener el menú pequeño arriba a la derecha del área de cámara. Los señalamientos se publican por Socket.IO solo para la sala y pantalla activa; usar coordenadas normalizadas, limitar eventos por segundo y resincronizar al reconectar. Los demás participantes deben verlos sobre el mismo contenido compartido.



## SUT-166 Validar calidad e integración: Señalar en pantalla desde el menú de cámara

Tecnologías propuestas: Jest y Playwright.
Dificultad estimada: Alta.

Alcance
Preparar pruebas del menú pequeño en la esquina superior derecha del área de cámara y de las herramientas para señalar contenido de pantalla durante la sesión.

Criterios de validación

Ubicación y apertura del menú en el área de cámara.

Activación, uso y desactivación del señalamiento sobre el contenido mostrado.

Cierre del menú sin interrumpir la cámara o la sesión.

Accesibilidad mediante teclado, respuesta móvil y estados de error.

Permisos de sesión y un caso de acceso no autorizado.

Historia relacionada: SUT-41

Validación con varios participantes
Comprobar con al menos dos participantes que los señalamientos del emisor aparecen sobre la pantalla compartida correspondiente para los demás integrantes de la misma sala. Cubrir cambio de tamaño del contenido, fin de pantalla compartida y rechazo de eventos desde otra sala.

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-41 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Mantener el menú pequeño arriba a la derecha del área de cámara. Los señalamientos se publican por Socket.IO solo para la sala y pantalla activa; usar coordenadas normalizadas, limitar eventos por segundo y resincronizar al reconectar. Los demás participantes deben verlos sobre el mismo contenido compartido.



## SUT-167 Implementar interfaz: Compartir y consultar documentos

Tecnologías propuestas: Cliente en tiempo real con React 18, TypeScript y Socket.IO.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-42

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-42 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Almacenar los documentos en Supabase Storage Free y los permisos/metadatos en PostgreSQL. Validar carga, consulta, acceso a otra sala, eliminación, tamaño máximo y cuota sin disco persistente o almacenamiento de pago.



## SUT-168 Implementar servicios y datos: Compartir y consultar documentos

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-42

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-42 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Almacenar los documentos en Supabase Storage Free y los permisos/metadatos en PostgreSQL. Validar carga, consulta, acceso a otra sala, eliminación, tamaño máximo y cuota sin disco persistente o almacenamiento de pago.



## SUT-169 Validar calidad e integración: Compartir y consultar documentos

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-42

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-42 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Almacenar los documentos en Supabase Storage Free y los permisos/metadatos en PostgreSQL. Validar carga, consulta, acceso a otra sala, eliminación, tamaño máximo y cuota sin disco persistente o almacenamiento de pago.



## SUT-170 Implementar interfaz: Crear notas privadas durante la sesión

Tecnologías propuestas: Cliente en tiempo real con React 18, TypeScript y Socket.IO.
Dificultad estimada: Baja.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-43

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-43 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-171 Implementar servicios y datos: Crear notas privadas durante la sesión

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Baja.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-43

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-43 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-172 Validar calidad e integración: Crear notas privadas durante la sesión

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-43

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-43 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-173 Implementar interfaz: Usar temporizador y modo de enfoque

Tecnologías propuestas: Cliente en tiempo real con React 18, TypeScript y Socket.IO.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-44

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-44 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-174 Implementar servicios y datos: Usar temporizador y modo de enfoque

Tecnologías propuestas: Servicios colaborativos con NestJS, Socket.IO y PostgreSQL.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-44

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-44 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-175 Validar calidad e integración: Usar temporizador y modo de enfoque

Tecnologías propuestas: Pruebas de integración con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
Cámara, audio y pantalla compartida viajan por WebRTC directamente al SFU de LiveKit Cloud Build ($0), con STUN/TURN administrados. Render Free recibe únicamente API, tokens, chat, presencia y señalamientos mediante Socket.IO; el audio y video no pasan por Render ni ngrok. Usar simulcast, adaptiveStream y dynacast, priorizar audio y adaptar video a la red. Una sola instancia evita necesitar un adaptador Redis entre réplicas. Los documentos se guardan en Supabase Storage Free. El menú pequeño de señalamiento está arriba a la derecha del área de cámara y sus señales se ven para los demás al compartir pantalla.

Historia relacionada: SUT-44

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-44 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.



## SUT-176 Implementar interfaz: Configurar el proveedor de IA de forma desacoplada

Tecnologías propuestas: Experiencia de IA con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-46

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-46 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Mantener un contrato de adaptador de IA desacoplado y configurar Ollama local mediante ngrok Free como proveedor inicial. Modelo y límites se verifican con el PC y panel ngrok; rechazar modelos cloud y mantener el secreto del servicio local en NestJS. Enviar únicamente contexto autorizado minimizado, sin claves ni datos personales innecesarios.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-177 Implementar servicios y datos: Configurar el proveedor de IA de forma desacoplada

Tecnologías propuestas: Adaptador de IA con NestJS y Ollama local mediante ngrok Free.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-46

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-46 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Mantener un contrato de adaptador de IA desacoplado y configurar Ollama local mediante ngrok Free como proveedor inicial. Modelo y límites se verifican con el PC y panel ngrok; rechazar modelos cloud y mantener el secreto del servicio local en NestJS. Enviar únicamente contexto autorizado minimizado, sin claves ni datos personales innecesarios.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-178 Validar calidad e integración: Configurar el proveedor de IA de forma desacoplada

Tecnologías propuestas: Validación con Jest, Playwright y registro de uso.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-46

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-46 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Mantener un contrato de adaptador de IA desacoplado y configurar Ollama local mediante ngrok Free como proveedor inicial. Modelo y límites se verifican con el PC y panel ngrok; rechazar modelos cloud y mantener el secreto del servicio local en NestJS. Enviar únicamente contexto autorizado minimizado, sin claves ni datos personales innecesarios.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-179 Implementar interfaz: Enviar contexto autorizado de chat y documentos

Tecnologías propuestas: Experiencia de IA con React 18 y TypeScript.
Dificultad estimada: Alta.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-49

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-49 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-180 Implementar interfaz: Hacer preguntas directas a la IA

Tecnologías propuestas: Experiencia de IA con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-47

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-47 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-181 Implementar servicios y datos: Enviar contexto autorizado de chat y documentos

Tecnologías propuestas: Adaptador de IA con NestJS y Ollama local mediante ngrok Free.
Dificultad estimada: Alta.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-49

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-49 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-182 Implementar servicios y datos: Hacer preguntas directas a la IA

Tecnologías propuestas: Adaptador de IA con NestJS y Ollama local mediante ngrok Free.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-47

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-47 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-183 Validar calidad e integración: Enviar contexto autorizado de chat y documentos

Tecnologías propuestas: Validación con Jest, Playwright y registro de uso.
Dificultad estimada: Alta.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-49

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-49 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-184 Validar calidad e integración: Hacer preguntas directas a la IA

Tecnologías propuestas: Validación con Jest, Playwright y registro de uso.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-47

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-47 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-185 Implementar interfaz: Controlar límites de uso, errores y costos de IA

Tecnologías propuestas: Experiencia de IA con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-50

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-50 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Establecer presupuesto $0 para IA. Consultar los límites gratuitos de solicitudes y transferencia de ngrok y medir RAM/VRAM y velocidad del modelo local; imponer cupos por usuario y globales, caché autorizada, límite de contexto/salida, concurrencia uno y reintento con backoff ante servidor ocupado. Nunca cambiar a modelo o API de pago al agotar cuota; mostrar espera y cuándo puede reintentarse sin inventar una respuesta.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-186 Implementar interfaz: Invocar la IA desde el chat con @IA

Tecnologías propuestas: Experiencia de IA con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-48

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-48 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-187 Implementar servicios y datos: Controlar límites de uso, errores y costos de IA

Tecnologías propuestas: Adaptador de IA con NestJS y Ollama local mediante ngrok Free.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-50

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-50 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Establecer presupuesto $0 para IA. Consultar los límites gratuitos de solicitudes y transferencia de ngrok y medir RAM/VRAM y velocidad del modelo local; imponer cupos por usuario y globales, caché autorizada, límite de contexto/salida, concurrencia uno y reintento con backoff ante servidor ocupado. Nunca cambiar a modelo o API de pago al agotar cuota; mostrar espera y cuándo puede reintentarse sin inventar una respuesta.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-188 Implementar servicios y datos: Invocar la IA desde el chat con @IA

Tecnologías propuestas: Adaptador de IA con NestJS y Ollama local mediante ngrok Free.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-48

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-48 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-189 Validar calidad e integración: Controlar límites de uso, errores y costos de IA

Tecnologías propuestas: Validación con Jest, Playwright y registro de uso.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-50

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-50 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Establecer presupuesto $0 para IA. Consultar los límites gratuitos de solicitudes y transferencia de ngrok y medir RAM/VRAM y velocidad del modelo local; imponer cupos por usuario y globales, caché autorizada, límite de contexto/salida, concurrencia uno y reintento con backoff ante servidor ocupado. Nunca cambiar a modelo o API de pago al agotar cuota; mostrar espera y cuándo puede reintentarse sin inventar una respuesta.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-190 Validar calidad e integración: Invocar la IA desde el chat con @IA

Tecnologías propuestas: Validación con Jest, Playwright y registro de uso.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-48

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-48 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-191 Implementar interfaz: Valorar y reportar respuestas de IA

Tecnologías propuestas: Experiencia de IA con React 18 y TypeScript.
Dificultad estimada: Baja.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-51

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-51 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-192 Implementar servicios y datos: Valorar y reportar respuestas de IA

Tecnologías propuestas: Adaptador de IA con NestJS y Ollama local mediante ngrok Free.
Dificultad estimada: Baja.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-51

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-51 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-193 Validar calidad e integración: Valorar y reportar respuestas de IA

Tecnologías propuestas: Validación con Jest, Playwright y registro de uso.
Dificultad estimada: Baja.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-51

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-51 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-194 Implementar interfaz: Finalizar y almacenar una sesión

Tecnologías propuestas: Vistas de historial con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-53

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-53 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Al finalizar, persistir estado y contexto autorizado antes de encolar trabajos idempotentes en PostgreSQL. La cola se consume dentro del proceso NestJS Render Free con concurrencia acotada; reanudar tras reinicio o arranque. Mostrar pendiente, procesando, completado o error sin perder la sesión.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-195 Implementar servicios y datos: Finalizar y almacenar una sesión

Tecnologías propuestas: Procesamiento de sesiones con NestJS, PostgreSQL y Ollama local mediante ngrok Free.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-53

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-53 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Al finalizar, persistir estado y contexto autorizado antes de encolar trabajos idempotentes en PostgreSQL. La cola se consume dentro del proceso NestJS Render Free con concurrencia acotada; reanudar tras reinicio o arranque. Mostrar pendiente, procesando, completado o error sin perder la sesión.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-196 Validar calidad e integración: Finalizar y almacenar una sesión

Tecnologías propuestas: Pruebas funcionales con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-53

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-53 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Al finalizar, persistir estado y contexto autorizado antes de encolar trabajos idempotentes en PostgreSQL. La cola se consume dentro del proceso NestJS Render Free con concurrencia acotada; reanudar tras reinicio o arranque. Mostrar pendiente, procesando, completado o error sin perder la sesión.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-197 Implementar interfaz: Generar resumen automático

Tecnologías propuestas: Vistas de historial con React 18 y TypeScript.
Dificultad estimada: Alta.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-54

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-54 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Generar resumen mediante Ollama local mediante ngrok Free con el contexto autorizado de la sesión y guardar resultado y fuentes. Mantener cola durable PostgreSQL y reintentos sin duplicar resultados; comprobar qué contenido existe realmente y no inventar una transcripción del audio.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-198 Implementar servicios y datos: Generar resumen automático

Tecnologías propuestas: Procesamiento de sesiones con NestJS, PostgreSQL y Ollama local mediante ngrok Free.
Dificultad estimada: Alta.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-54

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-54 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Generar resumen mediante Ollama local mediante ngrok Free con el contexto autorizado de la sesión y guardar resultado y fuentes. Mantener cola durable PostgreSQL y reintentos sin duplicar resultados; comprobar qué contenido existe realmente y no inventar una transcripción del audio.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-199 Validar calidad e integración: Generar resumen automático

Tecnologías propuestas: Pruebas funcionales con Jest y Playwright.
Dificultad estimada: Alta.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-54

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-54 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Generar resumen mediante Ollama local mediante ngrok Free con el contexto autorizado de la sesión y guardar resultado y fuentes. Mantener cola durable PostgreSQL y reintentos sin duplicar resultados; comprobar qué contenido existe realmente y no inventar una transcripción del audio.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-200 Implementar interfaz: Generar puntos clave y acuerdos

Tecnologías propuestas: Vistas de historial con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-55

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-55 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Generar puntos clave y acuerdos mediante Ollama local mediante ngrok Free a partir del contexto autorizado persistido. Usar cola PostgreSQL, idempotencia y referencias a la sesión; validar fidelidad de los acuerdos y tratar falta de contexto o cuota.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-201 Implementar servicios y datos: Generar puntos clave y acuerdos

Tecnologías propuestas: Procesamiento de sesiones con NestJS, PostgreSQL y Ollama local mediante ngrok Free.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-55

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-55 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Generar puntos clave y acuerdos mediante Ollama local mediante ngrok Free a partir del contexto autorizado persistido. Usar cola PostgreSQL, idempotencia y referencias a la sesión; validar fidelidad de los acuerdos y tratar falta de contexto o cuota.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-202 Validar calidad e integración: Generar puntos clave y acuerdos

Tecnologías propuestas: Pruebas funcionales con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-55

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-55 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Generar puntos clave y acuerdos mediante Ollama local mediante ngrok Free a partir del contexto autorizado persistido. Usar cola PostgreSQL, idempotencia y referencias a la sesión; validar fidelidad de los acuerdos y tratar falta de contexto o cuota.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-203 Implementar interfaz: Generar un quiz de repaso

Tecnologías propuestas: Vistas de historial con React 18 y TypeScript.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-56

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-56 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Generar y almacenar quiz y respuestas con Ollama local mediante ngrok Free sobre el contenido autorizado de la sesión. Validar formato y respuesta correcta, idempotencia, autorización y estados de cuota. Mantener cola PostgreSQL y recuperación de trabajos.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-204 Implementar servicios y datos: Generar un quiz de repaso

Tecnologías propuestas: Procesamiento de sesiones con NestJS, PostgreSQL y Ollama local mediante ngrok Free.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-56

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-56 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Generar y almacenar quiz y respuestas con Ollama local mediante ngrok Free sobre el contenido autorizado de la sesión. Validar formato y respuesta correcta, idempotencia, autorización y estados de cuota. Mantener cola PostgreSQL y recuperación de trabajos.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-205 Validar calidad e integración: Generar un quiz de repaso

Tecnologías propuestas: Pruebas funcionales con Jest y Playwright.
Dificultad estimada: Media.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-56

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-56 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Generar y almacenar quiz y respuestas con Ollama local mediante ngrok Free sobre el contenido autorizado de la sesión. Validar formato y respuesta correcta, idempotencia, autorización y estados de cuota. Mantener cola PostgreSQL y recuperación de trabajos.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-206 Implementar interfaz: Consultar historial y reporte de aprendizaje

Tecnologías propuestas: Vistas de historial con React 18 y TypeScript.
Dificultad estimada: Baja.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-57

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-57 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Consultar historial y reporte en PostgreSQL de Supabase Free, con filtros y permisos. Los trabajos pendientes por pausa de Render o cuota IA aparecen claramente; no presentar una generación pendiente como resultado final.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-207 Implementar servicios y datos: Consultar historial y reporte de aprendizaje

Tecnologías propuestas: Procesamiento de sesiones con NestJS, PostgreSQL y Ollama local mediante ngrok Free.
Dificultad estimada: Baja.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-57

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-57 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Alcance específico requerido

Consultar historial y reporte en PostgreSQL de Supabase Free, con filtros y permisos. Los trabajos pendientes por pausa de Render o cuota IA aparecen claramente; no presentar una generación pendiente como resultado final.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.



## SUT-208 Validar calidad e integración: Consultar historial y reporte de aprendizaje

Tecnologías propuestas: Pruebas funcionales con Jest y Playwright.
Dificultad estimada: Baja.

Arquitectura aplicable
React solicita IA a NestJS en Render Free; el backend autentica usuario y sala y llama mediante HTTPS a un túnel ngrok Free que publica un servicio local autenticado delante de Ollama. Ollama ejecuta un modelo local autorizado y mantiene sus funciones cloud desactivadas. Clave, URL y modelo permanecen en el servidor. Usar una generación simultánea, límites de contexto/salida y cola durable PostgreSQL de Supabase Free, con consumidor en el mismo proceso NestJS. Reanudar trabajos tras reinicios, pausa de Render o caída del PC/túnel; las funciones de IA mantienen estado pendiente hasta disponer del servicio. Este diseño sustituye API de IA de pago, RabbitMQ y workers separados preservando las funciones y el procesamiento asíncrono.

Historia relacionada: SUT-57

Condición de entrega: presupuesto de servicios $0 y cumplimiento de la historia SUT-57 y de las cuotas en SUT-26. Probar el flujo funcional, errores y cuota agotada sin activar servicios de pago.

Validación específica requerida

Consultar historial y reporte en PostgreSQL de Supabase Free, con filtros y permisos. Los trabajos pendientes por pausa de Render o cuota IA aparecen claramente; no presentar una generación pendiente como resultado final.

Implementación y validación de IA local con ngrok

Configurar proveedor Ollama local desacoplado: NestJS Render Free llama por HTTPS al dominio gratuito ngrok, que apunta a una API local autenticada; esta invoca /api/chat de Ollama en localhost. URL, secreto y modelo son configuración de servidor, nunca del navegador.

No exponer Ollama directamente: su API local no exige autenticación. El servicio local exige Bearer token propio, limita rutas a salud/generación, modelo permitido, tamaño de entrada y tasa de solicitudes. Mantener Ollama escuchando en 127.0.0.1:11434 y desactivar funciones cloud con OLLAMA_NO_CLOUD=1. Verificar 401 para peticiones sin credencial.

Punto de partida: qwen3:4b cuantizado Q4_K_M, licencia Apache 2.0 y archivo de unos 2,5 GB. Modelo, versión/digest y licencia quedan registrados; validar español, fidelidad de resúmenes y quizzes con datos de prueba. La selección final y velocidad dependen del equipo que sirva IA; no comprar hardware para cumplir presupuesto $0.

Iniciar con OLLAMA_NUM_PARALLEL=1, un modelo cargado y contexto de 4.096 tokens; dividir entradas largas y limitar salida. Medir RAM/VRAM, tokens por segundo y tiempo hasta el primer token; usar streaming y cancelación. Procesar resúmenes/quizzes en cola durable con prioridad para preguntas interactivas y concurrencia total uno.

Probar PC apagado, suspensión, túnel caído, credencial inválida, servidor ocupado, timeout, cancelación y cuota ngrok agotada. Mostrar pendiente/reintentar o indisponibilidad y conservar la sesión; nunca activar una API externa de pago ni presentar una respuesta inventada.

Registrar solicitudes y bytes transferidos de contexto/respuestas, alertar al 80% y verificar el panel de ngrok. El límite gratuito es 1 GB y 20.000 solicitudes HTTP mensuales; usar solo el dominio de desarrollo y túnel gratuitos. Si se comparte equipo con la llamada, medir calidad bajo inferencia y reducir recursos de IA o posponer trabajos secundarios para proteger el audio/video.

