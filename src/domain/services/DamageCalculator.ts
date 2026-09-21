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
  critOverride?: boolean,
  assistMode?: boolean
): number {
  const attackStat = attacker.stats.attack;
  const defenseStat = defender.stats.defense;

  // Skill power multiplier
  let powerMultiplier = skill ? skill.power / 100 : 1.0;

  // 鬼からの攻撃の場合、全体攻撃（target: 'all'）による即死・全滅を防ぐため威力を分散調整
  if (attacker.role === 'demon') {
    if (skill?.target === 'all') {
      // 全体攻撃は1体あたり50%の分散ダメージ（即死防止）
      powerMultiplier *= 0.5;
    }
  }

  // Base formula:
  // 鬼からの攻撃は味方が理不尽に一撃死しないよう、防御力がしっかり機能するマイルドな係数に
  let baseDamage: number;
  if (attacker.role === 'demon') {
    baseDamage = Math.max(1, (attackStat * 1.15 - defenseStat * 0.85)) * powerMultiplier;
    // かんたんサポートモード適用時は敵からの被ダメージをさらに40%軽減
    if (assistMode) {
      baseDamage *= 0.6;
    }
  } else {
    // 隊士からの攻撃：しっかり敵の体力を削れる爽快な係数
    baseDamage = Math.max(1, (attackStat * 1.6 - defenseStat * 0.7)) * powerMultiplier;
    // かんたんサポートモード適用時は与ダメージを1.4倍に強化
    if (assistMode) {
      baseDamage *= 1.4;
    }
  }

  // Small random variance (+/- 8%)
  const variance = 0.95 + Math.random() * 0.1;
  baseDamage = baseDamage * variance;

  // Elemental Breath Advantage (e.g. Sun / Fire against Demons)
  if (attacker.role === 'slayer' && defender.role === 'demon') {
    if (skill?.breathStyle === 'sun') {
      baseDamage *= 1.5; // 日の呼吸・ヒノカミ神楽は鬼に超特効
    } else if (skill?.breathStyle === 'flame' || skill?.breathStyle === 'thunder' || skill?.breathStyle === 'moon') {
      baseDamage *= 1.3;
    } else {
      baseDamage *= 1.15; // 日輪刀ボーナス
    }
  }

  // Critical hit (隙の糸) check:
  // If critOverride is boolean, use that. Otherwise roll based on luck.
  const critChance = attacker.stats.luck / 100;
  const isCrit = typeof critOverride === 'boolean' ? critOverride : Math.random() < critChance;

  if (isCrit) {
    // 隙の糸！ 会心の一撃 (2.0x damage)
    baseDamage *= 2.0;
  }

  return Math.max(1, Math.round(baseDamage));
}

export function isCriticalHit(attacker: Character): boolean {
  const critRate = Math.min(0.4, attacker.stats.luck * 0.015);
  return Math.random() < critRate;
}
