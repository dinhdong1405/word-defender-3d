import writeXlsxFile from 'write-excel-file';

const SAMPLE_DATA = [
  ['apple', 'quả táo', '/ˈæp.əl/', 'noun', 'I eat an apple.', 'Tôi ăn một quả táo.', 'A1', 'Food', 'fruit;daily'],
  ['beautiful', 'xinh đẹp', '/ˈbjuː.tɪ.fəl/', 'adjective', 'This place is beautiful.', 'Nơi này rất đẹp.', 'A2', 'Description', 'adjective'],
  ['study', 'học', '/ˈstʌd.i/', 'verb', 'I study English.', 'Tôi học tiếng Anh.', 'A1', 'School', 'education'],
  ['journey', 'chuyến hành trình', '/ˈdʒɜː.ni/', 'noun', 'The journey was long.', 'Chuyến đi kéo dài.', 'B1', 'Travel', 'travel'],
  ['important', 'quan trọng', '/ɪmˈpɔː.tənt/', 'adjective', 'Practice is important.', 'Luyện tập rất quan trọng.', 'A2', 'General', 'daily'],
];

const HEADERS = [
  'word',
  'meaning_vi',
  'ipa',
  'part_of_speech',
  'example_en',
  'example_vi',
  'level',
  'category',
  'tags',
];

export async function downloadExcelTemplate(): Promise<void> {
  const data = [
    HEADERS.map((h) => ({
      value: h,
      fontWeight: 'bold' as const,
      backgroundColor: '#33E6DD',
      color: '#071326',
    })),
    ...SAMPLE_DATA.map((row) =>
      row.map((val) => ({
        value: val,
        type: String,
      }))
    ),
  ];

  await writeXlsxFile(data, {
    fileName: 'word_defender_template.xlsx',
  });
}

export function downloadCsvTemplate(): void {
  const csvRows = [
    HEADERS.join(','),
    ...SAMPLE_DATA.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    ),
  ];

  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'word_defender_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
