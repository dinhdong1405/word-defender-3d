import React, { useRef, useEffect } from 'react';
import { GameSnapshot } from '../types/game';
import { Heart, Pause, Settings, Sparkles, Target, ArrowLeft } from 'lucide-react';
import { calculateAccuracy, calculateWPM } from '../core/scoring';

interface GameHUDProps {
  snapshot: GameSnapshot;
  onPause: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
  onTypeChar: (char: string) => void;
  onCycleTarget: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  snapshot,
  onPause,
  onOpenSettings,
  onExit,
  onTypeChar,
  onCycleTarget,
}) => {
  const { stats, blocks, lockedBlockId, phase, countdownValue } = snapshot;
  const lockedBlock = blocks.find((b) => b.id === lockedBlockId && b.state === 'active');

  const accuracy = calculateAccuracy(stats.correctKeys, stats.incorrectKeys);
  const wpm = calculateWPM(stats.correctKeys, stats.elapsedPlayingMs);

  // Mobile hidden input ref to ensure virtual keyboard stays active on touch devices
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus mobile input on touch screens
    const handleTouch = () => {
      if (mobileInputRef.current) {
        mobileInputRef.current.focus();
      }
    };
    window.addEventListener('touchstart', handleTouch);
    return () => window.removeEventListener('touchstart', handleTouch);
  }, []);

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      const lastChar = val[val.length - 1];
      onTypeChar(lastChar);
      e.target.value = '';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 20px',
      zIndex: 10,
    }}>
      {/* Hidden Mobile Input Field to drive virtual keyboard */}
      <input
        ref={mobileInputRef}
        type="text"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
        onChange={handleMobileInput}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'auto',
          width: '1px',
          height: '1px',
          top: 0,
          left: 0,
        }}
        aria-label="Mobile typing input"
      />

      {/* TOP HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        {/* Left: Brand & Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
          <button
            onClick={onExit}
            className="btn-secondary"
            style={{ padding: '8px 14px', borderRadius: '8px' }}
            title="Quay về màn hình chính"
          >
            <ArrowLeft size={16} />
            <span style={{ fontSize: '0.85rem' }}>Thoát</span>
          </button>

          <div className="glass-panel" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--cyan-primary)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              DINGDONG
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>WORD DEFENDER 3D</span>
          </div>
        </div>

        {/* Center: Level & Words killed */}
        <div className="glass-panel" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '8px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CẤP ĐỘ</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--cyan-primary)',
            }}>
              {String(stats.level).padStart(2, '0')}
            </span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TIÊU DIỆT</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700 }}>
              {stats.killed}
            </span>
          </div>
        </div>

        {/* Right: Score, Hearts, Pause & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
          {/* Score display */}
          <div className="glass-panel" style={{ padding: '8px 18px', textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
              ĐIỂM SỐ
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--gold-projectile)',
              textShadow: '0 0 12px var(--gold-glow)',
              lineHeight: 1.1,
            }}>
              {stats.score.toLocaleString()}
            </div>
          </div>

          {/* Lives (3 hearts) */}
          <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 14px',
          }}>
            {[1, 2, 3].map((heartIndex) => {
              const isAlive = stats.lives >= heartIndex;
              return (
                <Heart
                  key={heartIndex}
                  size={20}
                  fill={isAlive ? 'var(--red-danger)' : 'transparent'}
                  color={isAlive ? 'var(--red-danger)' : 'rgba(255,255,255,0.2)'}
                  style={{
                    filter: isAlive ? 'drop-shadow(0 0 6px rgba(252, 104, 104, 0.6))' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              );
            })}
          </div>

          {/* Pause button */}
          <button
            onClick={onPause}
            className="btn-secondary"
            style={{ padding: '10px', borderRadius: '10px' }}
            title="Tạm dừng (Esc)"
          >
            <Pause size={18} />
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{ padding: '10px', borderRadius: '10px' }}
            title="Cài đặt"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* COUNTDOWN OVERLAY IF IN COUNTDOWN */}
      {(phase === 'countdown' || phase === 'resume_countdown') && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div className="animate-countdown" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '6.5rem',
            fontWeight: 900,
            color: 'var(--cyan-primary)',
            textShadow: '0 0 40px var(--cyan-glow)',
          }}>
            {countdownValue}
          </div>
          <div style={{
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            fontWeight: 600,
            marginTop: '8px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {phase === 'countdown' ? 'SẴN SÀNG PHÒNG THỦ' : 'TIẾP TỤC'}
          </div>
        </div>
      )}

      {/* BOTTOM DOCK */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}>
        {/* Active Target Banner */}
        <div className="glass-panel" style={{
          width: '100%',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: lockedBlock ? '1px solid var(--cyan-primary)' : '1px solid var(--panel-border)',
          boxShadow: lockedBlock ? '0 0 25px var(--cyan-glow)' : 'none',
        }}>
          {/* Target Word View */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: lockedBlock ? 'var(--cyan-primary)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
            }}>
              <Target size={18} />
              <span>MỤC TIÊU:</span>
            </div>

            {lockedBlock ? (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.45rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
              }}>
                {/* Typed letters */}
                <span style={{ color: 'var(--green-success)', textShadow: '0 0 10px rgba(56, 227, 165, 0.6)' }}>
                  {lockedBlock.displayText.slice(0, lockedBlock.typedIndex)}
                </span>
                {/* Next letter to type */}
                <span style={{
                  color: '#FFF2B4',
                  backgroundColor: 'rgba(245, 213, 108, 0.25)',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  textShadow: '0 0 12px var(--gold-glow)',
                }}>
                  {lockedBlock.displayText[lockedBlock.typedIndex]}
                </span>
                {/* Remaining letters */}
                <span style={{ color: 'var(--text-muted)' }}>
                  {lockedBlock.displayText.slice(lockedBlock.typedIndex + 1)}
                </span>
                {lockedBlock.meaningVi && (
                  <span style={{
                    fontSize: '0.9rem',
                    color: 'var(--cyan-primary)',
                    marginLeft: '16px',
                    fontWeight: 500,
                    fontFamily: 'var(--font-body)',
                  }}>
                    ({lockedBlock.meaningVi})
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Gõ chữ cái đầu tiên của từ đang rơi để khóa mục tiêu...
              </span>
            )}
          </div>

          {/* Right stats in dock: Combo & Accuracy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Combo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color={stats.currentCombo > 0 ? 'var(--gold-projectile)' : 'var(--text-muted)'} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: stats.currentCombo > 0 ? 'var(--gold-projectile)' : 'var(--text-muted)',
              }}>
                COMBO x{stats.currentCombo}
              </span>
            </div>

            {/* Accuracy */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{accuracy}%</strong> CHÍNH XÁC
            </div>

            {/* WPM */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <strong style={{ color: 'var(--cyan-primary)' }}>{wpm}</strong> WPM
            </div>

            {/* Target cycle button (Tab) */}
            <button
              onClick={onCycleTarget}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', pointerEvents: 'auto' }}
              title="Nhấn Tab để đổi mục tiêu"
            >
              Đổi mục tiêu (Tab)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
