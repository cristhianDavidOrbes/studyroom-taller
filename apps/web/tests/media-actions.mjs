/** Microphone activation has no extra dialog; transcription follows published audio. */
export async function activateMicrophone(page) {
  await page.getByRole("button", { name: "Activar micrófono", exact: true }).click();
}
