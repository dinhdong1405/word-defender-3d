import { RunSummary } from '../types/game';
import { db } from '../data/db';
import { getActiveProfileId } from '../auth/authService';

export function calculateRunCoins(s: RunSummary): number {
  const completed = Math.max(0, s.completedWords);
  if (completed === 0 && s.wavesCleared === 0) return 0;
  return (
    10 +
    Math.min(60, s.independentRecallCorrect * 4) +
    Math.min(40, completed * 2) +
    s.wavesCleared * 5 +
    (s.result === 'win' ? 25 : 0)
  );
}

export function calculateRunXP(s: RunSummary): number {
  return Math.max(0, s.completedWords * 10 + s.wavesCleared * 15 + (s.result === 'win' ? 50 : 0));
}

export async function awardRunRewards(summary: RunSummary): Promise<{ coinsEarned: number; xpEarned: number }> {
  const profileId = getActiveProfileId();
  const referenceId = profileId === 'guest_profile'
    ? `earn-run-${summary.id}`
    : `earn-run-${profileId}-${summary.id}`;
  const coins = calculateRunCoins(summary);
  const xp = calculateRunXP(summary);
  const now = new Date().toISOString();

  return db.transaction('rw', [db.wallets, db.ledger, db.profiles, db.runs], async () => {
    // This check belongs inside the write transaction. React Strict Mode may
    // start the result effect twice before either invocation has finished.
    const existingLedger = await db.ledger.where('referenceId').equals(referenceId).first();
    if (existingLedger) {
      const savedRun = await db.runs.get(summary.id);
      return {
        coinsEarned: existingLedger.amount,
        xpEarned: savedRun?.xpEarned ?? summary.xpEarned ?? 0,
      };
    }

    // 1. Update Wallet
    const wallet = await db.wallets.get(profileId);
    if (wallet) {
      wallet.balance += coins;
      wallet.totalEarned += coins;
      await db.wallets.put(wallet);
    }

    // 2. Add Ledger Entry
    await db.ledger.add({
      id: `ledger_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      profileId,
      kind: 'earn',
      amount: coins,
      referenceId,
      at: now,
    });

    // 3. Update User Profile XP / Level
    const profile = await db.profiles.get(profileId);
    if (profile) {
      profile.xp += xp;
      // Level formula: 100 XP per level
      profile.level = Math.floor(profile.xp / 100) + 1;
      await db.profiles.put(profile);
    }

    // 4. Update Run Summary
    summary.rewardedAt = now;
    summary.coinsEarned = coins;
    summary.xpEarned = xp;
    await db.runs.put({ ...summary, profileId });

    return { coinsEarned: coins, xpEarned: xp };
  });
}
