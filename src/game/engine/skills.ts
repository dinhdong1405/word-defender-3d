import { EnemyState, SkillRuntime } from '../../types/game';
import { GAME_BALANCE } from '../../config/balance';

export function calculateEffectiveSpeed(
  enemy: EnemyState,
  nowGameMs: number
): number {
  let multiplier = 1.0;

  // Check Freeze Pulse
  if (enemy.statusEffects.freezeUntilGameMs && enemy.statusEffects.freezeUntilGameMs > nowGameMs) {
    const fMult = enemy.statusEffects.freezeMultiplier ?? (enemy.isBoss ? 0.45 : 0.15);
    multiplier = Math.min(multiplier, fMult);
  }

  // Check Slow Shot
  if (enemy.statusEffects.slowUntilGameMs && enemy.statusEffects.slowUntilGameMs > nowGameMs) {
    const sMult = enemy.statusEffects.slowMultiplier ?? (enemy.isBoss ? 0.50 : 0.35);
    multiplier = Math.min(multiplier, sMult);
  }

  return enemy.baseVelocityY * multiplier;
}

export function applySlowEffect(
  enemy: EnemyState,
  nowGameMs: number,
  durationMs: number = 5000,
  speedMultiplier: number = 0.35
): void {
  // Non-stacking, refreshes duration
  enemy.statusEffects.slowUntilGameMs = nowGameMs + durationMs;
  enemy.statusEffects.slowMultiplier = enemy.isBoss
    ? Math.max(speedMultiplier, GAME_BALANCE.skills.skill_slow_shot.bossMultiplierCap)
    : speedMultiplier;
}

export function applyFreezePulse(
  enemies: EnemyState[],
  nowGameMs: number,
  durationMs: number = 3000
): void {
  for (const enemy of enemies) {
    enemy.statusEffects.freezeUntilGameMs = nowGameMs + durationMs;
    enemy.statusEffects.freezeMultiplier = enemy.isBoss
      ? GAME_BALANCE.skills.skill_freeze_pulse.bossMultiplierCap
      : GAME_BALANCE.skills.skill_freeze_pulse.speedMultiplier;
  }
}

export function canActivateSkill(skill: SkillRuntime, nowGameMs: number): boolean {
  return skill.remainingCharges > 0 && nowGameMs >= skill.readyAtGameMs;
}
