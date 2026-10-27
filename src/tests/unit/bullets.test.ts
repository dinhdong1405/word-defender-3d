import { describe, expect, it } from 'vitest';
import { createBullet, updateProjectiles } from '../../game/engine/projectiles';
import { EnemyState } from '../../types/game';
import { GameEngine } from '../../game/engine/gameEngine';
import { STORE_CATALOG } from '../../config/catalog';

describe('Bullet & Projectile System', () => {
  it('defines bullet items in store catalog with icons and colors', () => {
    const defaultBullet = STORE_CATALOG.find((i) => i.id === 'bullet_default');
    expect(defaultBullet).toBeDefined();
    expect(defaultBullet?.title).toContain('Đạn Kẹo Tròn');
    expect(defaultBullet?.iconUrl).toBe('/assets/items/bullet_default_icon.png');

    const missile = STORE_CATALOG.find((i) => i.id === 'bullet_missile');
    expect(missile).toBeDefined();
    expect(missile?.title).toContain('Tên Lửa');

    const shuriken = STORE_CATALOG.find((i) => i.id === 'bullet_shuriken');
    expect(shuriken).toBeDefined();
    expect(shuriken?.title).toContain('Shuriken');
    expect(shuriken?.iconUrl).toBe('/assets/items/bullet_shuriken_icon.png');

    const kunai = STORE_CATALOG.find((i) => i.id === 'bullet_kunai');
    expect(kunai).toBeDefined();
    expect(kunai?.title).toContain('Kunai');
    expect(kunai?.iconUrl).toBe('/assets/items/bullet_kunai_icon.png');

    const soccer = STORE_CATALOG.find((i) => i.id === 'bullet_soccer');
    expect(soccer).toBeDefined();
    expect(soccer?.title).toContain('Bóng Đá');
    expect(soccer?.iconUrl).toBe('/assets/items/bullet_soccer_icon.png');

    const basketball = STORE_CATALOG.find((i) => i.id === 'bullet_basketball');
    expect(basketball).toBeDefined();
    expect(basketball?.title).toContain('Bóng Rổ');
    expect(basketball?.iconUrl).toBe('/assets/items/bullet_basketball_icon.png');
  });

  it('creates rocket missile bullet with correct speed and initial angle', () => {
    const bullet = createBullet(100, 500, 'enemy_1', 'bullet_missile', 1000);
    expect(bullet.kind).toBe('bullet_missile');
    expect(bullet.speed).toBe(540);
    expect(bullet.angle).toBe(-Math.PI / 2);
  });

  it('accurately aims and steers rocket towards target in updateProjectiles', () => {
    const startX = 200;
    const startY = 400;
    const targetX = 300;
    const targetY = 100;

    const bullet = createBullet(startX, startY, 'enemy_1', 'bullet_missile', 0);
    const mockEnemy: EnemyState = {
      id: 'enemy_1',
      speciesId: 'alien_1',
      entryId: 'entry_1',
      word: 'apple',
      acceptedAnswers: ['apple'],
      promptText: 'apple',
      x: targetX,
      y: targetY,
      baseVelocityY: 0,
      statusEffects: {},
      selected: true,
      spawnedAtGameMs: 0,
      width: 40,
      height: 40,
    };

    const expectedAngle = Math.atan2(targetY - startY, targetX - startX);

    const result = updateProjectiles([bullet], [mockEnemy], 50, 50);

    // Bullet should have turned to face target
    expect(bullet.angle).toBeCloseTo(expectedAngle, 4);

    // Bullet should have moved closer to target
    const prevDist = Math.hypot(targetX - startX, targetY - startY);
    const newDist = Math.hypot(targetX - bullet.x, targetY - bullet.y);
    expect(newDist).toBeLessThan(prevDist);

    // Particles should include exhaust flames / smoke
    expect(result.newParticles.length).toBeGreaterThan(0);
  });

  it('triggers fiery missile explosion particles when reaching target', () => {
    const bullet = createBullet(300, 105, 'enemy_1', 'bullet_missile', 0);
    const mockEnemy: EnemyState = {
      id: 'enemy_1',
      speciesId: 'alien_1',
      entryId: 'entry_1',
      word: 'star',
      acceptedAnswers: ['star'],
      promptText: 'star',
      x: 300,
      y: 100,
      baseVelocityY: 0,
      statusEffects: {},
      selected: true,
      spawnedAtGameMs: 0,
      width: 40,
      height: 40,
    };

    const result = updateProjectiles([bullet], [mockEnemy], 50, 50);

    expect(result.hitEnemyIds).toHaveLength(1);
    expect(result.hitEnemyIds[0].kind).toBe('bullet_missile');
    // Generates 14+ explosion particles
    expect(result.newParticles.length).toBeGreaterThanOrEqual(14);
  });

  it('spawns bullet matching equippedBulletId in GameEngine', () => {
    const engine = new GameEngine({
      setId: 'set_test',
      mode: 'recall',
      difficulty: 'normal',
      words: [
        {
          id: 'w1',
          setId: 'set_test',
          english: 'cat',
          vietnamese: 'con mèo',
          acceptedAnswers: ['cat'],
          createdAt: '',
          updatedAt: '',
        },
      ],
      equippedSkills: [],
      equippedStyleId: 'style_yellow',
      equippedBulletId: 'bullet_shuriken',
    });

    // Advance engine to spawn enemy
    for (let i = 0; i < 40; i++) {
      engine.update(50);
    }

    expect(engine.enemies.length).toBeGreaterThan(0);
    const target = engine.enemies[0];

    // Select and type letter
    engine.selectTarget(target.id);
    engine.handleCharacterInput('c');

    expect(engine.bullets.length).toBe(1);
    expect(engine.bullets[0].kind).toBe('bullet_shuriken');
  });

  it('delays monster death until bullet physically impacts the monster (prevents fast-typing desync bug)', () => {
    const engine = new GameEngine({
      setId: 'set_test',
      mode: 'recall',
      difficulty: 'normal',
      words: [
        {
          id: 'w1',
          setId: 'set_test',
          english: 'cat',
          vietnamese: 'con mèo',
          acceptedAnswers: ['cat'],
          createdAt: '',
          updatedAt: '',
        },
      ],
      equippedSkills: [],
      equippedStyleId: 'style_yellow',
      equippedBulletId: 'bullet_missile',
    });

    // Advance engine to spawn enemy
    for (let i = 0; i < 40; i++) {
      engine.update(50);
    }

    const enemy = engine.enemies[0];
    const enemyId = enemy.id;

    // Fast-type the entire word 'cat' in a fraction of a millisecond
    engine.selectTarget(enemyId);
    engine.handleCharacterInput('c');
    engine.handleCharacterInput('a');
    engine.handleCharacterInput('t');

    // Word is completed, BUT enemy MUST STILL BE ALIVE on field awaiting bullet impact!
    expect(engine.enemies.some((e) => e.id === enemyId)).toBe(true);
    expect(engine.enemies.find((e) => e.id === enemyId)?.pendingDefeat).toBe(true);
    expect(engine.bullets.length).toBeGreaterThanOrEqual(1);

    // Enemy must NOT be defeated yet
    expect(engine.defeatedWordEffects).toHaveLength(0);

    // Advance game time step-by-step until bullet reaches monster
    let reached = false;
    for (let step = 0; step < 40; step++) {
      engine.update(50);
      if (!engine.enemies.some((e) => e.id === enemyId)) {
        reached = true;
        break;
      }
    }

    // Now that bullet reached, the monster is officially defeated with floating meaning popup
    expect(reached).toBe(true);
    expect(engine.defeatedWordEffects.length).toBeGreaterThanOrEqual(1);
    expect(engine.defeatedWordEffects[0].word).toBe('cat');
  });
});
