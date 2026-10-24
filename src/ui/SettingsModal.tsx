import React from 'react';
import { PlayerGameSettings } from '../types/game';
import { Volume2, VolumeX, Monitor, Eye, Trash2, X, Speech } from 'lucide-react';
import { globalAudio } from '../services/audio-service';

interface SettingsModalProps {
  settings: PlayerGameSettings;
  onUpdateSettings: (newSettings: PlayerGameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleVolumeChange = (val: number) => {
    globalAudio.setVolume(val);
    onUpdateSettings({ ...settings, soundFxVolume: val });
  };

  const handlePronunciationToggle = (enabled: boolean) => {
    globalAudio.setSpeechEnabled(enabled);
    onUpdateSettings({ ...settings, pronunciationEnabled: enabled });
  };

  const handleResetData = () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ bộ từ cá nhân đã tải lên và kết quả chơi trong bộ nhớ trình duyệt. Bạn có chắc chắn muốn xóa?')) {
      if (typeof window !== 'undefined' && window.indexedDB) {
        indexedDB.deleteDatabase('word_defender_db');
      }
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(7, 19, 38, 0.92)',
      backdropFilter: 'blur(16px)',
      zIndex: 80,
      padding: '24px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--cyan-primary)',
          }}>
            CÀI ĐẶT TRÒ CHƠI
          </h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Audio Volume */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {settings.soundFxVolume > 0 ? <Volume2 size={18} color="var(--cyan-primary)" /> : <VolumeX size={18} color="var(--text-muted)" />}
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Âm Thanh Hiệu Ứng (SFX)</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {Math.round(settings.soundFxVolume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.soundFxVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--cyan-primary)' }}
          />
        </div>

        {/* Speech Pronunciation Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Speech size={18} color="var(--cyan-primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Phát Âm Tiếng Anh (TTS)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đọc phát âm từ vựng khi tiêu diệt</div>
            </div>
          </div>

          <input
            type="checkbox"
            checked={settings.pronunciationEnabled}
            onChange={(e) => handlePronunciationToggle(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--cyan-primary)', cursor: 'pointer' }}
          />
        </div>

        {/* Graphics Quality */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={18} color="var(--cyan-primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Chất Lượng Đồ Họa 3D</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {(['low', 'medium', 'high'] as const).map((q) => {
              const label = q === 'low' ? 'Thấp (1x)' : q === 'medium' ? 'Vừa (1.5x)' : 'Cao (2x)';
              const isSelected = settings.graphicsQuality === q;
              return (
                <button
                  key={q}
                  onClick={() => onUpdateSettings({ ...settings, graphicsQuality: q })}
                  className="btn-secondary"
                  style={{
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderColor: isSelected ? 'var(--cyan-primary)' : 'rgba(255, 255, 255, 0.12)',
                    background: isSelected ? 'rgba(51, 230, 221, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? 'var(--cyan-primary)' : 'var(--text-primary)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reduced Motion */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={18} color="var(--cyan-primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Giảm Chuyển Động (Reduced Motion)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tắt rung camera và giảm hạt VFX</div>
            </div>
          </div>

          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => onUpdateSettings({ ...settings, reducedMotion: e.target.checked })}
            style={{ width: '20px', height: '20px', accentColor: 'var(--cyan-primary)', cursor: 'pointer' }}
          />
        </div>

        {/* Reset Game Data */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
          <button
            onClick={handleResetData}
            className="btn-danger"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
          >
            <Trash2 size={16} />
            <span>Xóa Toàn Bộ Dữ Liệu Trò Chơi Cục Bộ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
