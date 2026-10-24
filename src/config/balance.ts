import { GameDifficulty } from '../types/game';

export interface StageConfig {
  stage: number;
  wordCountThreshold: number; // Words destroyed to advance
  maxActive: number;
  spawnIntervalSec: [number, number]; // [min, max]
  fallSpeedMultiplier: number;
  wordMinLength: number;
  wordMaxLength: number;
}

export const DIFFICULTY_MULTIPLIERS: Record<GameDifficulty, { speed: number; spawnDelay: number }> = {
  easy: { speed: 0.75, spawnDelay: 1.35 },
  normal: { speed: 1.0, spawnDelay: 1.0 },
  hard: { speed: 1.35, spawnDelay: 0.75 },
};

export const STAGE_CONFIGS: StageConfig[] = [
  {
    stage: 1,
    wordCountThreshold: 0,
    maxActive: 3,
    spawnIntervalSec: [3.8, 4.5],
    fallSpeedMultiplier: 1.0,
    wordMinLength: 3,
    wordMaxLength: 5,
  },
  {
    stage: 2,
    wordCountThreshold: 8,
    maxActive: 4,
    spawnIntervalSec: [3.0, 3.8],
    fallSpeedMultiplier: 1.15,
    wordMinLength: 4,
    wordMaxLength: 6,
  },
  {
    stage: 3,
    wordCountThreshold: 18,
    maxActive: 5,
    spawnIntervalSec: [2.5, 3.2],
    fallSpeedMultiplier: 1.3,
    wordMinLength: 5,
    wordMaxLength: 8,
  },
  {
    stage: 4,
    wordCountThreshold: 30,
    maxActive: 6,
    spawnIntervalSec: [2.0, 2.7],
    fallSpeedMultiplier: 1.5,
    wordMinLength: 6,
    wordMaxLength: 9,
  },
  {
    stage: 5,
    wordCountThreshold: 45,
    maxActive: 7,
    spawnIntervalSec: [1.8, 2.3],
    fallSpeedMultiplier: 1.8,
    wordMinLength: 3,
    wordMaxLength: 12,
  },
];

export const GAME_CONSTANTS = {
  INITIAL_LIVES: 3,
  SPAWN_Y: 7.2,
  GROUND_Y: -2.8,
  URGENT_Y_THRESHOLD: -0.6,
  SPAWN_X_RANGE: [-5.2, 5.2] as [number, number],
  SPAWN_Z_VARIATION: [-0.8, 0.8] as [number, number],
  DAMAGE_GRACE_MS: 600,
  BASE_SCORE: 10,
  COMBO_BONUS_STEP_5: 20,
  COMBO_BONUS_STEP_10: 50,
  TURRET_POS: [0, -3.2, 2.0] as [number, number, number],
  PROJECTILE_SPEED: 28.0,
  BASE_FALL_SPEED: 0.72, // units per second at multiplier 1.0
};
