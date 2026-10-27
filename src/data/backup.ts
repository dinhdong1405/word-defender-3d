import { db } from './db';

export async function exportBackupData(): Promise<string> {
  const [profiles, wordSets, words, learningRecords, attempts, runs, wallets, inventories, ledger, settings] = await Promise.all([
    db.profiles.toArray(),
    db.wordSets.toArray(),
    db.words.toArray(),
    db.learningRecords.toArray(),
    db.attempts.toArray(),
    db.runs.toArray(),
    db.wallets.toArray(),
    db.inventories.toArray(),
    db.ledger.toArray(),
    db.settings.toArray(),
  ]);

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      profiles,
      wordSets,
      words,
      learningRecords,
      attempts,
      runs,
      wallets,
      inventories,
      ledger,
      settings,
    },
  };

  return JSON.stringify(backup, null, 2);
}

export async function importBackupData(jsonString: string): Promise<void> {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Dữ liệu sao lưu không đúng định dạng JSON.');
  }

  if (!parsed || !parsed.data || !parsed.version) {
    throw new Error('File sao lưu không hợp lệ hoặc thiếu cấu trúc phiên bản.');
  }

  const { data } = parsed;
  const tableNames = [
    'profiles',
    'wordSets',
    'words',
    'learningRecords',
    'attempts',
    'runs',
    'wallets',
    'inventories',
    'ledger',
    'settings',
  ] as const;

  if (parsed.version !== 1 || tableNames.some((tableName) => !Array.isArray(data[tableName]))) {
    throw new Error('File sao lưu không hợp lệ hoặc không đúng phiên bản được hỗ trợ.');
  }

  await db.transaction(
    'rw',
    [
      db.profiles,
      db.wordSets,
      db.words,
      db.learningRecords,
      db.attempts,
      db.runs,
      db.wallets,
      db.inventories,
      db.ledger,
      db.settings,
    ],
    async () => {
      await Promise.all([
        db.profiles.clear(),
        db.wordSets.clear(),
        db.words.clear(),
        db.learningRecords.clear(),
        db.attempts.clear(),
        db.runs.clear(),
        db.wallets.clear(),
        db.inventories.clear(),
        db.ledger.clear(),
        db.settings.clear(),
      ]);

      if (data.profiles.length) await db.profiles.bulkAdd(data.profiles);
      if (data.wordSets.length) await db.wordSets.bulkAdd(data.wordSets);
      if (data.words.length) await db.words.bulkAdd(data.words);
      if (data.learningRecords.length) await db.learningRecords.bulkAdd(data.learningRecords);
      if (data.attempts.length) await db.attempts.bulkAdd(data.attempts);
      if (data.runs.length) await db.runs.bulkAdd(data.runs);
      if (data.wallets.length) await db.wallets.bulkAdd(data.wallets);
      if (data.inventories.length) await db.inventories.bulkAdd(data.inventories);
      if (data.ledger.length) await db.ledger.bulkAdd(data.ledger);
      if (data.settings.length) await db.settings.bulkAdd(data.settings);
    }
  );
}
