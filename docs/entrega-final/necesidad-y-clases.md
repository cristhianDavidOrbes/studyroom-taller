# Necesidad, usuarios y relación con las clases

## Necesidad comprendida

La petición inicial es «crear salas de estudio con videollamada e IA». La necesidad que atiende StudyRoom es que un grupo pueda estudiar a distancia, compartir recursos durante la sesión y recuperar después el contenido con su procedencia y orden temporal. El reporte tiene valor solo si deja distinguir lo dicho por cada persona, lo enviado por chat, los adjuntos y lo generado por IA.

## Actores y contexto

| Actor | Necesidad | Restricción observada |
|---|---|---|
| Participante | Entrar, conversar, compartir y revisar lo ocurrido | Debe tener acceso a la sala y puede sufrir cortes de red o errores de transcripción |
| Anfitrión | Crear y cerrar una sesión, administrar acceso | No debe permitir que una sala cerrada siga aceptando actividad |
| Persona menor de edad | Encontrar solo salas apropiadas | La fecha de nacimiento debe validarse en servidor; no basta ocultar una tarjeta |
| Servicio de IA local | Transcribir y responder con fuentes disponibles | Depende del PC, del túnel y de cuotas; no reemplaza la fuente original |

La información procede de las solicitudes del dueño del proyecto, el código y las pruebas del repositorio. No se hicieron entrevistas formales ni se atribuyen opiniones a usuarios que no participaron. Queda por validar con usuarios reales si la cronología y los avisos de cobertura son comprensibles.

## Reglas e hipótesis

- Hecho de implementación: los archivos de la sala se guardan en Storage privado y los reportes requieren pertenecer a la sesión.
- Hecho de implementación: los fragmentos de transcripción tienen hablante y tiempo; la IA puede fallar y no produce palabras faltantes.
- Regla acordada: no hay cuestionarios y no se obliga a instalar una herramienta de dibujo para entrar.
- Hipótesis por validar: un reporte Word/ZIP con cronología y adjuntos satisface la necesidad de revisar una sesión completa. La prueba de uso con estudiantes aún requiere evidencia.
- Hipótesis por validar: la conexión de medios conserva calidad suficiente en cuatro equipos durante 60 minutos. Las pruebas unitarias no demuestran esto.

## Qué se aplicó de cada clase

| Material de clase | Aplicación concreta en StudyRoom |
|---|---|
| Ingeniería Web I | Distinguir «se ve funcionando» de persistencia, permisos y calidad; comprobar el cambio con lectura posterior y casos de error |
| De la interfaz al dato II | Seguir UI → petición → lógica → PostgreSQL/Storage; poner la edad y la pertenencia en el backend y conservar procedencia de la sesión |
| HTTP/HTTPS III | Interpretar método, status y cuerpo; 401 significa identidad ausente, 403 permiso insuficiente; HTTPS protege el canal, no decide acceso |
| Necesidades de usuarios IV | Separar petición visible de necesidad, actores, reglas, supuestos y prioridades; limitar el alcance con Non-Goals |
| Contexto SDD y guía Spec Kit | Constitución → especificación → plan → tareas → pruebas; revisar divergencias entre documentos y código antes de presentar |

## Preguntas pendientes para validación posterior

1. ¿Qué nivel de error de voz consideran aceptable los estudiantes para estudiar con el reporte?
2. ¿Qué tamaño máximo de archivo necesitan en sesiones reales dentro de las cuotas gratuitas?
3. ¿Qué evidencia necesita el docente sobre participación de más integrantes, si el trabajo se presenta en equipo?
4. ¿La política de edad mínima de cada sala se define por el anfitrión o por una regla institucional adicional?
