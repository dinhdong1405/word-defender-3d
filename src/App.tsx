import React, { useState, useEffect, useRef } from 'react';
import { VocabularyPack } from './types/vocabulary';
import {
  GameSnapshot,
  GameEvent,
  GameMode,
  GameDifficulty,
  PlayerGameSettings,
  GameSessionRecord,
} from './types/game';
import { WordDefenderEngine } from './core/engine';
import { ThreeCanvas } from './scene/ThreeCanvas';
import { GameHub } from './ui/GameHub';
import { PreGameSetup } from './ui/PreGameSetup';
import { GameHUD } from './ui/GameHUD';
import { PauseModal } from './ui/PauseModal';
import { GameOverSummary } from './ui/GameOverSummary';
import { ImportWizard } from './ui/ImportWizard';
import { PackLibrary } from './ui/PackLibrary';
import { SettingsModal } from './ui/SettingsModal';
import { globalAudio } from './services/audio-service';
import { packRepository } from './services/pack-repository';

type Screen = 'hub' | 'pregame' | 'game' | 'library';

const DEFAULT_SETTINGS: PlayerGameSettings = {
  soundFxVolume: 0.8,
  musicVolume: 0.5,
  pronunciationEnabled: true,
  graphicsQuality: 'high',
  reducedMotion: false,
  showMeaningOnKill: true,
  skipTutorial: false,
  preferredDifficulty: 'normal',
};

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('hub');
  const [selectedPack, setSelectedPack] = useState<VocabularyPack | null>(null);
  const [settings, setSettings] = useState<PlayerGameSettings>(() => {
    try {
      const saved = localStorage.getItem('wd_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [showImportWizard, setShowImportWizard] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Engine instance & reactive snapshot
  const engineRef = useRef<WordDefenderEngine>(new WordDefenderEngine());
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => engineRef.current.getSnapshot());
  const [lastEvent, setLastEvent] = useState<GameEvent | null>(null);

  // Subscribe to engine state & events
  useEffect(() => {
    const engine = engineRef.current;
    const unsubSnapshot = engine.subscribe((snap) => setSnapshot(snap));
    const unsubEvent = engine.onEvent((ev) => {
      setLastEvent(ev);

      // Audio dispatch
      if (ev.type === 'SHOT_FIRED') {
        globalAudio.playLaserShot();
      } else if (ev.type === 'KEY_CORRECT') {
        globalAudio.playKeyTick();
      } else if (ev.type === 'KEY_WRONG') {
        globalAudio.playKeyWrong();
      } else if (ev.type === 'BLOCK_DESTROYED') {
        globalAudio.playExplosion();
        if (settings.pronunciationEnabled) {
          globalAudio.speakWord(ev.term);
        }
      } else if (ev.type === 'LIFE_LOST' || ev.type === 'BLOCK_MISSED') {
        globalAudio.playGroundImpact();
      } else if (ev.type === 'COMBO_MILESTONE') {
        globalAudio.playComboChime(ev.combo);
      } else if (ev.type === 'LEVEL_UP') {
        globalAudio.playLevelUp();
      } else if (ev.type === 'GAME_OVER') {
        // Save session record
        const snap = engine.getSnapshot();
        const record: GameSessionRecord = {
          id: `sess-${Date.now()}`,
          packId: snap.packId,
          packTitleSnapshot: snap.packTitle,
          mode: snap.mode,
          difficulty: snap.difficulty,
          score: snap.stats.score,
          maxCombo: snap.stats.maxCombo,
          accuracy: Math.round(
            (snap.stats.correctKeys / Math.max(1, snap.stats.correctKeys + snap.stats.incorrectKeys)) * 100
          ),
          correctKeys: snap.stats.correctKeys,
          incorrectKeys: snap.stats.incorrectKeys,
          wordsDestroyed: snap.stats.killed,
          wordsMissed: snap.stats.missed,
          reachedLevel: snap.stats.level,
          durationMs: snap.stats.elapsedPlayingMs,
          endedAt: new Date().toISOString(),
          missedWords: snap.stats.missedWordEntries.map((m) => ({
            term: m.term,
            meaningVi: m.meaningVi,
            ipa: m.ipa,
          })),
        };
        packRepository.saveSessionRecord(record);
      }
    });

    // 60FPS tick update loop
    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      engine.update(dt);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      unsubSnapshot();
      unsubEvent();
      engine.dispose();
    };
  }, [settings.pronunciationEnabled]);

  // Window Keydown listener for gameplay input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture typing if in an input/textarea or modal
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (screen !== 'game') return;

      // Unlock audio on first keypress
      globalAudio.unlock();

      if (e.key === 'Escape') {
        e.preventDefault();
        if (snapshot.phase === 'playing') {
          engineRef.current.pause();
        } else if (snapshot.phase === 'paused') {
          engineRef.current.resume();
        }
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        engineRef.current.cycleTarget();
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        engineRef.current.receiveCharacter(' ');
        return;
      }

      // Ignore modifier keys / control
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) {
        return;
      }

      if (e.key.length === 1) {
        engineRef.current.receiveCharacter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, snapshot.phase]);

  // Auto pause on tab blur/hidden per section 18.4
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && screen === 'game' && snapshot.phase === 'playing') {
        engineRef.current.pause();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [screen, snapshot.phase]);

  // Save settings in localStorage
  const handleUpdateSettings = (newSettings: PlayerGameSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('wd_settings', JSON.stringify(newSettings));
    } catch {
      // Ignore
    }
  };

  // Launch Game
  const handleStartGame = (mode: GameMode, difficulty: GameDifficulty) => {
    if (!selectedPack) return;
    globalAudio.unlock();
    setScreen('game');
    engineRef.current.start({
      pack: selectedPack,
      mode,
      difficulty,
    });
  };

  // Play Missed Words review game
  const handlePlayMissedWords = () => {
    if (!selectedPack || snapshot.stats.missedWordEntries.length === 0) return;
    const missedTerms = new Set(snapshot.stats.missedWordEntries.map((m) => m.term.toLowerCase()));
    const filteredEntries = selectedPack.entries.filter((e) => missedTerms.has(e.term.toLowerCase()));

    const reviewPack: VocabularyPack = {
      ...selectedPack,
      id: `review-${Date.now()}`,
      title: `Ôn Tập: ${selectedPack.title}`,
      entries: filteredEntries.length > 0 ? filteredEntries : selectedPack.entries,
    };

    setSelectedPack(reviewPack);
    handleStartGame('classic', 'normal');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas Layer */}
      <ThreeCanvas
        blocks={snapshot.blocks}
        lockedBlockId={snapshot.lockedBlockId}
        lastEvent={lastEvent}
        reducedMotion={settings.reducedMotion}
        quality={settings.graphicsQuality === 'auto' ? 'high' : settings.graphicsQuality}
      />

      {/* Screen: Game Hub */}
      {screen === 'hub' && (
        <GameHub
          onSelectPack={(pack) => {
            setSelectedPack(pack);
            setScreen('pregame');
          }}
          onOpenImportWizard={() => setShowImportWizard(true)}
          onOpenLibrary={() => setScreen('library')}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      )}

      {/* Screen: Pre-game Setup */}
      {screen === 'pregame' && selectedPack && (
        <PreGameSetup
          pack={selectedPack}
          onStartGame={handleStartGame}
          onBack={() => setScreen('hub')}
        />
      )}

      {/* Screen: Active Gameplay HUD Overlay */}
      {screen === 'game' && (
        <GameHUD
          snapshot={snapshot}
          onPause={() => engineRef.current.pause()}
          onOpenSettings={() => setShowSettingsModal(true)}
          onExit={() => {
            engineRef.current.pause();
            setScreen('hub');
          }}
          onTypeChar={(char) => engineRef.current.receiveCharacter(char)}
          onCycleTarget={() => engineRef.current.cycleTarget()}
        />
      )}

      {/* Screen: Pack Library */}
      {screen === 'library' && (
        <PackLibrary
          onSelectPackToPlay={(pack) => {
            setSelectedPack(pack);
            setScreen('pregame');
          }}
          onOpenImportWizard={() => setShowImportWizard(true)}
          onBack={() => setScreen('hub')}
        />
      )}

      {/* MODAL: Pause Screen */}
      {screen === 'game' && snapshot.phase === 'paused' && (
        <PauseModal
          onResume={() => engineRef.current.resume()}
          onRestart={() => engineRef.current.restart()}
          onOpenSettings={() => setShowSettingsModal(true)}
          onExit={() => setScreen('hub')}
        />
      )}

      {/* MODAL: Game Over Summary */}
      {screen === 'game' && snapshot.phase === 'game_over' && (
        <GameOverSummary
          snapshot={snapshot}
          onRestart={() => engineRef.current.restart()}
          onPlayMissedWords={handlePlayMissedWords}
          onExit={() => setScreen('hub')}
        />
      )}

      {/* MODAL: Excel/CSV Import Wizard */}
      {showImportWizard && (
        <ImportWizard
          onClose={() => setShowImportWizard(false)}
          onPackCreatedAndPlay={(pack) => {
            setShowImportWizard(false);
            setSelectedPack(pack);
            setScreen('pregame');
          }}
        />
      )}

      {/* MODAL: Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};
