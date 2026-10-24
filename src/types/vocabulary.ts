export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'unknown';

export interface VocabularyEntry {
  id: string;                  // Stable unique ID
  term: string;                // English source, e.g. "apple" or "take part in"
  meaningVi?: string;          // Vietnamese translation, e.g. "quả táo"
  ipa?: string;                // Phonetic notation, e.g. "/ˈæp.əl/"
  partOfSpeech?: string;       // noun, verb, adjective, phrase, etc.
  exampleEn?: string;          // English example sentence
  exampleVi?: string;          // Vietnamese example sentence
  synonyms?: string[];         // Synonyms list
  acceptedAnswers?: string[];  // For semantic/meaning modes
  category?: string;           // E.g. "Food", "School"
  cefr?: CEFR;                 // CEFR level
  tags?: string[];
  notes?: string;
  sourceRow?: number;          // Excel row number for diagnostics
  disabledModes?: Array<'classic' | 'meaning' | 'listening'>;
}

export interface VocabularyPack {
  id: string;
  title: string;
  description?: string;
  sourceType: 'official' | 'imported' | 'manual';
  ownerId?: string;
  visibility: 'public' | 'private';
  level?: CEFR;
  topic?: string;
  tags: string[];
  version: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  entries: VocabularyEntry[];
  thumbnailTheme?: string;
}

export interface PackSummary {
  id: string;
  title: string;
  description?: string;
  sourceType: 'official' | 'imported' | 'manual';
  level?: CEFR;
  topic?: string;
  tags: string[];
  version: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  thumbnailTheme?: string;
}
