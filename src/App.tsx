import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './app/appStore';
import { initializeDatabase } from './data/db';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { WordSetEditorPage } from './pages/WordSetEditorPage';
import { PreparePage } from './pages/PreparePage';
import { BattlePage } from './pages/BattlePage';
import { ResultsPage } from './pages/ResultsPage';
import { ReviewPage } from './pages/ReviewPage';
import { StorePage } from './pages/StorePage';
import { WardrobePage } from './pages/WardrobePage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { getAssetUrl } from './utils/assetUrl';

const AppContent: React.FC = () => {
  const { currentRoute } = useApp();
  const { isAdmin } = useAuth();

  switch (currentRoute) {
    case 'home':
      return <HomePage />;
    case 'library':
      return <LibraryPage />;
    case 'editor':
      return isAdmin ? <WordSetEditorPage /> : <HomePage />;
    case 'prepare':
      return <PreparePage />;
    case 'battle':
      return <BattlePage />;
    case 'results':
      return <ResultsPage />;
    case 'review':
      return <ReviewPage />;
    case 'store':
      return <StorePage />;
    case 'wardrobe':
      return <WardrobePage />;
    case 'progress':
      return <ProgressPage />;
    case 'settings':
      return <SettingsPage />;
    case 'admin':
      return isAdmin ? <AdminPage /> : <HomePage />;
    default:
      return <HomePage />;
  }
};

const AuthenticatedApplication: React.FC = () => {
  const { account, ready } = useAuth();

  if (!ready) {
    return (
      <div className="notebook-grid-bg app-loading-screen">
        <img src={getAssetUrl('/assets/logo.png')} alt="" />
        <span>Đang kiểm tra phiên đăng nhập…</span>
      </div>
    );
  }

  if (!account) return <AuthPage />;

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export const App: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    initializeDatabase()
      .then(() => {
        if (isActive) setDbReady(true);
      })
      .catch((error) => {
        if (isActive) {
          setDbError(error instanceof Error ? error.message : 'Không thể mở dữ liệu trò chơi.');
        }
      });

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  if (dbError) {
    return (
      <div
        className="notebook-grid-bg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-danger)' }}>
          Không thể khởi động Ponpi
        </h1>
        <p style={{ maxWidth: '560px', color: 'var(--color-muted-ink)' }}>{dbError}</p>
        <button
          className="sticker-button"
          onClick={() => {
            setDbError(null);
            setRetryCount((count) => count + 1);
          }}
        >
          Thử Lại
        </button>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div
        className="notebook-grid-bg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--color-ink)',
        }}
      >
        Đang khởi động Ponpi: Word Blaster...
      </div>
    );
  }

  return (
    <AuthProvider>
      <AuthenticatedApplication />
    </AuthProvider>
  );
};

export default App;
