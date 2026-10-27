let speechAvailable: boolean | null = null;
let lastSpokenAt = 0;
const THROTTLE_MS = 600;

export function checkSpeechSupport(): boolean {
  if (speechAvailable !== null) return speechAvailable;
  speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  return speechAvailable;
}

export function speakEnglishWord(word: string, audioUrl?: string): boolean {
  const now = Date.now();
  if (now - lastSpokenAt < THROTTLE_MS) {
    return false;
  }
  lastSpokenAt = now;

  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {});
      return true;
    } catch (e) {
      // Fallback to speech synthesis
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      return false;
    }
  }

  return false;
}
