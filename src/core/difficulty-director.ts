import { STAGE_CONFIGS, DIFFICULTY_MULTIPLIERS, StageConfig, GAME_CONSTANTS } from '../config/balance';
import { GameDifficulty, FallingBlock } from '../types/game';
import { VocabularyEntry } from '../types/vocabulary';
import { normalizeTerm } from './input-normalizer';

export class DifficultyDirector {
  private killedCount: number = 0;
  private currentStageIndex: number = 0;
  private difficulty: GameDifficulty;
  private lastSpawnTimeMs: number = 0;
  private nextSpawnDelayMs: number = 2000;
  private nextIdCounter: number = 1;
  private laneHistory: number[] = [];

  constructor(difficulty: GameDifficulty = 'normal') {
    this.difficulty = difficulty;
    this.reset();
  }

  public reset(): void {
    this.killedCount = 0;
    this.currentStageIndex = 0;
    this.lastSpawnTimeMs = 0;
    this.nextSpawnDelayMs = 1500;
    this.nextIdCounter = 1;
    this.laneHistory = [];
  }

  public onWordKilled(): { stageChanged: boolean; newStage: number } {
    this.killedCount += 1;
    let stageChanged = false;
    for (let i = STAGE_CONFIGS.length - 1; i >= 0; i--) {
      if (this.killedCount >= STAGE_CONFIGS[i].wordCountThreshold) {
        if (i !== this.currentStageIndex) {
          this.currentStageIndex = i;
          stageChanged = true;
        }
        break;
      }
    }
    return { stageChanged, newStage: this.getCurrentStage().stage };
  }

  public getCurrentStage(): StageConfig {
    return STAGE_CONFIGS[this.currentStageIndex];
  }

  public getStageNumber(): number {
    return this.getCurrentStage().stage;
  }

  public shouldSpawn(gameTimeMs: number, activeBlockCount: number): boolean {
    const stage = this.getCurrentStage();
    if (activeBlockCount >= stage.maxActive) {
      return false;
    }
    return gameTimeMs - this.lastSpawnTimeMs >= this.nextSpawnDelayMs;
  }

  public createSpawnedBlock(
    gameTimeMs: number,
    entries: VocabularyEntry[],
    activeBlocks: FallingBlock[]
  ): FallingBlock | null {
    if (entries.length === 0) return null;

    const activeTerms = new Set(activeBlocks.map((b) => b.typingText));
    // Filter available entries that aren't already active on screen
    let candidateEntries = entries.filter((e) => {
      const { typingText } = normalizeTerm(e.term);
      return !activeTerms.has(typingText);
    });

    if (candidateEntries.length === 0) {
      // If all are active, fall back to any entry
      candidateEntries = entries;
    }

    // Pick entry
    const randomIndex = Math.floor(Math.random() * candidateEntries.length);
    const chosen = candidateEntries[randomIndex];
    const { displayText, typingText } = normalizeTerm(chosen.term);

    // Pick a lane on X from 5 lanes [-4.0, -2.0, 0, 2.0, 4.0]
    const lanes = [-4.2, -2.1, 0, 2.1, 4.2];
    // Find lane least recently used
    const recentLanes = new Set(this.laneHistory.slice(-2));
    const availableLanes = lanes.filter((_, idx) => !recentLanes.has(idx));
    const laneIndex = availableLanes.length > 0
      ? lanes.indexOf(availableLanes[Math.floor(Math.random() * availableLanes.length)])
      : Math.floor(Math.random() * lanes.length);
    
    this.laneHistory.push(laneIndex);
    if (this.laneHistory.length > 5) this.laneHistory.shift();

    const baseX = lanes[laneIndex];
    const jitterX = (Math.random() - 0.5) * 0.6;
    const finalX = Math.max(-5.0, Math.min(5.0, baseX + jitterX));
    const zOffset = (Math.random() - 0.5) * 1.2;

    const stage = this.getCurrentStage();
    const diffMultiplier = DIFFICULTY_MULTIPLIERS[this.difficulty];
    const speed = GAME_CONSTANTS.BASE_FALL_SPEED * stage.fallSpeedMultiplier * diffMultiplier.speed;

    // Next spawn delay
    const [minSec, maxSec] = stage.spawnIntervalSec;
    const randomizedSec = minSec + Math.random() * (maxSec - minSec);
    this.nextSpawnDelayMs = randomizedSec * 1000 * diffMultiplier.spawnDelay;
    this.lastSpawnTimeMs = gameTimeMs;

    const block: FallingBlock = {
      id: `blk-${this.nextIdCounter++}`,
      entryId: chosen.id,
      displayText,
      typingText,
      typedIndex: 0,
      state: 'active',
      x: finalX,
      y: GAME_CONSTANTS.SPAWN_Y,
      z: zOffset,
      speedUnitsPerSecond: speed,
      spawnedAtMs: gameTimeMs,
      meaningVi: chosen.meaningVi,
      ipa: chosen.ipa,
      category: chosen.category,
    };

    return block;
  }
}
