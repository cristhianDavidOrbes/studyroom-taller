# Constitución de StudyRoom

## 1. Naturaleza del proyecto

StudyRoom es una aplicación web para estudiantes que necesitan reunirse a distancia, compartir materiales y consultar después un registro de la sesión. Su propósito central es apoyar la colaboración en salas de estudio y conservar su contexto.

## 2. Stack tecnológico

- **Frontend:** React 18, TypeScript, Vite y CSS en `apps/web`.
- **Backend:** Node.js 22–24, TypeScript, NestJS y Socket.IO en `apps/api`.
- **Base de datos y archivos:** PostgreSQL, Prisma, migraciones versionadas y Supabase Storage privado.
- **Identidad y medios:** Firebase Authentication y LiveKit; HTTPS en tránsito.
- **IA:** gateway Node/TypeScript, Ollama, voz local en Python y OCR. ngrok expone solo el gateway autenticado mientras el PC anfitrión está encendido.
- **Otros lenguajes existentes:** SQL para migraciones y C# en el ayudante Windows, que no es obligatorio para el flujo académico.

## 3. Reglas de dominio y negocio

- **Acceso:** sala privada, chat, adjuntos y reporte requieren identidad y autorización de membresía. Las notas personales solo pertenecen a su autor.
- **Edad:** se guarda una fecha de nacimiento válida. Las salas con edad mínima no se muestran a quien no la cumple; el servidor vuelve a calcular y comprobar la edad al entrar.
- **Sesión:** una sala cerrada no acepta nuevas acciones. El reporte ordena voz, chat y recursos por el instante en que ocurrieron, no por el fin de su procesamiento.
- **Transcripción:** se conserva el texto reconocido con hablante y tiempos. Fallos, huecos y cobertura parcial se declaran; nunca se inventan palabras ni se promete exactitud absoluta.
- **Adjuntos:** validar tipo, tamaño y permisos antes de guardar. Los originales son privados y se entregan solo a usuarios autorizados; si se eliminan, el reporte conserva la referencia y marca la ausencia.
- **IA:** solo recibe fuentes autorizadas; no utiliza notas privadas, secretos ni datos de otras sesiones. La síntesis se distingue del contenido original.
- **Presupuesto:** mantener servicios en planes gratuitos configurados. Mostrar indisponibilidad o cuota agotada en vez de fingir funcionamiento ilimitado.

## 4. Estructura y estilo de código

- **Estructura:** `apps/web`, `apps/api`, `apps/ai-gateway`, `apps/desktop`, `scripts`, `tests`, `docs` y `specs`.
- **Estilo:** reutilizar servicios, validadores y contratos existentes. Separar interfaz, autorización, dominio, persistencia e integraciones. Preferir cambios pequeños.
- **Nombres:** componentes y tipos en PascalCase; variables y funciones TypeScript en camelCase; seguir nombres de archivo existentes. Requisitos `FR-###` y tareas `T###` permiten trazabilidad.

## 5. Errores y validaciones

- **UI:** mostrar carga, error y recuperación en español, sin claves, rutas privadas ni trazas internas.
- **Backend:** validar entradas y permisos antes de persistir. Usar HTTP 400 para dato inválido, 401 sin identidad, 403 sin permiso, 404 para recurso no disponible, 409 para conflicto y 5xx para falla del servicio. Confirmar el efecto antes de responder éxito.
- **Evidencia:** un 2xx no prueba por sí solo persistencia; verificar con lectura posterior, casos de error y control de acceso.

## 6. Reglas SDD y gobierno

- **Fuente de verdad:** `spec.md` define el comportamiento, `plan.md` el enfoque y `tasks.md` el trabajo. Ante un cambio de alcance, actualizar los artefactos afectados antes del código.
- **Cero código sombra:** no añadir funciones, dependencias ni refactorizaciones ajenas a los requisitos. El código heredado no acredita capacidades que no se probaron.
- **Colaboración:** usar rama, commits descriptivos y pull request. No atribuir trabajo a integrantes que no participaron.
- **Verificación:** probar éxito, error, autorización y regresión. La llamada prolongada con dispositivos reales requiere evidencia manual.
- **Secretos:** variables de entorno y archivos ignorados por Git; revisar el diff antes de publicar.
- **Conflictos:** si una solicitud contradice esta constitución, actualizar primero la regla y revisar especificación, plan y tareas.

**Versión:** 1.0.0 | **Adoptada:** 2026-11-15 | **Última revisión:** 2026-11-15
