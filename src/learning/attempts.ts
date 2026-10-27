import { Attempt } from '../types/learning';
import { db } from '../data/db';
import { updateLearningProgress } from './scheduler';
import { getActiveProfileId } from '../auth/authService';

export async function logAttempt(params: {
  runId: string;
  entryId: string;
  mode: 'copy' | 'recall' | 'listen';
  outcome: 'correct' | 'wrong' | 'timeout' | 'abandoned';
  typedAnswer: string;
  acceptedAnswer?: string;
  hadHint: boolean;
  wrongKeystrokes: number;
  timeToAnswerMs: number;
  slowSkillUsedOnEnemy?: boolean;
}): Promise<Attempt> {
  const attempt: Attempt = {
    id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    profileId: getActiveProfileId(),
    ...params,
    occurredAt: new Date().toISOString(),
  };

  await db.attempts.add(attempt);

  // Update spaced repetition memory record
  const isCorrect = params.outcome === 'correct';
  await updateLearningProgress(params.entryId, params.mode, isCorrect, params.hadHint);

  return attempt;
}
