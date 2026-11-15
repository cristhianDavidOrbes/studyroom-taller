import { ageOn, parseBirthDate, requireAge } from "./age";

describe("edad para salas", () => {
  const today = new Date("2026-11-03T12:00:00Z");

  it("cumple 18 años exactamente en su cumpleaños", () => {
    expect(ageOn(parseBirthDate("2008-11-03", today), today)).toBe(18);
    expect(ageOn(parseBirthDate("2008-11-04", today), today)).toBe(17);
  });

  it("rechaza fechas imposibles y acceso sin edad declarada", () => {
    expect(() => parseBirthDate("2010-02-30", today)).toThrow();
    expect(() => requireAge(null, 0, today)).toThrow();
    expect(() => requireAge(new Date("2008-11-04T00:00:00Z"), 18, today)).toThrow();
  });
});
