import { describe, it, expect, beforeEach } from 'vitest';
import { WordDefenderEngine } from '../core/engine';
import { VocabularyPack } from '../types/vocabulary';

const mockPack: VocabularyPack = {
  id: 'test-pack',
  title: 'Test Pack',
  sourceType: 'official',
  visibility: 'public',
  tags: ['test'],
  version: 1,
  wordCount: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  entries: [
    { id: '1', term: 'apple', meaningVi: 'quả táo' },
    { id: '2', term: 'apply', meaningVi: 'áp dụng' },
    { id: '3', term: 'banana', meaningVi: 'quả chuối' },
  ],
};

describe('WordDefenderEngine', () => {
  let engine: WordDefenderEngine;

  beforeEach(() => {
    engine = new WordDefenderEngine();
    engine.start({
      pack: mockPack,
      mode: 'classic',
      difficulty: 'normal',
    });
  });

  it('initializes with ready countdown and correct lives', () => {
    const snap = engine.getSnapshot();
    expect(snap.phase).toBe('countdown');
    expect(snap.stats.lives).toBe(3);
    expect(snap.stats.score).toBe(0);
  });

  it('accurately locks target on first matching character and registers hits', () => {
    // Manually force playing state for unit testing
    (engine as unknown as { phase: string }).phase = 'playing';

    // Inject active block
    (engine as unknown as { blocks: unknown[] }).blocks = [
      {
        id: 'blk-1',
        entryId: '1',
        displayText: 'apple',
        typingText: 'apple',
        typedIndex: 0,
        state: 'active',
        x: 0,
        y: 5.0,
        z: 0,
        speedUnitsPerSecond: 1.0,
        spawnedAtMs: 0,
      },
    ];

    let shotsFired = 0;
    let destroyed = false;

    engine.onEvent((ev) => {
      if (ev.type === 'SHOT_FIRED') shotsFired += 1;
      if (ev.type === 'BLOCK_DESTROYED') destroyed = true;
    });

    // Type 'a'
    engine.receiveCharacter('a');
    let snap = engine.getSnapshot();
    expect(snap.lockedBlockId).toBe('blk-1');
    expect(shotsFired).toBe(1);
    expect(snap.stats.correctKeys).toBe(1);

    // Type wrong key 'z' -> should decrease accuracy, not shoot, keep target
    engine.receiveCharacter('z');
    snap = engine.getSnapshot();
    expect(snap.lockedBlockId).toBe('blk-1');
    expect(shotsFired).toBe(1);
    expect(snap.stats.incorrectKeys).toBe(1);

    // Type remaining 'p', 'p', 'l', 'e'
    engine.receiveCharacter('p');
    engine.receiveCharacter('p');
    engine.receiveCharacter('l');
    engine.receiveCharacter('e');

    snap = engine.getSnapshot();
    expect(shotsFired).toBe(5);
    expect(destroyed).toBe(true);
    expect(snap.stats.killed).toBe(1);
    expect(snap.stats.score).toBeGreaterThan(0);
    expect(snap.lockedBlockId).toBeNull();
  });

  it('chooses the most urgent candidate when multiple words share a prefix', () => {
    (engine as unknown as { phase: string }).phase = 'playing';

    // Inject two words with 'app' prefix at different heights
    (engine as unknown as { blocks: unknown[] }).blocks = [
      {
        id: 'blk-high',
        entryId: '1',
        displayText: 'apple',
        typingText: 'apple',
        typedIndex: 0,
        state: 'active',
        x: 2.0,
        y: 5.0, // further from ground
        z: 0,
        speedUnitsPerSecond: 1.0,
        spawnedAtMs: 100,
      },
      {
        id: 'blk-low',
        entryId: '2',
        displayText: 'apply',
        typingText: 'apply',
        typedIndex: 0,
        state: 'active',
        x: -2.0,
        y: 1.0, // much closer to ground (more urgent)
        z: 0,
        speedUnitsPerSecond: 1.0,
        spawnedAtMs: 200,
      },
    ];

    engine.receiveCharacter('a');
    const snap = engine.getSnapshot();
    expect(snap.lockedBlockId).toBe('blk-low');
  });

  it('cycles target using cycleTarget()', () => {
    (engine as unknown as { phase: string }).phase = 'playing';

    (engine as unknown as { blocks: unknown[] }).blocks = [
      {
        id: 'blk-1',
        entryId: '1',
        displayText: 'apple',
        typingText: 'apple',
        typedIndex: 0,
        state: 'active',
        x: 0,
        y: 4.0,
        z: 0,
        speedUnitsPerSecond: 1.0,
        spawnedAtMs: 0,
      },
      {
        id: 'blk-2',
        entryId: '2',
        displayText: 'banana',
        typingText: 'banana',
        typedIndex: 0,
        state: 'active',
        x: 2.0,
        y: 3.5,
        z: 0,
        speedUnitsPerSecond: 1.0,
        spawnedAtMs: 0,
      },
    ];

    engine.receiveCharacter('a');
    expect(engine.getSnapshot().lockedBlockId).toBe('blk-1');

    engine.cycleTarget();
    expect(engine.getSnapshot().lockedBlockId).toBe('blk-2');
  });

  it('deducts life and eventually triggers game over on ground collision', () => {
    (engine as unknown as { phase: string }).phase = 'playing';

    (engine as unknown as { blocks: unknown[] }).blocks = [
      {
        id: 'blk-1',
        entryId: '1',
        displayText: 'apple',
        typingText: 'apple',
        typedIndex: 0,
        state: 'active',
        x: 0,
        y: -2.9, // below ground threshold (-2.8)
        z: 0,
        speedUnitsPerSecond: 1.0,
        spawnedAtMs: 0,
      },
    ];

    engine.update(0.016);
    let snap = engine.getSnapshot();
    expect(snap.stats.lives).toBe(2);
    expect(snap.stats.missed).toBe(1);

    // Next two collisions past grace window
    (engine as unknown as { lastDamageTimeMs: number }).lastDamageTimeMs = -9999;
    (engine as unknown as { blocks: unknown[] }).blocks = [
      {
        id: 'blk-2',
        entryId: '2',
        displayText: 'banana',
        typingText: 'banana',
        typedIndex: 0,
        state: 'active',
        x: 0,
        y: -3.0,
        z: 0,
        speedUnitsPerSecond: 1.0,
        spawnedAtMs: 0,
      },
    ];
    engine.update(0.016);
    snap = engine.getSnapshot();
    expect(snap.stats.lives).toBe(1);

    (engine as unknown as { lastDamageTimeMs: number }).lastDamageTimeMs = -9999;
    (engine as unknown as { blocks: unknown[] }).blocks = [
      {
        id: 'blk-3',
        entryId: '3',
        displayText: 'cat',
        typingText: 'cat',
        typedIndex: 0,
        state: 'active',
        x: 0,
        y: -3.0,
        z: 0,
        speedUnitsPerSecond: 1.0,
        spawnedAtMs: 0,
      },
    ];
    engine.update(0.016);
    snap = engine.getSnapshot();
    expect(snap.stats.lives).toBe(0);
    expect(snap.phase).toBe('game_over');
  });

  it('pauses simulation and resumes with countdown', () => {
    (engine as unknown as { phase: string }).phase = 'playing';
    engine.pause();
    expect(engine.getSnapshot().phase).toBe('paused');

    engine.resume();
    expect(engine.getSnapshot().phase).toBe('resume_countdown');
  });
});
