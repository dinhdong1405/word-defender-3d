export interface TypingResult {
  accepted: boolean;
  isComplete: boolean;
  newBuffer: string;
  matchedAnswer?: string;
  isWrong: boolean;
}

export function normalizeInput(str: string): string {
  return str.trim().toLowerCase().normalize('NFC');
}

export function cleanKey(event: KeyboardEvent): string | null {
  if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) {
    return null;
  }
  // Allow letters, space, apostrophe, hyphen
  const key = event.key;
  if (/^[a-zA-Z '-]$/.test(key)) {
    return key.toLowerCase();
  }
  return null;
}

export function evaluateKeystroke(
  currentBuffer: string,
  candidateAnswers: string[],
  nextChar: string
): TypingResult {
  const normalizedChar = nextChar.toLowerCase();
  const testBuffer = currentBuffer + normalizedChar;

  // Check if testBuffer is a prefix of ANY accepted answer
  const matchingAnswers = candidateAnswers.filter((ans) => {
    const normAns = normalizeInput(ans);
    return normAns.startsWith(testBuffer);
  });

  if (matchingAnswers.length === 0) {
    return {
      accepted: false,
      isComplete: false,
      newBuffer: currentBuffer,
      isWrong: true,
    };
  }

  // Check if testBuffer EXACTLY matches any full answer
  const exactMatch = matchingAnswers.find((ans) => normalizeInput(ans) === testBuffer);
  if (exactMatch) {
    return {
      accepted: true,
      isComplete: true,
      newBuffer: testBuffer,
      matchedAnswer: exactMatch,
      isWrong: false,
    };
  }

  return {
    accepted: true,
    isComplete: false,
    newBuffer: testBuffer,
    isWrong: false,
  };
}
