import { BadRequestException, ForbiddenException } from "@nestjs/common";

export function parseBirthDate(value: string, now = new Date()): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new BadRequestException("Indica una fecha de nacimiento válida");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value || ageOn(date, now) < 0 || ageOn(date, now) > 120)
    throw new BadRequestException("Indica una fecha de nacimiento válida");
  return date;
}

export function ageOn(birthDate: Date, now = new Date()): number {
  const birthdayPassed = now.getUTCMonth() > birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() >= birthDate.getUTCDate());
  return now.getUTCFullYear() - birthDate.getUTCFullYear() - Number(!birthdayPassed);
}

export function requireAge(birthDate: Date | null, minAge: number, now = new Date()) {
  if (!birthDate) throw new ForbiddenException("Indica tu fecha de nacimiento en tu perfil para entrar a las salas");
  if (ageOn(birthDate, now) < minAge) throw new ForbiddenException("No tienes la edad mínima para esta sala");
}
