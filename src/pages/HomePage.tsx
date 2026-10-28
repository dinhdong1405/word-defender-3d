import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Flame,
  MapPinned,
  Play,
  Shirt,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { useApp } from '../app/appStore';
import { useAuth } from '../auth/AuthContext';
import { StickerButton } from '../components/StickerButton';
import { PaperPanel } from '../components/PaperPanel';
import { PonpiPreview } from '../components/PonpiPreview';
import { ALL_MAP_IDS, MAP_CONFIGS } from '../config/maps';

export const HomePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const {
    navigateTo,
    profile,
    inventory,
    dueWordsCount,
    addTestCoins,
    selectedMap,
    setSelectedMap,
  } = useApp();

  const currentMap = MAP_CONFIGS[selectedMap] || MAP_CONFIGS.default;
  const cycleMap = () => {
    const currentIndex = ALL_MAP_IDS.indexOf(selectedMap);
    setSelectedMap(ALL_MAP_IDS[(currentIndex + 1) % ALL_MAP_IDS.length]);
  };

  const quickLinks = [
    {
      route: 'library' as const,
      icon: <BookOpen size={22} />,
      title: 'Bộ từ vựng',
      description: 'Chọn chủ đề bạn muốn luyện',
      tone: 'blue',
    },
    {
      route: 'store' as const,
      icon: <ShoppingBag size={22} />,
      title: 'Cửa hàng',
      description: 'Mở khóa vật phẩm mới',
      tone: 'yellow',
    },
    {
      route: 'wardrobe' as const,
      icon: <Shirt size={22} />,
      title: 'Tủ đồ Ponpi',
      description: 'Tạo phong cách phi công',
      tone: 'green',
    },
    {
      route: 'progress' as const,
      icon: <BarChart3 size={22} />,
      title: 'Tiến trình',
      description: 'Xem kết quả và chuỗi học',
      tone: 'pink',
    },
  ];

  return (
    <div className="home-page app-page">
      <div className="home-wrap">
        <section className="home-status" aria-label="Tóm tắt tiến trình">
          <div className="home-level">
            <span><Trophy size={16} /></span>
            <div><small>Cấp độ hiện tại</small><strong>Cấp {profile?.level || 1} · {profile?.xp || 0} XP</strong></div>
          </div>

          <button type="button" className={`home-review ${dueWordsCount > 0 ? 'has-due' : ''}`} onClick={() => navigateTo('review')}>
            <Flame size={17} />
            <span>{dueWordsCount > 0 ? `${dueWordsCount} từ cần ôn` : 'Đã ôn xong hôm nay'}</span>
            <ArrowRight size={16} />
          </button>

          {isAdmin && (
            <button type="button" className="home-test-coins" onClick={() => void addTestCoins(99999)}>
              <Sparkles size={15} /> Thêm xu test
            </button>
          )}
        </section>

        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-eyebrow"><Target size={15} /> Học từ vựng qua trò chơi</span>
            <h1><span>Gõ đúng.</span><br />Bắn gọn. Nhớ lâu.</h1>
            <p>
              Biến mỗi từ tiếng Anh thành một mục tiêu. Luyện phản xạ, ghi nhớ nghĩa và theo dõi tiến bộ trong cùng một trận đấu.
            </p>
            <div className="home-hero-actions">
              <StickerButton
                variant="primary"
                size="lg"
                onClick={() => navigateTo('prepare')}
                icon={<Play fill="currentColor" size={21} />}
              >
                Chơi ngay
              </StickerButton>
              <StickerButton onClick={() => navigateTo('library')} icon={<BookOpen size={19} />}>
                Chọn bộ từ
              </StickerButton>
            </div>
            <div className="home-note"><span /> Không quảng cáo · Lưu tiến trình trên thiết bị</div>
          </div>

          <PaperPanel className="home-pilot-card">
            <div className="home-pilot-heading">
              <div><span>PHI CÔNG CỦA BẠN</span><strong>Sẵn sàng xuất kích</strong></div>
              <button type="button" onClick={() => navigateTo('wardrobe')}>Đổi trang phục</button>
            </div>

            <div className="home-ponpi-stage">
              <span className="home-doodle home-doodle-one">✦</span>
              <span className="home-doodle home-doodle-two">↑</span>
              <PonpiPreview
                styleId={inventory?.equippedStyleId}
                outfitId={inventory?.equippedOutfitId}
                scale={1.14}
                showPoseSelector={false}
                width={280}
                height={220}
              />
            </div>

            <button
              type="button"
              className="home-map-selector"
              onClick={cycleMap}
              style={{ '--map-accent': currentMap.accentColor } as React.CSSProperties}
              aria-label={`Bản đồ đang chọn: ${currentMap.name}. Nhấn để đổi bản đồ`}
            >
              <span className="home-map-icon">{currentMap.emoji}</span>
              <span><small>Bản đồ đang chọn</small><strong>{currentMap.name}</strong></span>
              <span className="home-map-change"><MapPinned size={15} /> Đổi</span>
            </button>
          </PaperPanel>
        </section>

        <section className="home-quick-section" aria-labelledby="home-quick-title">
          <div className="home-section-heading">
            <div><span>KHÁM PHÁ PONPI</span><h2 id="home-quick-title">Bạn muốn làm gì tiếp theo?</h2></div>
            <button type="button" onClick={() => navigateTo('progress')}>Xem tổng quan <ArrowRight size={16} /></button>
          </div>

          <div className="home-quick-grid">
            {quickLinks.map((item) => (
              <button type="button" key={item.route} className={`home-quick-card tone-${item.tone}`} onClick={() => navigateTo(item.route)}>
                <span className="home-quick-icon">{item.icon}</span>
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
                <ArrowRight className="home-quick-arrow" size={18} />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
