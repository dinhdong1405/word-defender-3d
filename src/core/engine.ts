import {
  GameSnapshot,
  GameEvent,
  GamePhase,
  SessionConfig,
  FallingBlock,
  SessionStats,
} from '../types/game';
import { GAME_CONSTANTS } from '../config/balance';
import { DifficultyDirector } from './difficulty-director';
import { findBestTargetForChar, cycleTargetBlock } from './targeting';
import { normalizeTypedKey, isValidTypingChar } from './input-normalizer';
import { calculatePointsForWord } from './scoring';

export class WordDefenderEngine {
  private phase: GamePhase = 'boot';
  private config: SessionConfig | null = null;
  private director: DifficultyDirector | null = null;
  private blocks: FallingBlock[] = [];
  private lockedBlockId: string | null = null;
  private stats: SessionStats = {
    score: 0,
    lives: GAME_CONSTANTS.INITIAL_LIVES,
    level: 1,
    killed: 0,
    missed: 0,
    correctKeys: 0,
    incorrectKeys: 0,
    maxCombo: 0,
    currentCombo: 0,
    elapsedPlayingMs: 0,
    missedWordEntries: [],
  };
  private gameTimeMs: number = 0;
  private lastDamageTimeMs: number = -9999;
  private countdownValue: number = 3;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private snapshotListeners: Set<(snapshot: GameSnapshot) => void> = new Set();
  private eventListeners: Set<(event: GameEvent) => void> = new Set();

  constructor() {
    this.phase = 'boot';
  }

  public start(config: SessionConfig): void {
    this.config = config;
    this.director = new DifficultyDirector(config.difficulty);
    this.blocks = [];
    this.lockedBlockId = null;
    this.gameTimeMs = 0;
    this.lastDamageTimeMs = -9999;
    this.stats = {
      score: 0,
      lives: config.mode === 'zen' ? 999 : GAME_CONSTANTS.INITIAL_LIVES,
      level: 1,
      killed: 0,
      missed: 0,
      correctKeys: 0,
      incorrectKeys: 0,
      maxCombo: 0,
      currentCombo: 0,
      elapsedPlayingMs: 0,
      missedWordEntries: [],
    };

    this.startCountdown('ready');
  }

  private startCountdown(fromState: 'ready' | 'paused'): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    this.phase = fromState === 'ready' ? 'countdown' : 'resume_countdown';
    this.countdownValue = 3;
    this.notifySnapshot();

    this.countdownTimer = setInterval(() => {
      this.countdownValue -= 1;
      if (this.countdownValue <= 0) {
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }
        this.phase = 'playing';
        this.notifySnapshot();
      } else {
        this.notifySnapshot();
      }
    }, 900);
  }

  public update(dtSeconds: number): void {
    if (this.phase !== 'playing') return;

    // Clamp dt to avoid huge steps if tab was blurred/throttled
    const dt = Math.min(dtSeconds, 0.1);
    const dtMs = dt * 1000;
    this.gameTimeMs += dtMs;
    this.stats.elapsedPlayingMs += dtMs;

    // 1. Spawner logic
    if (this.director && this.config) {
      const activeCount = this.blocks.filter((b) => b.state === 'active').length;
      if (this.director.shouldSpawn(this.gameTimeMs, activeCount)) {
        const newBlock = this.director.createSpawnedBlock(
          this.gameTimeMs,
          this.config.pack.entries,
          this.blocks
        );
        if (newBlock) {
          this.blocks.push(newBlock);
        }
      }
    }

    // 2. Update active blocks positions & ground collision
    for (const block of this.blocks) {
      if (block.state !== 'active') continue;

      block.y -= block.speedUnitsPerSecond * dt;

      // Ground collision check
      if (block.y <= GAME_CONSTANTS.GROUND_Y) {
        block.state = 'missed';
        this.stats.missed += 1;
        this.stats.missedWordEntries.push({
          term: block.displayText,
          meaningVi: block.meaningVi,
          ipa: block.ipa,
          missedAtMs: this.gameTimeMs,
        });

        this.emitEvent({
          type: 'BLOCK_MISSED',
          blockId: block.id,
          entryId: block.entryId,
          term: block.displayText,
          pos: [block.x, block.y, block.z],
        });

        // Handle life loss with grace window
        if (this.config?.mode !== 'zen') {
          const timeSinceLastDamage = this.gameTimeMs - this.lastDamageTimeMs;
          if (timeSinceLastDamage >= GAME_CONSTANTS.DAMAGE_GRACE_MS) {
            this.stats.lives -= 1;
            this.stats.currentCombo = 0;
            this.lastDamageTimeMs = this.gameTimeMs;
            this.emitEvent({
              type: 'LIFE_LOST',
              remainingLives: this.stats.lives,
            });

            if (this.stats.lives <= 0) {
              this.phase = 'game_over';
              this.emitEvent({ type: 'GAME_OVER' });
              this.notifySnapshot();
              return;
            }
          }
        }

        // Release target if this block was locked
        if (this.lockedBlockId === block.id) {
          this.lockedBlockId = null;
          this.emitEvent({ type: 'TARGET_RELEASED', blockId: block.id });
        }
      }
    }

    // Clean up finished blocks older than 2s to prevent array bloat
    this.blocks = this.blocks.filter((b) => b.state === 'active');

    this.notifySnapshot();
  }

  public receiveCharacter(rawKey: string): void {
    if (this.phase !== 'playing') return;

    const normalizedKey = normalizeTypedKey(rawKey);
    if (!normalizedKey || !isValidTypingChar(normalizedKey)) {
      return;
    }

    // If no target locked, attempt to lock candidate
    if (!this.lockedBlockId) {
      const best = findBestTargetForChar(this.blocks, normalizedKey);
      if (!best) {
        this.stats.incorrectKeys += 1;
        this.stats.currentCombo = 0;
        this.emitEvent({ type: 'KEY_WRONG', typedChar: normalizedKey });
        this.notifySnapshot();
        return;
      }
      this.lockedBlockId = best.id;
      this.emitEvent({ type: 'TARGET_LOCKED', blockId: best.id });
    }

    const lockedBlock = this.blocks.find((b) => b.id === this.lockedBlockId && b.state === 'active');
    if (!lockedBlock) {
      this.lockedBlockId = null;
      return;
    }

    const expectedChar = lockedBlock.typingText[lockedBlock.typedIndex];
    if (normalizedKey === expectedChar) {
      // Correct keystroke!
      lockedBlock.typedIndex += 1;
      this.stats.correctKeys += 1;

      this.emitEvent({
        type: 'KEY_CORRECT',
        blockId: lockedBlock.id,
        charIndex: lockedBlock.typedIndex,
        char: expectedChar,
        blockPos: [lockedBlock.x, lockedBlock.y, lockedBlock.z],
      });

      this.emitEvent({
        type: 'SHOT_FIRED',
        blockId: lockedBlock.id,
        charIndex: lockedBlock.typedIndex,
        targetPos: [lockedBlock.x, lockedBlock.y, lockedBlock.z],
      });

      // Word completed check!
      if (lockedBlock.typedIndex >= lockedBlock.typingText.length) {
        lockedBlock.state = 'destroyed';
        this.stats.killed += 1;
        this.stats.currentCombo += 1;
        if (this.stats.currentCombo > this.stats.maxCombo) {
          this.stats.maxCombo = this.stats.currentCombo;
        }

        const points = calculatePointsForWord(lockedBlock.displayText, this.stats.currentCombo);
        this.stats.score += points;

        this.emitEvent({
          type: 'BLOCK_DESTROYED',
          blockId: lockedBlock.id,
          entryId: lockedBlock.entryId,
          term: lockedBlock.displayText,
          meaningVi: lockedBlock.meaningVi,
          points,
          pos: [lockedBlock.x, lockedBlock.y, lockedBlock.z],
        });

        if (this.stats.currentCombo > 0 && this.stats.currentCombo % 5 === 0) {
          this.emitEvent({
            type: 'COMBO_MILESTONE',
            combo: this.stats.currentCombo,
          });
        }

        // Check stage progression
        if (this.director) {
          const { stageChanged, newStage } = this.director.onWordKilled();
          if (stageChanged) {
            this.stats.level = newStage;
            this.emitEvent({ type: 'LEVEL_UP', level: newStage });
          }
        }

        this.lockedBlockId = null;
        this.emitEvent({ type: 'TARGET_RELEASED', blockId: lockedBlock.id });
      }
    } else {
      // Wrong keystroke!
      this.stats.incorrectKeys += 1;
      this.stats.currentCombo = 0;
      this.emitEvent({
        type: 'KEY_WRONG',
        expectedChar,
        typedChar: normalizedKey,
        blockId: lockedBlock.id,
      });
    }

    this.notifySnapshot();
  }

  public cycleTarget(): void {
    if (this.phase !== 'playing') return;
    const next = cycleTargetBlock(this.blocks, this.lockedBlockId);
    if (next && next.id !== this.lockedBlockId) {
      this.lockedBlockId = next.id;
      this.emitEvent({ type: 'TARGET_LOCKED', blockId: next.id });
      this.notifySnapshot();
    }
  }

  public selectTargetById(id: string): void {
    const target = this.blocks.find((b) => b.id === id && b.state === 'active');
    if (target) {
      this.lockedBlockId = target.id;
      this.emitEvent({ type: 'TARGET_LOCKED', blockId: target.id });
      this.notifySnapshot();
    }
  }

  public pause(): void {
    if (this.phase === 'playing') {
      this.phase = 'paused';
      this.notifySnapshot();
    }
  }

  public resume(): void {
    if (this.phase === 'paused') {
      this.startCountdown('paused');
    }
  }

  public restart(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.config) {
      this.start(this.config);
    }
  }

  public getSnapshot(): Readonly<GameSnapshot> {
    return {
      phase: this.phase,
      seed: this.config?.seed || 12345,
      mode: this.config?.mode || 'classic',
      difficulty: this.config?.difficulty || 'normal',
      packId: this.config?.pack.id || '',
      packTitle: this.config?.pack.title || '',
      blocks: [...this.blocks],
      lockedBlockId: this.lockedBlockId,
      stats: { ...this.stats },
      gameTimeMs: this.gameTimeMs,
      countdownValue: this.countdownValue,
    };
  }

  public subscribe(listener: (snapshot: GameSnapshot) => void): () => void {
    this.snapshotListeners.add(listener);
    listener(this.getSnapshot());
    return () => this.snapshotListeners.delete(listener);
  }

  public onEvent(listener: (event: GameEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private notifySnapshot(): void {
    const snap = this.getSnapshot();
    this.snapshotListeners.forEach((l) => l(snap));
  }

  private emitEvent(event: GameEvent): void {
    this.eventListeners.forEach((l) => l(event));
  }

  public dispose(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.snapshotListeners.clear();
    this.eventListeners.clear();
  }
}
