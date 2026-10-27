import { describe, it, expect } from 'vitest';
import { generateCsvTemplate, parseAndImportFile } from '../../data/importExcel';
import { db } from '../../data/db';

describe('Vocabulary Import and Parsing', () => {
  it('generates a valid CSV template containing standard headers and sample words', () => {
    const csv = generateCsvTemplate();
    expect(csv).toContain('english');
    expect(csv).toContain('vietnamese');
    expect(csv).toContain('dũng cảm');
  });

  it('imports valid CSV with Vietnamese Unicode accents preserved', async () => {
    const csvContent = `english,vietnamese,partOfSpeech
brave,dũng cảm,adj
curiosity,sự tò mò,noun`;

    const file = new File([csvContent], 'test_words.csv', { type: 'text/csv' });
    const summary = await parseAndImportFile(file, 'Test Unicode Set');

    expect(summary.validRows).toBe(2);
    expect(summary.entries[0].english).toBe('brave');
    expect(summary.entries[0].vietnamese).toBe('dũng cảm');
    expect(summary.entries[1].vietnamese).toBe('sự tò mò');

    // Verify written to database
    const saved = await db.words.where('setId').equals(summary.importedSetId!).toArray();
    expect(saved.length).toBe(2);
    expect(saved[0].vietnamese).toBe('dũng cảm');
  });

  it('skips duplicate rows in the same file', async () => {
    const csvContent = `english,vietnamese
brave,dũng cảm
brave,dũng cảm
brave,dũng cảm`;

    const file = new File([csvContent], 'duplicates.csv', { type: 'text/csv' });
    const summary = await parseAndImportFile(file, 'Dedupe Set');

    expect(summary.validRows).toBe(1);
    expect(summary.duplicateRows).toBe(2);
  });

  it('rejects files with no valid vocabulary entries', async () => {
    const csvContent = `foo,bar
123,456`;

    const file = new File([csvContent], 'invalid.csv', { type: 'text/csv' });
    await expect(parseAndImportFile(file, 'Bad Set')).rejects.toThrow();
  });
});
