import React, { useState, useEffect } from 'react';
import { PackSummary, VocabularyPack } from '../types/vocabulary';
import { GameSessionRecord } from '../types/game';
import { packRepository } from '../services/pack-repository';
import {
  Play,
  Upload,
  BookOpen,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  Target,
  Keyboard,
  ArrowRight,
} from 'lucide-react';

interface GameHubProps {
  onSelectPack: (pack: VocabularyPack) => void;
  onOpenImportWizard: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  onSelectPack,
  onOpenImportWizard,
  onOpenLibrary,
  onOpenSettings,
}) => {
  const [officialPacks, setOfficialPacks] = useState<PackSummary[]>([]);
  const [myPacks, setMyPacks] = useState<PackSummary[]>([]);
  const [recentRecords, setRecentRecords] = useState<GameSessionRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [officials, personal, records] = await Promise.all([
        packRepository.listOfficial(),
        packRepository.listMyPacks(),
        packRepository.listSessionRecords(),
      ]);
      setOfficialPacks(officials);
      setMyPacks(personal);
      setRecentRecords(records);
    };
    fetchData();
  }, []);

  const handleQuickPlay = async () => {
    // Pick first official pack (Everyday English A1)
    if (officialPacks.length > 0) {
      const pack = await packRepository.getOfficialPack(officialPacks[0].id);
      if (pack) {
        onSelectPack(pack);
      }
    }
  };

  const handleCardPlay = async (packId: string) => {
    const pack = await packRepository.getPackById(packId);
    if (pack) {
      onSelectPack(pack);
    }
  };

  const bestScore = recentRecords.reduce((max, r) => Math.max(max, r.score), 0);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflowY: 'auto',
      background: 'radial-gradient(circle at 50% 15%, rgba(24, 44, 82, 0.6) 0%, rgba(7, 19, 38, 0.98) 75%)',
      padding: '32px 24px 64px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {/* Top Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #33e6dd 0%, #162a36 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--cyan-glow)',
            }}>
              <Shield size={22} color="#071326" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.04em' }}>
                <span style={{ color: 'var(--cyan-primary)' }}>DINGDONG</span> SPEAK
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>
                HỆ SINH THÁI HỌC TIẾNG ANH
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={onOpenLibrary} className="btn-secondary" style={{ padding: '9px 16px', fontSize: '0.9rem' }}>
              <BookOpen size={16} />
              <span>Thư Viện Bộ Từ</span>
            </button>

            <button onClick={onOpenSettings} className="btn-secondary" style={{ padding: '9px 14px' }} title="Cài đặt">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* HERO SECTION */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
          padding: '24px 0 12px',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(51, 230, 221, 0.1)',
            border: '1px solid rgba(51, 230, 221, 0.3)',
            fontSize: '0.85rem',
            color: 'var(--cyan-primary)',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}>
            <Sparkles size={16} />
            <span>GAME THỦ THÀNH TỪ VỰNG 3D THẾ HỆ MỚI</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 6vw, 4.4rem)',
            fontWeight: 900,
            letterSpacing: '0.03em',
            lineHeight: 1.05,
            background: 'linear-gradient(180deg, #F6F9FF 30%, #8BA1C2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
          }}>
            WORD DEFENDER 3D
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
            color: 'var(--cyan-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Gõ Đúng. Bắn Trúng. Giữ Vững Phòng Tuyến.
          </p>

          <p style={{
            maxWidth: '620px',
            color: 'var(--text-muted)',
            fontSize: '1rem',
            lineHeight: 1.6,
          }}>
            Khối từ vựng liên tục rơi từ bầu trời không gian. Hãy điều khiển tháp pháo năng lượng bằng cách gõ chính xác từng ký tự để kích hoạt đạn laser tiêu diệt mục tiêu trước khi chạm đất!
          </p>

          {/* Primary CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handleQuickPlay}
              className="btn-primary"
              style={{ padding: '16px 36px', fontSize: '1.15rem' }}
            >
              <Play size={20} fill="#071326" />
              <span>Chơi Ngay (Everyday A1)</span>
            </button>

            <button
              onClick={onOpenImportWizard}
              className="btn-secondary"
              style={{ padding: '16px 28px', fontSize: '1.05rem', borderColor: 'var(--cyan-primary)', color: 'var(--cyan-primary)' }}
            >
              <Upload size={18} />
              <span>Tải Lên File Excel (.xlsx / .csv)</span>
            </button>
          </div>

          {/* Personal Record Banner */}
          {bestScore > 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 20px',
              background: 'rgba(245, 213, 108, 0.08)',
              border: '1px solid rgba(245, 213, 108, 0.25)',
              borderRadius: '24px',
              marginTop: '8px',
            }}>
              <Trophy size={16} color="var(--gold-projectile)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kỷ lục cá nhân:</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--gold-projectile)' }}>
                {bestScore.toLocaleString()} ĐIỂM
              </span>
            </div>
          )}
        </div>

        {/* HOW TO PLAY (3 STEPS) */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
              HƯỚNG DẪN CÁCH CHƠI
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Step 1 */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(51, 230, 221, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Target size={22} color="var(--cyan-primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>1. Nhìn Từ & Khóa Mục Tiêu</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Các khối từ tiếng Anh liên tục rơi xuống. Nhấn chữ cái đầu tiên của từ gần đất nhất để khóa mục tiêu (hoặc bấm <strong>Tab</strong> để đổi mục tiêu).
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(245, 213, 108, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Keyboard size={22} color="var(--gold-projectile)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>2. Gõ Phím Bắn Pháo Thật</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Mỗi ký tự gõ đúng tương ứng một phát đạn laser từ tháp pháo 3D. Gõ hoàn chỉnh từ vựng sẽ kích hoạt nổ hủy diệt và nhận điểm thưởng combo!
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(252, 104, 104, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={22} color="var(--red-danger)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>3. Giữ Vững 3 Mạng Phòng Thủ</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Khối từ chạm mặt đất phòng tuyến sẽ gây sóng xung kích làm mất 1 tim. Hết 3 tim ván đấu sẽ kết thúc và hệ thống tổng hợp danh sách từ để bạn ôn tập.
              </p>
            </div>
          </div>
        </div>

        {/* OFFICIAL PACKS SHOWCASE */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
                BỘ TỪ VỰNG DỰNG SẴN CHÍNH THỨC
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
                Được biên soạn chuẩn ngữ âm IPA và nghĩa tiếng Việt
              </p>
            </div>

            <button onClick={onOpenLibrary} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
            {officialPacks.map((pack) => (
              <div key={pack.id} className="glass-panel glass-panel-interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="badge-level">{pack.level || 'A1'}</span>
                    <span className="badge-official">{pack.wordCount} Từ</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {pack.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                    {pack.description}
                  </p>
                </div>

                <button
                  onClick={() => handleCardPlay(pack.id)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                >
                  <Play size={16} fill="#071326" />
                  <span>Chọn & Bắt Đầu</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MY PACKS SECTION (IF ANY) */}
        {myPacks.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
                  BỘ TỪ CỦA BẠN ({myPacks.length})
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
                  Các bộ từ bạn đã tải lên từ Excel hoặc CSV
                </p>
              </div>

              <button onClick={onOpenImportWizard} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <span>Thêm bộ từ mới</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
              {myPacks.slice(0, 4).map((pack) => (
                <div key={pack.id} className="glass-panel glass-panel-interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="badge-level">{pack.level || 'A2'}</span>
                      <span className="badge-custom">{pack.wordCount} Từ</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                      {pack.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                      {pack.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCardPlay(pack.id)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                  >
                    <Play size={16} fill="#071326" />
                    <span>Chơi Bộ Từ Này</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
