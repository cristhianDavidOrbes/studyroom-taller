import { describe, expect, it } from "vitest";
import { consentWasRevoked } from "./transcription-consent";
describe("consentimiento sincronizado entre pestañas", () => {
  const confirmed = "2026-10-02T16:00:01.000Z";
  it("una revocación posterior detiene la captura local", () => {
    expect(consentWasRevoked({ enabled: false, updatedAt: "2026-10-02T16:00:02.000Z" }, confirmed)).toBe(true);
    expect(consentWasRevoked({ enabled: false, updatedAt: confirmed }, confirmed)).toBe(true);
  });
  it("un sondeo anterior no desactiva el consentimiento recién confirmado", () => {
    expect(consentWasRevoked({ enabled: false, updatedAt: "2026-10-02T16:00:00.999Z" }, confirmed)).toBe(false);
  });
  it("no inicia captura con el consentimiento de otra pestaña ni con fechas inválidas", () => {
    expect(consentWasRevoked({ enabled: true, updatedAt: confirmed }, null)).toBe(false);
    expect(consentWasRevoked({ enabled: false, updatedAt: "invalid" }, confirmed)).toBe(false);
    expect(consentWasRevoked(undefined, confirmed)).toBe(false);
  });
});
