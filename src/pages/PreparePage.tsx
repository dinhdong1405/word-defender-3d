import React, { useEffect, useState } from 'react';
import { useApp } from '../app/appStore';
import { Difficulty, GameMode } from '../types/game';
import { VocabularyEntry, VocabularySet } from '../types/vocabulary';
import { db } from '../data/db';
import { PaperPanel } from '../components/PaperPanel';
import { StickerButton } from '../components/StickerButton';
import { CoinBadge } from '../components/CoinBadge';
import { ArrowLeft, Play, Eye, EyeOff, BookOpen, Volume2, SpellCheck, BrainCircuit, ShieldAlert } from 'lucide-react';
import { STORE_CATALOG } from '../config/catalog';
import { MAP_CONFIGS, GameMapId } from '../config/maps';

export const PreparePage: React.FC = () => {
  const {
    navigateTo,
    selectedSetId,
    setSelectedSetId,
    selectedMode,
    setSelectedMode,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedMap,
    setSelectedMap,
    wallet,
    inventory,
  } = useApp();

  const [sets, setSets] = useState<VocabularySet[]>([]);
  const [currentSet, setCurrentSet] = useState<VocabularySet | null>(null);
  const [previewWords, setPreviewWords] = useState<VocabularyEntry[]>([]);
  const [showStudyFirst, setShowStudyFirst] = useState(false);

  useEffect(() => {
    const load = async () => {
      const allSets = await db.wordSets.toArray();
      setSets(allSets);

      const active = allSets.find((s) => s.id === selectedSetId) || allSets[0];
      if (active) {
        setCurrentSet(active);
        const words = await db.words.where('setId').equals(active.id).toArray();
        setPreviewWords(words);
      }
    };
    load();
  }, [selectedSetId]);

  const handleSetChange = (id: string) => {
    setSelectedSetId(id);
  };

  const modes: { id: GameMode; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'copy',
      title: 'Nấc 1: Gõ Từ (Copy)',
      desc: 'Quái hiện chữ tiếng Anh màu đỏ. Gõ đúng chữ chuyển sang màu xanh. Quái chết hiện ra nghĩa của từ.',
      icon: <SpellCheck size={20} color="#0288D1" />,
    },
    {
      id: 'recall',
      title: 'Nấc 2: Nhớ Nghĩa (Recall)',
      desc: 'Quái chỉ hiện nghĩa tiếng Việt. Bắt đầu nhắm vào quái thì mất nghĩa đó và điền các chữ cái đúng bạn bấm.',
      icon: <BrainCircuit size={20} color="#E06C96" />,
    },
    {
      id: 'listen',
      title: 'Nấc 3: Nghe & Gõ (Listen)',
      desc: 'Quái phát âm thanh tiếng Anh. Khi nhắm vào quái, gõ từ đúng để bắn hạ quái và hiện ra nghĩa của từ.',
      icon: <Volume2 size={20} color="#F57F17" />,
    },
  ];

  const difficulties: { id: Difficulty; title: string; desc: string }[] = [
    { id: 'easy', title: 'Dễ (Easy)', desc: 'Tốc độ quái 70% • Phù hợp làm quen' },
    { id: 'normal', title: 'Vừa (Normal)', desc: 'Tốc độ quái 100% • Trải nghiệm chuẩn' },
    { id: 'hard', title: 'Khó (Hard)', desc: 'Tốc độ quái 135% • Điểm thưởng cao' },
  ];

  const equippedSkills = (inventory?.equippedSkillIds || [])
    .map((id) => STORE_CATALOG.find((item) => item.id === id))
    .filter(Boolean);

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
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <StickerButton onClick={() => navigateTo('home')} icon={<ArrowLeft size={18} />}>
            Trang Chủ
          </StickerButton>
          <CoinBadge amount={wallet?.balance || 0} showLabel />
        </div>

        <PaperPanel>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, marginBottom: '6px' }}>
            Chuẩn Bị Chiến Đấu
          </h1>
          <p style={{ color: 'var(--color-muted-ink)', marginBottom: '20px' }}>
            Chọn bộ từ, chế độ học và cấp độ thử thách trước khi vào trận.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* 1. Chọn Bộ Từ Vựng */}
            <div>
              <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '1.05rem' }}>
                1. Bộ Từ Vựng Đang Chọn:
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={selectedSetId}
                  onChange={(e) => handleSetChange(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'var(--border-ink)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
                >
                  {sets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.entryIds.length} từ)
                    </option>
                  ))}
                </select>
                <StickerButton size="sm" onClick={() => navigateTo('library')} icon={<BookOpen size={16} />}>
                  Đổi Bộ Từ
                </StickerButton>
              </div>
            </div>

            {/* 2. Chọn Chế Độ Học */}
            <div>
              <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '1.05rem' }}>
                2. Chế Độ Bắn Chữ (Game Mode):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                {modes.map((m) => {
                  const isSelected = selectedMode === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMode(m.id)}
                      style={{
                        padding: '14px',
                        backgroundColor: isSelected ? '#FFF0F5' : '#FFFFFF',
                        border: isSelected ? '3px solid var(--color-ponpi-pink)' : 'var(--border-ink)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: isSelected ? 'var(--shadow-sticker-hover)' : 'var(--shadow-sticker-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1rem' }}>
                        {m.icon}
                        <span>{m.title}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted-ink)', lineHeight: 1.3 }}>
                        {m.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Chọn Độ Khó */}
            <div>
              <label style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '1.05rem' }}>
                3. Tốc Độ & Độ Khó:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '10px' }}>
                {difficulties.map((d) => {
                  const isSelected = selectedDifficulty === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDifficulty(d.id)}
                      style={{
                        padding: '12px',
                        backgroundColor: isSelected ? '#FFF8E1' : '#FFFFFF',
                        border: isSelected ? '3px solid var(--color-accent-yellow)' : 'var(--border-ink)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: isSelected ? 'var(--shadow-sticker-hover)' : 'var(--shadow-sticker-sm)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{d.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-ink)', marginTop: '2px' }}>
                        {d.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Chọn Bản Đồ (Map / Chiến Trường) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  4. Chọn Bản Đồ (Map / Chiến Trường):
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-muted-ink)' }}>
                  Đang chọn: <strong>{MAP_CONFIGS[selectedMap]?.name}</strong>
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {(['default', 'red-canyon'] as GameMapId[]).map((mapId) => {
                  const mapInfo = MAP_CONFIGS[mapId];
                  const isSelected = selectedMap === mapId;
                  const isRed = mapId === 'red-canyon';

                  return (
                    <div
                      key={mapId}
                      onClick={() => setSelectedMap(mapId)}
                      style={{
                        padding: '14px',
                        backgroundColor: isSelected ? (isRed ? '#FFF4EE' : '#F6F9FA') : '#FFFFFF',
                        border: isSelected
                          ? (isRed ? '3px solid #DE764A' : '3px solid var(--color-ink)')
                          : '1.5px solid var(--color-ink)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: isSelected ? 'var(--shadow-sticker-hover)' : 'var(--shadow-sticker-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isRed ? '#FF5722' : 'var(--color-muted-ink)',
                            color: '#FFFFFF',
                          }}
                        >
                          {mapInfo.badge}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 900,
                              color: isRed ? '#D04E20' : '#16A34A',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            ✓ ĐANG CHỌN
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--color-ink)',
                            backgroundColor: mapInfo.previewBg,
                            backgroundImage: isRed
                              ? 'linear-gradient(to bottom, #E88B60, #BD4D2A)'
                              : 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0,
                            boxShadow: '1px 1px 0 var(--color-ink)',
                          }}
                        >
                          {isRed ? (
                            <>
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: '9px',
                                  backgroundColor: '#281311',
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: '9px',
                                  backgroundColor: '#281311',
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '5px',
                                  left: '11px',
                                  right: '11px',
                                  height: '1px',
                                  borderBottom: '1px dashed #FFE082',
                                }}
                              />
                            </>
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundImage:
                                  'linear-gradient(to right, #C8DDE6 1px, transparent 1px), linear-gradient(to bottom, #C8DDE6 1px, transparent 1px)',
                                backgroundSize: '8px 8px',
                              }}
                            />
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--color-ink)' }}>
                            {mapInfo.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-ink)', marginTop: '2px', lineHeight: 1.3 }}>
                            {mapInfo.tagline}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Kỹ Năng Đang Trang Bị */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--color-paper)',
                border: '1.5px solid var(--color-ink)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>5. Kỹ Năng Đang Trang Bị: </span>
                <span style={{ fontSize: '0.9rem', color: '#0288D1', fontWeight: 700 }}>
                  {equippedSkills.length > 0
                    ? equippedSkills.map((s, i) => `Phím [${i + 1}] ${s?.title}`).join(' • ')
                    : 'Chưa trang bị kỹ năng nào'}
                </span>
              </div>
              <StickerButton size="sm" onClick={() => navigateTo('wardrobe')}>
                Đổi Kỹ Năng
              </StickerButton>
            </div>

            {/* Preview Words Toggle */}
            <div>
              <StickerButton
                size="sm"
                onClick={() => setShowStudyFirst(!showStudyFirst)}
                icon={showStudyFirst ? <EyeOff size={16} /> : <Eye size={16} />}
              >
                {showStudyFirst ? 'Ẩn Ôn Tập Trước' : 'Ôn Tập Nhanh Danh Sách Từ Trước Trận'}
              </StickerButton>

              {showStudyFirst && (
                <div
                  style={{
                    marginTop: '12px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--color-paper)',
                    border: 'var(--border-ink)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {previewWords.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-ink)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <strong style={{ fontFamily: 'var(--font-english)' }}>{w.english}</strong>: <span style={{ fontFamily: 'var(--font-vietnamese)' }}>{w.vietnamese}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Launch CTA */}
            <div style={{ marginTop: '8px' }}>
              <StickerButton
                variant="primary"
                size="lg"
                onClick={() => navigateTo('battle')}
                icon={<Play fill="var(--color-ink)" size={24} />}
                style={{ width: '100%', fontSize: '1.3rem', padding: '16px 0' }}
              >
                VÀO TRẬN CHIẾN NGAY
              </StickerButton>
            </div>
          </div>
        </PaperPanel>
      </div>
    </div>
  );
};
