/**
 * Input and Text Normalization Module
 * Implements section 4.4 and 13.1 of specification.
 */

export function normalizeTerm(rawTerm: string): { displayText: string; typingText: string } {
  const trimmed = rawTerm.trim().normalize('NFC').replace(/\s+/g, ' ');
  const displayText = trimmed;
  // typingText: lowercased, keeps letters, spaces, hyphens, and apostrophes
  const typingText = trimmed.toLowerCase();
  return { displayText, typingText };
}

export function normalizeTypedKey(key: string): string | null {
  if (key.length === 1) {
    // Normal single-char typing: letter, space, hyphen, apostrophe
    return key.toLowerCase();
  }
  if (key === 'Spacebar' || key === ' ') {
    return ' ';
  }
  return null;
}

export function isValidTypingChar(char: string): boolean {
  // Accepts standard English letters, spaces, hyphens, apostrophes
  return /^[a-z0-9 '\-]$/i.test(char);
}
