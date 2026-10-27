import React from 'react';
import { useApp } from '../app/appStore';
import { StickerButton } from '../components/StickerButton';
import { PaperPanel } from '../components/PaperPanel';
import { CoinBadge } from '../components/CoinBadge';
import { PonpiPreview } from '../components/PonpiPreview';
import { BookOpen, ShoppingBag, Shirt, BarChart3, Play, Flame, Sparkles } from 'lucide-react';
import { MAP_CONFIGS } from '../config/maps';
import { useAuth } from '../auth/AuthContext';
import { AccountMenu } from '../components/AccountMenu';

export const HomePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const {
    navigateTo,
    wallet,
    profile,
    inventory,
    dueWordsCount,
    addTestCoins,
    selectedMap,
    setSelectedMap,
  } = useApp();

  return (
    <div
      className="notebook-grid-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 20px',
      }}
    >
      {/* Top Bar with Profile Stats & Coins */}
      <header
        style={{
          width: '100%',
          maxWidth: '850px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '4px 14px 4px 6px',
              backgroundColor: '#FFFFFF',
              border: 'var(--border-ink)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.9rem',
              boxShadow: 'var(--shadow-sticker-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <img src="/assets/logo.png" alt="Ponpi" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            <span>Cấp {profile?.level || 1} • {profile?.xp || 0} XP</span>
          </div>

          {dueWordsCount > 0 && (
            <div
              onClick={() => navigateTo('review')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: '#FFE8E8',
                color: 'var(--color-danger)',
                border: '1.5px solid var(--color-danger)',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Flame size={14} />
              <span>{dueWordsCount} từ cần ôn</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CoinBadge
            amount={wallet?.balance || 0}
            showLabel
            size="md"
            onClick={isAdmin ? () => addTestCoins(99999) : undefined}
          />
          {isAdmin && (
            <StickerButton
              size="sm"
              variant="accent"
              onClick={() => addTestCoins(99999)}
              icon={<Sparkles size={16} />}
            >
              +99.999 Xu Test
            </StickerButton>
          )}
          <AccountMenu />
        </div>
      </header>

      {/* Main Hero Section */}
      <main
        style={{
          width: '100%',
          maxWidth: '850px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Game Title: English in Comic Sans, Vietnamese in normal clean font */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <img
              src="/assets/logo.png"
              alt="Ponpi Logo"
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'contain',
                filter: 'drop-shadow(2px 3px 0px var(--color-ink))',
              }}
            />
            <h1
              style={{
                fontFamily: 'var(--font-english)',
                fontSize: 'clamp(2.2rem, 5.5vw, 3.6rem)',
                fontWeight: 900,
                color: 'var(--color-ink)',
                textShadow: '3px 4px 0px var(--color-accent-yellow)',
                letterSpacing: '0px',
                lineHeight: 1.1,
              }}
            >
              PONPI: WORD BLASTER
            </h1>
          </div>
          <p
            style={{
              fontWeight: 600,
              fontSize: '1.05rem',
              color: 'var(--color-muted-ink)',
              marginTop: '6px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-english)', fontWeight: 700 }}>Learn. Shoot. Remember.</span>{' '}
            <span style={{ fontFamily: 'var(--font-vietnamese)' }}>— Bắn chữ ôn từ trên giấy ô ly</span>
          </p>
        </div>

        {/* Mascot Center Card */}
        <PaperPanel
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
          }}
        >
          <PonpiPreview
            styleId={inventory?.equippedStyleId}
            outfitId={inventory?.equippedOutfitId}
            scale={1.2}
            showPoseSelector={false}
            width={260}
            height={220}
          />

          {/* Primary CTA PLAY */}
          <div style={{ marginTop: '20px', width: '100%' }}>
            <StickerButton
              variant="primary"
              size="lg"
              onClick={() => navigateTo('prepare')}
              icon={<Play fill="var(--color-ink)" size={24} />}
              style={{ width: '100%', padding: '16px 0', fontSize: '1.4rem' }}
            >
              CHIẾN ĐẤU NGAY
            </StickerButton>
          </div>

          {/* Quick Map Selector Badge on Home */}
          <div
            onClick={() => setSelectedMap(selectedMap === 'red-canyon' ? 'default' : 'red-canyon')}
            title="Click để đổi nhanh bản đồ chiến đấu"
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '8px 12px',
              backgroundColor: selectedMap === 'red-canyon' ? '#FFF2EB' : '#F7F7F7',
              border: selectedMap === 'red-canyon' ? '2px solid #DE764A' : '1.5px solid var(--color-ink)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sticker-sm)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>{selectedMap === 'red-canyon' ? '🏜️' : '📝'}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-muted-ink)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Bản Đồ Đang Dùng
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: selectedMap === 'red-canyon' ? '#C04C20' : 'var(--color-ink)' }}>
                  {MAP_CONFIGS[selectedMap]?.name}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 9px',
                backgroundColor: selectedMap === 'red-canyon' ? '#DE764A' : 'var(--color-ink)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Đổi Map ↺
            </span>
          </div>
        </PaperPanel>

        {/* Quick Navigation Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            width: '100%',
          }}
        >
          <StickerButton
            variant="default"
            onClick={() => navigateTo('library')}
            icon={<BookOpen size={20} />}
            style={{ padding: '14px 16px', justifyContent: 'flex-start' }}
          >
            Bộ Từ Vựng
          </StickerButton>

          <StickerButton
            variant="accent"
            onClick={() => navigateTo('store')}
            icon={<ShoppingBag size={20} />}
            style={{ padding: '14px 16px', justifyContent: 'flex-start' }}
          >
            Cửa Hàng
          </StickerButton>

          <StickerButton
            variant="mint"
            onClick={() => navigateTo('wardrobe')}
            icon={<Shirt size={20} />}
            style={{ padding: '14px 16px', justifyContent: 'flex-start' }}
          >
            Tủ Đồ Ponpi
          </StickerButton>

          <StickerButton
            variant="blue"
            onClick={() => navigateTo('progress')}
            icon={<BarChart3 size={20} />}
            style={{ padding: '14px 16px', justifyContent: 'flex-start' }}
          >
            Tiến Trình Học
          </StickerButton>
        </div>
      </main>
    </div>
  );
};
