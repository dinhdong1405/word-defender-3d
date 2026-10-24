import React, { useState } from 'react';
import { VocabularyPack } from '../types/vocabulary';
import { GameMode, GameDifficulty } from '../types/game';
import { Play, ArrowLeft, Shield, Sparkles, BookOpen } from 'lucide-react';

interface PreGameSetupProps {
  pack: VocabularyPack;
  onStartGame: (mode: GameMode, difficulty: GameDifficulty) => void;
  onBack: () => void;
}

export const PreGameSetup: React.FC<PreGameSetupProps> = ({ pack, onStartGame, onBack }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('normal');

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at center, rgba(16, 30, 56, 0.85) 0%, rgba(7, 19, 38, 0.96) 100%)',
      zIndex: 20,
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '740px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge-level">{pack.level || 'A1'}</span>
              <span className="badge-official">{pack.entries.length} TỪ VỰNG</span>
              {pack.topic && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  • {pack.topic}
                </span>
              )}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}>
              {pack.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              {pack.description || 'Sẵn sàng thử thách gõ phím và bảo vệ pháo đài từ vựng!'}
            </p>
          </div>

          <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 14px' }}>
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '10px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            1. Chọn Chế Độ Chơi
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Classic Survival */}
            <div
              onClick={() => setSelectedMode('classic')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: '12px',
                border: selectedMode === 'classic' ? '2px solid var(--cyan-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: selectedMode === 'classic' ? 'rgba(51, 230, 221, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                boxShadow: selectedMode === 'classic' ? '0 0 20px var(--cyan-glow)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Shield size={18} color="var(--cyan-primary)" />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--cyan-primary)' }}>
                  Thủ Thành Sinh Tồn
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Endless Survival chuẩn. Bắt đầu với 3 mạng, độ khó tăng dần theo số từ bắn trúng.
              </p>
            </div>

            {/* Zen / Practice */}
            <div
              onClick={() => setSelectedMode('zen')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: '12px',
                border: selectedMode === 'zen' ? '2px solid var(--green-success)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: selectedMode === 'zen' ? 'rgba(56, 227, 165, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                boxShadow: selectedMode === 'zen' ? '0 0 20px rgba(56, 227, 165, 0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={18} color="var(--green-success)" />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--green-success)' }}>
                  Luyện Tập Zen
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Không mất mạng. Tốc độ thư giãn, luyện kỹ năng gõ và ghi nhớ từ vựng không áp lực.
              </p>
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '10px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            2. Độ Khó
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {(['easy', 'normal', 'hard'] as GameDifficulty[]).map((diff) => {
              const label = diff === 'easy' ? 'Dễ (Thư thái)' : diff === 'normal' ? 'Chuẩn (Cân bằng)' : 'Thử thách (Nhanh)';
              const isSelected = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className="btn-secondary"
                  style={{
                    padding: '12px',
                    borderColor: isSelected ? 'var(--cyan-primary)' : 'rgba(255,255,255,0.12)',
                    background: isSelected ? 'rgba(51, 230, 221, 0.12)' : 'rgba(255,255,255,0.04)',
                    color: isSelected ? 'var(--cyan-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vocabulary Preview (First 8 words) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <BookOpen size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Xem Trước Một Số Từ ({Math.min(8, pack.entries.length)} / {pack.entries.length})
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '8px',
            maxHeight: '130px',
            overflowY: 'auto',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '8px',
          }}>
            {pack.entries.slice(0, 8).map((entry) => (
              <div key={entry.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.85rem',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--cyan-primary)' }}>{entry.term}</div>
                {entry.meaningVi && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {entry.meaningVi}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '10px' }}>
          <button
            onClick={() => onStartGame(selectedMode, selectedDifficulty)}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1.15rem' }}
          >
            <Play size={20} fill="#071326" />
            <span>Bắt Đầu Phòng Thủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
