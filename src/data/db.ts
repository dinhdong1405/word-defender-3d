import Dexie, { type EntityTable } from 'dexie';
import { VocabularyEntry, VocabularySet } from '../types/vocabulary';
import { Inventory, LedgerEntry, Wallet } from '../types/economy';
import { Attempt, LearningRecord } from '../types/learning';
import { RunSummary } from '../types/game';
import { SEED_ENTRIES, SEED_WORD_SETS } from './seedWordSets';
import { DEFAULT_INVENTORY_SEED } from '../config/catalog';
import { GAME_BALANCE } from '../config/balance';

export interface UserProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  audioEnabled: boolean;
  volume: number;
  reduceMotion: boolean;
  fontSize: 'normal' | 'large';
  desktopReminderDismissed: boolean;
}

export class PonpiDatabase extends Dexie {
  profiles!: EntityTable<UserProfile, 'id'>;
  wordSets!: EntityTable<VocabularySet, 'id'>;
  words!: EntityTable<VocabularyEntry, 'id'>;
  learningRecords!: EntityTable<LearningRecord, 'entryId'>;
  attempts!: EntityTable<Attempt, 'id'>;
  runs!: EntityTable<RunSummary, 'id'>;
  wallets!: EntityTable<Wallet, 'profileId'>;
  inventories!: EntityTable<Inventory, 'profileId'>;
  ledger!: EntityTable<LedgerEntry, 'id'>;
  settings!: EntityTable<UserSettings, 'id'>;

  constructor() {
    super('PonpiWordBlasterDB');
    this.version(1).stores({
      profiles: 'id',
      wordSets: 'id, owner',
      words: 'id, setId, english',
      learningRecords: 'entryId, stage, nextDueAt',
      attempts: 'id, runId, entryId, occurredAt',
      runs: 'id, setId, result, startedAt',
      wallets: 'profileId',
      inventories: 'profileId',
      ledger: 'id, profileId, referenceId, at',
      settings: 'id',
    });
  }
}

export const db = new PonpiDatabase();

let initializationPromise: Promise<void> | null = null;

async function seedMissingData(): Promise<void> {
  await db.transaction('rw', [
    db.profiles,
    db.wallets,
    db.inventories,
    db.ledger,
    db.settings,
    db.wordSets,
    db.words,
  ], async () => {
    const profileId = 'guest_profile';
    const now = new Date().toISOString();

    if (!(await db.profiles.get(profileId))) {
      await db.profiles.add({
        id: profileId,
        name: 'Ponpi Pilot',
        level: 1,
        xp: 0,
        createdAt: now,
      });
    }

    const existingWallet = await db.wallets.get(profileId);
    if (!existingWallet) {
      await db.wallets.add({
        profileId,
        balance: GAME_BALANCE.initialCoinBalance,
        totalEarned: GAME_BALANCE.initialCoinBalance,
        totalSpent: 0,
      });
    } else if (existingWallet.balance < 99999) {
      existingWallet.balance = 99999;
      existingWallet.totalEarned = Math.max(existingWallet.totalEarned, 99999);
      await db.wallets.put(existingWallet);
    }

    const onboardingLedger = await db.ledger
      .where('referenceId')
      .equals('onboarding_welcome_bonus')
      .first();
    if (!onboardingLedger) {
      await db.ledger.add({
        id: 'ledger_onboarding_welcome_bonus',
        profileId,
        kind: 'onboarding',
        amount: GAME_BALANCE.initialCoinBalance,
        referenceId: 'onboarding_welcome_bonus',
        at: now,
      });
    }

    if (!(await db.inventories.get(profileId))) {
      await db.inventories.add({
        profileId,
        ...DEFAULT_INVENTORY_SEED,
      });
    }

    if (!(await db.settings.get('user_settings'))) {
      await db.settings.add({
        id: 'user_settings',
        audioEnabled: true,
        volume: 0.8,
        reduceMotion: false,
        fontSize: 'normal',
        desktopReminderDismissed: false,
      });
    }

    const existingSets = await db.wordSets.bulkGet(SEED_WORD_SETS.map((set) => set.id));
    const missingSets = SEED_WORD_SETS.filter((_, index) => !existingSets[index]);
    if (missingSets.length > 0) {
      await db.wordSets.bulkAdd(missingSets);
    }

    const existingWords = await db.words.bulkGet(SEED_ENTRIES.map((word) => word.id));
    const missingWords = SEED_ENTRIES.filter((_, index) => !existingWords[index]);
    if (missingWords.length > 0) {
      await db.words.bulkAdd(missingWords);
    }
  });
}

// Share one initialization between React Strict Mode effects and repair any
// missing seed records left by an interrupted first launch.
export function initializeDatabase(): Promise<void> {
  if (!initializationPromise) {
    const currentInitialization = seedMissingData();
    initializationPromise = currentInitialization;
    const releaseInitialization = () => {
      if (initializationPromise === currentInitialization) {
        initializationPromise = null;
      }
    };
    void currentInitialization.then(releaseInitialization, releaseInitialization);
  }

  return initializationPromise;
}
