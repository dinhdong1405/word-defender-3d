const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const USER_UPLOADS = 'C:/Users/quang/.gemini/antigravity-ide/brain/d2768b1f-05df-479f-8522-c878295950a3/.user_uploaded/';
const PUBLIC_ITEMS = path.join(__dirname, '../public/assets/items');
const SRC_ITEMS = path.join(__dirname, '../src/game/assets/items');

[PUBLIC_ITEMS, SRC_ITEMS].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveBoth(name, buffer) {
  fs.writeFileSync(path.join(PUBLIC_ITEMS, name), buffer);
  fs.writeFileSync(path.join(SRC_ITEMS, name), buffer);
  console.log(`Saved: ${name} (${buffer.length} bytes)`);
}

// 1. Shuriken (media_1793107071983.png)
async function processShuriken() {
  const srcPath = path.join(USER_UPLOADS, 'media_1793107071983.png');
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Flood fill outer white
  const visited = new Uint8Array(w * h);
  const queue = [];

  function isWhite(x, y) {
    const idx = (y * w + x) * 4;
    return data[idx] >= 235 && data[idx + 1] >= 235 && data[idx + 2] >= 235;
  }

  // Border seeds
  for (let x = 0; x < w; x++) {
    queue.push([x, 0]);
    queue.push([x, h - 1]);
  }
  for (let y = 0; y < h; y++) {
    queue.push([0, y]);
    queue.push([w - 1, y]);
  }
  // Center hole seed around (60, 59)
  queue.push([60, 59]);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const pidx = y * w + x;
    if (visited[pidx]) continue;
    visited[pidx] = 1;

    if (isWhite(x, y)) {
      const bidx = pidx * 4;
      data[bidx + 3] = 0; // Transparent
      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }
  }

  const clean = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await saveBoth('bullet_shuriken.png', clean);

  // Icon: with cute sticker border
  const icon = await sharp(clean)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await saveBoth('bullet_shuriken_icon.png', icon);
}

// 2. Kunai (media_1793107084044.png)
async function processKunai() {
  const srcPath = path.join(USER_UPLOADS, 'media_1793107084044.png');
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  function isBg(x, y) {
    const idx = (y * w + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const dist = Math.hypot(r - 235, g - 222, b - 208);
    return dist < 32;
  }

  const visited = new Uint8Array(w * h);
  const queue = [];

  for (let x = 0; x < w; x++) {
    queue.push([x, 0]);
    queue.push([x, h - 1]);
  }
  for (let y = 0; y < h; y++) {
    queue.push([0, y]);
    queue.push([w - 1, y]);
  }
  // Ring hole seed
  queue.push([40, 24]);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const pidx = y * w + x;
    if (visited[pidx]) continue;
    visited[pidx] = 1;

    if (isBg(x, y)) {
      data[pidx * 4 + 3] = 0;
      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }
  }

  // Flip vertically so the sharp pointy tip points UP (0° heading towards enemy target)
  const flipped = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .flip()
    .trim()
    .resize(96, 214, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await saveBoth('bullet_kunai.png', flipped);

  // Icon: rotated 35 deg for sticker look
  const icon = await sharp(flipped)
    .rotate(35, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await saveBoth('bullet_kunai_icon.png', icon);
}

// 3. Soccer Ball (media_1793107116858.png)
async function processSoccer() {
  const srcPath = path.join(USER_UPLOADS, 'media_1793107116858.png');
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = (w / 2) - 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const d = Math.hypot(x - cx, y - cy);
      if (d > r) {
        data[idx + 3] = 0;
      } else if (d > r - 1.5) {
        // antialias edge
        const alpha = Math.max(0, Math.min(1, (r - d) / 1.5));
        data[idx + 3] = Math.round(data[idx + 3] * alpha);
      }
    }
  }

  const clean = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await saveBoth('bullet_soccer.png', clean);

  const icon = await sharp(clean)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await saveBoth('bullet_soccer_icon.png', icon);
}

// 4. Basketball (media_1793107136210.jpg)
async function processBasketball() {
  const srcPath = path.join(USER_UPLOADS, 'media_1793107136210.jpg');
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const cx = 511.5;
  const cy = 514.5;
  const r = 401;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const d = Math.hypot(x - cx, y - cy);
      if (d > r) {
        data[idx + 3] = 0;
      } else if (d > r - 2) {
        const alpha = Math.max(0, Math.min(1, (r - d) / 2));
        data[idx + 3] = Math.round(data[idx + 3] * alpha);
      }
    }
  }

  const clean = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await saveBoth('bullet_basketball.png', clean);

  const icon = await sharp(clean)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await saveBoth('bullet_basketball_icon.png', icon);
}

// 5. Default Pink Candy Orb Icon
async function processDefaultOrb() {
  const svg = `
  <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad" cx="38%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="28%" stop-color="#FF9BBB" />
        <stop offset="75%" stop-color="#E06C96" />
        <stop offset="100%" stop-color="#B84973" />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="3" dy="4" stdDeviation="1.5" flood-color="#25232B" flood-opacity="0.35" />
      </filter>
    </defs>
    <!-- Background sticker circle -->
    <circle cx="64" cy="64" r="52" fill="#FFFFFF" stroke="#25232B" stroke-width="5" filter="url(#shadow)" />
    <!-- Pink Candy Orb -->
    <circle cx="64" cy="64" r="42" fill="url(#grad)" stroke="#25232B" stroke-width="4.5" />
    <!-- Glossy Highlight -->
    <ellipse cx="52" cy="48" rx="14" ry="9" fill="#FFFFFF" opacity="0.8" transform="rotate(-25 52 48)" />
    <circle cx="76" cy="74" r="4" fill="#FFFFFF" opacity="0.75" />
    <!-- Sparkle Stars -->
    <path d="M 88 36 Q 96 36 96 28 Q 96 36 104 36 Q 96 36 96 44 Q 96 36 88 36 Z" fill="#FFD700" stroke="#25232B" stroke-width="1.8" />
  </svg>
  `;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  await saveBoth('bullet_default_icon.png', buf);
}

async function run() {
  console.log('Processing all new bullet assets...');
  await processShuriken();
  await processKunai();
  await processSoccer();
  await processBasketball();
  await processDefaultOrb();
  console.log('All bullet assets created successfully!');
}

run().catch(console.error);
