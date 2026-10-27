import { VocabularyEntry } from '../types/vocabulary';
import { db } from '../data/db';
import { getActiveProfileId } from '../auth/authService';

export async function selectSessionWords(
  setId: string,
  targetCount: number = 15
): Promise<VocabularyEntry[]> {
  const allEntries = await db.words.where('setId').equals(setId).toArray();
  if (allEntries.length === 0) {
    return [];
  }

  const allRecords = await db.learningRecords.where('profileId').equals(getActiveProfileId()).toArray();
  const recordMap = new Map(allRecords.map((r) => [r.wordId ?? r.entryId, r]));

  const now = new Date().toISOString();

  const dueWords: VocabularyEntry[] = [];
  const strugglingWords: VocabularyEntry[] = [];
  const newWords: VocabularyEntry[] = [];
  const otherWords: VocabularyEntry[] = [];

  for (const entry of allEntries) {
    const rec = recordMap.get(entry.id);
    if (!rec) {
      newWords.push(entry);
    } else if (rec.stage === 'struggling') {
      strugglingWords.push(entry);
    } else if (rec.nextDueAt && rec.nextDueAt <= now) {
      dueWords.push(entry);
    } else {
      otherWords.push(entry);
    }
  }

  // Shuffle helper
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const selected: VocabularyEntry[] = [];

  // Priority 1: Due words (up to half of targetCount)
  const maxDue = Math.min(Math.ceil(targetCount * 0.45), dueWords.length);
  selected.push(...shuffle(dueWords).slice(0, maxDue));

  // Priority 2: Struggling words (up to 25% of targetCount)
  const maxStruggling = Math.min(Math.ceil(targetCount * 0.25), strugglingWords.length);
  selected.push(...shuffle(strugglingWords).slice(0, maxStruggling));

  // Priority 3: New words
  const neededAfterPriority = targetCount - selected.length;
  const maxNew = Math.min(neededAfterPriority, newWords.length);
  selected.push(...shuffle(newWords).slice(0, maxNew));

  // Priority 4: Fill from remaining other words
  if (selected.length < targetCount) {
    const remainingNeeded = targetCount - selected.length;
    const availableOthers = shuffle(otherWords.filter((e) => !selected.some((s) => s.id === e.id)));
    selected.push(...availableOthers.slice(0, remainingNeeded));
  }

  // If pool has fewer unique words than targetCount (e.g. only 5 words total in set),
  // cycle pool with cooldown to avoid immediate repeats until targetCount is reached
  if (selected.length < targetCount && allEntries.length > 0) {
    const pool = shuffle(allEntries);
    let index = 0;
    while (selected.length < targetCount) {
      const candidate = pool[index % pool.length];
      const lastPicked = selected[selected.length - 1];
      if (pool.length > 1 && lastPicked?.id === candidate.id) {
        // Skip to next to avoid consecutive duplicate
        index++;
        continue;
      }
      selected.push(candidate);
      index++;
    }
  }

  return selected.slice(0, targetCount);
}
