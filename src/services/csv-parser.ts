import Papa from 'papaparse';

export function parseCsvFile(file: File): Promise<(string | null)[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: 'greedy',
      encoding: 'UTF-8',
      complete: (results) => {
        resolve(results.data);
      },
      error: (err) => {
        reject(new Error(`Lỗi đọc file CSV: ${err.message}`));
      },
    });
  });
}
