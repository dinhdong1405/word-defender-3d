import { describe, it, expect } from 'vitest';
import { calculateNextReview } from '../../learning/scheduler';
import { LearningRecord } from '../../types/learning';

describe('Spaced Repetition Scheduler', () => {
  const baseDate = new Date('2026-10-26T12:00:00Z');

  it('moves new word to learning due in 1 day on first independent recall', () => {
    const res = calculateNextReview(undefined, 'recall', true, false, baseDate);
    expect(res.stage).toBe('learning');
    expect(res.streak).toBe(1);

    const expectedDate = new Date('2026-10-27T12:00:00Z').toISOString();
    expect(res.nextDueAt).toBe(expectedDate);
  });

  it('moves word to remembered due in 3 days on second independent recall', () => {
    const prevRecord: LearningRecord = {
      entryId: 'e1',
      stage: 'learning',
      independentRecallStreak: 1,
      easeLevel: 2.5,
      successfulRecalls: 1,
      failedRecalls: 0,
    };

    const res = calculateNextReview(prevRecord, 'recall', true, false, baseDate);
    expect(res.stage).toBe('remembered');
    expect(res.streak).toBe(2);

    const expectedDate = new Date('2026-10-29T12:00:00Z').toISOString();
    expect(res.nextDueAt).toBe(expectedDate);
  });

  it('moves word to struggling due in 10 minutes when wrong or hint used', () => {
    const prevRecord: LearningRecord = {
      entryId: 'e1',
      stage: 'remembered',
      independentRecallStreak: 3,
      easeLevel: 2.5,
      successfulRecalls: 3,
      failedRecalls: 0,
    };

    // Failed recall
    const resWrong = calculateNextReview(prevRecord, 'recall', false, false, baseDate);
    expect(resWrong.stage).toBe('struggling');
    expect(resWrong.streak).toBe(0);

    const expectedDue = new Date('2026-10-26T12:10:00Z').toISOString();
    expect(resWrong.nextDueAt).toBe(expectedDue);

    // Had hint (even if correct answer was typed eventually)
    const resHint = calculateNextReview(prevRecord, 'recall', true, true, baseDate);
    expect(resHint.stage).toBe('struggling');
    expect(resHint.streak).toBe(0);
    expect(resHint.nextDueAt).toBe(expectedDue);
  });

  it('does NOT jump to remembered for Copy mode success', () => {
    const res = calculateNextReview(undefined, 'copy', true, false, baseDate);
    // Can move from new to learning, but NEVER directly to remembered
    expect(res.stage).not.toBe('remembered');
    expect(res.streak).toBe(0); // independent recall streak does not advance
  });

  it('does NOT jump to remembered for Listen mode success', () => {
    const res = calculateNextReview(undefined, 'listen', true, false, baseDate);
    expect(res.stage).not.toBe('remembered');
    expect(res.streak).toBe(0);
  });
});
