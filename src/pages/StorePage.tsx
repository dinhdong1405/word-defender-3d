import React, { useState } from 'react';
import { useApp } from '../app/appStore';
import { StoreCategory, StoreItem } from '../types/economy';
import { STORE_CATALOG } from '../config/catalog';
import { buyStoreItem, equipItem } from '../economy/inventory';
import { PaperPanel } from '../components/PaperPanel';
import { StickerButton } from '../components/StickerButton';
import { CoinBadge } from '../components/CoinBadge';
import { getAssetUrl } from '../utils/assetUrl';
import { PonpiPreview } from '../components/PonpiPreview';
import { ArrowLeft, ShoppingBag, Check, Sparkles, Shirt } from 'lucide-react';

export const StorePage: React.FC = () => {
  const { navigateTo, wallet, inventory, refreshUserData, addTestCoins } = useApp();
  const [activeTab, setActiveTab] = useState<StoreCategory>('style');
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<StoreItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tabs: { id: StoreCategory; label: string }[] = [
    { id: 'style', label: 'Thay Màu' },
    { id: 'skill', label: 'Thay Đạn' },
    { id: 'outfit', label: 'Thay Trang Phục' },
  ];

  const items = STORE_CATALOG.filter((i) => i.category === activeTab);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuy = async (item: StoreItem) => {
    try {
      const res = await buyStoreItem(item.id);
      if (res.success) {
        showToast(`Mua thành công: ${item.title}!`);
        await refreshUserData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể thực hiện giao dịch.');
    }
  };

  const handleEquip = async (item: StoreItem) => {
    try {
      await equipItem(item.category, item.id);
      showToast(`Đã trang bị ${item.title}!`);
      await refreshUserData();
    } catch (err: any) {
      showToast(err?.message || 'Không thể trang bị.');
    }
  };

  // Determine what to show in preview
  const previewOutfitId =
    selectedPreviewItem?.category === 'outfit'
      ? selectedPreviewItem.id
      : inventory?.equippedOutfitId;

  const previewStyleId =
    selectedPreviewItem?.category === 'style'
      ? selectedPreviewItem.id
      : inventory?.equippedStyleId || 'style_yellow';

  const previewBulletId =
    selectedPreviewItem?.category === 'skill'
      ? selectedPreviewItem.id
      : inventory?.equippedBulletId || 'bullet_missile';

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
      <div style={{ width: '100%', maxWidth: '900px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <StickerButton onClick={() => navigateTo('home')} icon={<ArrowLeft size={18} />}>
            Trang Chủ
          </StickerButton>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <CoinBadge
              amount={wallet?.balance || 0}
              size="md"
              showLabel
              onClick={async () => {
                await addTestCoins(99999);
                showToast('Đã nhận thêm +99,999 xu test!');
              }}
              title="Click để nhận ngay +99,999 xu test"
            />
            <StickerButton
              variant="accent"
              size="sm"
              onClick={async () => {
                await addTestCoins(99999);
                showToast('Đã nhận thêm +99,999 xu test thành công!');
              }}
              icon={<Sparkles size={16} />}
              title="Cộng 99,999 xu vào tài khoản test"
            >
              +99.999 Xu Test
            </StickerButton>
            <StickerButton variant="mint" size="sm" onClick={() => navigateTo('wardrobe')} icon={<Shirt size={16} />}>
              Vào Tủ Đồ
            </StickerButton>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900 }}>
            Cửa Hàng Ponpi
          </h1>
          <p style={{ color: 'var(--color-muted-ink)' }}>
            Dùng xu kiếm được từ các trận chiến để thay màu, đổi loại đạn và sắm trang phục mới cho Ponpi!
          </p>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--color-ink)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sticker)',
              fontWeight: 800,
              color: 'var(--color-ink)',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* Main Grid: Store Items Left + Live Ponpi Preview Right */}
        <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>
          {/* Left: Store Items */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {tabs.map((tab) => (
                <StickerButton
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'default'}
                  size="sm"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedPreviewItem(null);
                  }}
                >
                  {tab.label}
                </StickerButton>
              ))}
            </div>

            {/* Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {items.map((item) => {
                const isOwned = inventory?.ownedItemIds.includes(item.id) || false;
                const isEquipped =
                  (item.category === 'outfit' && inventory?.equippedOutfitId === item.id) ||
                  (item.category === 'style' && inventory?.equippedStyleId === item.id) ||
                  (item.category === 'skill' && (
                    inventory?.equippedBulletId === item.id ||
                    (item.id === 'bullet_default' && (inventory?.equippedBulletId === 'normal' || !inventory?.equippedBulletId)) ||
                    (item.id === 'skill_slow_shot' && inventory?.equippedBulletId === 'slow_shot') ||
                    (inventory?.equippedSkillIds || []).includes(item.id)
                  ));

                const canAfford = (wallet?.balance || 0) >= item.priceCoins;

                return (
                  <PaperPanel
                    key={item.id}
                    onClick={() => setSelectedPreviewItem(item)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border:
                        selectedPreviewItem?.id === item.id
                          ? '3px solid var(--color-ponpi-pink)'
                          : 'var(--border-ink)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {item.iconUrl ? (
                          <img
                            src={getAssetUrl(item.iconUrl)}
                            alt={item.title}
                            style={{
                              width: '28px',
                              height: '28px',
                              objectFit: 'contain',
                              display: 'inline-block',
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: item.color || '#F58AB0',
                              border: '1px solid var(--color-ink)',
                              display: 'inline-block',
                            }}
                          />
                        )}
                        {isEquipped ? (
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2E7D32' }}>
                            ✓ Đang mặc
                          </span>
                        ) : isOwned ? (
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0288D1' }}>
                            Đã sở hữu
                          </span>
                        ) : (
                          <CoinBadge amount={item.priceCoins} size="sm" showLabel />
                        )}
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-english)', fontWeight: 800, marginTop: '8px', fontSize: '1.1rem' }}>
                        {item.title}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-vietnamese)', fontSize: '0.85rem', color: 'var(--color-muted-ink)', marginTop: '4px', minHeight: '40px' }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ marginTop: '14px' }}>
                      {isEquipped ? (
                        <StickerButton size="sm" disabled style={{ width: '100%' }}>
                          Đang Trang Bị
                        </StickerButton>
                      ) : isOwned ? (
                        <StickerButton
                          variant="mint"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquip(item);
                          }}
                          style={{ width: '100%' }}
                        >
                          Trang Bị Ngay
                        </StickerButton>
                      ) : (
                        <StickerButton
                          variant={canAfford ? 'accent' : 'default'}
                          size="sm"
                          disabled={!canAfford}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuy(item);
                          }}
                          style={{ width: '100%' }}
                        >
                          {canAfford ? `Mua (${item.priceCoins} xu)` : 'Chưa Đủ Xu'}
                        </StickerButton>
                      )}
                    </div>
                  </PaperPanel>
                );
              })}
            </div>
          </div>

          {/* Right: Preview Panel */}
          <div>
            <PaperPanel style={{ position: 'sticky', top: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-muted-ink)', marginBottom: '10px' }}>
                XEM TRƯỚC PONPI
              </div>

              <PonpiPreview
                styleId={previewStyleId}
                outfitId={previewOutfitId}
                bulletId={previewBulletId}
                scale={1.3}
                width={240}
                height={220}
                showPoseSelector={true}
              />

              {selectedPreviewItem && !inventory?.ownedItemIds.includes(selectedPreviewItem.id) && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '4px 8px',
                    backgroundColor: '#FFF9E6',
                    border: '1px dashed var(--color-ink)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Đang thử trước: {selectedPreviewItem.title}
                </div>
              )}
            </PaperPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
