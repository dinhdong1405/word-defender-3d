import readXlsxFile, { readSheetNames } from 'read-excel-file';
import { VocabularyEntry, CEFR } from '../types/vocabulary';

export interface RawSheetData {
  sheetName: string;
  rows: (string | number | boolean | null)[][];
}

export interface HeaderMapping {
  term: number | null;
  meaningVi: number | null;
  ipa: number | null;
  partOfSpeech: number | null;
  exampleEn: number | null;
  exampleVi: number | null;
  cefr: number | null;
  category: number | null;
  tags: number | null;
}

export interface ValidationIssue {
  rowNumber: number;
  field?: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ParseResult {
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  rawRows: (string | number | boolean | null)[][];
  headerMapping: HeaderMapping;
  entries: VocabularyEntry[];
  issues: ValidationIssue[];
  duplicateGroups: Array<{ normalizedTerm: string; rows: number[] }>;
}

export async function getXlsxSheetNames(file: File): Promise<string[]> {
  try {
    const names = await readSheetNames(file);
    return names && names.length > 0 ? names : ['Sheet1'];
  } catch {
    return ['Sheet1'];
  }
}

export async function parseXlsxFile(file: File, sheetName?: string): Promise<(string | number | boolean | null)[][]> {
  const options = sheetName ? { sheet: sheetName } : undefined;
  const rows = await readXlsxFile(file, options);
  return rows as (string | number | boolean | null)[][];
}

export function autoDetectHeaderMapping(headers: string[]): HeaderMapping {
  const mapping: HeaderMapping = {
    term: null,
    meaningVi: null,
    ipa: null,
    partOfSpeech: null,
    exampleEn: null,
    exampleVi: null,
    cefr: null,
    category: null,
    tags: null,
  };

  const normalize = (h: string) =>
    h
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[\s_-]+/g, '');

  headers.forEach((header, colIndex) => {
    const nh = normalize(header);

    // term
    if (mapping.term === null) {
      if (['word', 'english', 'vocabulary', 'term', 'tuvung', 'tutienganh', 'englishword'].includes(nh)) {
        mapping.term = colIndex;
        return;
      }
    }

    // meaningVi
    if (mapping.meaningVi === null) {
      if (['meaning', 'vietnamese', 'translation', 'nghia', 'nghiatiengviet', 'dichnghia', 'dich'].includes(nh)) {
        mapping.meaningVi = colIndex;
        return;
      }
    }

    // ipa
    if (mapping.ipa === null) {
      if (['ipa', 'phonetic', 'pronunciation', 'phienam'].includes(nh)) {
        mapping.ipa = colIndex;
        return;
      }
    }

    // partOfSpeech
    if (mapping.partOfSpeech === null) {
      if (['pos', 'partofspeech', 'loaitu', 'tuloai', 'type'].includes(nh)) {
        mapping.partOfSpeech = colIndex;
        return;
      }
    }

    // exampleEn
    if (mapping.exampleEn === null) {
      if (['example', 'exampleen', 'vidu', 'cauvidu'].includes(nh)) {
        mapping.exampleEn = colIndex;
        return;
      }
    }

    // exampleVi
    if (mapping.exampleVi === null) {
      if (['examplevi', 'dichvidu', 'nghiavidu'].includes(nh)) {
        mapping.exampleVi = colIndex;
        return;
      }
    }

    // cefr
    if (mapping.cefr === null) {
      if (['cefr', 'level', 'trinhdo', 'capdo'].includes(nh)) {
        mapping.cefr = colIndex;
        return;
      }
    }

    // category
    if (mapping.category === null) {
      if (['category', 'topic', 'chude'].includes(nh)) {
        mapping.category = colIndex;
        return;
      }
    }

    // tags
    if (mapping.tags === null) {
      if (['tags', 'tag', 'nhan'].includes(nh)) {
        mapping.tags = colIndex;
        return;
      }
    }
  });

  // Fallback: If 0 is not mapped, check if first column could be word
  if (mapping.term === null && headers.length > 0) {
    mapping.term = 0;
  }
  if (mapping.meaningVi === null && headers.length > 1 && mapping.term !== 1) {
    mapping.meaningVi = 1;
  }

  return mapping;
}

export function validateAndBuildEntries(
  rows: (string | number | boolean | null)[][],
  mapping: HeaderMapping,
  headerRowIndex: number = 0
): { entries: VocabularyEntry[]; issues: ValidationIssue[]; duplicates: Array<{ normalizedTerm: string; rows: number[] }> } {
  const entries: VocabularyEntry[] = [];
  const issues: ValidationIssue[] = [];
  const termMap = new Map<string, number[]>();

  const dataRows = rows.slice(headerRowIndex + 1);

  dataRows.forEach((row, idx) => {
    const rowNum = headerRowIndex + 2 + idx; // 1-based row number in sheet

    // Skip totally empty rows
    const isRowEmpty = row.every((c) => c === null || c === undefined || String(c).trim() === '');
    if (isRowEmpty) return;

    if (mapping.term === null) {
      issues.push({
        rowNumber: rowNum,
        severity: 'error',
        message: 'Chưa chọn cột từ tiếng Anh.',
      });
      return;
    }

    const rawTerm = row[mapping.term];
    if (rawTerm === null || rawTerm === undefined || String(rawTerm).trim() === '') {
      issues.push({
        rowNumber: rowNum,
        field: 'term',
        severity: 'error',
        message: `Dòng ${rowNum}: Từ tiếng Anh bị trống.`,
      });
      return;
    }

    const termStr = String(rawTerm).trim().normalize('NFC');
    if (termStr.length > 60) {
      issues.push({
        rowNumber: rowNum,
        field: 'term',
        severity: 'error',
        message: `Dòng ${rowNum}: "${termStr.slice(0, 20)}..." quá dài (> 60 ký tự).`,
      });
      return;
    }

    // Meaning
    const rawMeaning = mapping.meaningVi !== null ? row[mapping.meaningVi] : null;
    const meaningVi = rawMeaning ? String(rawMeaning).trim().normalize('NFC') : undefined;
    if (!meaningVi) {
      issues.push({
        rowNumber: rowNum,
        field: 'meaningVi',
        severity: 'warning',
        message: `Dòng ${rowNum}: Chưa có nghĩa tiếng Việt (vẫn chơi được chế độ Classic).`,
      });
    }

    // IPA
    const rawIpa = mapping.ipa !== null ? row[mapping.ipa] : null;
    const ipa = rawIpa ? String(rawIpa).trim() : undefined;

    // Part of speech
    const rawPos = mapping.partOfSpeech !== null ? row[mapping.partOfSpeech] : null;
    const partOfSpeech = rawPos ? String(rawPos).trim() : undefined;

    // Examples
    const rawExEn = mapping.exampleEn !== null ? row[mapping.exampleEn] : null;
    const exampleEn = rawExEn ? String(rawExEn).trim() : undefined;

    const rawExVi = mapping.exampleVi !== null ? row[mapping.exampleVi] : null;
    const exampleVi = rawExVi ? String(rawExVi).trim() : undefined;

    // CEFR
    const rawCefr = mapping.cefr !== null ? row[mapping.cefr] : null;
    let cefr: CEFR = 'unknown';
    if (rawCefr) {
      const cUpper = String(rawCefr).trim().toUpperCase();
      if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cUpper)) {
        cefr = cUpper as CEFR;
      }
    }

    // Category
    const rawCat = mapping.category !== null ? row[mapping.category] : null;
    const category = rawCat ? String(rawCat).trim() : undefined;

    // Tags
    const rawTags = mapping.tags !== null ? row[mapping.tags] : null;
    const tags = rawTags
      ? String(rawTags)
          .split(/[;,]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    // Track duplicate
    const normalizedKey = termStr.toLowerCase();
    const existing = termMap.get(normalizedKey) || [];
    existing.push(rowNum);
    termMap.set(normalizedKey, existing);

    entries.push({
      id: `imp-${rowNum}-${Math.random().toString(36).slice(2, 7)}`,
      term: termStr,
      meaningVi,
      ipa,
      partOfSpeech,
      exampleEn,
      exampleVi,
      cefr,
      category,
      tags,
      sourceRow: rowNum,
    });
  });

  const duplicates: Array<{ normalizedTerm: string; rows: number[] }> = [];
  termMap.forEach((rowsArr, key) => {
    if (rowsArr.length > 1) {
      duplicates.push({ normalizedTerm: key, rows: rowsArr });
      issues.push({
        rowNumber: rowsArr[0],
        field: 'term',
        severity: 'warning',
        message: `Từ "${key}" xuất hiện trùng lặp ở các dòng: ${rowsArr.join(', ')}.`,
      });
    }
  });

  return { entries, issues, duplicates };
}
