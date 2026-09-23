/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Item, Skill } from '../models/types.ts';
import { checkNewLearnedSkills, getSkillsForLevel } from '../services/SkillProgressionService.ts';

export interface DetailedLevelUp {
  character: Character;
  name: string;
  oldLevel: number;
  newLevel: number;
  statGains: {
    hp: number;
    bp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  newSkills: Skill[];
}

export class PartyAggregate {
  public activeMembers: Character[] = [];
  public roster: Character[] = [];
  public money: number = 200;
  public inventory: Item[] = [
    { id: 'item_herb', name: '傷薬（薬草）', description: '【自動適用】HPが半分以下になると自動で傷を癒し、HPを50回復する。', cost: 30, type: 'heal_hp', value: 50, count: 5 },
    { id: 'item_riceball', name: '特製おにぎり', description: '【自動適用】呼吸力が不足すると自動で食し、BPを25回復する。', cost: 40, type: 'heal_bp', value: 25, count: 3 },
    { id: 'item_wisteria_water', name: '藤の花の霊水', description: '【自動適用】戦闘不能になると自動で霊水が奇跡を起こし、HP半分で即座に蘇生する。', cost: 150, type: 'revive', value: 50, count: 1 },
    { id: 'item_gourd', name: '鍛錬の瓢箪', description: '【常時自動適用】全集中の呼吸・常中鍛錬用の瓢箪。持っているだけで素早さ+12、攻撃力+8。', cost: 100, type: 'buff', value: 12, count: 1 },
    { id: 'item_talisman', name: '厄除の御守り', description: '【常時自動適用】厄を祓う御守り。持っているだけで防御力+10、最大HP+25。', cost: 100, type: 'buff', value: 10, count: 1 },
  ];

  /**
   * Calculates required EXP for the next level.
   * Calibrated so that winning 2 to 3 battles against level-appropriate mob groups
   * consistently grants a level-up.
   */
  public static calculateNextExp(level: number): number {
    return Math.round(level * 200 + 220);
  }

  constructor(leadHero: Character) {
    leadHero.nextExp = PartyAggregate.calculateNextExp(leadHero.level);
    this.activeMembers = [leadHero];
    this.roster = [leadHero];
  }

  public restoreFromData(
    roster: Character[],
    activeMemberIds: string[],
    money: number,
    inventory: Item[]
  ): void {
    if (roster && roster.length > 0) {
      this.roster = roster.map(m => ({
        ...m,
        nextExp: m.nextExp && m.nextExp > 0 ? m.nextExp : PartyAggregate.calculateNextExp(m.level)
      }));
    }
    if (activeMemberIds && activeMemberIds.length > 0) {
      const restoredActive = activeMemberIds
        .map(id => this.roster.find(m => m.id === id))
        .filter((m): m is Character => !!m);
      if (restoredActive.length > 0) {
        this.activeMembers = restoredActive;
      }
    }
    if (typeof money === 'number') {
      this.money = money;
    }
    if (inventory && inventory.length > 0) {
      this.inventory = inventory;
    }
  }

  public isAllDead(): boolean {
    return this.activeMembers.length > 0 && this.activeMembers.every(m => m.stats.hp <= 0);
  }

  public hasMember(nameOrId: string): boolean {
    return this.roster.some(m => m.id === nameOrId || m.name === nameOrId);
  }

  public recruitMember(candidate: Character): boolean {
    if (this.hasMember(candidate.id) || this.hasMember(candidate.name)) {
      return false;
    }
    candidate.isUnlocked = true;
    candidate.nextExp = PartyAggregate.calculateNextExp(candidate.level);
    this.roster.push(candidate);

    // If active party has less than 4, auto add
    if (this.activeMembers.length < 4) {
      this.activeMembers.push(candidate);
    }
    return true;
  }

  public setPartySlot(slotIndex: number, characterId: string): boolean {
    if (slotIndex < 0 || slotIndex >= 4) return false;
    const target = this.roster.find(m => m.id === characterId);
    if (!target) return false;

    // Remove if already in active in another slot
    const existingIndex = this.activeMembers.findIndex(m => m.id === characterId);
    if (existingIndex >= 0) {
      const temp = this.activeMembers[slotIndex];
      this.activeMembers[slotIndex] = this.activeMembers[existingIndex];
      if (temp) {
        this.activeMembers[existingIndex] = temp;
      }
      return true;
    }

    if (slotIndex < this.activeMembers.length) {
      this.activeMembers[slotIndex] = target;
    } else {
      this.activeMembers.push(target);
    }
    return true;
  }

  // Swap two active slots
  public swapActiveSlots(slotA: number, slotB: number): boolean {
    if (slotA < 0 || slotA >= this.activeMembers.length) return false;
    if (slotB < 0 || slotB >= this.activeMembers.length) return false;
    const temp = this.activeMembers[slotA];
    this.activeMembers[slotA] = this.activeMembers[slotB];
    this.activeMembers[slotB] = temp;
    return true;
  }

  // Remove a member from active party (move to reserve), keeping at least 1 member
  public removeMemberFromActive(slotIndex: number): boolean {
    if (this.activeMembers.length <= 1) return false; // Must keep at least 1 hero
    if (slotIndex < 0 || slotIndex >= this.activeMembers.length) return false;
    this.activeMembers.splice(slotIndex, 1);
    return true;
  }

  // Directly set/replace active member at slot with any character
  public replaceActiveMember(slotIndex: number, character: Character): boolean {
    // Ensure character is in roster
    if (!this.hasMember(character.id) && !this.hasMember(character.name)) {
      character.isUnlocked = true;
      this.roster.push(character);
    }
    const realChar = this.roster.find(m => m.id === character.id || m.name === character.name) || character;

    // If character is already in active party at another slot, swap them
    const existingIdx = this.activeMembers.findIndex(m => m.id === realChar.id);
    if (existingIdx >= 0) {
      if (existingIdx === slotIndex) return true;
      const temp = this.activeMembers[slotIndex];
      this.activeMembers[slotIndex] = this.activeMembers[existingIdx];
      if (temp) {
        this.activeMembers[existingIdx] = temp;
      }
      return true;
    }

    if (slotIndex < this.activeMembers.length) {
      this.activeMembers[slotIndex] = realChar;
    } else if (this.activeMembers.length < 4) {
      this.activeMembers.push(realChar);
    } else {
      this.activeMembers[3] = realChar;
    }
    return true;
  }

  public addExpAndMoney(exp: number, gold: number): {
    leveledUp: { name: string; newLevel: number }[];
    learnedSkills: { characterName: string; skill: Skill }[];
    detailedLevelUps: DetailedLevelUp[];
  } {
    this.money += gold;
    const leveledUp: { name: string; newLevel: number }[] = [];
    const learnedSkills: { characterName: string; skill: Skill }[] = [];
    const detailedLevelUps: DetailedLevelUp[] = [];

    for (const member of this.activeMembers) {
      if (member.stats.hp <= 0) continue; // collapsed characters don't gain exp unless revived
      member.exp += exp;

      const initialLevel = member.level;
      let totalHpUp = 0;
      let totalBpUp = 0;
      let totalAtkUp = 0;
      let totalDefUp = 0;
      let totalSpeedUp = 0;

      while (member.exp >= member.nextExp) {
        member.exp -= member.nextExp;
        member.level += 1;
        member.nextExp = PartyAggregate.calculateNextExp(member.level);

        // Stat growth
        const hpUp = 12 + Math.floor(Math.random() * 8);
        const bpUp = 5 + Math.floor(Math.random() * 4);
        const atkUp = 3 + Math.floor(Math.random() * 3);
        const defUp = 2 + Math.floor(Math.random() * 2);

        member.stats.maxHp += hpUp;
        member.stats.hp = member.stats.maxHp; // full restore on level up
        member.stats.maxBp += bpUp;
        member.stats.bp = member.stats.maxBp;
        member.stats.attack += atkUp;
        member.stats.defense += defUp;
        member.stats.speed += 1;

        totalHpUp += hpUp;
        totalBpUp += bpUp;
        totalAtkUp += atkUp;
        totalDefUp += defUp;
        totalSpeedUp += 1;

        leveledUp.push({ name: member.name, newLevel: member.level });
      }

      // Check if character unlocked new breathing techniques / skills through level-up!
      const memberNewSkills: Skill[] = [];
      if (member.level > initialLevel) {
        const newSkills = checkNewLearnedSkills(member, initialLevel, member.level);
        for (const skill of newSkills) {
          if (!member.skills.some(s => s.id === skill.id)) {
            member.skills.push(skill);
            learnedSkills.push({ characterName: member.name, skill });
            memberNewSkills.push(skill);
          }
        }

        detailedLevelUps.push({
          character: member,
          name: member.name,
          oldLevel: initialLevel,
          newLevel: member.level,
          statGains: {
            hp: totalHpUp,
            bp: totalBpUp,
            attack: totalAtkUp,
            defense: totalDefUp,
            speed: totalSpeedUp,
          },
          newSkills: memberNewSkills,
        });
      }
    }

    return { leveledUp, learnedSkills, detailedLevelUps };
  }

  /**
   * Synchronize active and roster characters' skills according to their levels.
   * Ensures low level characters start with weak/basic skills and unlock stronger ones as they grow.
   */
  public syncPartySkills(): void {
    for (const m of this.roster) {
      const skills = getSkillsForLevel(m);
      if (skills.length > 0) {
        m.skills = skills;
      }
    }
  }

  public useItem(itemId: string, targetIndex: number): { success: boolean; message: string } {
    const item = this.inventory.find(i => i.id === itemId);
    if (!item || item.count <= 0) {
      return { success: false, message: 'その道具は持っていません。' };
    }

    const target = this.activeMembers[targetIndex];
    if (!target) {
      return { success: false, message: '対象が存在しません。' };
    }

    if (item.type === 'heal_hp') {
      if (target.stats.hp <= 0) {
        return { success: false, message: `${target.name}は力尽きていて傷薬を受け付けない！` };
      }
      target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + item.value);
      item.count--;
      return { success: true, message: `${target.name}の傷が癒え、HPが${item.value}回復した！` };
    }

    if (item.type === 'heal_bp') {
      if (target.stats.hp <= 0) {
        return { success: false, message: `${target.name}は倒れている！` };
      }
      target.stats.bp = Math.min(target.stats.maxBp, target.stats.bp + item.value);
      item.count--;
      return { success: true, message: `${target.name}は全集中の呼吸を整え、BPが${item.value}回復した！` };
    }

    if (item.type === 'revive') {
      if (target.stats.hp > 0) {
        return { success: false, message: `${target.name}はまだ戦える！` };
      }
      target.stats.hp = Math.round(target.stats.maxHp * (item.value / 100));
      item.count--;
      return { success: true, message: `藤の花の霊水が奇跡を起こし、${target.name}は息を吹き返した！` };
    }

    return { success: false, message: '使用できません。' };
  }
}
