import { describe, it, expect, beforeEach } from 'vitest';
import { calculateRunCoins, awardRunRewards } from '../../economy/rewards';
import { buyStoreItem } from '../../economy/inventory';
import { db } from '../../data/db';
import { RunSummary } from '../../types/game';

describe('Economy and Rewards', () => {
  beforeEach(async () => {
    await db.wallets.clear();
    await db.inventories.clear();
    await db.ledger.clear();
    await db.runs.clear();
    await db.profiles.clear();

    const profileId = 'guest_profile';
    await db.profiles.add({ id: profileId, name: 'Pilot', level: 1, xp: 0, createdAt: new Date().toISOString() });
    await db.wallets.add({ profileId, balance: 250, totalEarned: 250, totalSpent: 0 });
    await db.inventories.add({
      profileId,
      ownedItemIds: ['style_classic', 'skill_slow_shot'],
      equippedHatId: null,
      equippedShirtId: null,
      equippedStyleId: 'style_classic',
      equippedSkillIds: ['skill_slow_shot'],
    });
  });

  it('calculates run coins accurately per spec formula', () => {
    const summary: RunSummary = {
      id: 'r1',
      setId: 's1',
      mode: 'recall',
      difficulty: 'normal',
      result: 'win',
      completedWords: 15,
      independentRecallCorrect: 12,
      wavesCleared: 3,
      totalScore: 2500,
      attemptedEntryIds: [],
      startedAt: '',
      endedAt: '',
      coinsEarned: 0,
      xpEarned: 0,
      accuracy: 95,
      wrongKeystrokes: 1,
      hintsUsed: 0,
    };

    // Expected:
    // 10 base
    // + min(60, 12 * 4) = 48
    // + min(40, 15 * 2) = 30
    // + 3 * 5 = 15
    // + 25 (win bonus) = 128
    const coins = calculateRunCoins(summary);
    expect(coins).toBe(128);
  });

  it('awards run rewards idempotently', async () => {
    const summary: RunSummary = {
      id: 'run_test_idempotent_1',
      setId: 's1',
      mode: 'recall',
      difficulty: 'normal',
      result: 'win',
      completedWords: 10,
      independentRecallCorrect: 8,
      wavesCleared: 3,
      totalScore: 1500,
      attemptedEntryIds: [],
      startedAt: '',
      endedAt: '',
      coinsEarned: 0,
      xpEarned: 0,
      accuracy: 90,
      wrongKeystrokes: 2,
      hintsUsed: 0,
    };

    // First award
    const res1 = await awardRunRewards(summary);
    expect(res1.coinsEarned).toBeGreaterThan(0);

    const walletAfter1 = await db.wallets.get('guest_profile');
    const balance1 = walletAfter1?.balance;

    // Second award with same run summary
    const res2 = await awardRunRewards(summary);
    expect(res2.coinsEarned).toBe(res1.coinsEarned);

    const walletAfter2 = await db.wallets.get('guest_profile');
    // Balance must NOT double!
    expect(walletAfter2?.balance).toBe(balance1);
  });

  it('awards a run only once when duplicate requests arrive concurrently', async () => {
    const summary: RunSummary = {
      id: 'run_test_concurrent_1',
      setId: 's1',
      mode: 'recall',
      difficulty: 'normal',
      result: 'win',
      completedWords: 10,
      independentRecallCorrect: 8,
      wavesCleared: 3,
      totalScore: 1500,
      attemptedEntryIds: [],
      startedAt: '',
      endedAt: '',
      coinsEarned: 0,
      xpEarned: 0,
      accuracy: 90,
      wrongKeystrokes: 2,
      hintsUsed: 0,
    };

    const expectedCoins = calculateRunCoins(summary);
    const [first, second] = await Promise.all([
      awardRunRewards(summary),
      awardRunRewards({ ...summary }),
    ]);

    expect(first.coinsEarned).toBe(expectedCoins);
    expect(second.coinsEarned).toBe(expectedCoins);
    expect((await db.wallets.get('guest_profile'))?.balance).toBe(250 + expectedCoins);
    expect(await db.ledger.where('referenceId').equals(`earn-run-${summary.id}`).count()).toBe(1);
  });

  it('allows purchase when sufficient coins and deducts atomically', async () => {
    // Buy Cotton Pink (style_pink: 120 coins) with initial 250 coins
    const res = await buyStoreItem('style_pink');
    expect(res.success).toBe(true);
    expect(res.newBalance).toBe(130); // 250 - 120

    const wallet = await db.wallets.get('guest_profile');
    expect(wallet?.balance).toBe(130);

    const inv = await db.inventories.get('guest_profile');
    expect(inv?.ownedItemIds).toContain('style_pink');
  });

  it('prevents purchase when insufficient coins', async () => {
    // Ninja Outfit (outfit_ninja: 220 coins)
    // First buy Cotton Pink (120 coins) -> balance becomes 130
    await buyStoreItem('style_pink');

    // Now try to buy Ninja Outfit (220 coins) with 130 coins balance
    await expect(buyStoreItem('outfit_ninja')).rejects.toThrow(/Không đủ xu/);

    const wallet = await db.wallets.get('guest_profile');
    expect(wallet?.balance).toBe(130); // unchanged
  });

  it('prevents purchasing an already owned item', async () => {
    // Buy Cotton Pink once
    await buyStoreItem('style_pink');

    // Try to buy again
    await expect(buyStoreItem('style_pink')).rejects.toThrow(/đã sở hữu/);
  });

  it('allows purchasing the new Ninja Outfit (outfit_ninja: 220 coins)', async () => {
    const res = await buyStoreItem('outfit_ninja');
    expect(res.success).toBe(true);
    expect(res.newBalance).toBe(30); // 250 - 220

    const inv = await db.inventories.get('guest_profile');
    expect(inv?.ownedItemIds).toContain('outfit_ninja');
  });

  it('allows purchasing and equipping the new Samurai Armor (outfit_samurai: 250 coins)', async () => {
    const res = await buyStoreItem('outfit_samurai');
    expect(res.success).toBe(true);
    expect(res.newBalance).toBe(0); // 250 - 250

    const inv = await db.inventories.get('guest_profile');
    expect(inv?.ownedItemIds).toContain('outfit_samurai');

    const { equipItem } = await import('../../economy/inventory');
    await equipItem('outfit', 'outfit_samurai');
    const invEquipped = await db.inventories.get('guest_profile');
    expect(invEquipped?.equippedOutfitId).toBe('outfit_samurai');
  });

  it('allows purchasing and equipping the new Blanket Ghost outfit (outfit_ghost: 240 coins)', async () => {
    const res = await buyStoreItem('outfit_ghost');
    expect(res.success).toBe(true);
    expect(res.newBalance).toBe(10); // 250 - 240

    const inv = await db.inventories.get('guest_profile');
    expect(inv?.ownedItemIds).toContain('outfit_ghost');

    const { equipItem } = await import('../../economy/inventory');
    await equipItem('outfit', 'outfit_ghost');
    const invEquipped = await db.inventories.get('guest_profile');
    expect(invEquipped?.equippedOutfitId).toBe('outfit_ghost');
  });
});

