import React, { useEffect, useRef, useState } from 'react';
import { FallingBlock, GameEvent } from '../types/game';
import { ThreeGameScene } from './ThreeGameScene';

interface ThreeCanvasProps {
  blocks: FallingBlock[];
  lockedBlockId: string | null;
  lastEvent: GameEvent | null;
  reducedMotion?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  blocks,
  lockedBlockId,
  lastEvent,
  reducedMotion = false,
  quality = 'high',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ThreeGameScene | null>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    if (!checkWebGLSupport()) {
      setHasWebGL(false);
      return;
    }

    if (containerRef.current && !sceneRef.current) {
      try {
        const scene = new ThreeGameScene(containerRef.current);
        scene.setReducedMotion(reducedMotion);
        scene.setQuality(quality);
        sceneRef.current = scene;
      } catch (err) {
        console.error('Failed to initialize WebGL scene:', err);
        setHasWebGL(false);
      }
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, []);

  // Update blocks and target lock
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateBlocks(blocks, lockedBlockId);
    }
  }, [blocks, lockedBlockId]);

  // Forward game events (shots, explosions, shockwaves)
  useEffect(() => {
    if (sceneRef.current && lastEvent) {
      sceneRef.current.handleGameEvent(lastEvent);
    }
  }, [lastEvent]);

  // Settings update
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setReducedMotion(reducedMotion);
      sceneRef.current.setQuality(quality);
    }
  }, [reducedMotion, quality]);

  if (!hasWebGL) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#071326',
        color: '#F6F9FF',
        padding: '24px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#FFB547' }}>
          Trình duyệt chưa hỗ trợ WebGL 3D
        </h2>
        <p style={{ maxWidth: '500px', color: '#8BA1C2', lineHeight: 1.6 }}>
          Vui lòng kích hoạt tính năng Tăng tốc phần cứng (Hardware Acceleration) trong cài đặt trình duyệt để trải nghiệm đồ họa 3D của Word Defender.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  );
};
