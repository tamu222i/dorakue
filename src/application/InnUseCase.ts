/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { Character } from '../domain/models/types.ts';

export interface InnReviveResult {
  success: boolean;
  message: string;
  recoveredMembers: string[];
}

export class InnService {
  /**
   * Called when the entire party collapses in battle
   * "死んだら宿で復活だよ"
   */
  public static reviveAtInn(party: PartyAggregate): InnReviveResult {
    const recoveredMembers: string[] = [];

    // Revive all active members to full HP & BP
    for (const member of party.activeMembers) {
      member.stats.hp = member.stats.maxHp;
      member.stats.bp = member.stats.maxBp;
      recoveredMembers.push(member.name);
    }

    // Also revive any downed members in the wider roster
    for (const member of party.roster) {
      if (member.stats.hp <= 0) {
        member.stats.hp = member.stats.maxHp;
        member.stats.bp = member.stats.maxBp;
      }
    }

    return {
      success: true,
      message: '隠（かくし）の隊士たちによって藤の家紋の宿へ運び込まれました。\n女将「気がつかれましたか…藤の家紋の家でございます。傷が癒えるまでごゆっくりお休みください」\n味方全員のHPと呼吸力が全回復しました！',
      recoveredMembers
    };
  }

  /**
   * Normal rest at the Inn (藤の家紋の宿)
   */
  public static restAtInn(party: PartyAggregate): InnReviveResult {
    const recoveredMembers: string[] = [];
    for (const member of party.activeMembers) {
      member.stats.hp = member.stats.maxHp;
      member.stats.bp = member.stats.maxBp;
      recoveredMembers.push(member.name);
    }

    return {
      success: true,
      message: '藤の花の香りが漂う部屋で静かに休息を取りました。\n日輪刀の刃を研ぎ澄まし、心身ともに全快しました！',
      recoveredMembers
    };
  }

  /**
   * Get 3 random scoutable corps members from the 500 catalog
   */
  public static getScoutCandidates(
    catalog: Character[],
    party: PartyAggregate
  ): Character[] {
    // Only slayers/support who are not yet recruited
    const pool = catalog.filter(c => c.role !== 'demon' && !party.hasMember(c.id));
    if (pool.length === 0) return [];

    // Shuffle and pick 3
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }
}
