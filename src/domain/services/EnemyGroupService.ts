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

// Standard skills for wild mob demons (scratch, bite, pounce, roar)
const MOB_ATTACK_SKILLS: Record<string, Skill> = {
  scratch: {
    id: 'sk_mob_scratch',
    name: '引っ掻き',
    katagaki: '爪攻撃',
    breathStyle: 'none',
    bpCost: 0,
    power: 75,
    target: 'single',
    effectType: 'damage',
    description: '鋭い鉤爪を振り下ろして引っ掻く。',
    animation: 'beast_fangs'
  },
  bite: {
    id: 'sk_mob_bite',
    name: '噛みつき',
    katagaki: '牙攻撃',
    breathStyle: 'none',
    bpCost: 4,
    power: 95,
    target: 'single',
    effectType: 'damage',
    description: '鋭い牙を剥き出しにして肉片を食いちぎる。',
    animation: 'beast_fangs'
  },
  pounce: {
    id: 'sk_mob_pounce',
    name: '飛びかかり',
    katagaki: '肉弾強襲',
    breathStyle: 'none',
    bpCost: 6,
    power: 110,
    target: 'single',
    effectType: 'damage',
    description: '全速力で飛びかかり、押し倒して爪を立てる。',
    animation: 'beast_fangs'
  },
  roar: {
    id: 'sk_mob_roar',
    name: '鬼の威嚇咆哮',
    katagaki: '威嚇',
    breathStyle: 'none',
    bpCost: 8,
    power: 85,
    target: 'all',
    effectType: 'damage',
    description: '耳をつんざく咆哮を放ち、周囲の隊士全体に衝撃を与える。',
    animation: 'blood_dark'
  }
};

export class EnemyGroupService {
  /**
   * Scales an enemy for 2nd and subsequent playthroughs (2周目はレベル1上がっていく感じで調整)
   * 2周目: Stage 1 = Lv.46, Stage 2 = Lv.47, ..., Stage 9 = Lv.54 (+1 per stage!)
   * 3周目+: +(playthroughCount - 2)
   */
  public static scaleEnemyForPlaythrough(
    enemy: Character,
    playthroughCount: number = 1,
    chapterNumber: number = 1
  ): Character {
    if (playthroughCount < 2) {
      return { ...enemy, stats: { ...enemy.stats } };
    }

    const loopBonus = playthroughCount - 2;
    // 2周目は各ステージでレベルが1ずつ上がっていく (第1章:46, 第2章:47 ... 第9章:54)
    const targetLevel = 45 + chapterNumber + loopBonus;
    const baseLevel = Math.max(1, enemy.level || 1);
    const scaleRatio = Math.max(1.0, targetLevel / baseLevel);

    const scaledMaxHp = Math.round(enemy.stats.maxHp * Math.min(2.5, Math.max(1.0, scaleRatio * 0.95)));
    const scaledAttack = Math.round(enemy.stats.attack * Math.min(1.8, Math.max(1.0, Math.sqrt(scaleRatio) * 1.05)));
    const scaledDefense = Math.round(enemy.stats.defense * Math.min(1.6, Math.max(1.0, Math.sqrt(scaleRatio) * 1.02)));

    return {
      ...enemy,
      level: targetLevel,
      stats: {
        ...enemy.stats,
        maxHp: scaledMaxHp,
        hp: scaledMaxHp,
        attack: scaledAttack,
        defense: scaledDefense,
        speed: enemy.stats.speed + Math.min(15, chapterNumber)
      }
    };
  }

  /**
   * Resolves a battle encounter enemy into a group of 1 to 4 enemies.
   * Specific lore encounters naturally split into multiple bodies (e.g. Swamp Demon = 3 bodies, Susamaru & Yahaba = 2, Daki & Gyutaro = 2).
   */
  public static resolveEnemies(
    mainEnemy: Character,
    catalog: Character[],
    playthroughCount: number = 1,
    chapterNumber: number = 1
  ): Character[] {
    let list: Character[] = [];

    // 1. 沼の鬼 (Swamp Demon) splits into exactly 3 bodies! ("沼鬼は3人だよ")
    if (
      mainEnemy.id === 'demon_swamp' ||
      mainEnemy.name.includes('沼の鬼') ||
      mainEnemy.name.includes('沼鬼')
    ) {
      list = this.createSwampDemonTrio(mainEnemy);
    } else if (
      mainEnemy.id === 'demon_yahaba_susamaru' ||
      (mainEnemy.name.includes('朱紗丸') && mainEnemy.name.includes('矢琶羽'))
    ) {
      // 2. 朱紗丸 ＆ 矢琶羽 (2 enemies)
      const susamaru = catalog.find(c => c.id === 'demon_susamaru');
      const yahaba = catalog.find(c => c.id === 'demon_yahaba');
      if (susamaru && yahaba) {
        list = [
          { ...susamaru, stats: { ...susamaru.stats } },
          { ...yahaba, stats: { ...yahaba.stats } }
        ];
      } else {
        list = [
          {
            ...mainEnemy,
            id: 'demon_susamaru',
            name: '朱紗丸（毬の鬼）',
            stats: { ...mainEnemy.stats, maxHp: 750, hp: 750, attack: 64 }
          },
          {
            ...mainEnemy,
            id: 'demon_yahaba',
            name: '矢琶羽（矢印の鬼）',
            stats: { ...mainEnemy.stats, maxHp: 700, hp: 700, attack: 65 }
          }
        ];
      }
    } else if (
      mainEnemy.id === 'demon_daki_gyutaro' ||
      (mainEnemy.name.includes('堕姫') && mainEnemy.name.includes('妓夫太郎'))
    ) {
      // 3. 堕姫 ＆ 妓夫太郎 (2 enemies)
      const daki = catalog.find(c => c.id === 'demon_daki');
      const gyutaro = catalog.find(c => c.id === 'demon_gyutaro');
      if (daki && gyutaro) {
        list = [
          { ...daki, stats: { ...daki.stats } },
          { ...gyutaro, stats: { ...gyutaro.stats } }
        ];
      } else {
        list = [{ ...mainEnemy, stats: { ...mainEnemy.stats } }];
      }
    } else if (
      mainEnemy.id === 'demon_gyokko_hantengu' ||
      (mainEnemy.name.includes('玉壺') && mainEnemy.name.includes('半天狗'))
    ) {
      // 4. 玉壺 ＆ 半天狗 (2 enemies)
      const gyokko = catalog.find(c => c.id === 'demon_gyokko');
      const zohakuten = catalog.find(c => c.id === 'demon_zohakuten');
      if (gyokko && zohakuten) {
        list = [
          { ...gyokko, stats: { ...gyokko.stats } },
          { ...zohakuten, stats: { ...zohakuten.stats } }
        ];
      } else {
        list = [{ ...mainEnemy, stats: { ...mainEnemy.stats } }];
      }
    } else if (
      mainEnemy.id === 'demon_enmu_akaza' ||
      (mainEnemy.name.includes('魘夢') && mainEnemy.name.includes('猗窩座'))
    ) {
      // 5. 魘夢 ＆ 猗窩座 (2 enemies)
      const enmu = catalog.find(c => c.id === 'demon_enmu');
      const akaza = catalog.find(c => c.id === 'demon_akaza');
      if (enmu && akaza) {
        list = [
          { ...enmu, stats: { ...enmu.stats } },
          { ...akaza, stats: { ...akaza.stats } }
        ];
      } else {
        list = [{ ...mainEnemy, stats: { ...mainEnemy.stats } }];
      }
    } else if (mainEnemy.id === 'demon_hantengu_clones' || mainEnemy.name.includes('喜怒哀楽')) {
      // 6. 半天狗の分身 (4 enemies: 積怒・可楽・空喜・哀絶)
      list = this.createHantenguClones(mainEnemy);
    } else {
      // Default: Single Enemy
      list = [{ ...mainEnemy, stats: { ...mainEnemy.stats } }];
    }

    // Apply 2周目 level scaling if active
    if (playthroughCount >= 2) {
      return list.map(e => this.scaleEnemyForPlaythrough(e, playthroughCount, chapterNumber));
    }
    return list;
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

  /**
   * Strictly determines whether a character is a wild mob demon (雑魚鬼・野良鬼),
   * strictly excluding bosses, Kizuki, and story bosses so player can safely grind levels.
   */
  public static isMobDemon(c: Character): boolean {
    if (c.role !== 'demon') return false;
    // Explicit mob demons generated for leveling up (catalog 201-300)
    if (c.id.startsWith('demon_mob_')) return true;
    // Disqualify by rank (Kizuki / Demon Progenitor)
    if (c.rank === '下弦' || c.rank === '上弦' || c.rank === '鬼の始祖') return false;

    // Explicit boss IDs to exclude
    const bossIds = new Set([
      'demon_temple', 'demon_hand', 'demon_swamp', 'demon_yahaba_susamaru',
      'demon_susamaru', 'demon_yahaba', 'demon_kyogai', 'demon_tongue',
      'demon_spider_mother', 'demon_spider_father', 'demon_spider_brother', 'demon_spider_sister',
      'demon_rui', 'demon_enmu_akaza', 'demon_enmu', 'demon_akaza',
      'demon_daki_gyutaro', 'demon_daki', 'demon_gyutaro', 'demon_kaigaku',
      'demon_gyokko_hantengu', 'demon_gyokko', 'demon_hantengu', 'demon_doma',
      'demon_muzan_final', 'demon_kokushibo', 'demon_tanjiro',
      'demon_kamanue', 'demon_mukago', 'demon_wakuraba', 'demon_rokuro'
    ]);
    if (bossIds.has(c.id)) return false;

    // Any ID with 'boss' or 'kizuki'
    if (c.id.includes('boss') || c.id.includes('kizuki')) return false;

    return c.rank === '一般鬼' || c.rank === '異形鬼';
  }

  /**
   * Scales a wild mob demon's level and stats appropriately for the target level.
   * Keeps stats balanced so party members are not one-shot killed and can level up smoothly.
   */
  public static scaleMobDemonToLevel(baseMob: Character, targetLevel: number): Character {
    const safeTargetLevel = Math.max(1, targetLevel);
    const baseLevel = Math.max(1, baseMob.level || 1);

    // Select skills appropriate for scaled level
    let mobSkills: Skill[];
    if (safeTargetLevel <= 3) {
      mobSkills = [MOB_ATTACK_SKILLS.scratch];
    } else if (safeTargetLevel <= 7) {
      mobSkills = [MOB_ATTACK_SKILLS.scratch, MOB_ATTACK_SKILLS.bite];
    } else if (safeTargetLevel <= 15) {
      mobSkills = [MOB_ATTACK_SKILLS.scratch, MOB_ATTACK_SKILLS.bite, MOB_ATTACK_SKILLS.pounce];
    } else {
      mobSkills = [MOB_ATTACK_SKILLS.scratch, MOB_ATTACK_SKILLS.bite, MOB_ATTACK_SKILLS.pounce, MOB_ATTACK_SKILLS.roar];
    }

    if (safeTargetLevel === baseLevel) {
      return {
        ...baseMob,
        skills: mobSkills,
        stats: { ...baseMob.stats }
      };
    }

    const ratio = safeTargetLevel / baseLevel;
    // Balanced mob stats:
    // At Lv.1 ~35 HP, 14 Atk, 8 Def, 16 Spd.
    // At Lv.10 ~180 HP, 55 Atk, 38 Def, 30 Spd.
    // At Lv.25 ~560 HP, 116 Atk, 85 Def, 53 Spd.
    // At Lv.45 ~1050 HP, 170 Atk, 125 Def, 72 Spd.
    const scaledMaxHp = Math.max(35, Math.round(baseMob.stats.maxHp * Math.pow(ratio, 1.05)));
    const scaledAttack = Math.max(12, Math.round(baseMob.stats.attack * Math.pow(ratio, 0.72)));
    const scaledDefense = Math.max(6, Math.round(baseMob.stats.defense * Math.pow(ratio, 0.70)));
    const scaledSpeed = Math.max(12, Math.round(baseMob.stats.speed * Math.pow(ratio, 0.50)));

    return {
      ...baseMob,
      level: safeTargetLevel,
      title: `${baseMob.name} (Lv.${safeTargetLevel})`,
      skills: mobSkills,
      stats: {
        ...baseMob.stats,
        maxHp: scaledMaxHp,
        hp: scaledMaxHp,
        maxBp: Math.round(20 + safeTargetLevel * 2),
        bp: Math.round(20 + safeTargetLevel * 2),
        attack: scaledAttack,
        defense: scaledDefense,
        speed: scaledSpeed,
        luck: baseMob.stats.luck
      }
    };
  }

  /**
   * Generates a balanced mob group (1 to 4 enemies) for training based on target level.
   * STRICTLY excludes boss characters so that player can safely grind levels!
   */
  public static createTrainingMobGroup(
    catalog: Character[],
    targetLevel: number,
    requestedCount?: number
  ): Character[] {
    const safeLevel = Math.max(1, targetLevel);

    // 1. Filter ONLY mob demons
    const allMobs = catalog.filter(c => EnemyGroupService.isMobDemon(c));
    const pool = allMobs.length > 0
      ? allMobs
      : catalog.filter(c => c.id.startsWith('demon_mob_'));

    if (pool.length === 0) {
      // Fallback safe dummy mob if pool is somehow empty
      const dummy: Character = {
        id: 'demon_mob_dummy',
        catalogNo: 201,
        name: '足鬼',
        title: `藤襲山の野良鬼 (Lv.${safeLevel})`,
        role: 'demon',
        rank: '一般鬼',
        breathStyle: 'blood',
        level: safeLevel,
        exp: 0,
        nextExp: 0,
        stats: {
          maxHp: 35 + safeLevel * 18,
          hp: 35 + safeLevel * 18,
          maxBp: 20 + safeLevel * 2,
          bp: 20 + safeLevel * 2,
          attack: 14 + Math.round(safeLevel * 3.2),
          defense: 8 + Math.round(safeLevel * 2.2),
          speed: 15 + Math.round(safeLevel * 1.1),
          luck: 10
        },
        skills: [MOB_ATTACK_SKILLS.scratch],
        spriteConfig: {
          hairColor: '#1e293b',
          skinColor: '#cbd5e1',
          eyeColor: '#ef4444',
          haoriColor: '#475569',
          haoriPattern: 'plain',
          hasHorn: false,
          accentColor: '#475569'
        },
        lore: '野良鬼。修業用。',
        isUnlocked: false
      };
      return EnemyGroupService.createWildEnemyGroup([dummy], requestedCount);
    }

    // 2. Select candidates whose base levels are closest to safeLevel
    const sorted = [...pool].sort((a, b) => Math.abs(a.level - safeLevel) - Math.abs(b.level - safeLevel));
    const closestCandidates = sorted.slice(0, 16);

    // 3. Scale candidate mobs to safeLevel
    const scaledCandidates = closestCandidates.map(mob =>
      EnemyGroupService.scaleMobDemonToLevel(mob, safeLevel)
    );

    return EnemyGroupService.createWildEnemyGroup(scaledCandidates, requestedCount);
  }
}
