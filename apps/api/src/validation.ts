import { z } from "zod";
export const profileSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80).optional(),
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
export const annotationSchema = z
  .object({
    action: z.enum(["point", "stroke", "clear"]),
    screenId: z.string().min(1).max(100),
    x: z.number().min(0).max(1).optional(),
    y: z.number().min(0).max(1).optional(),
    points: z
      .array(
        z
          .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
          .strict(),
      )
      .max(200)
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .default("#ffd166"),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.action === "point" && (v.x === undefined || v.y === undefined))
      c.addIssue({ code: "custom", message: "Faltan coordenadas" });
    if (v.action === "stroke" && (!v.points || v.points.length < 2))
      c.addIssue({
        code: "custom",
        message: "Se necesitan al menos dos puntos",
      });
  });
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
