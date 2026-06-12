/**
 * Read-aloud using the browser's built-in SpeechSynthesis — free, offline,
 * zero download. Crucial accessibility feature for low-literacy learners and
 * anyone on a device that can't run heavier models.
 */
export function speak(text: string, langCode = "en", rate = 0.98) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  stopSpeaking();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langCode;
  // Prefer a voice matching the language if the device has one.
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.toLowerCase().startsWith(langCode));
  if (match) utter.voice = match;
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
