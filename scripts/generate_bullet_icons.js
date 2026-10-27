import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

fs.mkdirSync('./public/assets/items', { recursive: true });
fs.mkdirSync('./src/game/assets/items', { recursive: true });

// 1. Tilted launch version for missile icon (dynamic 30 degree tilt)
async function generateMissileIcon() {
  const missilePath = './public/assets/items/bullet_missile.png';
  if (!fs.existsSync(missilePath)) return;

  const rotated = await sharp(missilePath)
    .rotate(-35, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const meta = await sharp(rotated).metadata();
  const maxDim = Math.max(meta.width, meta.height);
  const scale = 110 / maxDim;
  const targetW = Math.round(meta.width * scale);
  const targetH = Math.round(meta.height * scale);

  const resized = await sharp(rotated)
    .resize(targetW, targetH)
    .toBuffer();

  const canvas = await sharp({
    create: {
      width: 128,
      height: 128,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((128 - targetW) / 2),
        top: Math.round((128 - targetH) / 2),
      },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync('./public/assets/items/bullet_missile_icon.png', canvas);
  fs.writeFileSync('./src/game/assets/items/bullet_missile_icon.png', canvas);
  console.log('Generated bullet_missile_icon.png');
}

// 2. Laser Pulse Icon
const laserSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="laserGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E0F7FA" stop-opacity="0.9"/>
      <stop offset="40%" stop-color="#00E5FF" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#00B0FF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="laserBeam" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0091EA"/>
      <stop offset="50%" stop-color="#00E5FF"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <!-- Outer glow -->
  <circle cx="64" cy="64" r="56" fill="url(#laserGlow)"/>
  
  <!-- Electric sparks -->
  <path d="M24 104 L44 80 L36 78 L58 54" stroke="#00E5FF" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M72 74 L84 60 L78 58 L96 42" stroke="#80D8FF" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M48 42 L60 30 L54 28 L74 16" stroke="#00E5FF" stroke-width="2.5" stroke-linecap="round" fill="none"/>

  <!-- Energy rings -->
  <ellipse cx="64" cy="64" rx="32" ry="14" transform="rotate(-45 64 64)" stroke="#80D8FF" stroke-width="3" fill="none" opacity="0.8"/>
  <ellipse cx="64" cy="64" rx="20" ry="9" transform="rotate(-45 64 64)" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.9"/>

  <!-- Main Energy Bolt -->
  <path d="M28 100 L96 32 C104 24 106 18 100 24 C94 30 84 38 84 38 L38 84 Z" fill="url(#laserBeam)" stroke="#25232B" stroke-width="3" stroke-linejoin="round"/>
  
  <!-- Core White Flash -->
  <circle cx="86" cy="42" r="10" fill="#FFFFFF"/>
  <circle cx="86" cy="42" r="6" fill="#CCFFFF"/>
  <path d="M86 26 L86 58 M70 42 L102 42" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`;

// 3. Fireball Meteor Icon
const fireballSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="fireCore" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="25%" stop-color="#FFEE58"/>
      <stop offset="60%" stop-color="#FF9800"/>
      <stop offset="100%" stop-color="#E65100"/>
    </radialGradient>
    <linearGradient id="flameTail" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF5722"/>
      <stop offset="50%" stop-color="#E64A19"/>
      <stop offset="100%" stop-color="#BF360C" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <!-- Tail flames -->
  <path d="M30 98 Q42 82 50 74 Q32 80 20 88 Q40 68 56 60 Q42 62 28 68 Q52 48 70 46" fill="url(#flameTail)"/>
  <path d="M40 108 C36 94 48 84 58 76 C46 82 36 90 32 100 Z" fill="#FF5722" stroke="#25232B" stroke-width="2"/>
  <path d="M18 90 C28 80 38 72 48 64 C36 68 24 76 14 84 Z" fill="#FF9800" stroke="#25232B" stroke-width="1.5"/>

  <!-- Ember sparks -->
  <circle cx="20" cy="106" r="3.5" fill="#FFC107"/>
  <circle cx="34" cy="116" r="2.5" fill="#FF9800"/>
  <circle cx="12" cy="74" r="3" fill="#FF5722"/>

  <!-- Main Fireball Outer Silhouette -->
  <circle cx="76" cy="52" r="34" fill="#FF5722" stroke="#25232B" stroke-width="3"/>

  <!-- Flame Swirls -->
  <path d="M50 68 Q64 88 88 80 Q110 70 104 46 Q98 22 74 24 Q50 26 48 48 Z" fill="#FFA726" stroke="#25232B" stroke-width="2.5"/>
  
  <!-- Glowing Sun Core -->
  <circle cx="78" cy="50" r="20" fill="url(#fireCore)" stroke="#25232B" stroke-width="2.5"/>
  <ellipse cx="73" cy="45" rx="7" ry="5" fill="#FFFFFF" opacity="0.85"/>
</svg>
`;

// 4. Crystal Shard Icon
const crystalSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E1BEE7"/>
      <stop offset="100%" stop-color="#CE93D8"/>
    </linearGradient>
    <linearGradient id="cLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BA68C8"/>
      <stop offset="100%" stop-color="#8E24AA"/>
    </linearGradient>
    <linearGradient id="cRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#AB47BC"/>
      <stop offset="100%" stop-color="#6A1B9A"/>
    </linearGradient>
    <linearGradient id="cCenter" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#E1BEE7"/>
      <stop offset="100%" stop-color="#BA68C8"/>
    </linearGradient>
  </defs>

  <!-- Sparkle aura -->
  <circle cx="64" cy="64" r="50" fill="#F3E5F5" opacity="0.5"/>
  <path d="M64 12 L64 32 M64 96 L64 116 M12 64 L32 64 M96 64 L116 64" stroke="#BA68C8" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="28" cy="32" r="3" fill="#BA68C8"/>
  <circle cx="100" cy="94" r="3" fill="#BA68C8"/>

  <!-- Diamond crystal body -->
  <!-- Facet Left -->
  <polygon points="64,18 36,44 48,104 64,114" fill="url(#cLeft)" stroke="#25232B" stroke-width="3" stroke-linejoin="round"/>
  <!-- Facet Right -->
  <polygon points="64,18 92,44 80,104 64,114" fill="url(#cRight)" stroke="#25232B" stroke-width="3" stroke-linejoin="round"/>
  <!-- Facet Center Highlight -->
  <polygon points="64,18 50,44 64,96 78,44" fill="url(#cCenter)" stroke="#25232B" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Table facet at top -->
  <polygon points="64,18 52,36 76,36" fill="#FFFFFF" stroke="#25232B" stroke-width="2"/>

  <!-- Gleam spark -->
  <path d="M52 36 L52 24 L56 36 L68 36 L58 42 L62 54 L52 46 L42 54 L46 42 L36 36 L48 36 Z" fill="#FFFFFF" opacity="0.9"/>
</svg>
`;

// 5. Ice Frost Slow Icon
const slowSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="iceAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E0F7FA"/>
      <stop offset="60%" stop-color="#80DEEA" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#00BCD4" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Ice Aura -->
  <circle cx="64" cy="64" r="54" fill="url(#iceAura)"/>
  
  <!-- Rotating Ice Crystal Base -->
  <polygon points="64,16 98,36 98,92 64,112 30,92 30,36" fill="#B2EBF2" stroke="#25232B" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="64,28 88,44 88,84 64,100 40,84 40,44" fill="#E0F7FA" stroke="#25232B" stroke-width="2.5" stroke-linejoin="round"/>

  <!-- Snowflake arms -->
  <path d="M64 24 L64 104 M24 64 L104 64 M36 36 L92 92 M36 92 L92 36" stroke="#0097A7" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Snowflake branches -->
  <path d="M64 36 L56 44 M64 36 L72 44" stroke="#0097A7" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M64 92 L56 84 M64 92 L72 84" stroke="#0097A7" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M36 64 L44 56 M36 64 L44 72" stroke="#0097A7" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M92 64 L84 56 M92 64 L84 72" stroke="#0097A7" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Diamond Center Gem -->
  <polygon points="64,48 78,64 64,80 50,64" fill="#FFFFFF" stroke="#25232B" stroke-width="2.5"/>
  <circle cx="64" cy="64" r="4" fill="#00BCD4"/>
</svg>
`;

async function main() {
  await generateMissileIcon();

  const svgItems = [
    { name: 'bullet_laser_icon.png', svg: laserSvg },
    { name: 'bullet_fireball_icon.png', svg: fireballSvg },
    { name: 'bullet_crystal_icon.png', svg: crystalSvg },
    { name: 'bullet_slow_icon.png', svg: slowSvg },
  ];

  for (const item of svgItems) {
    const png = await sharp(Buffer.from(item.svg)).png().toBuffer();
    fs.writeFileSync(path.join('./public/assets/items', item.name), png);
    fs.writeFileSync(path.join('./src/game/assets/items', item.name), png);
    console.log(`Saved ${item.name}`);
  }
}

main().catch(console.error);
