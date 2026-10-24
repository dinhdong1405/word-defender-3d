import React from 'react';
import { Play, RotateCcw, Home, Settings, Info } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onExit,
}) => {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(7, 19, 38, 0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 50,
      padding: '24px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--cyan-primary)',
            letterSpacing: '0.06em',
          }}>
            TẠM DỪNG
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginTop: '6px',
          }}>
            <Info size={14} />
            <span>Game sẽ tự động dừng khi bạn chuyển tab.</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={onResume} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
            <Play size={18} fill="#071326" />
            <span>Tiếp Tục (Esc)</span>
          </button>

          <button onClick={onRestart} className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
            <RotateCcw size={16} />
            <span>Chơi Lại Trận Này</span>
          </button>

          <button onClick={onOpenSettings} className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
            <Settings size={16} />
            <span>Cài Đặt</span>
          </button>

          <button onClick={onExit} className="btn-danger" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
            <Home size={16} />
            <span>Thoát Ra Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
