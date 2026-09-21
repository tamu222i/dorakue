/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Skill } from '../models/types.ts';

/**
 * Calculates damage in classic Dragon Quest / Kimetsu style
 * In Kimetsu, "隙の糸 (Suki no Ito)" is the thread of opening that triggers a critical strike.
 */
export function calculateDamage(
  attacker: Character,
  defender: Character,
  skill?: Skill,
  critOverride?: boolean
): number {
  const attackStat = attacker.stats.attack;
  const defenseStat = defender.stats.defense;

  // Skill power multiplier
  const powerMultiplier = skill ? skill.power / 100 : 1.0;

  // Base formula: (Atk * 1.6 - Def * 0.7) * skillPower
  let baseDamage = Math.max(1, (attackStat * 1.6 - defenseStat * 0.7)) * powerMultiplier;

  // Small random variance (+/- 8%)
  const variance = 0.95 + Math.random() * 0.1;
  baseDamage = baseDamage * variance;

  // Elemental Breath Advantage (e.g. Sun / Fire against Demons)
  if (attacker.role === 'slayer' && defender.role === 'demon') {
    if (skill?.breathStyle === 'sun') {
      baseDamage *= 1.4; // 日の呼吸は鬼に特効
    } else if (skill?.breathStyle === 'flame' || skill?.breathStyle === 'thunder') {
      baseDamage *= 1.2;
    } else {
      baseDamage *= 1.1; // 日輪刀ボーナス
    }
  }

  // Critical hit (隙の糸) check:
  // If critOverride is boolean, use that. Otherwise roll based on luck.
  const critChance = attacker.stats.luck / 100;
  const isCrit = typeof critOverride === 'boolean' ? critOverride : Math.random() < critChance;

  if (isCrit) {
    // 隙の糸！ 会心の一撃 (1.85x damage)
    baseDamage *= 1.85;
  }

  return Math.max(1, Math.round(baseDamage));
}

export function isCriticalHit(attacker: Character): boolean {
  const critRate = Math.min(0.4, attacker.stats.luck * 0.015);
  return Math.random() < critRate;
}
