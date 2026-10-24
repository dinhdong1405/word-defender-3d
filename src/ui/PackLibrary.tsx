import React, { useState, useEffect } from 'react';
import { PackSummary, VocabularyPack } from '../types/vocabulary';
import { packRepository } from '../services/pack-repository';
import {
  Play,
  Copy,
  Trash2,
  Download,
  Search,
  Plus,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface PackLibraryProps {
  onSelectPackToPlay: (pack: VocabularyPack) => void;
  onOpenImportWizard: () => void;
  onBack: () => void;
}

export const PackLibrary: React.FC<PackLibraryProps> = ({
  onSelectPackToPlay,
  onOpenImportWizard,
  onBack,
}) => {
  const [officialPacks, setOfficialPacks] = useState<PackSummary[]>([]);
  const [myPacks, setMyPacks] = useState<PackSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'official' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadPacks = async () => {
    const [officials, personal] = await Promise.all([
      packRepository.listOfficial(),
      packRepository.listMyPacks(),
    ]);
    setOfficialPacks(officials);
    setMyPacks(personal);
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const handlePlayPack = async (packId: string) => {
    const pack = await packRepository.getPackById(packId);
    if (pack) {
      onSelectPackToPlay(pack);
    }
  };

  const handleDuplicate = async (packId: string) => {
    await packRepository.duplicateOfficialToMyPacks(packId);
    await loadPacks();
  };

  const handleDelete = async (packId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ từ này khỏi thư viện cá nhân?')) {
      await packRepository.deleteMyPack(packId);
      await loadPacks();
    }
  };

  const handleExportCsv = async (packId: string) => {
    const pack = await packRepository.getPackById(packId);
    if (!pack) return;

    const headers = ['word', 'meaning_vi', 'ipa', 'part_of_speech', 'level', 'category'];
    const rows = pack.entries.map((e) => [
      e.term,
      e.meaningVi || '',
      e.ipa || '',
      e.partOfSpeech || '',
      e.cefr || '',
      e.category || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        r.map((c) => (c.includes(',') ? `"${c.replace(/"/g, '""')}"` : c)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterPacks = (list: PackSummary[]) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.topic && p.topic.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  };

  const displayedOfficial = activeTab === 'my' ? [] : filterPacks(officialPacks);
  const displayedMy = activeTab === 'official' ? [] : filterPacks(myPacks);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at center, rgba(16, 30, 56, 0.9) 0%, rgba(7, 19, 38, 0.98) 100%)',
      zIndex: 30,
      padding: '28px 24px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 14px' }}>
            <ArrowLeft size={16} />
            <span>Quay Lại Hub</span>
          </button>

          <button onClick={onOpenImportWizard} className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.95rem' }}>
            <Plus size={16} />
            <span>Nhập File Excel / CSV Mới</span>
          </button>
        </div>

        {/* Title and Search */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Thư Viện Bộ Từ Vựng
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Khám phá các gói từ vựng chất lượng cao từ DingDongSpeak hoặc tự tải bộ từ của bạn.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(10, 22, 42, 0.8)', border: '1px solid var(--panel-border)', borderRadius: '10px', padding: '8px 14px', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề, tên từ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('all')}
            className="btn-secondary"
            style={{
              borderColor: activeTab === 'all' ? 'var(--cyan-primary)' : 'transparent',
              color: activeTab === 'all' ? 'var(--cyan-primary)' : 'var(--text-muted)',
              background: activeTab === 'all' ? 'rgba(51, 230, 221, 0.1)' : 'transparent',
            }}
          >
            Tất cả ({officialPacks.length + myPacks.length})
          </button>

          <button
            onClick={() => setActiveTab('official')}
            className="btn-secondary"
            style={{
              borderColor: activeTab === 'official' ? 'var(--green-success)' : 'transparent',
              color: activeTab === 'official' ? 'var(--green-success)' : 'var(--text-muted)',
              background: activeTab === 'official' ? 'rgba(56, 227, 165, 0.1)' : 'transparent',
            }}
          >
            Chính Thức ({officialPacks.length})
          </button>

          <button
            onClick={() => setActiveTab('my')}
            className="btn-secondary"
            style={{
              borderColor: activeTab === 'my' ? 'var(--gold-projectile)' : 'transparent',
              color: activeTab === 'my' ? 'var(--gold-projectile)' : 'var(--text-muted)',
              background: activeTab === 'my' ? 'rgba(245, 213, 108, 0.1)' : 'transparent',
            }}
          >
            Bộ Từ Của Tôi ({myPacks.length})
          </button>
        </div>

        {/* OFFICIAL PACKS SECTION */}
        {displayedOfficial.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={18} color="var(--cyan-primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                BỘ TỪ CHÍNH THỨC DINGDONGSPEAK
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {displayedOfficial.map((pack) => (
                <div key={pack.id} className="glass-panel glass-panel-interactive" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="badge-level">{pack.level || 'A1'}</span>
                      <span className="badge-official">{pack.wordCount} Từ</span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {pack.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                      {pack.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                    <button
                      onClick={() => handlePlayPack(pack.id)}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                    >
                      <Play size={16} fill="#071326" />
                      <span>Chơi Ngay</span>
                    </button>

                    <button
                      onClick={() => handleDuplicate(pack.id)}
                      className="btn-secondary"
                      style={{ padding: '10px' }}
                      title="Nhân bản để chỉnh sửa riêng"
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      onClick={() => handleExportCsv(pack.id)}
                      className="btn-secondary"
                      style={{ padding: '10px' }}
                      title="Xuất file CSV"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY PACKS SECTION */}
        {displayedMy.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <BookOpen size={18} color="var(--gold-projectile)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                BỘ TỪ TỰ TẢI LÊN & ĐÃ LƯU
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {displayedMy.map((pack) => (
                <div key={pack.id} className="glass-panel glass-panel-interactive" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="badge-level">{pack.level || 'A2'}</span>
                      <span className="badge-custom">{pack.wordCount} Từ</span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {pack.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                      {pack.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                    <button
                      onClick={() => handlePlayPack(pack.id)}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                    >
                      <Play size={16} fill="#071326" />
                      <span>Chơi Ngay</span>
                    </button>

                    <button
                      onClick={() => handleExportCsv(pack.id)}
                      className="btn-secondary"
                      style={{ padding: '10px' }}
                      title="Xuất file CSV"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(pack.id)}
                      className="btn-danger"
                      style={{ padding: '10px' }}
                      title="Xóa bộ từ này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'my' ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '1px dashed var(--panel-border)',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Bạn chưa có bộ từ cá nhân nào
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Tải lên file Excel (.xlsx) hoặc CSV để tạo màn chơi theo danh sách từ vựng riêng của bạn.
            </p>
            <button onClick={onOpenImportWizard} className="btn-primary">
              <Plus size={16} />
              <span>Tải Lên File Excel Đầu Tiên</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
