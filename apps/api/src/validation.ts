import { z } from "zod";
export const profileSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80).optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    bio: z.string().max(500).optional(),
    interests: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    level: z.string().min(1).max(40).optional(),
    notifications: z
      .object({ inApp: z.boolean(), email: z.boolean() })
      .optional(),
    onboarded: z.boolean().optional(),
  })
  .strict();
export const roomSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().max(2000).default(""),
    subject: z.string().trim().min(1).max(80),
    modality: z.string().min(1).max(40).default("colaborativa"),
    level: z.string().min(1).max(40).default("principiante"),
    minAge: z.number().int().min(0).max(18).default(0),
    privacy: z.enum(["public", "private"]).default("public"),
    accessCode: z.string().min(6).max(64).optional(),
    capacity: z.number().int().min(2).max(4).default(4),
    scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
    durationMinutes: z.number().int().min(15).max(120).default(60),
  })
  .strict();
export const messageSchema = z
  .object({
    text: z.string().trim().min(1).max(4000),
    clientId: z.string().min(1).max(100),
  })
  .strict();
export const ANNOTATION_LIMITS = {
  stored: 40,
  points: 200,
  text: 300,
  strokeWidth: 24,
  fontSize: 96,
} as const;
const normalizedCoordinate = z.number().finite().min(0).max(1);
export const annotationSchema = z
  .object({
    action: z.enum(["point", "stroke", "line", "arrow", "rectangle", "ellipse", "text", "erase", "clear"]),
    screenId: z.string().trim().min(1).max(100),
    x: normalizedCoordinate.optional(),
    y: normalizedCoordinate.optional(),
    points: z
      .array(
        z
          .object({ x: normalizedCoordinate, y: normalizedCoordinate })
          .strict(),
      )
      .max(ANNOTATION_LIMITS.points)
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .default("#ffd166"),
    // Size units use a 1000-unit-wide viewport; x/y remain normalized to [0,1].
    strokeWidth: z.number().finite().min(1).max(ANNOTATION_LIMITS.strokeWidth).optional(),
    fontSize: z.number().finite().min(8).max(ANNOTATION_LIMITS.fontSize).optional(),
    text: z.string().trim().min(1).max(ANNOTATION_LIMITS.text)
      .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value), "El texto contiene caracteres de control")
      .optional(),
    targetIds: z.array(z.string().uuid().transform((id) => id.toLowerCase()))
      .min(1).max(ANNOTATION_LIMITS.stored).optional(),
  })
  .strict()
  .superRefine((v, c) => {
    const shape = ["line", "arrow", "rectangle", "ellipse"].includes(v.action);
    const positioned = v.action === "point" || v.action === "text";
    if (positioned && (v.x === undefined || v.y === undefined))
      c.addIssue({ code: "custom", message: "Faltan coordenadas" });
    if (v.action === "stroke" && (!v.points || v.points.length < 2))
      c.addIssue({
        code: "custom",
        message: "Se necesitan al menos dos puntos",
      });
    if (shape && v.points?.length !== 2)
      c.addIssue({ code: "custom", message: "La figura requiere exactamente dos puntos" });
    if (shape && v.points?.length === 2) {
      const [a, b] = v.points;
      const empty = ["rectangle", "ellipse"].includes(v.action)
        ? a.x === b.x || a.y === b.y
        : a.x === b.x && a.y === b.y;
      if (empty) c.addIssue({ code: "custom", message: "La figura debe tener tamaño" });
    }
    if (v.action === "text" && !v.text)
      c.addIssue({ code: "custom", message: "Falta el texto" });
    if (v.action === "erase" && !v.targetIds?.length)
      c.addIssue({ code: "custom", message: "Faltan los identificadores a borrar" });
    if (v.targetIds && new Set(v.targetIds).size !== v.targetIds.length)
      c.addIssue({ code: "custom", message: "Los identificadores no pueden repetirse" });
    const allowed = new Set(["action", "screenId", "color"]);
    if (positioned) { allowed.add("x"); allowed.add("y"); }
    if (shape || v.action === "stroke") { allowed.add("points"); allowed.add("strokeWidth"); }
    if (v.action === "text") { allowed.add("text"); allowed.add("fontSize"); }
    if (v.action === "erase") allowed.add("targetIds");
    for (const [key, value] of Object.entries(v))
      if (value !== undefined && !allowed.has(key))
        c.addIssue({ code: "custom", path: [key], message: "Campo incompatible con esta herramienta" });
  })
  .transform((v) => ({
    ...v,
    ...(["stroke", "line", "arrow", "rectangle", "ellipse"].includes(v.action)
      ? { strokeWidth: v.strokeWidth ?? 3 } : {}),
    ...(v.action === "text" ? { fontSize: v.fontSize ?? 24 } : {}),
  }));
export const timerSchema = z
  .object({
    action: z.enum(["start", "pause", "reset"]),
    durationSeconds: z.number().int().min(10).max(14400).optional(),
    mode: z.enum(["focus", "break"]).default("focus"),
  })
  .strict();
export const aiSchema = z
  .object({
    question: z.string().trim().min(3).max(1500),
    includeChat: z.boolean().default(false),
    documentIds: z.array(z.string().uuid()).max(5).default([]),
  })
  .strict();
export const quizSchema = z
  .object({
    questions: z
      .array(
        z
          .object({
            question: z.string().min(3).max(500),
            options: z.array(z.string().min(1).max(300)).length(4),
            correctIndex: z.number().int().min(0).max(3),
            explanation: z.string().min(1).max(1000),
          })
          .strict(),
      )
      .min(1)
      .max(5),
  })
  .strict();
