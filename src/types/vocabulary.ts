export interface VocabularyEntry {
  id: string;
  setId: string;
  english: string;              // required; primary answer
  vietnamese: string;           // required; recall prompt
  acceptedAnswers: string[];    // English aliases
  partOfSpeech?: string;
  ipa?: string;
  exampleEn?: string;
  exampleVi?: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  audioUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VocabularySet {
  id: string;
  title: string;
  description?: string;
  owner: 'builtin' | 'local';
  entryIds: string[];
  createdAt: string;
  updatedAt: string;
}
