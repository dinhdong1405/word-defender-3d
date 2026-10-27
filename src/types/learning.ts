export type MemoryStage = 'new' | 'learning' | 'remembered' | 'due' | 'struggling';

export interface LearningRecord {
  profileId?: string;
  entryId: string;
  wordId?: string;
  stage: MemoryStage;
  independentRecallStreak: number;
  easeLevel: number;             // 0..5
  successfulRecalls: number;
  failedRecalls: number;
  lastReviewedAt?: string;
  nextDueAt?: string;
  separateCopyAccuracy?: number;
  separateListeningAccuracy?: number;
}

export interface Attempt {
  id: string;
  profileId?: string;
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
  occurredAt: string;
}
