import { GAME_CONSTANTS } from '../config/balance';

export function calculatePointsForWord(term: string, currentCombo: number): number {
  const base = GAME_CONSTANTS.BASE_SCORE;
  const lengthBonus = Math.max(0, term.length - 4);
  let comboBonus = 0;
  if (currentCombo > 0 && currentCombo % 10 === 0) {
    comboBonus = GAME_CONSTANTS.COMBO_BONUS_STEP_10;
  } else if (currentCombo > 0 && currentCombo % 5 === 0) {
    comboBonus = GAME_CONSTANTS.COMBO_BONUS_STEP_5;
  }
  return base + lengthBonus + comboBonus;
}

export function calculateAccuracy(correctKeys: number, incorrectKeys: number): number {
  const total = correctKeys + incorrectKeys;
  if (total === 0) return 100;
  return Math.round((correctKeys / total) * 1000) / 10; // e.g. 96.5%
}

export function calculateWPM(correctKeys: number, elapsedPlayingMs: number): number {
  const minutes = Math.max(0.05, elapsedPlayingMs / 60000);
  const wordsTyped = correctKeys / 5;
  return Math.round(wordsTyped / minutes);
}
