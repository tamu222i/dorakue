/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Skill } from '../models/types.ts';

// Dedicated skills for Swamp Demon clones
const SWAMP_SKILLS: Record<string, Skill> = {
  swamp_sink: {
    id: 'sk_swamp_sink',
    name: '血鬼術 沼沈降',
    katagaki: '沼の鬼の血鬼術',
    breathStyle: 'blood',
    bpCost: 10,
    power: 140,
    target: 'single',
    effectType: 'damage',
    description: '足元に黒い沼を展開し、隊士を引きずり込んで窒息させる。',
    animation: 'blood_dark'
  },
  swamp_ambush: {
    id: 'sk_swamp_ambush',
    name: '血鬼術 沼中奇襲',
    katagaki: '沼の鬼の血鬼術',
    breathStyle: 'blood',
    bpCost: 12,
    power: 155,
    target: 'single',
    effectType: 'damage',
    description: '壁や地面の沼地から突如飛び出し、死角から急襲する。',
    animation: 'blood_dark'
  },
  swamp_frenzy: {
    id: 'sk_swamp_frenzy',
    name: '血鬼術 沼連撃',
    katagaki: '沼の鬼の血鬼術',
    breathStyle: 'blood',
    bpCost: 14,
    power: 150,
    target: 'all',
    effectType: 'damage',
    description: '三体の沼の鬼が同時に沼地から飛び出し、隊士全員に襲いかかる。',
    animation: 'beast_fangs'
  }
};

export class EnemyGroupService {
  /**
   * Resolves a battle encounter enemy into a group of 1 to 4 enemies.
   * Specific lore encounters naturally split into multiple bodies (e.g. Swamp Demon = 3 bodies, Susamaru & Yahaba = 2, Daki & Gyutaro = 2).
   */
  public static resolveEnemies(mainEnemy: Character, catalog: Character[]): Character[] {
    // 1. 沼の鬼 (Swamp Demon) splits into exactly 3 bodies! ("沼鬼は3人だよ")
    if (
      mainEnemy.id === 'demon_swamp' ||
      mainEnemy.name.includes('沼の鬼') ||
      mainEnemy.name.includes('沼鬼')
    ) {
      return this.createSwampDemonTrio(mainEnemy);
    }

    // 2. 朱紗丸 ＆ 矢琶羽 (2 enemies)
    if (
      mainEnemy.id === 'demon_yahaba_susamaru' ||
      (mainEnemy.name.includes('朱紗丸') && mainEnemy.name.includes('矢琶羽'))
    ) {
      const susamaru = catalog.find(c => c.id === 'demon_susamaru');
      const yahaba = catalog.find(c => c.id === 'demon_yahaba');
      if (susamaru && yahaba) {
        return [
          { ...susamaru, stats: { ...susamaru.stats } },
          { ...yahaba, stats: { ...yahaba.stats } }
        ];
      }
      return [
        {
          ...mainEnemy,
          id: 'demon_susamaru',
          name: '朱紗丸（毬の鬼）',
          stats: { ...mainEnemy.stats, maxHp: 260, hp: 260, attack: 44 }
        },
        {
          ...mainEnemy,
          id: 'demon_yahaba',
          name: '矢琶羽（矢印の鬼）',
          stats: { ...mainEnemy.stats, maxHp: 240, hp: 240, attack: 42 }
        }
      ];
    }

    // 3. 堕姫 ＆ 妓夫太郎 (2 enemies)
    if (
      mainEnemy.id === 'demon_daki_gyutaro' ||
      (mainEnemy.name.includes('堕姫') && mainEnemy.name.includes('妓夫太郎'))
    ) {
      const daki = catalog.find(c => c.id === 'demon_daki');
      const gyutaro = catalog.find(c => c.id === 'demon_gyutaro');
      if (daki && gyutaro) {
        return [
          { ...daki, stats: { ...daki.stats } },
          { ...gyutaro, stats: { ...gyutaro.stats } }
        ];
      }
    }

    // 4. 玉壺 ＆ 半天狗 (2 enemies)
    if (
      mainEnemy.id === 'demon_gyokko_hantengu' ||
      (mainEnemy.name.includes('玉壺') && mainEnemy.name.includes('半天狗'))
    ) {
      const gyokko = catalog.find(c => c.id === 'demon_gyokko');
      const zohakuten = catalog.find(c => c.id === 'demon_zohakuten');
      if (gyokko && zohakuten) {
        return [
          { ...gyokko, stats: { ...gyokko.stats } },
          { ...zohakuten, stats: { ...zohakuten.stats } }
        ];
      }
    }

    // 5. 魘夢 ＆ 猗窩座 (2 enemies)
    if (
      mainEnemy.id === 'demon_enmu_akaza' ||
      (mainEnemy.name.includes('魘夢') && mainEnemy.name.includes('猗窩座'))
    ) {
      const enmu = catalog.find(c => c.id === 'demon_enmu');
      const akaza = catalog.find(c => c.id === 'demon_akaza');
      if (enmu && akaza) {
        return [
          { ...enmu, stats: { ...enmu.stats } },
          { ...akaza, stats: { ...akaza.stats } }
        ];
      }
    }

    // 6. 半天狗の分身 (4 enemies: 積怒・可楽・空喜・哀絶)
    if (mainEnemy.id === 'demon_hantengu_clones' || mainEnemy.name.includes('喜怒哀楽')) {
      return this.createHantenguClones(mainEnemy);
    }

    // Default: Single Enemy
    return [{ ...mainEnemy, stats: { ...mainEnemy.stats } }];
  }

  /**
   * Generates Swamp Demon trio (一本角、二本角、三本角) exactly matching user requirement ("沼鬼は3人だよ")
   */
  public static createSwampDemonTrio(base: Character): Character[] {
    const level = base.level || 7;
    const hpPerBody = Math.max(120, Math.round((base.stats.maxHp * 0.55) || 160));

    const clone1: Character = {
      ...base,
      id: 'demon_swamp_1',
      name: '沼の鬼（一本角）',
      title: '沼の鬼・壱',
      stats: {
        ...base.stats,
        maxHp: hpPerBody,
        hp: hpPerBody,
        attack: Math.round(base.stats.attack * 0.85),
        speed: base.stats.speed + 1
      },
      skills: [SWAMP_SKILLS.swamp_sink],
      spriteConfig: {
        ...base.spriteConfig,
        hasHorn: true,
        accentColor: '#0284c7', // Blue
        haoriColor: '#1e293b'
      },
      lore: '一本の角を持つ沼の鬼。地中の沼を自在に行き来し、隊士の死角を狙う。'
    };

    const clone2: Character = {
      ...base,
      id: 'demon_swamp_2',
      name: '沼の鬼（二本角）',
      title: '沼の鬼・弐',
      stats: {
        ...base.stats,
        maxHp: hpPerBody,
        hp: hpPerBody,
        attack: Math.round(base.stats.attack * 0.88),
        speed: base.stats.speed + 3
      },
      skills: [SWAMP_SKILLS.swamp_ambush],
      spriteConfig: {
        ...base.spriteConfig,
        hasHorn: true,
        accentColor: '#0ea5e9', // Sky blue
        haoriColor: '#0f172a'
      },
      lore: '二本の角を持つ沼の鬼。歯軋りを鳴らしながら激しく奇襲を仕掛ける。'
    };

    const clone3: Character = {
      ...base,
      id: 'demon_swamp_3',
      name: '沼の鬼（三本角）',
      title: '沼の鬼・参',
      stats: {
        ...base.stats,
        maxHp: Math.round(hpPerBody * 1.1),
        hp: Math.round(hpPerBody * 1.1),
        attack: Math.round(base.stats.attack * 0.92),
        speed: base.stats.speed + 5
      },
      skills: [SWAMP_SKILLS.swamp_frenzy],
      spriteConfig: {
        ...base.spriteConfig,
        hasHorn: true,
        accentColor: '#38bdf8', // Light Cyan
        haoriColor: '#172554'
      },
      lore: '三本の角を持つ沼の鬼の本体格。三体連携で容赦なく隊士を取り囲む！'
    };

    return [clone1, clone2, clone3];
  }

  /**
   * Generates Hantengu's 4 emotion clones (積怒・可楽・空喜・哀絶 = 4人)
   */
  public static createHantenguClones(base: Character): Character[] {
    const hp = Math.max(180, Math.round(base.stats.maxHp * 0.45));
    const letters = [
      { name: '積怒（せきど・怒）', skillName: '血鬼術 錫杖雷撃', accent: '#ef4444' },
      { name: '可楽（からく・楽）', skillName: '血鬼術 団扇突風', accent: '#22c55e' },
      { name: '空喜（うろぎ・喜）', skillName: '血鬼術 超音波', accent: '#eab308' },
      { name: '哀絶（あいぜつ・哀）', skillName: '血鬼術 十文字槍', accent: '#3b82f6' }
    ];

    return letters.map((clone, idx) => ({
      ...base,
      id: `demon_hantengu_${idx + 1}`,
      name: clone.name,
      title: `半天狗の分身 (${idx + 1}/4)`,
      stats: {
        ...base.stats,
        maxHp: hp,
        hp: hp,
        attack: Math.round(base.stats.attack * 0.75),
        speed: base.stats.speed + idx * 2
      },
      spriteConfig: {
        ...base.spriteConfig,
        accentColor: clone.accent
      }
    }));
  }

  /**
   * Creates a wild mob group with 1 to 4 enemies (up to 4, labeling duplicates with A, B, C, D)
   */
  public static createWildEnemyGroup(candidates: Character[], requestedCount?: number): Character[] {
    if (!candidates || candidates.length === 0) return [];

    // If count not specified, randomly generate 1 to 4 enemies with weighted probability:
    // 1 enemy: 30%, 2 enemies: 35%, 3 enemies: 25%, 4 enemies: 10%
    let count = requestedCount;
    if (!count) {
      const rand = Math.random();
      if (rand < 0.30) count = 1;
      else if (rand < 0.65) count = 2;
      else if (rand < 0.90) count = 3;
      else count = 4;
    }

    count = Math.max(1, Math.min(4, count));

    const selected: Character[] = [];
    for (let i = 0; i < count; i++) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      selected.push({ ...pick, stats: { ...pick.stats } });
    }

    // Name disambiguation: If multiple enemies share the same base name, assign suffix A, B, C, D (Dragon Quest style)
    const nameCounts: Record<string, number> = {};
    selected.forEach(c => {
      nameCounts[c.name] = (nameCounts[c.name] || 0) + 1;
    });

    const letterCounters: Record<string, number> = {};
    const LETTERS = ['A', 'B', 'C', 'D'];

    return selected.map((c, idx) => {
      if (nameCounts[c.name] > 1) {
        const currentLetterIdx = letterCounters[c.name] || 0;
        letterCounters[c.name] = currentLetterIdx + 1;
        const letter = LETTERS[currentLetterIdx] || String(currentLetterIdx + 1);
        return {
          ...c,
          id: `${c.id}_${idx + 1}`,
          name: `${c.name} ${letter}`
        };
      }
      return {
        ...c,
        id: `${c.id}_${idx + 1}`
      };
    });
  }
}
