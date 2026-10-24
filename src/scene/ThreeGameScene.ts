import * as THREE from 'three';
import { FallingBlock, GameEvent } from '../types/game';
import { GAME_CONSTANTS } from '../config/balance';
import { THEME } from '../config/theme';

export interface Projectile {
  mesh: THREE.Mesh;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  progress: number;
  speed: number;
  blockId: string;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface ScorePopup {
  sprite: THREE.Sprite;
  velocity: THREE.Vector3;
  life: number;
}

export interface Shockwave {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
}

export class ThreeGameScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;

  // Visual scene elements
  private starsParticles: THREE.Points | null = null;
  private cloudsGroup: THREE.Group = new THREE.Group();
  private groundGroup: THREE.Group = new THREE.Group();
  private defenseLineMesh: THREE.Mesh | null = null;
  
  // Turret components
  private turretGroup: THREE.Group = new THREE.Group();
  private turretSwivel: THREE.Group = new THREE.Group();
  private barrelLeft: THREE.Mesh | null = null;
  private barrelRight: THREE.Mesh | null = null;
  private muzzleFlashLight: THREE.PointLight | null = null;
  private muzzleFlashMesh: THREE.Mesh | null = null;
  private targetingLaser: THREE.Line | null = null;
  private turretRecoil: number = 0;

  // Falling block meshes pool
  private blockMeshes: Map<string, { group: THREE.Group; bodyMesh: THREE.Mesh; textSprite: THREE.Sprite; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; texture: THREE.CanvasTexture; reticleGroup: THREE.Group }> = new Map();

  // Projectiles and particles
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private scorePopups: ScorePopup[] = [];
  private shockwaves: Shockwave[] = [];

  // Camera shake
  private cameraShake: number = 0;
  private baseCameraPos: THREE.Vector3 = new THREE.Vector3(0, 0, 11);

  // Settings
  private quality: 'low' | 'medium' | 'high' = 'high';
  private reducedMotion: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(THEME.colors.skyDeep);
    this.scene.fog = new THREE.FogExp2(THEME.colors.skyDeep, 0.035);

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.copy(this.baseCameraPos);
    this.camera.lookAt(0, 1.2, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // 4. Build visual world
    this.buildLighting();
    this.buildAtmosphere();
    this.buildDefenseGround();
    this.buildTurret();

    // 5. Start animation loop
    this.renderLoop = this.renderLoop.bind(this);
    this.animFrameId = requestAnimationFrame(this.renderLoop);

    // 6. Resize handling
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  private buildLighting(): void {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x38557a, 0.9);
    this.scene.add(ambient);

    // Directional light (cyan rim)
    const dirLight = new THREE.DirectionalLight(0x33e6dd, 1.6);
    dirLight.position.set(5, 12, 8);
    this.scene.add(dirLight);

    // Fill light (warm gold highlight from below/side)
    const fillLight = new THREE.DirectionalLight(0xf5d56c, 0.7);
    fillLight.position.set(-6, -2, 5);
    this.scene.add(fillLight);
  }

  private buildAtmosphere(): void {
    // Starfield particles
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35 + 5;
      positions[i * 3 + 2] = -8 - Math.random() * 25;

      // Subtle cyan or warm tint
      if (Math.random() > 0.6) {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 0.86;
      } else {
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1.0;
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    this.starsParticles = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starsParticles);

    // Celestial clouds group
    this.scene.add(this.cloudsGroup);
    for (let i = 0; i < 6; i++) {
      const cloudGeo = new THREE.PlaneGeometry(12 + Math.random() * 8, 3 + Math.random() * 2);
      const cloudMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x182c52 : 0x101e38,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      });
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      cloudMesh.position.set((Math.random() - 0.5) * 25, 4 + Math.random() * 6, -5 - i * 1.5);
      this.cloudsGroup.add(cloudMesh);
    }
  }

  private buildDefenseGround(): void {
    this.scene.add(this.groundGroup);

    // Ground platform platform base
    const platformGeo = new THREE.CylinderGeometry(8.5, 9.5, 1.2, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x142333,
      metalness: 0.8,
      roughness: 0.35,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, -3.8, 0);
    this.groundGroup.add(platform);

    // Glowing energy defense line along y = -2.8
    const lineGeo = new THREE.BoxGeometry(14, 0.08, 0.3);
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x33e6dd,
      transparent: true,
      opacity: 0.85,
    });
    this.defenseLineMesh = new THREE.Mesh(lineGeo, lineMat);
    this.defenseLineMesh.position.set(0, GAME_CONSTANTS.GROUND_Y, 0.1);
    this.groundGroup.add(this.defenseLineMesh);

    // Decorative defense grid bars
    for (let x = -6; x <= 6; x += 1.5) {
      const pylonGeo = new THREE.BoxGeometry(0.08, 0.4, 0.08);
      const pylonMat = new THREE.MeshBasicMaterial({ color: 0x33e6dd, transparent: true, opacity: 0.4 });
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(x, GAME_CONSTANTS.GROUND_Y - 0.2, 0.1);
      this.groundGroup.add(pylon);
    }
  }

  private buildTurret(): void {
    const [tx, ty, tz] = GAME_CONSTANTS.TURRET_POS;
    this.turretGroup.position.set(tx, ty, tz);
    this.scene.add(this.turretGroup);

    // Turret heavy base plate
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.5, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e3347,
      metalness: 0.9,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    this.turretGroup.add(baseMesh);

    // Glowing base energy ring
    const ringGeo = new THREE.TorusGeometry(1.25, 0.05, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x33e6dd });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.15;
    this.turretGroup.add(ringMesh);

    // Swivel mount that rotates toward target
    this.turretGroup.add(this.turretSwivel);
    this.turretSwivel.position.set(0, 0.3, 0);

    // Center core dome
    const coreGeo = new THREE.SphereGeometry(0.65, 20, 20);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x162a36,
      metalness: 0.95,
      roughness: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.turretSwivel.add(coreMesh);

    // Glowing inner reactor pulse
    const reactorGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const reactorMat = new THREE.MeshBasicMaterial({ color: 0x33e6dd });
    const reactorMesh = new THREE.Mesh(reactorGeo, reactorMat);
    this.turretSwivel.add(reactorMesh);

    // Dual Cannon Barrels
    const barrelGeo = new THREE.CylinderGeometry(0.09, 0.11, 1.4, 16);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x2a445e,
      metalness: 0.9,
      roughness: 0.2,
    });

    this.barrelLeft = new THREE.Mesh(barrelGeo, barrelMat);
    this.barrelLeft.position.set(-0.25, 0.65, 0.2);
    this.turretSwivel.add(this.barrelLeft);

    this.barrelRight = new THREE.Mesh(barrelGeo, barrelMat);
    this.barrelRight.position.set(0.25, 0.65, 0.2);
    this.turretSwivel.add(this.barrelRight);

    // Muzzle flash point light
    this.muzzleFlashLight = new THREE.PointLight(0xf5d56c, 0, 8);
    this.muzzleFlashLight.position.set(0, 1.4, 0.2);
    this.turretSwivel.add(this.muzzleFlashLight);

    // Muzzle flash sphere sprite
    const flashGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xfff2b4, transparent: true, opacity: 0 });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlashMesh.position.set(0, 1.4, 0.2);
    this.turretSwivel.add(this.muzzleFlashMesh);

    // Targeting Laser Line
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x33e6dd,
      transparent: true,
      opacity: 0.45,
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 1.4, 0.2),
      new THREE.Vector3(0, 8, 0),
    ]);
    this.targetingLaser = new THREE.Line(laserGeo, laserMat);
    this.targetingLaser.visible = false;
    this.scene.add(this.targetingLaser);
  }

  public updateBlocks(blocks: FallingBlock[], lockedBlockId: string | null): void {
    const currentIds = new Set(blocks.map((b) => b.id));

    // Remove dead block meshes
    for (const [id, item] of this.blockMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(item.group);
        item.texture.dispose();
        this.blockMeshes.delete(id);
      }
    }

    // Update or create block meshes
    for (const block of blocks) {
      let item = this.blockMeshes.get(block.id);
      if (!item) {
        item = this.createBlockMesh(block);
        this.blockMeshes.set(block.id, item);
        this.scene.add(item.group);
      }

      // Update position
      item.group.position.set(block.x, block.y, block.z);

      const isLocked = block.id === lockedBlockId;
      const isUrgent = block.y <= GAME_CONSTANTS.URGENT_Y_THRESHOLD;

      // Update block material & glow outline
      const bodyMat = item.bodyMesh.material as THREE.MeshStandardMaterial;
      if (isUrgent) {
        bodyMat.color.setHex(0x521a1a);
        bodyMat.emissive.setHex(0xfc6868);
        bodyMat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.35;
      } else if (isLocked) {
        bodyMat.color.setHex(0x0e2c3d);
        bodyMat.emissive.setHex(0x33e6dd);
        bodyMat.emissiveIntensity = 0.5;
      } else {
        bodyMat.color.setHex(0x13263b);
        bodyMat.emissive.setHex(0x1a3a5a);
        bodyMat.emissiveIntensity = 0.2;
      }

      item.reticleGroup.visible = isLocked;
      if (isLocked) {
        item.reticleGroup.rotation.z += 0.02;
      }

      // Redraw text canvas if typed index changed
      this.renderBlockText(item.canvas, item.ctx, item.texture, block, isLocked, isUrgent);
    }

    // Aim turret at locked block if present
    const lockedBlock = blocks.find((b) => b.id === lockedBlockId && b.state === 'active');
    if (lockedBlock && this.targetingLaser) {
      const targetVec = new THREE.Vector3(lockedBlock.x, lockedBlock.y, lockedBlock.z);
      
      // Orient turret toward target
      const turretWorldPos = new THREE.Vector3();
      this.turretGroup.getWorldPosition(turretWorldPos);
      const angle = Math.atan2(targetVec.x - turretWorldPos.x, targetVec.y - turretWorldPos.y);
      this.turretSwivel.rotation.z = -angle;

      // Update laser beam
      const laserGeo = this.targetingLaser.geometry as THREE.BufferGeometry;
      laserGeo.setFromPoints([
        new THREE.Vector3(turretWorldPos.x, turretWorldPos.y + 0.8, turretWorldPos.z),
        targetVec,
      ]);
      this.targetingLaser.visible = true;
    } else if (this.targetingLaser) {
      this.targetingLaser.visible = false;
      // Gently return turret to center
      this.turretSwivel.rotation.z *= 0.95;
    }
  }

  private createBlockMesh(block: FallingBlock): {
    group: THREE.Group;
    bodyMesh: THREE.Mesh;
    textSprite: THREE.Sprite;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    texture: THREE.CanvasTexture;
    reticleGroup: THREE.Group;
  } {
    const group = new THREE.Group();

    // Estimate width based on word length
    const blockWidth = Math.max(1.8, block.displayText.length * 0.26 + 0.6);
    const blockHeight = 0.75;
    const blockDepth = 0.35;

    // Beveled physical crystal body
    const bodyGeo = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x13263b,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x1a3a5a,
      emissiveIntensity: 0.2,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(bodyMesh);

    // Glowing border wireframe
    const wireGeo = new THREE.EdgesGeometry(bodyGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x33e6dd, transparent: true, opacity: 0.6 });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    group.add(wireMesh);

    // Text Canvas & Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const textSprite = new THREE.Sprite(spriteMat);
    textSprite.scale.set(blockWidth * 1.05, blockHeight * 1.05, 1);
    textSprite.position.set(0, 0, blockDepth / 2 + 0.05);
    group.add(textSprite);

    // Corner targeting reticle brackets
    const reticleGroup = new THREE.Group();
    const bracketSize = 0.25;
    const halfW = blockWidth / 2 + 0.12;
    const halfH = blockHeight / 2 + 0.12;

    const corners = [
      [-halfW, halfH],
      [halfW, halfH],
      [-halfW, -halfH],
      [halfW, -halfH],
    ];

    const bracketMat = new THREE.LineBasicMaterial({ color: 0x33e6dd });
    corners.forEach(([cx, cy]) => {
      const bGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(cx + (cx < 0 ? bracketSize : -bracketSize), cy, 0.2),
        new THREE.Vector3(cx, cy, 0.2),
        new THREE.Vector3(cx, cy + (cy < 0 ? bracketSize : -bracketSize), 0.2),
      ]);
      reticleGroup.add(new THREE.Line(bGeo, bracketMat));
    });
    reticleGroup.visible = false;
    group.add(reticleGroup);

    return { group, bodyMesh, textSprite, canvas, ctx, texture, reticleGroup };
  }

  private renderBlockText(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    texture: THREE.CanvasTexture,
    block: FallingBlock,
    isLocked: boolean,
    isUrgent: boolean
  ): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const text = block.displayText;
    const typed = block.typedIndex;

    ctx.font = 'bold 54px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const totalWidth = ctx.measureText(text).width;
    let startX = (canvas.width - totalWidth) / 2;
    const centerY = canvas.height / 2;

    // Draw background pill in canvas
    ctx.fillStyle = isUrgent ? 'rgba(80, 15, 15, 0.75)' : isLocked ? 'rgba(10, 35, 55, 0.85)' : 'rgba(8, 18, 32, 0.75)';
    ctx.beginPath();
    ctx.roundRect(startX - 24, centerY - 38, totalWidth + 48, 76, 12);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = isUrgent ? '#FC6868' : isLocked ? '#33E6DD' : 'rgba(51, 230, 221, 0.4)';
    ctx.stroke();

    // Render each character with correct status color
    ctx.textAlign = 'left';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charWidth = ctx.measureText(char).width;

      if (i < typed) {
        // Typed characters: Glowing green-cyan
        ctx.fillStyle = '#38E3A5';
        ctx.shadowColor = '#38E3A5';
        ctx.shadowBlur = 12;
      } else if (i === typed && isLocked) {
        // Current character to type: Bright Yellow highlight
        ctx.fillStyle = '#FFF2B4';
        ctx.shadowColor = '#F5D56C';
        ctx.shadowBlur = 16;
      } else {
        // Remaining characters: Crisp Silver White
        ctx.fillStyle = '#F6F9FF';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      ctx.fillText(char, startX, centerY);
      startX += charWidth;
    }

    ctx.shadowBlur = 0;
    texture.needsUpdate = true;
  }

  public handleGameEvent(event: GameEvent): void {
    if (event.type === 'SHOT_FIRED') {
      this.fireProjectile(event.targetPos, event.blockId);
      this.triggerMuzzleFlash();
    } else if (event.type === 'BLOCK_DESTROYED') {
      this.spawnExplosion(event.pos, event.points);
    } else if (event.type === 'BLOCK_MISSED') {
      this.spawnGroundShockwave(event.pos || [0, GAME_CONSTANTS.GROUND_Y, 0]);
      this.cameraShake = 0.35;
    } else if (event.type === 'LIFE_LOST') {
      this.spawnGroundShockwave([0, GAME_CONSTANTS.GROUND_Y, 0]);
      this.cameraShake = 0.45;
    }
  }

  private triggerMuzzleFlash(): void {
    if (this.muzzleFlashLight && this.muzzleFlashMesh) {
      this.muzzleFlashLight.intensity = 4.5;
      (this.muzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 0.95;
      this.turretRecoil = 0.18;
    }
  }

  private fireProjectile(targetPos: [number, number, number], blockId: string): void {
    const [tx, ty, tz] = GAME_CONSTANTS.TURRET_POS;
    const start = new THREE.Vector3(tx, ty + 0.8, tz);
    const end = new THREE.Vector3(...targetPos);

    const boltGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.6, 8);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xfff2b4 });
    const boltMesh = new THREE.Mesh(boltGeo, boltMat);

    boltMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
    boltMesh.position.copy(start);
    this.scene.add(boltMesh);

    this.projectiles.push({
      mesh: boltMesh,
      startPos: start,
      targetPos: end,
      progress: 0,
      speed: GAME_CONSTANTS.PROJECTILE_SPEED,
      blockId,
    });
  }

  private spawnExplosion(pos: [number, number, number], points: number): void {
    const center = new THREE.Vector3(...pos);

    // Particle debris
    const count = this.quality === 'low' ? 12 : 24;
    for (let i = 0; i < count; i++) {
      const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const pMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x33e6dd : 0xf5d56c,
        transparent: true,
        opacity: 1,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.copy(center);
      this.scene.add(pMesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6 + 1.5,
        (Math.random() - 0.5) * 4
      );

      this.particles.push({
        mesh: pMesh,
        velocity: vel,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
      });
    }

    // Expanding shockwave ring
    const ringGeo = new THREE.RingGeometry(0.2, 0.35, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x33e6dd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(center);
    this.scene.add(ringMesh);

    this.shockwaves.push({
      mesh: ringMesh,
      life: 0,
      maxLife: 0.4,
    });

    // Score Popup (+Points)
    this.spawnScorePopup(center, points);
  }

  private spawnScorePopup(pos: THREE.Vector3, points: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.font = 'bold 36px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#38E3A5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${points}`, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 1 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.7, 1);
    sprite.position.copy(pos).add(new THREE.Vector3(0, 0.5, 0));
    this.scene.add(sprite);

    this.scorePopups.push({
      sprite,
      velocity: new THREE.Vector3(0, 1.8, 0),
      life: 0,
    });
  }

  private spawnGroundShockwave(pos: [number, number, number]): void {
    const center = new THREE.Vector3(pos[0], GAME_CONSTANTS.GROUND_Y, pos[2]);
    const ringGeo = new THREE.RingGeometry(0.3, 0.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfc6868,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.copy(center);
    this.scene.add(ringMesh);

    this.shockwaves.push({
      mesh: ringMesh,
      life: 0,
      maxLife: 0.5,
    });
  }

  private renderLoop(): void {
    if (this.isDestroyed) return;

    const dt = 0.016; // approx 60fps frame delta

    // 1. Slow cosmic background motion
    if (this.starsParticles) {
      this.starsParticles.rotation.y += 0.0003;
    }
    this.cloudsGroup.children.forEach((c, idx) => {
      c.position.x += 0.004 * (idx % 2 === 0 ? 1 : -0.7);
      if (c.position.x > 25) c.position.x = -25;
      if (c.position.x < -25) c.position.x = 25;
    });

    // 2. Turret recoil decay & muzzle light decay
    if (this.turretRecoil > 0) {
      this.turretRecoil *= 0.85;
      if (this.barrelLeft && this.barrelRight) {
        this.barrelLeft.position.y = 0.65 - this.turretRecoil * 0.4;
        this.barrelRight.position.y = 0.65 - this.turretRecoil * 0.4;
      }
    }
    if (this.muzzleFlashLight && this.muzzleFlashLight.intensity > 0) {
      this.muzzleFlashLight.intensity *= 0.7;
    }
    if (this.muzzleFlashMesh) {
      const mat = this.muzzleFlashMesh.material as THREE.MeshBasicMaterial;
      mat.opacity *= 0.7;
    }

    // 3. Projectiles flight
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.progress += p.speed * dt * 0.08;
      p.mesh.position.lerpVectors(p.startPos, p.targetPos, p.progress);

      if (p.progress >= 1.0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.projectiles.splice(i, 1);
      }
    }

    // 4. Explosion particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += dt;
      pt.mesh.position.addScaledVector(pt.velocity, dt);
      pt.velocity.y -= 9.8 * dt * 0.6; // gravity
      pt.mesh.rotation.x += 0.1;
      pt.mesh.rotation.y += 0.15;

      const progress = pt.life / pt.maxLife;
      (pt.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress);

      if (pt.life >= pt.maxLife) {
        this.scene.remove(pt.mesh);
        pt.mesh.geometry.dispose();
        this.particles.splice(i, 1);
      }
    }

    // 5. Score popups
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const sp = this.scorePopups[i];
      sp.life += dt;
      sp.sprite.position.addScaledVector(sp.velocity, dt);
      const progress = sp.life / 0.85;
      (sp.sprite.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - progress);

      if (sp.life >= 0.85) {
        this.scene.remove(sp.sprite);
        (sp.sprite.material as THREE.SpriteMaterial).map?.dispose();
        this.scorePopups.splice(i, 1);
      }
    }

    // 6. Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      const progress = sw.life / sw.maxLife;
      const scale = 1.0 + progress * 5.0;
      sw.mesh.scale.set(scale, scale, 1);
      (sw.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress);

      if (sw.life >= sw.maxLife) {
        this.scene.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // 7. Camera shake
    if (this.cameraShake > 0 && !this.reducedMotion) {
      this.camera.position.x = this.baseCameraPos.x + (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y = this.baseCameraPos.y + (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake *= 0.86;
      if (this.cameraShake < 0.01) {
        this.cameraShake = 0;
        this.camera.position.copy(this.baseCameraPos);
      }
    }

    // 8. Render
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.renderLoop);
  }

  private handleResize(): void {
    if (this.isDestroyed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  public setQuality(quality: 'low' | 'medium' | 'high'): void {
    this.quality = quality;
    const dpr = quality === 'low' ? 1.0 : quality === 'medium' ? 1.5 : 2.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
  }

  public dispose(): void {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.handleResize);

    // Clean up Three.js resources
    this.blockMeshes.forEach((item) => {
      this.scene.remove(item.group);
      item.texture.dispose();
    });
    this.blockMeshes.clear();

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
