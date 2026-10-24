import React, { useState, useRef } from 'react';
import {
  getXlsxSheetNames,
  parseXlsxFile,
  autoDetectHeaderMapping,
  validateAndBuildEntries,
  HeaderMapping,
  ValidationIssue,
} from '../services/excel-parser';
import { parseCsvFile } from '../services/csv-parser';
import { downloadExcelTemplate, downloadCsvTemplate } from '../services/template-generator';
import { packRepository } from '../services/pack-repository';
import { VocabularyPack, VocabularyEntry, CEFR } from '../types/vocabulary';
import {
  Upload,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Trash2,
  Play,
  Save,
  X,
  Lock,
} from 'lucide-react';

interface ImportWizardProps {
  onClose: () => void;
  onPackCreatedAndPlay: (pack: VocabularyPack) => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ onClose, onPackCreatedAndPlay }) => {
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [rawRows, setRawRows] = useState<(string | number | boolean | null)[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<HeaderMapping>({
    term: null,
    meaningVi: null,
    ipa: null,
    partOfSpeech: null,
    exampleEn: null,
    exampleVi: null,
    cefr: null,
    category: null,
    tags: null,
  });

  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [duplicates, setDuplicates] = useState<Array<{ normalizedTerm: string; rows: number[] }>>([]);

  // Pack metadata form
  const [packTitle, setPackTitle] = useState<string>('');
  const [packDesc, setPackDesc] = useState<string>('');
  const [packTopic, setPackTopic] = useState<string>('');
  const [packLevel, setPackLevel] = useState<CEFR>('A2');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 1: Handle File Upload
  const handleFileSelect = async (selectedFile: File) => {
    setErrorMsg(null);
    const fileName = selectedFile.name.toLowerCase();

    if (fileName.endsWith('.xls')) {
      setErrorMsg('Định dạng .xls cũ không được hỗ trợ. Vui lòng chuyển đổi sang .xlsx hoặc .csv.');
      return;
    }

    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.csv')) {
      setErrorMsg('Vui lòng chọn file định dạng .xlsx hoặc .csv.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('Dung lượng file vượt quá giới hạn 5MB.');
      return;
    }

    setIsLoading(true);
    setFile(selectedFile);
    setPackTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));

    try {
      if (fileName.endsWith('.xlsx')) {
        const sheets = await getXlsxSheetNames(selectedFile);
        setSheetNames(sheets);
        const firstSheet = sheets[0] || 'Sheet1';
        setSelectedSheet(firstSheet);
        const rows = await parseXlsxFile(selectedFile, firstSheet);
        setRawRows(rows);
        if (rows.length > 0) {
          const detectedHeaders = rows[0].map((c) => String(c || '').trim());
          setHeaders(detectedHeaders);
          const detectedMapping = autoDetectHeaderMapping(detectedHeaders);
          setMapping(detectedMapping);
        }
        setStep(2);
      } else {
        // CSV
        const rows = await parseCsvFile(selectedFile);
        setRawRows(rows);
        setSheetNames(['CSV']);
        setSelectedSheet('CSV');
        if (rows.length > 0) {
          const detectedHeaders = rows[0].map((c) => String(c || '').trim());
          setHeaders(detectedHeaders);
          const detectedMapping = autoDetectHeaderMapping(detectedHeaders);
          setMapping(detectedMapping);
        }
        setStep(3); // CSV skips sheet selection
      }
    } catch (err: unknown) {
      setErrorMsg(`Không thể đọc file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch Sheet in Step 2
  const handleSheetChange = async (newSheet: string) => {
    if (!file) return;
    setIsLoading(true);
    setSelectedSheet(newSheet);
    try {
      const rows = await parseXlsxFile(file, newSheet);
      setRawRows(rows);
      if (rows.length > 0) {
        const detectedHeaders = rows[0].map((c) => String(c || '').trim());
        setHeaders(detectedHeaders);
        const detectedMapping = autoDetectHeaderMapping(detectedHeaders);
        setMapping(detectedMapping);
      }
    } catch (err: unknown) {
      setErrorMsg(`Lỗi đổi sheet: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Run validation when moving to Step 4
  const handleProceedToValidation = () => {
    if (mapping.term === null) {
      setErrorMsg('Vui lòng chọn cột chứa từ tiếng Anh (bắt buộc).');
      return;
    }
    setErrorMsg(null);
    const result = validateAndBuildEntries(rawRows, mapping, 0);
    setEntries(result.entries);
    setIssues(result.issues);
    setDuplicates(result.duplicates);
    setStep(4);
  };

  // Edit entry in Step 4
  const handleUpdateEntry = (index: number, field: keyof VocabularyEntry, value: string) => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Delete entry in Step 4
  const handleDeleteEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove duplicates automatically
  const handleResolveDuplicates = () => {
    const seen = new Set<string>();
    const deduplicated = entries.filter((e) => {
      const key = e.term.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setEntries(deduplicated);
    setDuplicates([]);
  };

  // Final Save & Play
  const handleSavePack = async (playImmediately: boolean) => {
    if (!packTitle.trim()) {
      setErrorMsg('Vui lòng nhập tên cho bộ từ.');
      return;
    }

    if (entries.length < 2) {
      setErrorMsg('Bộ từ cần ít nhất 2 từ vựng hợp lệ để chơi.');
      return;
    }

    setIsLoading(true);
    const newPack: VocabularyPack = {
      id: `imported-${Date.now()}`,
      title: packTitle.trim(),
      description: packDesc.trim() || `Tải lên từ file ${file?.name || 'Excel'}`,
      sourceType: 'imported',
      visibility: 'private',
      level: packLevel,
      topic: packTopic.trim() || 'Tự nhập',
      tags: ['imported', 'excel', packLevel.toLowerCase()],
      version: 1,
      wordCount: entries.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnailTheme: 'amber',
      entries,
    };

    try {
      await packRepository.saveMyPack(newPack);
      if (playImmediately) {
        onPackCreatedAndPlay(newPack);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(`Lỗi lưu bộ từ: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(7, 19, 38, 0.94)',
      backdropFilter: 'blur(16px)',
      zIndex: 70,
      padding: '24px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '94vh',
        overflowY: 'auto',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge-official">BƯỚC {step} / 5</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {step === 1 && 'Tải file lên'}
                {step === 2 && 'Chọn Sheet & Dữ liệu'}
                {step === 3 && 'Khớp Cột (Header Mapping)'}
                {step === 4 && 'Kiểm Tra & Chỉnh Sửa'}
                {step === 5 && 'Đặt Tên & Hoàn Tất'}
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}>
              Nhập Bộ Từ Từ Excel / CSV
            </h2>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(252, 104, 104, 0.15)',
            border: '1px solid var(--red-danger)',
            borderRadius: '8px',
            color: 'var(--red-danger)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <XCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              style={{
                border: '2px dashed var(--cyan-primary)',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(51, 230, 221, 0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <Upload size={48} color="var(--cyan-primary)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                Kéo thả file .xlsx hoặc .csv vào đây, hoặc nhấp để chọn
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                Hỗ trợ cả file đơn giản chỉ gồm 2 cột (Từ tiếng Anh và Nghĩa tiếng Việt). Tối đa 5MB, 5000 dòng.
              </p>
            </div>

            {/* Privacy note & template downloads */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Lock size={16} color="var(--green-success)" />
                <span>File được xử lý 100% trên thiết bị của bạn, bảo mật tuyệt đối.</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={downloadExcelTemplate} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Download size={14} />
                  <span>Tải Template Excel (.xlsx)</span>
                </button>
                <button onClick={downloadCsvTemplate} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Download size={14} />
                  <span>Tải Template CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT SHEET & PREVIEW */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>Chọn Sheet trong file Excel:</label>
              <select
                value={selectedSheet}
                onChange={(e) => handleSheetChange(e.target.value)}
                style={{
                  background: 'rgba(10, 22, 42, 0.9)',
                  border: '1px solid var(--panel-border)',
                  color: 'var(--text-primary)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                }}
              >
                {sheetNames.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ({rawRows.length} dòng được tìm thấy)
              </span>
            </div>

            {/* Peek first 6 rows */}
            <div style={{ overflowX: 'auto', maxHeight: '280px', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(51, 230, 221, 0.1)', borderBottom: '1px solid var(--panel-border)' }}>
                    {headers.map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--cyan-primary)' }}>
                        {h || `Cột ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawRows.slice(1, 7).map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '8px 14px', color: 'var(--text-primary)' }}>
                          {cell !== null && cell !== undefined ? String(cell) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ArrowLeft size={16} />
                <span>Chọn File Khác</span>
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                <span>Tiếp Tục Khớp Cột</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: COLUMN MAPPING */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Hệ thống đã tự động nhận diện các cột phù hợp. Bạn có thể kiểm tra và thay đổi nếu cần:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Term (English Word - Required) */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--cyan-primary)' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--cyan-primary)', marginBottom: '6px' }}>
                  Từ Tiếng Anh (Bắt buộc) *
                </label>
                <select
                  value={mapping.term !== null ? mapping.term : ''}
                  onChange={(e) => setMapping({ ...mapping, term: e.target.value === '' ? null : Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a162a', color: '#fff', border: '1px solid var(--panel-border)' }}
                >
                  <option value="">-- Chọn cột --</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h || `Cột ${i + 1}`}</option>
                  ))}
                </select>
              </div>

              {/* Meaning Vietnamese */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Nghĩa Tiếng Việt (Tùy chọn)
                </label>
                <select
                  value={mapping.meaningVi !== null ? mapping.meaningVi : ''}
                  onChange={(e) => setMapping({ ...mapping, meaningVi: e.target.value === '' ? null : Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a162a', color: '#fff', border: '1px solid var(--panel-border)' }}
                >
                  <option value="">-- Chọn cột --</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h || `Cột ${i + 1}`}</option>
                  ))}
                </select>
              </div>

              {/* IPA */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Phiên Âm IPA
                </label>
                <select
                  value={mapping.ipa !== null ? mapping.ipa : ''}
                  onChange={(e) => setMapping({ ...mapping, ipa: e.target.value === '' ? null : Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a162a', color: '#fff', border: '1px solid var(--panel-border)' }}
                >
                  <option value="">-- Không sử dụng --</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h || `Cột ${i + 1}`}</option>
                  ))}
                </select>
              </div>

              {/* Level / CEFR */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Trình Độ (CEFR)
                </label>
                <select
                  value={mapping.cefr !== null ? mapping.cefr : ''}
                  onChange={(e) => setMapping({ ...mapping, cefr: e.target.value === '' ? null : Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a162a', color: '#fff', border: '1px solid var(--panel-border)' }}
                >
                  <option value="">-- Không sử dụng --</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h || `Cột ${i + 1}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button onClick={() => setStep(file?.name.endsWith('.csv') ? 1 : 2)} className="btn-secondary">
                <ArrowLeft size={16} />
                <span>Quay Lại</span>
              </button>
              <button onClick={handleProceedToValidation} className="btn-primary">
                <span>Kiểm Tra Dữ Liệu</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: VALIDATION & EDIT */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge-official">{entries.length} Từ Hợp Lệ</span>
                {issues.filter((i) => i.severity === 'error').length > 0 && (
                  <span style={{ color: 'var(--red-danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {issues.filter((i) => i.severity === 'error').length} Lỗi Chặn
                  </span>
                )}
                {duplicates.length > 0 && (
                  <span style={{ color: 'var(--amber-warning)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {duplicates.length} Từ Trùng Lặp
                  </span>
                )}
              </div>

              {duplicates.length > 0 && (
                <button onClick={handleResolveDuplicates} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Xóa các từ trùng
                </button>
              )}
            </div>

            {/* Editable Entries Table */}
            <div style={{ overflowX: 'auto', maxHeight: '340px', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(51, 230, 221, 0.1)', borderBottom: '1px solid var(--panel-border)' }}>
                    <th style={{ padding: '8px 12px', width: '50px', textAlign: 'center' }}>STT</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Từ Tiếng Anh *</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Nghĩa Tiếng Việt</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', width: '120px' }}>Phiên Âm</th>
                    <th style={{ padding: '8px 12px', width: '60px', textAlign: 'center' }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <input
                          type="text"
                          value={entry.term}
                          onChange={(e) => handleUpdateEntry(index, 'term', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            color: 'var(--cyan-primary)',
                            padding: '4px 8px',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <input
                          type="text"
                          value={entry.meaningVi || ''}
                          onChange={(e) => handleUpdateEntry(index, 'meaningVi', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            padding: '4px 8px',
                          }}
                        />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <input
                          type="text"
                          value={entry.ipa || ''}
                          onChange={(e) => handleUpdateEntry(index, 'ipa', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                            padding: '4px 8px',
                            fontFamily: 'var(--font-mono)',
                          }}
                        />
                      </td>
                      <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteEntry(index)}
                          style={{ background: 'none', border: 'none', color: 'var(--red-danger)', cursor: 'pointer', padding: '4px' }}
                          title="Xóa dòng này"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button onClick={() => setStep(3)} className="btn-secondary">
                <ArrowLeft size={16} />
                <span>Quay Lại Khớp Cột</span>
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={entries.length < 2}
                className="btn-primary"
              >
                <span>Xác Nhận & Tạo Bộ Từ</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FINALIZE PACK */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                Tên Bộ Từ *
              </label>
              <input
                type="text"
                value={packTitle}
                onChange={(e) => setPackTitle(e.target.value)}
                placeholder="VD: 50 Từ Vựng Chuyên Ngành Y Tế"
                style={{
                  width: '100%',
                  background: 'rgba(10, 22, 42, 0.9)',
                  border: '1px solid var(--panel-border)',
                  color: 'var(--text-primary)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                Mô Tả Bộ Từ (Tùy chọn)
              </label>
              <textarea
                value={packDesc}
                onChange={(e) => setPackDesc(e.target.value)}
                placeholder="Mô tả ngắn gọn về nguồn gốc hoặc mục đích của danh sách từ..."
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(10, 22, 42, 0.9)',
                  border: '1px solid var(--panel-border)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Chủ Đề
                </label>
                <input
                  type="text"
                  value={packTopic}
                  onChange={(e) => setPackTopic(e.target.value)}
                  placeholder="VD: Du lịch, Công nghệ..."
                  style={{
                    width: '100%',
                    background: 'rgba(10, 22, 42, 0.9)',
                    border: '1px solid var(--panel-border)',
                    color: 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Trình Độ (CEFR)
                </label>
                <select
                  value={packLevel}
                  onChange={(e) => setPackLevel(e.target.value as CEFR)}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 22, 42, 0.9)',
                    border: '1px solid var(--panel-border)',
                    color: 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="A1">A1 - Sơ cấp</option>
                  <option value="A2">A2 - Cơ bản</option>
                  <option value="B1">B1 - Trung cấp</option>
                  <option value="B2">B2 - Trung cao</option>
                  <option value="C1">C1 - Cao cấp</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
              <button
                onClick={() => handleSavePack(true)}
                disabled={isLoading}
                className="btn-primary"
                style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}
              >
                <Play size={18} fill="#071326" />
                <span>Lưu & Chơi Ngay</span>
              </button>

              <button
                onClick={() => handleSavePack(false)}
                disabled={isLoading}
                className="btn-secondary"
                style={{ padding: '16px 24px', fontSize: '1rem' }}
              >
                <Save size={18} />
                <span>Chỉ Lưu Vào Thư Viện</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
