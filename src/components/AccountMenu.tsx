import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useApp } from '../app/appStore';

export const AccountMenu: React.FC = () => {
  const { account, isAdmin, logout } = useAuth();
  const { navigateTo } = useApp();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeWhenOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', closeWhenOutside);
    return () => window.removeEventListener('pointerdown', closeWhenOutside);
  }, []);

  if (!account) return null;

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-menu-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="account-avatar" aria-hidden="true">{account.displayName.charAt(0).toLocaleUpperCase('vi-VN')}</span>
        <span className="account-menu-copy">
          <strong>{account.displayName}</strong>
          <small>{isAdmin ? 'Quản trị viên' : 'Người chơi'}</small>
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="account-menu-popover" role="menu">
          <div className="account-menu-email">{account.email}</div>
          <button type="button" role="menuitem" onClick={() => { navigateTo('settings'); setOpen(false); }}>
            <Settings size={17} /> Tài khoản & cài đặt
          </button>
          {isAdmin && (
            <button type="button" role="menuitem" onClick={() => { navigateTo('admin'); setOpen(false); }}>
              <ShieldCheck size={17} /> Quản lý người dùng
            </button>
          )}
          {!isAdmin && (
            <div className="account-role-note"><UserRound size={15} /> Quyền người chơi</div>
          )}
          <div className="account-menu-divider" />
          <button type="button" role="menuitem" className="danger" onClick={() => void logout()}>
            <LogOut size={17} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};
