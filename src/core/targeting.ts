import { FallingBlock } from '../types/game';
import { GAME_CONSTANTS } from '../config/balance';

export function findBestTargetForChar(
  activeBlocks: FallingBlock[],
  normalizedKey: string,
  groundY: number = GAME_CONSTANTS.GROUND_Y
): FallingBlock | null {
  const candidates = activeBlocks.filter(
    (b) => b.state === 'active' && b.typingText[b.typedIndex] === normalizedKey
  );

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Sort candidates by most urgent: time to ground, then spawn time, then ID
  candidates.sort((a, b) => {
    const timeA = Math.max(0.01, a.y - groundY) / Math.max(0.1, a.speedUnitsPerSecond);
    const timeB = Math.max(0.01, b.y - groundY) / Math.max(0.1, b.speedUnitsPerSecond);
    if (Math.abs(timeA - timeB) > 0.05) {
      return timeA - timeB;
    }
    if (a.spawnedAtMs !== b.spawnedAtMs) {
      return a.spawnedAtMs - b.spawnedAtMs;
    }
    return a.id.localeCompare(b.id);
  });

  return candidates[0];
}

export function cycleTargetBlock(
  activeBlocks: FallingBlock[],
  currentLockedId: string | null
): FallingBlock | null {
  const alive = activeBlocks.filter((b) => b.state === 'active');
  if (alive.length === 0) return null;
  if (alive.length === 1) return alive[0];

  const currentIndex = alive.findIndex((b) => b.id === currentLockedId);
  if (currentIndex === -1) {
    return alive[0];
  }
  const nextIndex = (currentIndex + 1) % alive.length;
  return alive[nextIndex];
}
