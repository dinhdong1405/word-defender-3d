import React from 'react';
import { GameSnapshot } from '../types/game';
import { RotateCcw, Home, Volume2, Sparkles, Target, Zap, Clock } from 'lucide-react';
import { calculateAccuracy, calculateWPM } from '../core/scoring';
import { globalAudio } from '../services/audio-service';

interface GameOverSummaryProps {
  snapshot: GameSnapshot;
  onRestart: () => void;
  onPlayMissedWords?: () => void;
  onExit: () => void;
}

export const GameOverSummary: React.FC<GameOverSummaryProps> = ({
  snapshot,
  onRestart,
  onPlayMissedWords,
  onExit,
}) => {
  const { stats, packTitle } = snapshot;
  const accuracy = calculateAccuracy(stats.correctKeys, stats.incorrectKeys);
  const wpm = calculateWPM(stats.correctKeys, stats.elapsedPlayingMs);
  const durationSec = Math.round(stats.elapsedPlayingMs / 1000);
  const durationMin = Math.floor(durationSec / 60);
  const durationRemainderSec = durationSec % 60;

  // Filter unique missed words
  const uniqueMissed = Array.from(
    new Map(stats.missedWordEntries.map((w) => [w.term.toLowerCase(), w])).values()
  );

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, rgba(16, 30, 56, 0.94) 0%, rgba(7, 19, 38, 0.98) 100%)',
      zIndex: 60,
      padding: '24px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            KẾT THÚC VÁN ĐẤU • {packTitle}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 900,
            color: stats.lives > 0 ? 'var(--green-success)' : 'var(--red-danger)',
            letterSpacing: '0.04em',
            lineHeight: 1.1,
          }}>
            {stats.lives > 0 ? 'HOÀN THÀNH VÁN ĐẤU' : 'PHÒNG TUYẾN THẤT THỦ'}
          </h2>
        </div>

        {/* Big Score Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(51, 230, 221, 0.1) 0%, rgba(245, 213, 108, 0.1) 100%)',
          border: '1px solid var(--panel-border)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
            TỔNG ĐIỂM
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.4rem',
            fontWeight: 900,
            color: 'var(--gold-projectile)',
            textShadow: '0 0 20px var(--gold-glow)',
            lineHeight: 1.1,
            margin: '4px 0',
          }}>
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
        }}>
          {/* Words Destroyed */}
          <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--cyan-primary)', marginBottom: '4px' }}>
              <Target size={15} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>TIÊU DIỆT</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
              {stats.killed}
            </div>
          </div>

          {/* Accuracy */}
          <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--green-success)', marginBottom: '4px' }}>
              <Zap size={15} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>CHÍNH XÁC</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
              {accuracy}%
            </div>
          </div>

          {/* WPM */}
          <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--cyan-primary)', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>TỐC ĐỘ WPM</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--cyan-primary)' }}>
              {wpm}
            </div>
          </div>

          {/* Max Combo */}
          <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--gold-projectile)', marginBottom: '4px' }}>
              <Sparkles size={15} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>MAX COMBO</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
              x{stats.maxCombo}
            </div>
          </div>

          {/* Duration */}
          <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <Clock size={15} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>THỜI GIAN</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
              {durationMin}:{String(durationRemainderSec).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Review Missed Words Section */}
        <div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '10px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>Từ Cần Ôn Tập ({uniqueMissed.length})</span>
            {uniqueMissed.length > 0 && onPlayMissedWords && (
              <button
                onClick={onPlayMissedWords}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--gold-projectile)', color: 'var(--gold-projectile)' }}
              >
                Chỉ chơi các từ này
              </button>
            )}
          </div>

          {uniqueMissed.length === 0 ? (
            <div style={{
              padding: '18px',
              textAlign: 'center',
              background: 'rgba(56, 227, 165, 0.08)',
              border: '1px solid rgba(56, 227, 165, 0.2)',
              borderRadius: '10px',
              color: 'var(--green-success)',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}>
              🎉 Xuất sắc! Bạn không để lọt bất kỳ từ vựng nào trong ván đấu này.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px',
              maxHeight: '160px',
              overflowY: 'auto',
              padding: '4px',
            }}>
              {uniqueMissed.map((word, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--cyan-primary)', fontSize: '0.95rem' }}>
                      {word.term}
                    </div>
                    {word.meaningVi && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {word.meaningVi}
                      </div>
                    )}
                    {word.ipa && (
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono)' }}>
                        {word.ipa}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => globalAudio.speakWord(word.term)}
                    className="btn-secondary"
                    style={{ padding: '6px', borderRadius: '8px' }}
                    title="Phát âm từ này"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button
            onClick={onRestart}
            className="btn-primary"
            style={{ flex: 1, padding: '14px', fontSize: '1.05rem' }}
          >
            <RotateCcw size={18} />
            <span>Chơi Lại Trận Này</span>
          </button>

          <button
            onClick={onExit}
            className="btn-secondary"
            style={{ padding: '14px 24px', fontSize: '1.05rem' }}
          >
            <Home size={18} />
            <span>Chọn Bộ Từ Khác</span>
          </button>
        </div>
      </div>
    </div>
  );
};
