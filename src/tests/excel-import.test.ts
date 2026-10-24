import { describe, it, expect } from 'vitest';
import { autoDetectHeaderMapping, validateAndBuildEntries } from '../services/excel-parser';

describe('Excel & CSV Import Services', () => {
  it('correctly auto-maps Vietnamese and English column headers', () => {
    const headers = ['Từ tiếng Anh', 'Nghĩa tiếng Việt', 'Phiên âm', 'Trình độ'];
    const mapping = autoDetectHeaderMapping(headers);

    expect(mapping.term).toBe(0);
    expect(mapping.meaningVi).toBe(1);
    expect(mapping.ipa).toBe(2);
    expect(mapping.cefr).toBe(3);
  });

  it('correctly maps minimal 2-column format (word, meaning)', () => {
    const headers = ['English', 'Vietnamese'];
    const mapping = autoDetectHeaderMapping(headers);

    expect(mapping.term).toBe(0);
    expect(mapping.meaningVi).toBe(1);
  });

  it('validates rows, normalizes terms, and flags duplicate words', () => {
    const rows = [
      ['word', 'meaning_vi', 'ipa'],
      ['  Apple  ', 'Quả táo', '/ˈæp.əl/'],
      ['banana', 'Quả chuối', '/bəˈnɑː.nə/'],
      ['apple', 'Trái táo (trùng)', '/ˈæp.əl/'], // Duplicate
      ['', 'Không có từ', ''], // Missing term
    ];

    const mapping = {
      term: 0,
      meaningVi: 1,
      ipa: 2,
      partOfSpeech: null,
      exampleEn: null,
      exampleVi: null,
      cefr: null,
      category: null,
      tags: null,
    };

    const { entries, issues, duplicates } = validateAndBuildEntries(rows, mapping, 0);

    // 3 valid entries (apple, banana, apple duplicate)
    expect(entries.length).toBe(3);
    expect(entries[0].term).toBe('Apple');
    expect(entries[0].meaningVi).toBe('Quả táo');

    // 1 duplicate group for 'apple'
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].normalizedTerm).toBe('apple');
    expect(duplicates[0].rows).toEqual([2, 4]);

    // 1 error for missing term on row 5
    const errorIssue = issues.find((i) => i.severity === 'error');
    expect(errorIssue).toBeDefined();
    expect(errorIssue?.rowNumber).toBe(5);
  });
});
