/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character } from '../models/types.ts';

export interface UpperMoonTarget {
  id: string; // primary id
  aliasIds: string[]; // alternative defeat ids that count (e.g. tag-team encounters)
  name: string;
  rankTitle: string;
  level: number;
}

export const UPPER_MOON_LIST: UpperMoonTarget[] = [
  {
    id: 'demon_daki',
    aliasIds: ['demon_daki_gyutaro'],
    name: '堕姫（だき）',
    rankTitle: '上弦の陸',
    level: 51
  },
  {
    id: 'demon_gyutaro',
    aliasIds: ['demon_daki_gyutaro'],
    name: '妓夫太郎（ぎゅうたろう）',
    rankTitle: '上弦の陸',
    level: 51
  },
  {
    id: 'demon_kaigaku',
    aliasIds: [],
    name: '獪岳（かいがく・鬼）',
    rankTitle: '新・上弦の陸',
    level: 51
  },
  {
    id: 'demon_gyokko',
    aliasIds: ['demon_gyokko_hantengu'],
    name: '玉壺（ぎょっこ）',
    rankTitle: '上弦の伍',
    level: 52
  },
  {
    id: 'demon_zohakuten',
    aliasIds: ['demon_gyokko_hantengu'],
    name: '半天狗・憎珀天（ぞうはくてん）',
    rankTitle: '上弦の肆',
    level: 52
  },
  {
    id: 'demon_nakime',
    aliasIds: [],
    name: '鳴女（なきめ）',
    rankTitle: '新・上弦の肆',
    level: 53
  },
  {
    id: 'demon_akaza',
    aliasIds: ['demon_enmu_akaza'],
    name: '猗窩座（あかざ）',
    rankTitle: '上弦の参',
    level: 50
  },
  {
    id: 'demon_doma',
    aliasIds: [],
    name: '童磨（どうま）',
    rankTitle: '上弦の弐',
    level: 54
  },
  {
    id: 'demon_kokushibo',
    aliasIds: ['demon_muzan_final'],
    name: '黒死牟（こくしぼう）',
    rankTitle: '上弦の壱',
    level: 55
  }
];

export interface HiddenKizukiEncounter {
  chapterNumber: number;
  stageName: string;
  hiddenSpotName: string;
  demonId: string;
  bossName: string;
  rankTitle: string;
  recommendedLevel: number;
  description: string;
  hint: string;
}

export const HIDDEN_TWELVE_KIZUKI_LIST: HiddenKizukiEncounter[] = [
  {
    chapterNumber: 1,
    stageName: '第1章: 藤襲山',
    hiddenSpotName: '藤襲山・藤の大樹の裏岩窟',
    demonId: 'demon_kamanue',
    bossName: '下弦の陸・釜鵺',
    rankTitle: '下弦の陸',
    recommendedLevel: 46,
    description: '無惨の粛清から辛うじて逃亡した下弦の陸・釜鵺！藤襲山の結界の狭間に身を潜めていた。',
    hint: '藤襲山の巨木と岩の裂け目から異様な骨の擦れ合う音が聞こえる…！'
  },
  {
    chapterNumber: 2,
    stageName: '第2章: 浅草街',
    hiddenSpotName: '浅草の闇路地裏・地下暗渠',
    demonId: 'demon_mukago',
    bossName: '下弦の肆・零余子',
    rankTitle: '下弦の肆',
    recommendedLevel: 47,
    description: '柱との遭遇を極限まで恐れ、浅草の大都会の地下水路に逃げ込んでいた下弦の肆・零余子！',
    hint: '浅草の賑やかな路地の地下マンホールから、怯えと殺意を孕む冷気が立ち上る…！'
  },
  {
    chapterNumber: 3,
    stageName: '第3章: 鼓屋敷',
    hiddenSpotName: '鼓屋敷・回転狂乱の隠し密室',
    demonId: 'demon_wakuraba',
    bossName: '下弦の参・病葉',
    rankTitle: '下弦の参',
    recommendedLevel: 48,
    description: '十字傷を持つ逃走の達人・下弦の参・病葉！回転する屋敷の奥の隠し部屋から神速の刃を放つ。',
    hint: '鼓屋敷の壁の回転が止まった奥、封印された襖の向こうから突風が吹き荒れている…！'
  },
  {
    chapterNumber: 4,
    stageName: '第4章: 那田蜘蛛山',
    hiddenSpotName: '那田蜘蛛山・毒繭の洞窟深部',
    demonId: 'demon_rokuro',
    bossName: '下弦の弐・轆轤',
    rankTitle: '下弦の弐',
    recommendedLevel: 49,
    description: '更なる血肉の怪力を求め、蜘蛛山の最深部で肉体を巨大化させていた下弦の弐・轆轤！',
    hint: '那田蜘蛛山の谷底、毒繭に覆われた暗黒の洞穴から地響きのような唸り声が響く…！'
  },
  {
    chapterNumber: 5,
    stageName: '第5章: 無限列車',
    hiddenSpotName: '無限列車・暴走屋根と機関車頭上',
    demonId: 'demon_enmu',
    bossName: '下弦の壱・真 魘夢',
    rankTitle: '下弦の壱',
    recommendedLevel: 50,
    description: '無限列車と一体化した真の姿！心地よい悪夢を見せて精神の核を破壊しようと襲いかかる。',
    hint: '煙を噴き上げる機関車の屋根の上、甘美な眠りの囁きが夜風に乗って聞こえてくる…！'
  },
  {
    chapterNumber: 6,
    stageName: '第6章: 吉原遊郭',
    hiddenSpotName: '吉原遊郭・大屋根の黒雷落雷点',
    demonId: 'demon_kaigaku',
    bossName: '新・上弦の陸・獪岳（鬼）',
    rankTitle: '新・上弦の陸',
    recommendedLevel: 51,
    description: '善逸の兄弟子でありながら鬼に成り下がった男。皮膚をひび割れ焦がす黒い雷で立ちはだかる。',
    hint: '遊郭の屋根の上に不気味な黒い稲妻が閃光を放ち、雷鳴が轟いている…！'
  },
  {
    chapterNumber: 7,
    stageName: '第7章: 刀鍛冶の里',
    hiddenSpotName: '刀鍛冶の里・秘湯の奥の毒泉',
    demonId: 'demon_gyokko',
    bossName: '上弦の伍・玉壺（完全体）',
    rankTitle: '上弦の伍',
    recommendedLevel: 52,
    description: '神出鬼没の芸術家気取り鬼！蛸壺地獄と毒針魚を放ち、里の温泉を毒へと変える。',
    hint: '里の奥の温泉から無数の奇怪な壺と巨大な触手が現れ、異臭を放っている…！'
  },
  {
    chapterNumber: 8,
    stageName: '第8章: 無限城',
    hiddenSpotName: '無限城・歪む蓮池の最奥',
    demonId: 'demon_nakime',
    bossName: '新・上弦の肆・鳴女',
    rankTitle: '新・上弦の肆',
    recommendedLevel: 53,
    description: '無限城の空間を自在に操る単眼の琵琶弾き！空間を捻じ曲げて隊士たちを惑わす。',
    hint: '無限城の楼閣が逆さまに回転し、妖艶な琵琶の音色が空間を切り裂く…！'
  },
  {
    chapterNumber: 9,
    stageName: '第9章: 黎明の廃墟',
    hiddenSpotName: '黎明の廃墟・万世極楽教の氷結殿',
    demonId: 'demon_doma',
    bossName: '上弦の弐・童磨（極限氷結）',
    rankTitle: '上弦の弐',
    recommendedLevel: 54,
    description: '冷気を操る万世極楽教の教祖・上弦の弐・童磨！粉微塵の氷の蓮華と巨大な氷人形を召喚する。',
    hint: '黎明の廃墟の氷柱の奥から、美しい仏像と凍てつく吹雪が舞い散る…！'
  }
];

export const HASHIRA_IDS = [
  'char_giyu',
  'char_shinobu',
  'char_rengoku',
  'char_tengen',
  'char_muichiro',
  'char_mitsuri',
  'char_gyomei',
  'char_sanemi',
  'char_obanai'
];

export class TwelveKizukiService {
  /**
   * Check upper moon defeat status
   */
  public static checkUpperMoonsDefeated(defeatedIds: Set<string> | string[]) {
    const defeatedSet = defeatedIds instanceof Set ? defeatedIds : new Set(defeatedIds);

    const details = UPPER_MOON_LIST.map(target => {
      const isDefeated = defeatedSet.has(target.id) || target.aliasIds.some(aid => defeatedSet.has(aid));
      return {
        id: target.id,
        name: target.name,
        rankTitle: target.rankTitle,
        level: target.level,
        isDefeated
      };
    });

    const defeatedCount = details.filter(d => d.isDefeated).length;
    const totalCount = UPPER_MOON_LIST.length;
    const isComplete = defeatedCount >= totalCount;

    return {
      isComplete,
      defeatedCount,
      totalCount,
      details
    };
  }

  /**
   * Get target list of all collectible allies.
   * 「全仲間は柱だけだよ」というルールに基づき、クリア条件の対象は鬼殺隊の最高戦力【九柱】全員（9名）のみ。
   */
  public static getRecruitableAllies(catalog: Character[]): Character[] {
    return catalog.filter(c => HASHIRA_IDS.includes(c.id));
  }

  /**
   * Check if all allies are recruited into the player's roster
   */
  public static checkAlliesRecruited(roster: Character[], catalog: Character[]) {
    const rosterIdSet = new Set(roster.map(r => r.id));
    const recruitableAllies = this.getRecruitableAllies(catalog);

    const recruitedCount = recruitableAllies.filter(a => rosterIdSet.has(a.id)).length;
    const totalCount = recruitableAllies.length;
    const missingAllies = recruitableAllies.filter(a => !rosterIdSet.has(a.id));
    const isComplete = recruitedCount >= totalCount && totalCount > 0;

    return {
      isComplete,
      recruitedCount,
      totalCount,
      missingAllies
    };
  }

  /**
   * Full True Clear check:
   * 1. All allies recruited
   * 2. All upper moon demons defeated
   */
  public static checkTrueCompleteClear(
    roster: Character[],
    catalog: Character[],
    defeatedIds: Set<string> | string[]
  ) {
    const alliesStatus = this.checkAlliesRecruited(roster, catalog);
    const upperMoonsStatus = this.checkUpperMoonsDefeated(defeatedIds);

    const isTrueComplete = alliesStatus.isComplete && upperMoonsStatus.isComplete;

    return {
      isTrueComplete,
      alliesStatus,
      upperMoonsStatus
    };
  }

  /**
   * Get hidden Kizuki encounter for a given chapter
   */
  public static getHiddenKizukiForChapter(chapterNumber: number): HiddenKizukiEncounter | undefined {
    return HIDDEN_TWELVE_KIZUKI_LIST.find(k => k.chapterNumber === chapterNumber);
  }
}
