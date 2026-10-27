import React, { useState } from 'react';
import { useApp } from '../app/appStore';
import { PaperPanel } from '../components/PaperPanel';
import { StickerButton } from '../components/StickerButton';
import { ImportSummary, parseAndImportFile } from '../data/importExcel';
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WordSetEditorPage: React.FC = () => {
  const { navigateTo, setSelectedSetId } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
      setSummary(null);
      if (!customTitle) {
        setCustomTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Vui lòng chọn một file .xlsx hoặc .csv.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await parseAndImportFile(file, customTitle);
      setSummary(res);
      if (res.importedSetId) {
        setSelectedSetId(res.importedSetId);
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi nhập file. Vui lòng kiểm tra lại cấu trúc.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="notebook-grid-bg"
      style={{
        minHeight: '100vh',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '750px' }}>
        <div style={{ marginBottom: '20px' }}>
          <StickerButton onClick={() => navigateTo('library')} icon={<ArrowLeft size={18} />}>
            Quay Lại Thư Viện
          </StickerButton>
        </div>

        <PaperPanel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FileSpreadsheet size={28} color="#0288D1" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900 }}>
              Nhập Bộ Từ Vựng Từ File
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted-ink)', marginBottom: '24px' }}>
            Hỗ trợ file <strong>.xlsx, .xls, .csv</strong> (tối đa 5MB, 5.000 dòng). File cần có ít nhất 2 cột:
            <strong> English (Từ tiếng Anh)</strong> và <strong>Vietnamese (Nghĩa tiếng Việt)</strong>.
          </p>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                Tên Bộ Từ Vựng:
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ví dụ: 100 Từ Vựng Giao Tiếp Công Sở"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  border: 'var(--border-ink)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                Chọn File Excel hoặc CSV:
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--color-paper)',
                  border: '2px dashed var(--color-ink)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FFE8E8',
                  color: 'var(--color-danger)',
                  border: '1.5px solid var(--color-danger)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginTop: '10px' }}>
              <StickerButton
                variant="primary"
                size="lg"
                onClick={handleImport}
                disabled={loading || !file}
                icon={<Upload size={20} />}
                style={{ width: '100%' }}
              >
                {loading ? 'Đang Xử Lý...' : 'Bắt Đầu Nhập Bộ Từ'}
              </StickerButton>
            </div>
          </div>

          {/* Summary / Success result */}
          {summary && (
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#E8F5E9',
                border: '2px solid #2E7D32',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2E7D32', fontWeight: 800 }}>
                <CheckCircle2 size={22} />
                <span style={{ fontSize: '1.1rem' }}>Nhập bộ từ thành công!</span>
              </div>
              <ul style={{ marginTop: '10px', marginLeft: '20px', color: '#1B5E20', fontSize: '0.95rem' }}>
                <li>Tổng số dòng trong file: <strong>{summary.totalRows}</strong></li>
                <li>Số từ vựng hợp lệ đã lưu: <strong>{summary.validRows}</strong></li>
                {summary.duplicateRows > 0 && <li>Số từ trùng lặp đã bỏ qua: {summary.duplicateRows}</li>}
                {summary.skippedRows > 0 && <li>Số dòng thiếu thông tin: {summary.skippedRows}</li>}
              </ul>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <StickerButton
                  variant="primary"
                  onClick={() => navigateTo('prepare')}
                >
                  Luyện Tập Bộ Từ Này Ngay
                </StickerButton>
                <StickerButton onClick={() => navigateTo('library')}>
                  Về Thư Viện
                </StickerButton>
              </div>
            </div>
          )}
        </PaperPanel>
      </div>
    </div>
  );
};
