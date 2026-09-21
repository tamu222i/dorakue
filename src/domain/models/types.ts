/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BreathStyle =
  | 'water'     // 水の呼吸
  | 'flame'     // 炎の呼吸
  | 'thunder'   // 雷の呼吸
  | 'beast'     // 獣の呼吸
  | 'flower'    // 花の呼吸
  | 'insect'    // 蟲の呼吸
  | 'mist'      // 霞の呼吸
  | 'love'      // 恋の呼吸
  | 'serpent'   // 蛇の呼吸
  | 'wind'      // 風の呼吸
  | 'stone'     // 岩の呼吸
  | 'sun'       // ヒノカミ神楽 / 日の呼吸
  | 'moon'      // 月の呼吸
  | 'blood'     // 血鬼術
  | 'none';     // 無し / 格闘 / 一般

export type CharacterRole = 'slayer' | 'demon' | 'support';

export type CorpsRank =
  | '柱'
  | '甲'
  | '乙'
  | '丙'
  | '丁'
  | '戊'
  | '己'
  | '庚'
  | '辛'
  | '壬'
  | '癸'
  | '一般隊士'
  | '育手'
  | '刀鍛冶'
  | '隠'
  | '一般鬼'
  | '異形鬼'
  | '下弦'
  | '上弦'
  | '鬼の始祖';

export interface StatBlock {
  maxHp: number;
  hp: number;
  maxBp: number; // 呼吸力 / 精神力 (Breath Points / MP)
  bp: number;
  attack: number;
  defense: number;
  speed: number;
  luck: number;
}

export interface Skill {
  id: string;
  name: string;
  katagaki?: string; // e.g. "壱ノ型", "血鬼術"
  breathStyle: BreathStyle;
  bpCost: number;
  power: number; // Base power multiplier (e.g., 120 = 1.2x)
  target: 'single' | 'all' | 'ally_single' | 'ally_all' | 'self';
  effectType: 'damage' | 'heal' | 'buff_attack' | 'buff_defense' | 'cure';
  description: string;
  animation: 'slash_water' | 'slash_flame' | 'lightning' | 'beast_fangs' | 'butterfly' | 'mist_cut' | 'sun_burst' | 'blood_dark' | 'heal_herb';
}

export interface SpriteConfig {
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  haoriColor: string;
  haoriPattern: 'checker_green' | 'split_red_green' | 'triangle_yellow' | 'butterfly_wing' | 'flame_edge' | 'solid_white' | 'solid_black' | 'striped_purple' | 'plain' | 'demon_mark' | 'spotted';
  hasHorn?: boolean;
  hasMask?: 'boar' | 'fox' | 'none';
  hasSword?: boolean;
  accentColor: string;
}

export interface Character {
  id: string;
  catalogNo: number; // 1 to 500
  name: string;
  title: string;
  role: CharacterRole;
  rank: CorpsRank;
  breathStyle: BreathStyle;
  level: number;
  exp: number;
  nextExp: number;
  stats: StatBlock;
  skills: Skill[];
  spriteConfig: SpriteConfig;
  lore: string;
  isUnlocked: boolean; // in player's recruitment / discovered collection
  isDefeated?: boolean; // for demons
}

export interface StoryChoice {
  id: string;
  label: string;
  description: string;
  recruitCharacterId: string; // Character that joins if this choice is picked
  bonusCharacterIds?: string[]; // Additional companions that join together
  resultDialogue: string[];
}

export interface StoryChapter {
  id: string;
  chapterNumber: number; // 1 to 8
  title: string;
  subTitle: string;
  locationName: string;
  description: string;
  bossCharacterId: string;
  bossName: string;
  recommendedLevel: number;
  unlockedRecruits: string[]; // default unlocked recruits
  choices?: StoryChoice[]; // Branching recruitment choices
  introDialogues: string[];
  victoryDialogues: string[];
  rewardExp: number;
  rewardMoney: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'heal_hp' | 'heal_bp' | 'revive' | 'buff';
  value: number;
  count: number;
}
