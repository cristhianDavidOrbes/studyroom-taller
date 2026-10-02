import { OpenAPIObject } from "@nestjs/swagger";
import { ANNOTATION_LIMITS } from "./validation";
const string = (maxLength?: number) => ({
  type: "string",
  ...(maxLength ? { maxLength } : {}),
});
const object = (
  properties: Record<string, unknown>,
  required: string[] = [],
) => ({ type: "object", additionalProperties: false, properties, required });
export function documentContracts(spec: OpenAPIObject) {
  const coordinate = { type: "number", minimum: 0, maximum: 1 };
  const annotationBase = {
    screenId: { ...string(100), minLength: 1, description: "LiveKit trackSid de pantalla activa" },
    color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$", default: "#ffd166" },
  };
  const strokeWidth = { type: "number", minimum: 1, maximum: ANNOTATION_LIMITS.strokeWidth, default: 3 };
  const points = (maxItems: number) => ({
    type: "array", minItems: 2, maxItems,
    items: object({ x: coordinate, y: coordinate }, ["x", "y"]),
  });
  const annotationVariant = (actions: string[], properties: Record<string, unknown>, required: string[]) =>
    object({ ...annotationBase, action: { type: "string", enum: actions }, ...properties }, ["action", "screenId", ...required]);
  const schemas: Record<string, any> = {
    ProfileUpdate: object({
      displayName: { ...string(80), minLength: 2 },
      bio: string(500),
      interests: { type: "array", items: string(50), maxItems: 20 },
      level: string(40),
      notifications: object(
        { inApp: { type: "boolean" }, email: { type: "boolean" } },
        ["inApp", "email"],
      ),
      onboarded: { type: "boolean" },
    }),
    RoomCreate: object(
      {
        title: { ...string(120), minLength: 3 },
        description: string(2000),
        subject: string(80),
        modality: string(40),
        level: string(40),
        privacy: {
          type: "string",
          enum: ["public", "private"],
          default: "public",
        },
        accessCode: { ...string(64), minLength: 6 },
        capacity: { type: "integer", minimum: 2, maximum: 4, default: 4 },
        scheduledAt: { type: "string", format: "date-time", nullable: true },
        durationMinutes: {
          type: "integer",
          minimum: 15,
          maximum: 120,
          default: 60,
        },
      },
      ["title", "subject"],
    ),
    Join: object({ code: string(64), inviteToken: string(200) }),
    Message: object(
      {
        text: { ...string(4000), minLength: 1 },
        clientId: { ...string(100), minLength: 1 },
      },
      ["text", "clientId"],
    ),
    Note: object({ text: string(30000) }, ["text"]),
    Role: object(
      { role: { type: "string", enum: ["participant", "moderator"] } },
      ["role"],
    ),
    Timer: object(
      {
        action: { type: "string", enum: ["start", "pause", "reset"] },
        durationSeconds: { type: "integer", minimum: 10, maximum: 14400 },
        mode: { type: "string", enum: ["focus", "break"] },
      },
      ["action"],
    ),
    Annotation: {
      description: "Coordenadas normalizadas. Tamaños en unidades de un viewport de ancho1000 con altura proporcional. IDs asignados por servidor; erase devuelve solo IDs realmente borrados de esta pantalla. Máximo40 elementos persistidos por sala.",
      oneOf: [
        annotationVariant(["point"], { x: coordinate, y: coordinate }, ["x", "y"]),
        annotationVariant(["stroke"], { points: points(ANNOTATION_LIMITS.points), strokeWidth }, ["points"]),
        annotationVariant(["line", "arrow", "rectangle", "ellipse"], { points: points(2), strokeWidth }, ["points"]),
        annotationVariant(["text"], {
          x: coordinate, y: coordinate,
          text: { ...string(ANNOTATION_LIMITS.text), minLength: 1, description: "Texto plano, sin caracteres de control" },
          fontSize: { type: "number", minimum: 8, maximum: ANNOTATION_LIMITS.fontSize, default: 24 },
        }, ["x", "y", "text"]),
        annotationVariant(["erase"], { targetIds: {
          type: "array", minItems: 1, maxItems: ANNOTATION_LIMITS.stored, uniqueItems: true,
          items: { type: "string", format: "uuid" },
        } }, ["targetIds"]),
        annotationVariant(["clear"], {}, []),
      ],
    },
    Question: object(
      {
        question: {
          ...string(1500),
          description: "Máximo adicional: 1.000 bytes UTF-8",
        },
        includeChat: { type: "boolean", default: false },
        documentIds: {
          type: "array",
          items: { type: "string", format: "uuid" },
          maxItems: 5,
        },
      },
      ["question"],
    ),
    Feedback: object(
      { rating: { type: "integer", enum: [-1, 1] }, reason: string(1000) },
      ["rating"],
    ),
    Artifact: object(
      { kind: { type: "string", enum: ["summary", "keypoints", "quiz"] } },
      ["kind"],
    ),
    TranscriptionConsent: object({ enabled: { type: "boolean", description: "Consentimiento personal. No permite habilitar a otros participantes." } }, ["enabled"]),
    ReportQuestion: object({ question: { ...string(1500), minLength: 3, description: "Máximo1000bytesUTF8. Contextoexclusivo del reporteautorizado, citasfiltradas." }, clientId: { type: "string", format: "uuid" } }, ["question"]),
    TranscriptionGap: object({ clientId: { type: "string", format: "uuid" }, sessionId: { type: "string", format: "uuid" }, startMs: { type: "integer", minimum: 0 }, endMs: { type: "integer", minimum: 1 }, reason: { type: "string", enum: ["capture_failed", "queue_overflow", "upload_failed"] } }, ["clientId", "sessionId", "startMs", "endMs", "reason"]),
    QuizAttempt: object(
      {
        answers: {
          type: "array",
          minItems: 1,
          maxItems: 5,
          items: { type: "integer", minimum: 0, maximum: 3 },
        },
      },
      ["answers"],
    ),
    Error: object({ message: string(), code: string(), requestId: string() }, [
      "message",
    ]),
  };
  schemas.RoomUpdate = { ...schemas.RoomCreate, required: [] };
  spec.components ??= {};
  spec.components.schemas = { ...spec.components.schemas, ...schemas };
  const bodies: [string, string, string][] = [
    ["/api/me", "patch", "ProfileUpdate"],
    ["/api/rooms", "post", "RoomCreate"],
    ["/api/rooms/{id}", "patch", "RoomUpdate"],
    ["/api/rooms/{id}/join", "post", "Join"],
    ["/api/rooms/{id}/messages", "post", "Message"],
    ["/api/rooms/{id}/notes", "put", "Note"],
    ["/api/rooms/{id}/members/{uid}", "patch", "Role"],
    ["/api/rooms/{id}/timer", "put", "Timer"],
    ["/api/rooms/{id}/annotations", "post", "Annotation"],
    ["/api/rooms/{id}/ai", "post", "Question"],
    ["/api/rooms/{id}/transcription/consent", "post", "TranscriptionConsent"],
    ["/api/rooms/{id}/transcription/gaps", "post", "TranscriptionGap"],
    ["/api/ai/answers/{id}/feedback", "post", "Feedback"],
    ["/api/sessions/{id}/artifacts", "post", "Artifact"],
    ["/api/sessions/{id}/questions", "post", "ReportQuestion"],
    ["/api/sessions/{id}/quiz/attempts", "post", "QuizAttempt"],
  ];
  for (const [path, method, schema] of bodies) {
    const operation = (spec.paths[path] as any)?.[method];
    if (operation)
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${schema}` },
          },
        },
      };
  }
  for (const [path, value] of Object.entries(spec.paths)) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const operation = (value as any)?.[method];
      if (!operation || path === "/api/health") continue;
      for (const [status, description] of Object.entries({
        400: "Datos inválidos",
        401: "Sesión vencida o inválida",
        403: "Sin permiso para esta sala o recurso",
        409: "Estado o capacidad incompatible",
        429: "Cuota gratuita o límite de solicitudes",
        503: "Proveedor no disponible",
      }))
        operation.responses[status] = {
          description,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        };
    }
  }
  return spec;
}
