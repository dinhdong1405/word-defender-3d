import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Flame,
  Home,
  LogOut,
  Menu,
  Play,
  RotateCcw,
  Settings,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Upload,
  X,
} from 'lucide-react';
import { AppRoute, useApp } from '../app/appStore';
import { useAuth } from '../auth/AuthContext';
import { CoinBadge } from './CoinBadge';
import { AccountMenu } from './AccountMenu';
import { getAssetUrl } from '../utils/assetUrl';

type NavItem = {
  route: AppRoute;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
  group?: AppRoute[];
};

const MAIN_NAV: NavItem[] = [
  { route: 'home', label: 'Trang chủ', icon: <Home size={18} /> },
  { route: 'library', label: 'Bộ từ', icon: <BookOpen size={18} />, group: ['editor'] },
  { route: 'store', label: 'Cửa hàng', icon: <ShoppingBag size={18} /> },
  { route: 'wardrobe', label: 'Tủ đồ', icon: <Shirt size={18} /> },
  { route: 'progress', label: 'Tiến trình', icon: <BarChart3 size={18} /> },
];

const MOBILE_NAV: NavItem[] = [
  { route: 'home', label: 'Trang chủ', shortLabel: 'Trang chủ', icon: <Home size={20} /> },
  { route: 'library', label: 'Bộ từ', shortLabel: 'Bộ từ', icon: <BookOpen size={20} />, group: ['editor'] },
  { route: 'prepare', label: 'Chơi', shortLabel: 'Chơi', icon: <Play size={20} />, group: ['results'] },
];

const isItemActive = (item: NavItem, currentRoute: AppRoute) => (
  item.route === currentRoute || item.group?.includes(currentRoute) === true
);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentRoute, navigateTo, wallet, profile, dueWordsCount } = useApp();
  const { account, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const drawerItems = useMemo<NavItem[]>(() => {
    const utility: NavItem[] = [
      { route: 'review', label: 'Ôn tập', icon: <RotateCcw size={19} /> },
      { route: 'settings', label: 'Cài đặt', icon: <Settings size={19} /> },
    ];
    if (isAdmin) {
      utility.push(
        { route: 'editor', label: 'Nhập bộ từ', icon: <Upload size={19} /> },
        { route: 'admin', label: 'Quản trị', icon: <ShieldCheck size={19} /> },
      );
    }
    return [...MAIN_NAV, ...utility];
  }, [isAdmin]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [currentRoute]);

  const goTo = (route: AppRoute) => {
    navigateTo(route);
    setMenuOpen(false);
  };

  return (
    <div className="app-shell notebook-grid-bg">
      <header className="app-shell-header">
        <div className="app-shell-header-inner">
          <button className="app-brand" type="button" onClick={() => goTo('home')} aria-label="Về trang chủ Ponpi">
            <span className="app-brand-mark"><img src={getAssetUrl('/assets/logo.png')} alt="" /></span>
            <span className="app-brand-copy"><strong>Ponpi</strong><small>Word Blaster</small></span>
          </button>

          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {MAIN_NAV.map((item) => (
              <button
                type="button"
                key={item.route}
                className={isItemActive(item, currentRoute) ? 'active' : ''}
                onClick={() => goTo(item.route)}
                aria-current={isItemActive(item, currentRoute) ? 'page' : undefined}
              >
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="app-shell-actions">
            {dueWordsCount > 0 && (
              <button type="button" className="review-chip" onClick={() => goTo('review')}>
                <Flame size={15} /><span>{dueWordsCount} từ cần ôn</span>
              </button>
            )}
            <CoinBadge amount={wallet?.balance || 0} showLabel size="md" onClick={() => goTo('store')} />
            <button type="button" className="desktop-play-button" onClick={() => goTo('prepare')}>
              <Play size={17} fill="currentColor" /> Chơi ngay
            </button>
            <div className="desktop-account"><AccountMenu /></div>
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={menuOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-shell-content">{children}</main>

      <nav className="mobile-tabbar" aria-label="Điều hướng nhanh">
        {MOBILE_NAV.map((item) => (
          <button
            type="button"
            key={item.route}
            className={isItemActive(item, currentRoute) ? 'active' : ''}
            onClick={() => goTo(item.route)}
            aria-current={isItemActive(item, currentRoute) ? 'page' : undefined}
          >
            {item.icon}<span>{item.shortLabel}</span>
          </button>
        ))}
        <button type="button" className={menuOpen ? 'active' : ''} onClick={() => setMenuOpen(true)}>
          <Menu size={20} /><span>Menu</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-drawer-layer" role="presentation">
          <button className="mobile-drawer-backdrop" type="button" onClick={() => setMenuOpen(false)} aria-label="Đóng menu" />
          <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu Ponpi">
            <div className="mobile-drawer-head">
              <div className="mobile-drawer-profile">
                <span>{account?.displayName.charAt(0).toLocaleUpperCase('vi-VN')}</span>
                <div><strong>{account?.displayName}</strong><small>Cấp {profile?.level || 1} · {profile?.xp || 0} XP</small></div>
              </div>
              <button type="button" autoFocus onClick={() => setMenuOpen(false)} aria-label="Đóng menu"><X size={21} /></button>
            </div>

            <button type="button" className="mobile-drawer-play" onClick={() => goTo('prepare')}>
              <Play size={19} fill="currentColor" /> Bắt đầu trận đấu
            </button>

            {dueWordsCount > 0 && (
              <button type="button" className="mobile-review-card" onClick={() => goTo('review')}>
                <span><Flame size={18} /> Hôm nay có từ cần ôn</span>
                <strong>{dueWordsCount}</strong>
              </button>
            )}

            <nav className="mobile-drawer-nav">
              {drawerItems.map((item) => (
                <button
                  type="button"
                  key={item.route}
                  className={isItemActive(item, currentRoute) ? 'active' : ''}
                  onClick={() => goTo(item.route)}
                >
                  <span className="mobile-drawer-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mobile-drawer-footer">
              <span>{account?.email}</span>
              <button type="button" onClick={() => void logout()}><LogOut size={17} /> Đăng xuất</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
