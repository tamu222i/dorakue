/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Item } from '../models/types.ts';
import { PartyAggregate } from '../aggregates/PartyAggregate.ts';

export interface AutoItemResult {
  triggered: boolean;
  item?: Item;
  target?: Character;
  message?: string;
  effectType: 'heal_hp' | 'heal_bp' | 'revive' | 'buff';
  recoveredAmount?: number;
}

/**
 * Handles automatic application of items held in party inventory.
 * 「アイテムは持っているだけで自動適用」
 */
export class AutoItemService {
  /**
   * Check and auto-revive a member if they took lethal damage (HP <= 0).
   * Automatically triggered from inventory without requiring turn consumption!
   */
  public static checkAutoRevive(party: PartyAggregate, member: Character): AutoItemResult | null {
    if (member.stats.hp > 0) return null;

    const reviveItem = party.inventory.find(i => i.type === 'revive' && i.count > 0);
    if (!reviveItem) return null;

    reviveItem.count--;
    const reviveHp = Math.max(1, Math.round(member.stats.maxHp * (reviveItem.value / 100)));
    member.stats.hp = reviveHp;

    return {
      triggered: true,
      item: reviveItem,
      target: member,
      effectType: 'revive',
      recoveredAmount: reviveHp,
      message: `【自動発動・${reviveItem.name}】倒れかけた${member.name}に霊水が染み渡り、奇跡の力でHP ${reviveHp} で蘇生した！（残り:${reviveItem.count}個）`
    };
  }

  /**
   * Check and auto-heal HP if a member's HP drops to critical (<= 45%).
   * Automatically triggered from inventory without requiring turn consumption!
   */
  public static checkAutoHpHeal(party: PartyAggregate, member: Character): AutoItemResult | null {
    if (member.stats.hp <= 0) return null;
    const threshold = Math.round(member.stats.maxHp * 0.45);
    if (member.stats.hp > threshold) return null;

    const hpItem = party.inventory.find(i => i.type === 'heal_hp' && i.count > 0);
    if (!hpItem) return null;

    hpItem.count--;
    const healVal = Math.min(member.stats.maxHp - member.stats.hp, hpItem.value);
    member.stats.hp += healVal;

    return {
      triggered: true,
      item: hpItem,
      target: member,
      effectType: 'heal_hp',
      recoveredAmount: healVal,
      message: `【自動適用・${hpItem.name}】懐の薬草が浸透！${member.name}の傷が癒えHPが ${healVal} 回復！（残り:${hpItem.count}個）`
    };
  }

  /**
   * Check and auto-replenish BP if a member needs BP for breathing techniques or BP <= 15.
   * Automatically triggered from inventory without requiring turn consumption!
   */
  public static checkAutoBpReplenish(party: PartyAggregate, member: Character, requiredBp?: number): AutoItemResult | null {
    if (member.stats.hp <= 0) return null;

    const isLow = member.stats.bp <= 15;
    const isNeeded = requiredBp !== undefined && member.stats.bp < requiredBp;
    if (!isLow && !isNeeded) return null;

    const bpItem = party.inventory.find(i => i.type === 'heal_bp' && i.count > 0);
    if (!bpItem) return null;

    bpItem.count--;
    const bpVal = Math.min(member.stats.maxBp - member.stats.bp, bpItem.value);
    member.stats.bp += bpVal;

    return {
      triggered: true,
      item: bpItem,
      target: member,
      effectType: 'heal_bp',
      recoveredAmount: bpVal,
      message: `【自動適用・${bpItem.name}】${member.name}は特製おにぎりを素早く食し、呼吸力(BP)が ${bpVal} 回復！（残り:${bpItem.count}個）`
    };
  }

  /**
   * Passive stat boosts granted to party members simply by holding items in inventory!
   */
  public static getPassiveStatBonuses(inventory: Item[]): {
    bonusAtk: number;
    bonusDef: number;
    bonusSpd: number;
    bonusHp: number;
  } {
    let bonusAtk = 0;
    let bonusDef = 0;
    let bonusSpd = 0;
    let bonusHp = 0;

    for (const item of inventory) {
      if (item.count <= 0) continue;
      if (item.id === 'item_gourd') {
        bonusAtk += 8;
        bonusSpd += 12;
      } else if (item.id === 'item_talisman') {
        bonusDef += 10;
        bonusHp += 25;
      } else if (item.id === 'item_wisteria_pouch') {
        bonusDef += 6;
        bonusSpd += 6;
      }
    }

    return { bonusAtk, bonusDef, bonusSpd, bonusHp };
  }
}
