import { PoseId } from '../../types/game';

export interface Point {
  x: number;
  y: number;
}

export interface PoseRigConfig {
  hatAnchor: Point;
  shirtAnchor: Point;
  muzzleAnchor: Point;
  hatRotationDeg: number;
  shirtRotationDeg?: number;
  scaleX?: number;
}

export const PONPI_RIG: Record<PoseId, PoseRigConfig> = {
  idle: {
    hatAnchor: { x: 0, y: -42 },
    shirtAnchor: { x: 0, y: 15 },
    muzzleAnchor: { x: 0, y: -30.5 },
    hatRotationDeg: 0,
    shirtRotationDeg: 0,
  },
  fire_up: {
    hatAnchor: { x: 0, y: -44 },
    shirtAnchor: { x: 0, y: 15 },
    muzzleAnchor: { x: 0.5, y: -25.1 },
    hatRotationDeg: 0,
    shirtRotationDeg: 0,
  },
  fire_up_left: {
    hatAnchor: { x: -6, y: -42 },
    shirtAnchor: { x: -3, y: 15 },
    muzzleAnchor: { x: -13.1, y: -18.3 },
    hatRotationDeg: -16,
    shirtRotationDeg: -4,
  },
  fire_up_right: {
    hatAnchor: { x: 6, y: -42 },
    shirtAnchor: { x: 3, y: 15 },
    muzzleAnchor: { x: 15.5, y: -19.5 },
    hatRotationDeg: 16,
    shirtRotationDeg: 4,
  },
  fire_left: {
    hatAnchor: { x: -10, y: -38 },
    shirtAnchor: { x: -4, y: 15 },
    muzzleAnchor: { x: -13.5, y: -4.5 },
    hatRotationDeg: -22,
    shirtRotationDeg: -6,
  },
  fire_right: {
    hatAnchor: { x: 10, y: -38 },
    shirtAnchor: { x: 4, y: 15 },
    muzzleAnchor: { x: 13.7, y: -4.9 },
    hatRotationDeg: 22,
    shirtRotationDeg: 6,
  },
};

export function getPoseFromAngle(radians: number): PoseId {
  // Radians where:
  // -PI/2 is straight UP (towards negative Y)
  // -PI or PI is straight LEFT
  // 0 is straight RIGHT
  const deg = (radians * 180) / Math.PI;

  if (deg < -150 || deg > 150) {
    return 'fire_left';
  } else if (deg >= -150 && deg < -110) {
    return 'fire_up_left';
  } else if (deg >= -110 && deg < -70) {
    return 'fire_up';
  } else if (deg >= -70 && deg < -30) {
    return 'fire_up_right';
  } else if (deg >= -30 && deg <= 30) {
    return 'fire_right';
  }
  return 'idle';
}
