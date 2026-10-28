import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SKINS = [
  {
    id: 'coral',
    src: 'C:/Users/quang/.gemini/antigravity-ide/brain/d2768b1f-05df-479f-8522-c878295950a3/.user_uploaded/media_1793148967831.jpg',
    charMinY: 105,
    charMaxY: 320,
    cuts: [0, 180, 345, 510, 680, 850, 1024],
    row2MinY: 480,
    row2MaxY: 700,
    row2Cuts: [0, 360, 670, 1024],
  },
  {
    id: 'football',
    src: 'C:/Users/quang/.gemini/antigravity-ide/brain/d2768b1f-05df-479f-8522-c878295950a3/.user_uploaded/media_1793148975637.jpg',
    charMinY: 60,
    charMaxY: 265,
    cuts: [0, 180, 345, 510, 680, 850, 1024],
    row2MinY: 440,
    row2MaxY: 695,
    row2Cuts: [0, 360, 670, 1024],
  },
  {
    id: 'musician',
    src: 'C:/Users/quang/.gemini/antigravity-ide/brain/d2768b1f-05df-479f-8522-c878295950a3/.user_uploaded/media_1793148986058.jpg',
    charMinY: 90,
    charMaxY: 278,
    cuts: [0, 180, 345, 510, 680, 850, 1024],
    row2MinY: 430,
    row2MaxY: 695,
    row2Cuts: [0, 360, 670, 1024],
  },
  {
    id: 'hacker',
    src: 'C:/Users/quang/.gemini/antigravity-ide/brain/d2768b1f-05df-479f-8522-c878295950a3/.user_uploaded/media_1793148991731.jpg',
    charMinY: 80,
    charMaxY: 266,
    cuts: [0, 180, 345, 510, 680, 850, 1024],
    row2MinY: 430,
    row2MaxY: 695,
    row2Cuts: [0, 360, 670, 1024],
  },
  {
    id: 'shinobi',
    src: 'C:/Users/quang/.gemini/antigravity-ide/brain/d2768b1f-05df-479f-8522-c878295950a3/.user_uploaded/media_1793149004979.png',
    charMinY: 40,
    charMaxY: 198,
    cuts: [0, 180, 345, 510, 680, 850, 1024],
    row2MinY: 280,
    row2MaxY: 478,
    row2Cuts: [0, 360, 670, 1024],
  },
];

const POSE_NAMES = [
  'idle',          // slot 0: 1. Chính diện (Đứng)
  'fire_up_left',  // slot 1: 2. Nghiêng trái (Đứng)
  'fire_up_right', // slot 2: 3. Nghiêng phải (Đứng)
  'fire_up',       // slot 3: 4. Bắn lên (Chuẩn bị)
  'fire_left',     // slot 4: 5. Bắn trái (Chuẩn bị)
  'fire_right',    // slot 5: 6. Bắn phải (Chuẩn bị)
];

// Helper to remove outer background (black or transparent) using BFS flood fill from borders
function removeOuterBackground(srcRgba, w, h, threshold = 22) {
  const result = Buffer.from(srcRgba);
  const visited = new Uint8Array(w * h);
  const queue = [];

  function isBg(x, y) {
    const idx = (y * w + x) * 4;
    const r = result[idx], g = result[idx + 1], b = result[idx + 2], a = result[idx + 3];
    return a < 30 || (r < threshold && g < threshold && b < threshold);
  }

  // Border seeds
  for (let x = 0; x < w; x++) {
    if (isBg(x, 0)) { queue.push(x, 0); visited[0 * w + x] = 1; }
    if (isBg(x, h - 1)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
  }
  for (let y = 0; y < h; y++) {
    if (isBg(0, y)) { queue.push(0, y); visited[y * w + 0] = 1; }
    if (isBg(w - 1, y)) { queue.push(w - 1, y); visited[y * w + (w - 1)] = 1; }
  }

  let head = 0;
  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    result[(cy * w + cx) * 4 + 3] = 0; // Transparent

    for (let d = 0; d < 4; d++) {
      const nx = cx + dx[d], ny = cy + dy[d];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        if (!visited[nIdx] && isBg(nx, ny)) {
          visited[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Edge smoothing: Feather boundary pixels to prevent harsh dark fringing
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      if (result[idx + 3] === 0) continue;

      let hasTransparentNeighbor = false;
      for (let d = 0; d < 4; d++) {
        if (result[((y + dy[d]) * w + (x + dx[d])) * 4 + 3] === 0) {
          hasTransparentNeighbor = true;
          break;
        }
      }

      if (hasTransparentNeighbor) {
        const r = result[idx], g = result[idx + 1], b = result[idx + 2];
        const maxVal = Math.max(r, g, b);
        if (maxVal < 45) {
          result[idx + 3] = Math.min(255, Math.max(0, Math.round(((maxVal - 8) / 36) * 255)));
        }
      }
    }
  }

  return result;
}

// Find tight bounding box of non-transparent content
function findBounds(rgba, w, h) {
  let minX = w, maxX = -1, minY = h, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = rgba[(y * w + x) * 4 + 3];
      if (a > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return null;
  return { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

// Crop region from RGBA buffer
function cropRgba(srcRgba, srcW, srcH, x0, y0, cw, ch) {
  const dst = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const srcIdx = ((y0 + y) * srcW + (x0 + x)) * 4;
      const dstIdx = (y * cw + x) * 4;
      dst[dstIdx] = srcRgba[srcIdx];
      dst[dstIdx + 1] = srcRgba[srcIdx + 1];
      dst[dstIdx + 2] = srcRgba[srcIdx + 2];
      dst[dstIdx + 3] = srcRgba[srcIdx + 3];
    }
  }
  return dst;
}

// Fit tight sprite onto target 512x512 canvas aligned to bottom baseline 444
async function fitToCanvas(tightRgba, tightW, tightH, targetH = 349, baselineY = 444, canvasSize = 512) {
  const scale = targetH / tightH;
  const newW = Math.max(1, Math.round(tightW * scale));
  const newH = Math.max(1, Math.round(tightH * scale));

  const resizedBuffer = await sharp(tightRgba, { raw: { width: tightW, height: tightH, channels: 4 } })
    .resize(newW, newH, { fit: 'fill' })
    .raw()
    .toBuffer();

  const outCanvas = Buffer.alloc(canvasSize * canvasSize * 4, 0);
  const startX = Math.round(canvasSize / 2 - newW / 2);
  const startY = Math.round(baselineY - newH);

  for (let y = 0; y < newH; y++) {
    const canvasY = startY + y;
    if (canvasY < 0 || canvasY >= canvasSize) continue;
    for (let x = 0; x < newW; x++) {
      const canvasX = startX + x;
      if (canvasX < 0 || canvasX >= canvasSize) continue;

      const srcIdx = (y * newW + x) * 4;
      const dstIdx = (canvasY * canvasSize + canvasX) * 4;

      outCanvas[dstIdx] = resizedBuffer[srcIdx];
      outCanvas[dstIdx + 1] = resizedBuffer[srcIdx + 1];
      outCanvas[dstIdx + 2] = resizedBuffer[srcIdx + 2];
      outCanvas[dstIdx + 3] = resizedBuffer[srcIdx + 3];
    }
  }

  return sharp(outCanvas, { raw: { width: canvasSize, height: canvasSize, channels: 4 } }).png().toBuffer();
}

async function processAll() {
  console.log('Starting sprite generation for batch 3 (coral, football, musician, hacker, shinobi)...');

  for (const skin of SKINS) {
    console.log(`\n=== Processing ${skin.id} ===`);
    const img = sharp(skin.src);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

    const fullRgba = Buffer.alloc(info.width * info.height * 4);
    for (let i = 0; i < info.width * info.height; i++) {
      fullRgba[i * 4] = data[i * info.channels];
      fullRgba[i * 4 + 1] = data[i * info.channels + 1];
      fullRgba[i * 4 + 2] = data[i * info.channels + 2];
      fullRgba[i * 4 + 3] = info.channels === 4 ? data[i * info.channels + 3] : 255;
    }

    const srcDir = path.resolve(`./src/game/assets/${skin.id}`);
    const pubDir = path.resolve(`./public/assets/${skin.id}`);
    fs.mkdirSync(srcDir, { recursive: true });
    fs.mkdirSync(pubDir, { recursive: true });

    // 1. Process 6 Row 1 Poses
    for (let slot = 0; slot < 6; slot++) {
      const poseName = POSE_NAMES[slot];
      const x0 = skin.cuts[slot];
      const x1 = skin.cuts[slot + 1];
      const y0 = skin.charMinY;
      const y1 = skin.charMaxY;
      const cw = x1 - x0;
      const ch = y1 - y0;

      const rawCrop = cropRgba(fullRgba, info.width, info.height, x0, y0, cw, ch);
      const cleanRgba = removeOuterBackground(rawCrop, cw, ch);
      const bounds = findBounds(cleanRgba, cw, ch);

      if (!bounds) {
        console.error(`Error: No bounds for ${skin.id} slot ${slot}`);
        continue;
      }

      const tightCrop = cropRgba(cleanRgba, cw, ch, bounds.minX, bounds.minY, bounds.w, bounds.h);
      const finalPngBuffer = await fitToCanvas(tightCrop, bounds.w, bounds.h, 349, 444, 512);

      const fileName = `${skin.id}_${poseName}.png`;
      fs.writeFileSync(path.join(srcDir, fileName), finalPngBuffer);
      fs.writeFileSync(path.join(pubDir, fileName), finalPngBuffer);
      console.log(`  -> Saved ${fileName} (tight: ${bounds.w}x${bounds.h})`);
    }

    // 2. Process Icon from Row 2, Slot 2 ("Trang bị hoàn chỉnh")
    const iconX0 = skin.row2Cuts[2];
    const iconX1 = skin.row2Cuts[3];
    const iconY0 = skin.row2MinY;
    const iconY1 = skin.row2MaxY;
    const iconCw = iconX1 - iconX0;
    const iconCh = iconY1 - iconY0;

    const rawIconCrop = cropRgba(fullRgba, info.width, info.height, iconX0, iconY0, iconCw, iconCh);
    const cleanIconRgba = removeOuterBackground(rawIconCrop, iconCw, iconCh);
    const iconBounds = findBounds(cleanIconRgba, iconCw, iconCh);

    if (iconBounds) {
      const tightIcon = cropRgba(cleanIconRgba, iconCw, iconCh, iconBounds.minX, iconBounds.minY, iconBounds.w, iconBounds.h);
      const maxDim = Math.max(iconBounds.w, iconBounds.h);
      const targetDim = 114;
      const iconScale = targetDim / maxDim;
      const iconW = Math.round(iconBounds.w * iconScale);
      const iconH = Math.round(iconBounds.h * iconScale);

      const resizedIcon = await sharp(tightIcon, { raw: { width: iconBounds.w, height: iconBounds.h, channels: 4 } })
        .resize(iconW, iconH, { fit: 'fill' })
        .raw()
        .toBuffer();

      const iconCanvas = Buffer.alloc(128 * 128 * 4, 0);
      const offX = Math.round((128 - iconW) / 2);
      const offY = Math.round((128 - iconH) / 2);

      for (let y = 0; y < iconH; y++) {
        for (let x = 0; x < iconW; x++) {
          const sIdx = (y * iconW + x) * 4;
          const dIdx = ((offY + y) * 128 + (offX + x)) * 4;
          iconCanvas[dIdx] = resizedIcon[sIdx];
          iconCanvas[dIdx + 1] = resizedIcon[sIdx + 1];
          iconCanvas[dIdx + 2] = resizedIcon[sIdx + 2];
          iconCanvas[dIdx + 3] = resizedIcon[sIdx + 3];
        }
      }

      const iconPng = await sharp(iconCanvas, { raw: { width: 128, height: 128, channels: 4 } }).png().toBuffer();
      const iconName = `outfit_${skin.id}_icon.png`;
      fs.writeFileSync(path.join(srcDir, iconName), iconPng);
      fs.writeFileSync(path.join(pubDir, iconName), iconPng);
      console.log(`  -> Saved icon: ${iconName}`);
    }
  }

  console.log('\nAll 5 batch-3 skins extracted successfully!');
}

processAll().catch(console.error);
