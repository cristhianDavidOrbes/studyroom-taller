import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("El seed de demostración solo se permite en desarrollo");
  const uid = "studyroom-demo-host";
  await db.user.upsert({
    where: { id: uid },
    create: {
      id: uid,
      email: "demo@example.invalid",
      displayName: "Equipo StudyRoom",
      interests: ["Matemáticas", "Programación"],
      onboarded: true,
    },
    update: {},
  });
  for (const item of [
    {
      id: "20260000-0000-4000-8000-000000000001",
      title: "Álgebra paso a paso",
      subject: "Matemáticas",
      description:
        "Un espacio para resolver ejercicios, compartir ideas y aprender juntos.",
    },
    {
      id: "20260000-0000-4000-8000-000000000002",
      title: "Club de programación",
      subject: "Programación",
      description: "Resolvemos retos y explicamos nuestras soluciones.",
    },
  ]) {
    await db.room.upsert({
      where: { id: item.id },
      create: {
        ...item,
        hostId: uid,
        modality: "colaborativo",
        level: "universitario",
        memberships: { create: { userId: uid, role: "host" } },
        sessions: { create: { title: item.title, participantIds: [uid] } },
      },
      update: {},
    });
  }
  process.stdout.write("Datos iniciales creados de forma idempotente.\n");
}
main()
  .catch((e) => {
    process.stderr.write(String(e.message) + "\n");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
