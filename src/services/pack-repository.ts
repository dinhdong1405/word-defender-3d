import { VocabularyPack, PackSummary } from '../types/vocabulary';
import { GameSessionRecord } from '../types/game';

// Import official packs
import everydayA1 from '../data/official-packs/everyday-a1.json';
import foodDrinks from '../data/official-packs/food-and-drinks.json';
import schoolStudy from '../data/official-packs/school-study.json';
import travelTransport from '../data/official-packs/travel-transport.json';

const OFFICIAL_PACKS: VocabularyPack[] = [
  everydayA1 as unknown as VocabularyPack,
  foodDrinks as unknown as VocabularyPack,
  schoolStudy as unknown as VocabularyPack,
  travelTransport as unknown as VocabularyPack,
];

const DB_NAME = 'word_defender_db';
const DB_VERSION = 1;
const STORE_PACKS = 'my_packs';
const STORE_SESSIONS = 'sessions';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PACKS)) {
        db.createObjectStore(STORE_PACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class PackRepository {
  public async listOfficial(): Promise<PackSummary[]> {
    return OFFICIAL_PACKS.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      sourceType: p.sourceType,
      level: p.level,
      topic: p.topic,
      tags: p.tags,
      version: p.version,
      wordCount: p.entries.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      thumbnailTheme: p.thumbnailTheme,
    }));
  }

  public async getOfficialPack(id: string): Promise<VocabularyPack | null> {
    const found = OFFICIAL_PACKS.find((p) => p.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async listMyPacks(): Promise<PackSummary[]> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PACKS, 'readonly');
        const store = tx.objectStore(STORE_PACKS);
        const req = store.getAll();
        req.onsuccess = () => {
          const packs: VocabularyPack[] = req.result || [];
          resolve(
            packs.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              sourceType: 'imported',
              level: p.level,
              topic: p.topic,
              tags: p.tags || [],
              version: p.version || 1,
              wordCount: p.entries?.length || 0,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
              thumbnailTheme: p.thumbnailTheme || 'cyan',
            }))
          );
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  public async getMyPack(id: string): Promise<VocabularyPack | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PACKS, 'readonly');
        const store = tx.objectStore(STORE_PACKS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  public async getPackById(id: string): Promise<VocabularyPack | null> {
    const official = await this.getOfficialPack(id);
    if (official) return official;
    return this.getMyPack(id);
  }

  public async saveMyPack(pack: VocabularyPack): Promise<VocabularyPack> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PACKS, 'readwrite');
      const store = tx.objectStore(STORE_PACKS);
      const req = store.put(pack);
      req.onsuccess = () => resolve(pack);
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteMyPack(id: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PACKS, 'readwrite');
      const store = tx.objectStore(STORE_PACKS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async duplicateOfficialToMyPacks(officialId: string): Promise<VocabularyPack> {
    const official = await this.getOfficialPack(officialId);
    if (!official) throw new Error('Official pack not found');

    const newId = `my-pack-${Date.now()}`;
    const duplicated: VocabularyPack = {
      ...official,
      id: newId,
      title: `${official.title} (Bản sao)`,
      sourceType: 'manual',
      visibility: 'private',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entries: official.entries.map((e, idx) => ({ ...e, id: `${newId}-e${idx + 1}` })),
    };

    await this.saveMyPack(duplicated);
    return duplicated;
  }

  public async saveSessionRecord(record: GameSessionRecord): Promise<void> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_SESSIONS, 'readwrite');
      const store = tx.objectStore(STORE_SESSIONS);
      store.put(record);
    } catch (e) {
      console.warn('Failed to save session record:', e);
    }
  }

  public async listSessionRecords(): Promise<GameSessionRecord[]> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SESSIONS, 'readonly');
        const store = tx.objectStore(STORE_SESSIONS);
        const req = store.getAll();
        req.onsuccess = () => {
          const records: GameSessionRecord[] = req.result || [];
          records.sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
          resolve(records);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
}

export const packRepository = new PackRepository();
