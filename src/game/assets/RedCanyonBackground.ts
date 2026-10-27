/**
 * Red Canyon (Hẻm Núi Đỏ) Background Renderer
 *
 * Implements a hand-drawn 2D doodle / sketchbook desert canyon aesthetic:
 * - Terracotta / brick-orange graph paper with subtle low-contrast grid lines
 * - Distant layered canyon mesas and geological rock strata
 * - Hand-drawn irregular dark-rust cliff silhouettes flanking the left and right edges
 *   (framing the viewport without obstructing the central gameplay lanes)
 * - Doodle details: desert rock ledges, tiny cactus silhouette, hanging lantern with warm glow
 * - Gentle drifting sand/dust motes (respecting prefers-reduced-motion)
 * - Direct Canvas 2D rendering for maximum reliability and immediate response
 */

export interface RedCanyonRenderOptions {
  reduceMotion?: boolean;
  defenseLineY?: number;
}

// Deterministic pseudo-random seed helper for repeatable hand-drawn jitter
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Fixed pseudo-random dust mote descriptors (constant across frames)
interface DustMote {
  relX: number;
  relY: number;
  size: number;
  speed: number;
  wobbleFreq: number;
  wobbleAmp: number;
  alpha: number;
}

const DUST_MOTES: DustMote[] = Array.from({ length: 16 }, (_, i) => ({
  relX: pseudoRandom(i * 4.3 + 1),
  relY: pseudoRandom(i * 7.1 + 2),
  size: 1.2 + pseudoRandom(i * 2.9) * 2.2,
  speed: 0.015 + pseudoRandom(i * 3.7) * 0.025,
  wobbleFreq: 0.001 + pseudoRandom(i * 5.1) * 0.002,
  wobbleAmp: 4 + pseudoRandom(i * 6.2) * 8,
  alpha: 0.25 + pseudoRandom(i * 8.4) * 0.35,
}));

/**
 * Main draw call for Red Canyon.
 * Invoked during renderCanvas when activeMap === 'red-canyon'.
 */
export function drawRedCanyonBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  visualScale: number,
  timeMs: number,
  options: RedCanyonRenderOptions = {}
): void {
  if (width <= 0 || height <= 0) return;

  // -------------------------------------------------------------
  // 1. BASE PAPER GRADIENT (Terracotta / Earthy Desert Orange)
  // -------------------------------------------------------------
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#E88B60');    // Warm desert sky tint at top
  bgGrad.addColorStop(0.35, '#DE764A'); // Saturated terracotta midground
  bgGrad.addColorStop(0.75, '#CE5D36'); // Deep clay tone
  bgGrad.addColorStop(1, '#BD4D2A');    // Earthy red-brown base at bottom
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // -------------------------------------------------------------
  // 2. NOTEBOOK GRID OVERLAY (Subtle, low-contrast brick/earth ink)
  // -------------------------------------------------------------
  const gridSize = Math.max(12, 14 * visualScale);
  ctx.strokeStyle = 'rgba(105, 30, 16, 0.16)';
  ctx.lineWidth = Math.max(0.5, 0.65 * visualScale);
  ctx.beginPath();
  for (let x = 0; x <= width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // -------------------------------------------------------------
  // 3. CANYON SUN & DESERT HAZE
  // -------------------------------------------------------------
  const sunX = width * 0.52;
  const sunY = height * 0.16;
  const sunRadius = Math.max(28, 48 * visualScale);

  // Outer warm glow
  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 2.5);
  sunGlow.addColorStop(0, 'rgba(255, 238, 205, 0.32)');
  sunGlow.addColorStop(0.5, 'rgba(255, 225, 180, 0.14)');
  sunGlow.addColorStop(1, 'rgba(255, 210, 160, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Stylized hand-drawn doodle sun disk
  ctx.fillStyle = 'rgba(255, 246, 228, 0.45)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(125, 45, 24, 0.35)';
  ctx.lineWidth = Math.max(1, 1.5 * visualScale);
  ctx.beginPath();
  // Wobbly doodle circle outline for sun
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const wobble = (pseudoRandom(i * 1.7) - 0.5) * 2.5 * visualScale;
    const r = sunRadius + wobble;
    const px = sunX + Math.cos(angle) * r;
    const py = sunY + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // -------------------------------------------------------------
  // 4. DISTANT MESA PLATEAUS (Layer 1 - Furthest, Low Contrast)
  // -------------------------------------------------------------
  const farMesaY = height * 0.34;
  ctx.fillStyle = 'rgba(178, 80, 48, 0.42)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, farMesaY + 20);

  // Generate flat-top mesas across width
  const farSegments = 8;
  const farSegW = width / farSegments;
  for (let i = 0; i < farSegments; i++) {
    const sx = i * farSegW;
    const ex = (i + 1) * farSegW;
    const isMesa = i % 2 === 1;
    const mesaHeight = isMesa ? farMesaY - (25 + (i % 3) * 12) * visualScale : farMesaY;
    
    ctx.lineTo(sx + farSegW * 0.15, mesaHeight);
    ctx.lineTo(ex - farSegW * 0.15, mesaHeight);
    ctx.lineTo(ex, farMesaY + (pseudoRandom(i * 3.1) - 0.5) * 15 * visualScale);
  }
  ctx.lineTo(width, farMesaY + 20);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // -------------------------------------------------------------
  // 5. MIDGROUND CANYON RIDGES & BUTTES (Layer 2)
  // -------------------------------------------------------------
  const midMesaY = height * 0.48;
  ctx.fillStyle = 'rgba(152, 56, 32, 0.65)';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, midMesaY + 15);

  const midSegments = 6;
  const midSegW = width / midSegments;
  for (let i = 0; i < midSegments; i++) {
    const sx = i * midSegW;
    const mx = sx + midSegW * 0.5;
    const ex = (i + 1) * midSegW;
    const ridgeH = midMesaY - (38 + ((i * 17) % 35)) * visualScale;

    // Stepped canyon cliff profile
    ctx.lineTo(sx + midSegW * 0.2, ridgeH + 18 * visualScale);
    ctx.lineTo(sx + midSegW * 0.35, ridgeH);
    ctx.lineTo(mx + midSegW * 0.15, ridgeH);
    ctx.lineTo(ex - midSegW * 0.2, ridgeH + 24 * visualScale);
    ctx.lineTo(ex, midMesaY + 10);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Doodle ink outline along midground ridge
  ctx.strokeStyle = 'rgba(74, 22, 14, 0.45)';
  ctx.lineWidth = Math.max(1, 1.25 * visualScale);
  ctx.beginPath();
  ctx.moveTo(0, midMesaY + 15);
  for (let i = 0; i < midSegments; i++) {
    const sx = i * midSegW;
    const mx = sx + midSegW * 0.5;
    const ex = (i + 1) * midSegW;
    const ridgeH = midMesaY - (38 + ((i * 17) % 35)) * visualScale;
    ctx.lineTo(sx + midSegW * 0.2, ridgeH + 18 * visualScale);
    ctx.lineTo(sx + midSegW * 0.35, ridgeH);
    ctx.lineTo(mx + midSegW * 0.15, ridgeH);
    ctx.lineTo(ex - midSegW * 0.2, ridgeH + 24 * visualScale);
    ctx.lineTo(ex, midMesaY + 10);
  }
  ctx.stroke();

  // Subtle horizontal strata lines across midground
  ctx.strokeStyle = 'rgba(215, 115, 78, 0.28)';
  ctx.lineWidth = Math.max(0.75, 1 * visualScale);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const lineY = midMesaY + (i * 22 + 8) * visualScale;
    if (lineY < height * 0.72) {
      ctx.moveTo(width * 0.15, lineY);
      ctx.lineTo(width * 0.85, lineY);
    }
  }
  ctx.stroke();

  // -------------------------------------------------------------
  // 6. FOREGROUND FLANKING CLIFFS (Layer 3 - Left & Right Silhouettes)
  // Deep dark rust/charcoal brown: #281311
  // Dynamically sized to never encroach on the central gameplay area.
  // -------------------------------------------------------------
  const isNarrowScreen = width < 600;
  const maxCliffW = isNarrowScreen
    ? Math.min(width * 0.08, 38)
    : Math.min(width * 0.14, Math.max(50, 130 * visualScale));

  // --- LEFT CLIFF WALL ---
  ctx.fillStyle = '#281311';
  ctx.beginPath();
  ctx.moveTo(0, 0);

  const leftPoints: Array<{ x: number; y: number }> = [
    { x: maxCliffW * 0.65, y: 0 },
    { x: maxCliffW * 0.75, y: height * 0.08 },
    { x: maxCliffW * 0.55, y: height * 0.16 },
    { x: maxCliffW * 0.85, y: height * 0.25 }, // Rocky ledge
    { x: maxCliffW * 0.5, y: height * 0.34 },
    { x: maxCliffW * 0.95, y: height * 0.44 }, // Stepped outcrop
    { x: maxCliffW * 0.65, y: height * 0.54 },
    { x: maxCliffW * 0.8, y: height * 0.64 },  // Lower ledge
    { x: maxCliffW * 0.5, y: height * 0.75 },
    { x: maxCliffW * 0.75, y: height * 0.86 },
    { x: maxCliffW * 0.6, y: height },
    { x: 0, y: height },
  ];

  leftPoints.forEach((pt, idx) => {
    if (idx === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.closePath();
  ctx.fill();

  // Left cliff hand-drawn ink edge
  ctx.strokeStyle = '#140605';
  ctx.lineWidth = Math.max(1.5, 2 * visualScale);
  ctx.beginPath();
  leftPoints.forEach((pt, idx) => {
    if (idx === 0) ctx.moveTo(pt.x, pt.y);
    else if (idx < leftPoints.length - 1) ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();

  // --- RIGHT CLIFF WALL ---
  ctx.fillStyle = '#281311';
  ctx.beginPath();
  ctx.moveTo(width, 0);

  const rightPoints: Array<{ x: number; y: number }> = [
    { x: width - maxCliffW * 0.7, y: 0 },
    { x: width - maxCliffW * 0.55, y: height * 0.09 },
    { x: width - maxCliffW * 0.9, y: height * 0.18 }, // Upper rock spur
    { x: width - maxCliffW * 0.6, y: height * 0.28 },
    { x: width - maxCliffW * 0.8, y: height * 0.38 },
    { x: width - maxCliffW * 0.5, y: height * 0.48 },
    { x: width - maxCliffW * 0.95, y: height * 0.58 }, // Mid-lower ledge
    { x: width - maxCliffW * 0.65, y: height * 0.7 },
    { x: width - maxCliffW * 0.85, y: height * 0.82 },
    { x: width - maxCliffW * 0.6, y: height },
    { x: width, y: height },
  ];

  rightPoints.forEach((pt, idx) => {
    if (idx === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.closePath();
  ctx.fill();

  // Right cliff hand-drawn ink edge
  ctx.strokeStyle = '#140605';
  ctx.lineWidth = Math.max(1.5, 2 * visualScale);
  ctx.beginPath();
  rightPoints.forEach((pt, idx) => {
    if (idx === 0) ctx.moveTo(pt.x, pt.y);
    else if (idx < rightPoints.length - 1) ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();

  // -------------------------------------------------------------
  // 7. CLIFF DOODLE TEXTURES & DECORATIVE DETAILS
  // -------------------------------------------------------------
  ctx.strokeStyle = 'rgba(74, 32, 28, 0.85)';
  ctx.lineWidth = Math.max(1, 1.25 * visualScale);

  // Left cliff internal rock strata hatching
  ctx.beginPath();
  ctx.moveTo(0, height * 0.12);
  ctx.lineTo(maxCliffW * 0.45, height * 0.13);

  ctx.moveTo(0, height * 0.29);
  ctx.lineTo(maxCliffW * 0.6, height * 0.3);

  ctx.moveTo(0, height * 0.48);
  ctx.lineTo(maxCliffW * 0.55, height * 0.49);

  ctx.moveTo(0, height * 0.68);
  ctx.lineTo(maxCliffW * 0.5, height * 0.69);

  // Right cliff internal rock strata hatching
  ctx.moveTo(width, height * 0.14);
  ctx.lineTo(width - maxCliffW * 0.5, height * 0.15);

  ctx.moveTo(width, height * 0.32);
  ctx.lineTo(width - maxCliffW * 0.58, height * 0.33);

  ctx.moveTo(width, height * 0.52);
  ctx.lineTo(width - maxCliffW * 0.6, height * 0.53);

  ctx.moveTo(width, height * 0.74);
  ctx.lineTo(width - maxCliffW * 0.45, height * 0.75);
  ctx.stroke();

  // Left Cliff: Small hand-drawn silhouette cactus on ledge at y = 0.25 (if space allows)
  if (maxCliffW >= 36) {
    const cBaseX = maxCliffW * 0.65;
    const cBaseY = height * 0.25;
    const cScale = Math.min(1.2, Math.max(0.65, visualScale * 0.8));

    ctx.fillStyle = '#1C0C0B';
    ctx.strokeStyle = '#120504';
    ctx.lineWidth = 1;

    // Cactus trunk
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(cBaseX - 3.5 * cScale, cBaseY - 26 * cScale, 7 * cScale, 26 * cScale, 3.5 * cScale);
    } else {
      ctx.rect(cBaseX - 3.5 * cScale, cBaseY - 26 * cScale, 7 * cScale, 26 * cScale);
    }
    ctx.fill();
    ctx.stroke();

    // Left arm
    ctx.beginPath();
    ctx.moveTo(cBaseX - 2 * cScale, cBaseY - 14 * cScale);
    ctx.lineTo(cBaseX - 9 * cScale, cBaseY - 14 * cScale);
    ctx.lineTo(cBaseX - 9 * cScale, cBaseY - 22 * cScale);
    ctx.lineWidth = 4 * cScale;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1C0C0B';
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(cBaseX + 2 * cScale, cBaseY - 10 * cScale);
    ctx.lineTo(cBaseX + 8 * cScale, cBaseY - 10 * cScale);
    ctx.lineTo(cBaseX + 8 * cScale, cBaseY - 17 * cScale);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  // Right Cliff: Hanging vintage lantern on rock ledge at y = 0.58
  if (maxCliffW >= 36) {
    const lX = width - maxCliffW * 0.82;
    const lY = height * 0.58;
    const lScale = Math.min(1.2, Math.max(0.65, visualScale * 0.8));

    // Wooden / iron bracket
    ctx.strokeStyle = '#140605';
    ctx.lineWidth = Math.max(1.5, 2 * lScale);
    ctx.beginPath();
    ctx.moveTo(width - maxCliffW * 0.6, lY);
    ctx.lineTo(lX, lY);
    ctx.lineTo(lX, lY + 6 * lScale);
    ctx.stroke();

    // Warm amber lantern glow
    const lanternGlow = ctx.createRadialGradient(lX, lY + 15 * lScale, 2 * lScale, lX, lY + 15 * lScale, 28 * lScale);
    lanternGlow.addColorStop(0, 'rgba(255, 220, 110, 0.7)');
    lanternGlow.addColorStop(0.4, 'rgba(255, 175, 60, 0.28)');
    lanternGlow.addColorStop(1, 'rgba(255, 140, 40, 0)');
    ctx.fillStyle = lanternGlow;
    ctx.beginPath();
    ctx.arc(lX, lY + 15 * lScale, 28 * lScale, 0, Math.PI * 2);
    ctx.fill();

    // Lantern body
    ctx.fillStyle = '#FFE082';
    ctx.strokeStyle = '#140605';
    ctx.lineWidth = 1.25 * lScale;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(lX - 4 * lScale, lY + 8 * lScale, 8 * lScale, 12 * lScale, 2 * lScale);
    } else {
      ctx.rect(lX - 4 * lScale, lY + 8 * lScale, 8 * lScale, 12 * lScale);
    }
    ctx.fill();
    ctx.stroke();

    // Lantern cap & bottom
    ctx.fillStyle = '#1F0D0B';
    ctx.fillRect(lX - 5.5 * lScale, lY + 6 * lScale, 11 * lScale, 2.5 * lScale);
    ctx.fillRect(lX - 4 * lScale, lY + 20 * lScale, 8 * lScale, 2.5 * lScale);
  }

  // -------------------------------------------------------------
  // 8. DEFENSIVE LINE (Dashed desert ink / chalk line near Ponpi)
  // -------------------------------------------------------------
  if (typeof options.defenseLineY === 'number') {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 230, 200, 0.55)';
    ctx.lineWidth = Math.max(1.5, 2.5 * visualScale);
    ctx.setLineDash([Math.max(6, 9 * visualScale), Math.max(5, 7 * visualScale)]);
    ctx.beginPath();
    ctx.moveTo(maxCliffW * 0.65, options.defenseLineY);
    ctx.lineTo(width - maxCliffW * 0.65, options.defenseLineY);
    ctx.stroke();

    // Subtle darker ink dash parallel
    ctx.strokeStyle = 'rgba(60, 18, 12, 0.65)';
    ctx.lineWidth = Math.max(1, 1.5 * visualScale);
    ctx.beginPath();
    ctx.moveTo(maxCliffW * 0.65, options.defenseLineY + 1.5);
    ctx.lineTo(width - maxCliffW * 0.65, options.defenseLineY + 1.5);
    ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 9. DUST MOTES (Dynamic particles, if motion not reduced)
  // -------------------------------------------------------------
  if (!options.reduceMotion) {
    ctx.save();
    ctx.fillStyle = '#FFECC8';

    for (let i = 0; i < DUST_MOTES.length; i++) {
      const mote = DUST_MOTES[i];
      const progress = (mote.relX + (timeMs * mote.speed * 0.001)) % 1;
      const x = progress * width;
      const y = (mote.relY * height) + Math.sin(timeMs * mote.wobbleFreq + i) * mote.wobbleAmp;

      if (x > width * 0.12 && x < width * 0.88) {
        ctx.globalAlpha = mote.alpha;
        ctx.beginPath();
        ctx.arc(x, y, mote.size * visualScale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
