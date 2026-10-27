import React, { useEffect, useState } from 'react';
import { useApp } from '../app/appStore';
import { db } from '../data/db';
import { RunSummary } from '../types/game';
import { LearningRecord, MemoryStage } from '../types/learning';
import { PaperPanel } from '../components/PaperPanel';
import { StickerButton } from '../components/StickerButton';
import { CoinBadge } from '../components/CoinBadge';
import { ArrowLeft, Award, BookCheck, Flame, History, Target } from 'lucide-react';
import { getActiveProfileId } from '../auth/authService';

export const ProgressPage: React.FC = () => {
  const { navigateTo, profile, wallet } = useApp();
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [stageCounts, setStageCounts] = useState<Record<MemoryStage, number>>({
    new: 0,
    learning: 0,
    remembered: 0,
    due: 0,
    struggling: 0,
  });
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    const loadProgress = async () => {
      const profileId = getActiveProfileId();
      // 1. Last 10 runs
      const recentRuns = await db.runs.where('profileId').equals(profileId).toArray();
      recentRuns.sort((left, right) => right.startedAt.localeCompare(left.startedAt));
      recentRuns.splice(10);
      setRuns(recentRuns);

      // 2. Learning Records
      const now = new Date().toISOString();
      const records = await db.learningRecords.where('profileId').equals(profileId).toArray();
      const counts: Record<MemoryStage, number> = {
        new: 0,
        learning: 0,
        remembered: 0,
        due: 0,
        struggling: 0,
      };

      for (const r of records) {
        if (r.stage === 'struggling') {
          counts.struggling++;
        } else if (r.nextDueAt && r.nextDueAt <= now) {
          counts.due++;
        } else {
          counts[r.stage] = (counts[r.stage] || 0) + 1;
        }
      }

      // Words never reviewed count as 'new'
      const totalWords = await db.words.count();
      const reviewedWordIds = new Set(records.map((r) => r.wordId ?? r.entryId));
      counts.new = Math.max(0, totalWords - reviewedWordIds.size);

      setStageCounts(counts);

      const attemptsCount = await db.attempts.where('profileId').equals(profileId).count();
      setTotalAttempts(attemptsCount);
    };

    loadProgress();
  }, []);

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
      <div style={{ width: '100%', maxWidth: '850px' }}>
        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <StickerButton onClick={() => navigateTo('home')} icon={<ArrowLeft size={18} />}>
            Trang Chủ
          </StickerButton>
          <CoinBadge amount={wallet?.balance || 0} size="md" showLabel />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, marginBottom: '6px' }}>
          Tiến Trình & Thống Kê Học Tập
        </h1>
        <p style={{ color: 'var(--color-muted-ink)', marginBottom: '24px' }}>
          Theo dõi bằng chứng hồi tưởng từ vựng độc lập và lịch sử các trận chiến.
        </p>

        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <PaperPanel style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-ink)', fontWeight: 700 }}>CẤP ĐỘ PHI CÔNG</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginTop: '4px' }}>
              Cấp {profile?.level || 1}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#0288D1', marginTop: '2px' }}>{profile?.xp || 0} XP tích lũy</div>
          </PaperPanel>

          <PaperPanel style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-ink)', fontWeight: 700 }}>TỔNG LẦN GÕ TỪ</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginTop: '4px' }}>
              {totalAttempts}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#2E7D32', marginTop: '2px' }}>Lần thử thách</div>
          </PaperPanel>

          <PaperPanel style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-ink)', fontWeight: 700 }}>TỔNG XU ĐÃ KIẾM</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginTop: '4px' }}>
              {wallet?.totalEarned.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#F57F17', marginTop: '2px' }}>Xu trong đời</div>
          </PaperPanel>
        </div>

        {/* Memory Stages Breakdown */}
        <PaperPanel style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '14px' }}>
            Phân Bố Trạng Thái Trí Nhớ (Spaced Repetition)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F5F5F5', border: '1.5px solid var(--color-ink)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#757575' }}>Chưa Học</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '4px' }}>{stageCounts.new}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#E3F2FD', border: '1.5px solid var(--color-ink)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0288D1' }}>Đang Học</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '4px' }}>{stageCounts.learning}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#E8F5E9', border: '1.5px solid var(--color-ink)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2E7D32' }}>Đã Nhớ Bền Vững</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '4px', color: '#2E7D32' }}>{stageCounts.remembered}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FFF3E0', border: '1.5px solid var(--color-ink)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E65100' }}>Đến Hạn Ôn</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '4px', color: '#E65100' }}>{stageCounts.due}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FFEBEE', border: '1.5px solid var(--color-ink)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C62828' }}>Hay Sai / Cần Ôn Lại</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '4px', color: '#C62828' }}>{stageCounts.struggling}</div>
            </div>
          </div>
        </PaperPanel>

        {/* Recent 10 Runs */}
        <PaperPanel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <History size={20} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>
              Lịch Sử 10 Trận Chiến Gần Nhất
            </h3>
          </div>

          {runs.length === 0 ? (
            <p style={{ color: 'var(--color-muted-ink)' }}>Bạn chưa hoàn thành trận đấu nào.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {runs.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1.5px solid var(--color-ink)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color: r.result === 'win' ? '#2E7D32' : 'var(--color-danger)',
                        }}
                      >
                        {r.result === 'win' ? 'CHIẾN THẮNG' : r.result === 'lose' ? 'THẤT BẠI' : 'THOÁT TRẬN'}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-muted-ink)' }}>
                        • Chế độ: {r.mode} • Độ khó: {r.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-ink)', marginTop: '2px' }}>
                      {new Date(r.startedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800 }}>{r.totalScore.toLocaleString()} điểm</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-ink)' }}>
                        Độ chính xác: {r.accuracy}%
                      </div>
                    </div>
                    <CoinBadge amount={r.coinsEarned || 0} size="sm" showLabel />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PaperPanel>
      </div>
    </div>
  );
};
