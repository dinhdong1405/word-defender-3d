import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, RefreshCw, ShieldCheck, ShieldOff, UserRound, UsersRound } from 'lucide-react';
import { useApp } from '../app/appStore';
import { useAuth } from '../auth/AuthContext';
import { listAccounts, listSecurityEvents, updateAccountRole, updateAccountStatus } from '../auth/authService';
import type { SafeAccount, SecurityEvent, UserRole } from '../auth/types';
import { PaperPanel } from '../components/PaperPanel';
import { StickerButton } from '../components/StickerButton';

const EVENT_LABELS: Record<SecurityEvent['type'], string> = {
  register: 'Đăng ký tài khoản',
  login_success: 'Đăng nhập thành công',
  login_failure: 'Đăng nhập thất bại',
  account_locked: 'Tài khoản bị khóa tạm thời',
  logout: 'Đăng xuất',
  password_changed: 'Đổi mật khẩu',
  role_changed: 'Thay đổi vai trò',
  status_changed: 'Thay đổi trạng thái',
};

export const AdminPage: React.FC = () => {
  const { navigateTo } = useApp();
  const { account: currentAccount, refreshAccount } = useAuth();
  const [accounts, setAccounts] = useState<SafeAccount[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextAccounts, nextEvents] = await Promise.all([listAccounts(), listSecurityEvents(20)]);
      setAccounts(nextAccounts);
      setEvents(nextEvents);
    } catch (caught) {
      setMessage({ kind: 'error', text: caught instanceof Error ? caught.message : 'Không thể tải dữ liệu quản trị.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter((item) => item.status === 'active').length,
    admins: accounts.filter((item) => item.role === 'admin' && item.status === 'active').length,
  }), [accounts]);

  const runMutation = async (accountId: string, action: () => Promise<void>, success: string) => {
    setBusyId(accountId);
    setMessage(null);
    try {
      await action();
      await refreshAccount();
      setMessage({ kind: 'success', text: success });
      await load();
    } catch (caught) {
      setMessage({ kind: 'error', text: caught instanceof Error ? caught.message : 'Không thể cập nhật tài khoản.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-shell notebook-grid-bg app-page">
      <div className="admin-wrap">
        <div className="admin-topbar">
          <StickerButton onClick={() => navigateTo('home')} icon={<ArrowLeft size={18} />}>Trang chủ</StickerButton>
          <StickerButton size="sm" onClick={() => void load()} icon={<RefreshCw size={16} />}>Làm mới</StickerButton>
        </div>

        <header className="admin-heading">
          <div className="admin-heading-icon"><ShieldCheck size={28} /></div>
          <div>
            <span>TRUNG TÂM QUẢN TRỊ</span>
            <h1>Người dùng & phân quyền</h1>
            <p>Quản lý vai trò, trạng thái tài khoản và theo dõi các sự kiện bảo mật gần đây.</p>
          </div>
        </header>

        <div className="admin-stats" aria-label="Thống kê tài khoản">
          <PaperPanel><UsersRound size={21} /><div><strong>{stats.total}</strong><span>Tổng tài khoản</span></div></PaperPanel>
          <PaperPanel><CheckCircle2 size={21} /><div><strong>{stats.active}</strong><span>Đang hoạt động</span></div></PaperPanel>
          <PaperPanel><ShieldCheck size={21} /><div><strong>{stats.admins}</strong><span>Quản trị viên</span></div></PaperPanel>
        </div>

        {message && <div className={`admin-message ${message.kind}`} role="status">{message.text}</div>}

        <PaperPanel className="admin-users-panel">
          <div className="admin-section-title">
            <div><h2>Danh sách tài khoản</h2><p>Hệ thống luôn giữ ít nhất một quản trị viên hoạt động.</p></div>
          </div>

          {loading ? (
            <div className="admin-empty">Đang tải dữ liệu…</div>
          ) : (
            <div className="admin-user-list">
              {accounts.map((item) => {
                const isSelf = item.id === currentAccount?.id;
                const isBusy = busyId === item.id;
                return (
                  <article className={`admin-user-row ${item.status === 'disabled' ? 'disabled' : ''}`} key={item.id}>
                    <div className="admin-user-identity">
                      <span className="admin-user-avatar">{item.displayName.charAt(0).toLocaleUpperCase('vi-VN')}</span>
                      <div>
                        <div className="admin-user-name">{item.displayName} {isSelf && <em>Bạn</em>}</div>
                        <div className="admin-user-email">{item.email}</div>
                      </div>
                    </div>
                    <div className="admin-user-meta">
                      <span className={`admin-status ${item.status}`}>{item.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}</span>
                      <span>Tham gia {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="admin-user-actions">
                      <label>
                        <span className="sr-only">Vai trò của {item.displayName}</span>
                        <select
                          value={item.role}
                          disabled={isBusy || item.status === 'disabled'}
                          onChange={(event) => {
                            const role = event.target.value as UserRole;
                            void runMutation(item.id, () => updateAccountRole(item.id, role), 'Đã cập nhật vai trò.');
                          }}
                        >
                          <option value="player">Người chơi</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </label>
                      <StickerButton
                        size="sm"
                        variant={item.status === 'active' ? 'danger' : 'mint'}
                        disabled={isBusy || isSelf}
                        icon={item.status === 'active' ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                        onClick={() => void runMutation(
                          item.id,
                          () => updateAccountStatus(item.id, item.status === 'active' ? 'disabled' : 'active'),
                          item.status === 'active' ? 'Đã vô hiệu hóa tài khoản.' : 'Đã kích hoạt tài khoản.'
                        )}
                      >
                        {item.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </StickerButton>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </PaperPanel>

        <PaperPanel className="admin-audit-panel">
          <div className="admin-section-title">
            <div><h2>Nhật ký bảo mật gần đây</h2><p>Không ghi mật khẩu hoặc token phiên vào nhật ký.</p></div>
          </div>
          {events.length === 0 ? (
            <div className="admin-empty">Chưa có sự kiện.</div>
          ) : (
            <div className="admin-event-list">
              {events.map((event) => {
                const owner = accounts.find((item) => item.id === event.accountId);
                return (
                  <div className="admin-event" key={event.id}>
                    <span className="admin-event-icon">{event.type === 'login_failure' || event.type === 'account_locked' ? <ShieldOff size={16} /> : <UserRound size={16} />}</span>
                    <div><strong>{EVENT_LABELS[event.type]}</strong><small>{owner?.email || 'Tài khoản không xác định'}</small></div>
                    <time dateTime={event.occurredAt}><Clock3 size={13} /> {new Date(event.occurredAt).toLocaleString('vi-VN')}</time>
                  </div>
                );
              })}
            </div>
          )}
        </PaperPanel>
      </div>
    </div>
  );
};
