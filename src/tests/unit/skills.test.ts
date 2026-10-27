import { describe, it, expect } from 'vitest';
import {
  applySlowEffect,
  applyFreezePulse,
  calculateEffectiveSpeed,
  canActivateSkill,
} from '../../game/engine/skills';
import { EnemyState, SkillRuntime } from '../../types/game';

describe('Skills Gameplay Engine', () => {
  const createMockEnemy = (baseSpeed: number = 22, isBoss: boolean = false): EnemyState => ({
    id: 'mob1',
    speciesId: 'purple_one_eye_alien',
    entryId: 'e1',
    word: 'improve',
    acceptedAnswers: ['improve'],
    promptText: 'cải thiện',
    x: 400,
    y: 200,
    baseVelocityY: baseSpeed,
    statusEffects: {},
    selected: true,
    spawnedAtGameMs: 0,
    width: 60,
    height: 60,
    isBoss,
  });

  it('reduces regular enemy speed to exactly 35% when Slow Shot hits', () => {
    const enemy = createMockEnemy(100);
    const now = 1000;

    applySlowEffect(enemy, now, 5000, 0.35);

    expect(enemy.statusEffects.slowUntilGameMs).toBe(6000);
    expect(enemy.statusEffects.slowMultiplier).toBe(0.35);

    const effSpeed = calculateEffectiveSpeed(enemy, now + 1000);
    expect(effSpeed).toBeCloseTo(35, 1);
  });

  it('restores normal speed after slow duration expires', () => {
    const enemy = createMockEnemy(100);
    const now = 1000;

    applySlowEffect(enemy, now, 5000, 0.35);

    // After 5001ms (at 6001ms), slow effect is expired
    const effSpeed = calculateEffectiveSpeed(enemy, 6001);
    expect(effSpeed).toBe(100);
  });

  it('refreshes slow duration on re-hit without compounding multiplier', () => {
    const enemy = createMockEnemy(100);

    // First hit at 1000ms -> expires at 6000ms
    applySlowEffect(enemy, 1000, 5000, 0.35);

    // Second hit at 4000ms -> refreshes to expires at 9000ms
    applySlowEffect(enemy, 4000, 5000, 0.35);

    expect(enemy.statusEffects.slowUntilGameMs).toBe(9000);
    // Multiplier must remain 0.35, NEVER 0.35 * 0.35 = 0.1225
    expect(enemy.statusEffects.slowMultiplier).toBe(0.35);

    const effSpeed = calculateEffectiveSpeed(enemy, 5000);
    expect(effSpeed).toBeCloseTo(35, 1);
  });

  it('applies Freeze Pulse to all enemies and respects boss cap', () => {
    const mob = createMockEnemy(100, false);
    const boss = createMockEnemy(100, true);

    applyFreezePulse([mob, boss], 1000, 3000);

    const mobSpeed = calculateEffectiveSpeed(mob, 2000);
    expect(mobSpeed).toBeCloseTo(15, 1); // 15%

    const bossSpeed = calculateEffectiveSpeed(boss, 2000);
    expect(bossSpeed).toBeCloseTo(45, 1); // boss capped at 45%
  });

  it('uses minimum of slow and freeze rather than product when both active', () => {
    const mob = createMockEnemy(100, false);
    const now = 1000;

    applySlowEffect(mob, now, 5000, 0.35);
    applyFreezePulse([mob], now, 3000);

    // min(0.35, 0.15) = 0.15, NOT 0.35 * 0.15 = 0.0525
    const effSpeed = calculateEffectiveSpeed(mob, 2000);
    expect(effSpeed).toBeCloseTo(15, 1);

    // After freeze expires at 4001ms, slow is still active until 6000ms -> speed returns to 35%
    const speedAfterFreeze = calculateEffectiveSpeed(mob, 4500);
    expect(speedAfterFreeze).toBeCloseTo(35, 1);
  });

  it('checks skill charge and cooldown correctly', () => {
    const skill: SkillRuntime = {
      itemId: 'skill_slow_shot',
      title: 'Slow Shot',
      remainingCharges: 3,
      maxCharges: 3,
      cooldownMs: 12000,
      readyAtGameMs: 5000,
    };

    // Before ready time: cannot activate
    expect(canActivateSkill(skill, 4000)).toBe(false);

    // At or after ready time: can activate
    expect(canActivateSkill(skill, 5000)).toBe(true);

    // Out of charges: cannot activate
    skill.remainingCharges = 0;
    expect(canActivateSkill(skill, 6000)).toBe(false);
  });
});
