/** A stale poll must not undo a just-confirmed opt-in; newer revocation must stop it. */
export function consentWasRevoked(
  participant: { enabled: boolean; updatedAt?: string } | undefined,
  confirmedAt: string | null,
) {
  if (!participant || participant.enabled || !participant.updatedAt || !confirmedAt) return false;
  const observed = Date.parse(participant.updatedAt), confirmed = Date.parse(confirmedAt);
  return Number.isFinite(observed) && Number.isFinite(confirmed) && observed >= confirmed;
}
