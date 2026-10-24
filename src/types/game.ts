import { VocabularyPack } from './vocabulary';

export type GamePhase =
  | 'boot'
  | 'loading'
  | 'ready'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'resume_countdown'
  | 'game_over'
  | 'summary'
  | 'error';

export type GameMode = 'classic' | 'meaning' | 'zen';
export type GameDifficulty = 'easy' | 'normal' | 'hard';
export type BlockState = 'spawning' | 'active' | 'destroyed' | 'missed';

export interface FallingBlock {
  id: string;
  entryId: string;
  displayText: string;
  typingText: string;
  typedIndex: number;
  state: BlockState;
  x: number;
  y: number;
  z: number;
  speedUnitsPerSecond: number;
  spawnedAtMs: number;
  protectedUntilMs?: number;
  meaningVi?: string;
  ipa?: string;
  category?: string;
}

export interface SessionStats {
  score: number;
  lives: number;
  level: number;
  killed: number;
  missed: number;
  correctKeys: number;
  incorrectKeys: number;
  maxCombo: number;
  currentCombo: number;
  elapsedPlayingMs: number;
  missedWordEntries: Array<{
    term: string;
    meaningVi?: string;
    ipa?: string;
    missedAtMs: number;
  }>;
}

export interface GameSnapshot {
  phase: GamePhase;
  seed: number;
  mode: GameMode;
  difficulty: GameDifficulty;
  packId: string;
  packTitle: string;
  blocks: FallingBlock[];
  lockedBlockId: string | null;
  stats: SessionStats;
  gameTimeMs: number;
  countdownValue?: number;
}

export type GameEvent =
  | { type: 'KEY_CORRECT'; blockId: string; charIndex: number; char: string; blockPos: [number, number, number] }
  | { type: 'KEY_WRONG'; expectedChar?: string; typedChar: string; blockId?: string }
  | { type: 'TARGET_LOCKED'; blockId: string }
  | { type: 'TARGET_RELEASED'; blockId: string }
  | { type: 'SHOT_FIRED'; blockId: string; charIndex: number; targetPos: [number, number, number] }
  | { type: 'BLOCK_DESTROYED'; blockId: string; entryId: string; term: string; meaningVi?: string; points: number; pos: [number, number, number] }
  | { type: 'BLOCK_MISSED'; blockId: string; entryId: string; term: string; pos: [number, number, number] }
  | { type: 'LIFE_LOST'; remainingLives: number }
  | { type: 'LEVEL_UP'; level: number }
  | { type: 'COMBO_MILESTONE'; combo: number }
  | { type: 'GAME_OVER' };

export interface SessionConfig {
  pack: VocabularyPack;
  mode: GameMode;
  difficulty: GameDifficulty;
  seed?: number;
}

export interface PlayerGameSettings {
  soundFxVolume: number;
  musicVolume: number;
  pronunciationEnabled: boolean;
  graphicsQuality: 'auto' | 'low' | 'medium' | 'high';
  reducedMotion: boolean;
  showMeaningOnKill: boolean;
  skipTutorial: boolean;
  preferredDifficulty: GameDifficulty;
}

export interface GameSessionRecord {
  id: string;
  packId: string;
  packTitleSnapshot: string;
  mode: GameMode;
  difficulty: GameDifficulty;
  score: number;
  maxCombo: number;
  accuracy: number;
  correctKeys: number;
  incorrectKeys: number;
  wordsDestroyed: number;
  wordsMissed: number;
  reachedLevel: number;
  durationMs: number;
  endedAt: string;
  missedWords: Array<{ term: string; meaningVi?: string; ipa?: string }>;
}
