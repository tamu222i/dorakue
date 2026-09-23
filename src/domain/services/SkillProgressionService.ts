/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Skill, BreathStyle } from '../models/types.ts';

/**
 * Full master catalogue of breathing techniques and arts
 * from weak/basic starter techniques to ultimate legendary secret arts!
 */
export const MASTER_SKILLS: Record<string, Skill> = {
  // === BASIC STARTER TECHNIQUES (呼吸習得前の初歩技・無呼吸) ===
  starter_slash: {
    id: 'sk_starter_slash',
    name: '基礎・日輪刀の連撃',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 70,
    target: 'single',
    effectType: 'damage',
    description: '呼吸法を会得する前の素朴な刀の打ち込み。力強い太刀筋で斬りつける。',
    animation: 'slash_water'
  },
  starter_thrust: {
    id: 'sk_starter_thrust',
    name: '基礎・踏み込み突き',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 60,
    target: 'single',
    effectType: 'damage',
    description: '足腰を低く沈めて体重を乗せて放つ素朴な突き。呼吸力を使わず繰り出せる。',
    animation: 'slash_water'
  },
  starter_unarmed: {
    id: 'sk_starter_unarmed',
    name: '基礎・徒手格闘/体当たり',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 55,
    target: 'single',
    effectType: 'damage',
    description: '刀を使わず放つ素手の拳撃や体当たり。敵の体勢を崩す。',
    animation: 'beast_fangs'
  },
  starter_aid: {
    id: 'sk_starter_aid',
    name: '救急の手当',
    katagaki: '手当',
    breathStyle: 'none',
    bpCost: 2,
    power: 60,
    target: 'ally_single',
    effectType: 'heal',
    description: '清潔な布や薬草を使って傷口を手当し、HPをわずかに回復する。',
    animation: 'heal_herb'
  },
  weak_water_poke: {
    id: 'sk_weak_water',
    name: '基礎・素朴な突き',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 65,
    target: 'single',
    effectType: 'damage',
    description: '呼吸も浅い初心者の頼りない突き。威力は控えめ。',
    animation: 'slash_water'
  },
  weak_flame_poke: {
    id: 'sk_weak_flame',
    name: '基礎・打ち込み',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 65,
    target: 'single',
    effectType: 'damage',
    description: '初歩の太刀筋で放つ牽制の一撃。',
    animation: 'slash_flame'
  },
  weak_thunder_poke: {
    id: 'sk_weak_thunder',
    name: '基礎・怯えの一突き',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 65,
    target: 'single',
    effectType: 'damage',
    description: '震えながら放つ足踏み突き。まだ雷の速さはない。',
    animation: 'lightning'
  },
  weak_beast_scratch: {
    id: 'sk_weak_beast',
    name: '基礎・猪突引っかき',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 68,
    target: 'single',
    effectType: 'damage',
    description: '力任せに爪先や二刀の柄で叩く荒削りな攻撃。',
    animation: 'beast_fangs'
  },
  weak_sun_slash: {
    id: 'sk_weak_sun',
    name: '基礎・炭焼きの太刀',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 70,
    target: 'single',
    effectType: 'damage',
    description: '薪を割るような素朴な太刀筋。呼吸の真価はまだ眠っている。',
    animation: 'slash_flame'
  },
  weak_demon_scratch: {
    id: 'sk_weak_demon',
    name: '基礎・鬼の爪撃',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 65,
    target: 'single',
    effectType: 'damage',
    description: '鋭い爪で軽く引っ掻く。血鬼術の力は込められていない。',
    animation: 'beast_fangs'
  },
  weak_generic_slash: {
    id: 'sk_weak_generic',
    name: '基礎・がむしゃら斬り',
    katagaki: '基本技',
    breathStyle: 'none',
    bpCost: 0,
    power: 60,
    target: 'single',
    effectType: 'damage',
    description: '日輪刀を両手で必死に振り下ろす初歩の斬撃。',
    animation: 'slash_water'
  },

  // === RECOVERY & BUFF ===
  heal_herb: {
    id: 'sk_heal_basic',
    name: '全集中 常中・治癒',
    katagaki: '呼吸法',
    breathStyle: 'water',
    bpCost: 8,
    power: 120,
    target: 'ally_single',
    effectType: 'heal',
    description: '肺活量を高め、全身の血行を整えて味方の傷を癒す。',
    animation: 'heal_herb'
  },
  heal_herb_advanced: {
    id: 'sk_heal_advanced',
    name: '全集中・霊薬散布の呼吸',
    katagaki: '秘伝治癒',
    breathStyle: 'water',
    bpCost: 16,
    power: 240,
    target: 'ally_all',
    effectType: 'heal',
    description: '藤の花エキスを霧状に散布し、味方全員の傷を大きく癒す。',
    animation: 'heal_herb'
  },

  // === 水の呼吸 ===
  water_surface_slash: {
    id: 'sk_water_1',
    name: '壱ノ型 水面斬り',
    katagaki: '水の呼吸',
    breathStyle: 'water',
    bpCost: 4,
    power: 125,
    target: 'single',
    effectType: 'damage',
    description: '交差するように水平に放つ水流の斬撃。',
    animation: 'slash_water'
  },
  water_wheel: {
    id: 'sk_water_2',
    name: '弐ノ型 水車',
    katagaki: '水の呼吸',
    breathStyle: 'water',
    bpCost: 8,
    power: 160,
    target: 'single',
    effectType: 'damage',
    description: '垂直に宙を舞い、円を描くように斬り下ろす。',
    animation: 'slash_water'
  },
  water_striking_tide: {
    id: 'sk_water_4',
    name: '肆ノ型 打ち潮',
    katagaki: '水の呼吸',
    breathStyle: 'water',
    bpCost: 12,
    power: 195,
    target: 'all',
    effectType: 'damage',
    description: '淀みない流れるような剣戟で複数の敵を一瞬で撫で斬る。',
    animation: 'slash_water'
  },
  water_drop_ripple: {
    id: 'sk_water_7',
    name: '漆ノ型 雫波紋突き',
    katagaki: '水の呼吸',
    breathStyle: 'water',
    bpCost: 14,
    power: 215,
    target: 'single',
    effectType: 'damage',
    description: '波紋の中心を突くように放つ、水の呼吸で最速の突き技。',
    animation: 'slash_water'
  },
  water_flow: {
    id: 'sk_water_10',
    name: '拾ノ型 生生流転',
    katagaki: '水の呼吸',
    breathStyle: 'water',
    bpCost: 20,
    power: 260,
    target: 'single',
    effectType: 'damage',
    description: '回転を重ねるごとに龍のような激流となって威力を増す大技。',
    animation: 'slash_water'
  },
  water_dead_calm: {
    id: 'sk_water_11',
    name: '拾壱ノ型 凪（水柱奥義）',
    katagaki: '水の呼吸・奥義',
    breathStyle: 'water',
    bpCost: 28,
    power: 380,
    target: 'all',
    effectType: 'damage',
    description: '間合いに入った攻撃を静寂の水面のように無へと帰す、冨岡義勇の独自奥義。',
    animation: 'slash_water',
    isUltimate: true
  },

  // === ヒノカミ神楽 / 日の呼吸 ===
  hinokami_enbu: {
    id: 'sk_sun_1',
    name: 'ヒノカミ神楽 円舞',
    katagaki: '日の呼吸',
    breathStyle: 'sun',
    bpCost: 16,
    power: 250,
    target: 'single',
    effectType: 'damage',
    description: '弧を描く猛烈な炎の刃で鬼を袈裟斬りにする。',
    animation: 'sun_burst'
  },
  hinokami_clear_sky: {
    id: 'sk_sun_2',
    name: 'ヒノカミ神楽 碧羅の天',
    katagaki: '日の呼吸',
    breathStyle: 'sun',
    bpCost: 26,
    power: 330,
    target: 'all',
    effectType: 'damage',
    description: '天に向かって青い炎の輪を描き、敵全体を焼き払う。',
    animation: 'sun_burst'
  },
  hinokami_sun_dragon: {
    id: 'sk_sun_dragon',
    name: 'ヒノカミ神楽 日暈の龍 頭舞い（奥義）',
    katagaki: '日の呼吸・奥義',
    breathStyle: 'sun',
    bpCost: 38,
    power: 450,
    target: 'all',
    effectType: 'damage',
    description: '太陽を纏う炎龍のように飛び回り、幾重もの神速の刃で敵陣を灰燼に帰す究極奥義。',
    animation: 'sun_burst',
    isUltimate: true
  },
  yoriichi_thirteenth: {
    id: 'sk_sun_yoriichi',
    name: '日の呼吸 拾参ノ型 始まりの剣技（神境）',
    katagaki: '日の呼吸・神境',
    breathStyle: 'sun',
    bpCost: 42,
    power: 500,
    target: 'all',
    effectType: 'damage',
    description: '十二の型を円環のように途切れなく繋ぎ続ける、継国縁壱の到達した神の領域。',
    animation: 'sun_burst',
    isUltimate: true
  },

  // === 雷の呼吸 ===
  thunder_clap: {
    id: 'sk_thunder_1',
    name: '壱ノ型 霹靂一閃',
    katagaki: '雷の呼吸',
    breathStyle: 'thunder',
    bpCost: 6,
    power: 160,
    target: 'single',
    effectType: 'damage',
    description: '目にも止まらぬ電光石火の踏み込みで敵を一瞬で居合斬り。',
    animation: 'lightning'
  },
  thunder_clap_sixfold: {
    id: 'sk_thunder_6',
    name: '壱ノ型 霹靂一閃 六連',
    katagaki: '雷の呼吸',
    breathStyle: 'thunder',
    bpCost: 14,
    power: 230,
    target: 'all',
    effectType: 'damage',
    description: '落雷のような跳躍を六度連続で繰り出し、敵全体を電撃で切り刻む。',
    animation: 'lightning'
  },
  thunder_clap_godspeed: {
    id: 'sk_thunder_godspeed',
    name: '壱ノ型 霹靂一閃 神速',
    katagaki: '雷の呼吸',
    breathStyle: 'thunder',
    bpCost: 22,
    power: 310,
    target: 'single',
    effectType: 'damage',
    description: '己の筋肉と骨の限界を超えて放つ、肉眼では追えない超高速の居合。',
    animation: 'lightning'
  },
  thunder_god: {
    id: 'sk_thunder_7',
    name: '漆ノ型 火雷神（善逸奥義）',
    katagaki: '雷の呼吸・善逸奥義',
    breathStyle: 'thunder',
    bpCost: 36,
    power: 430,
    target: 'single',
    effectType: 'damage',
    description: '善逸が生み出した炎を纏う黄金の龍のような超神速の一撃！',
    animation: 'lightning',
    isUltimate: true
  },

  // === 獣の呼吸 ===
  beast_pierce: {
    id: 'sk_beast_1',
    name: '壱ノ牙 穿ち抜き',
    katagaki: '獣の呼吸',
    breathStyle: 'beast',
    bpCost: 5,
    power: 135,
    target: 'single',
    effectType: 'damage',
    description: '二振りの刃を重ねて相手の首を強烈に突き刺す。',
    animation: 'beast_fangs'
  },
  beast_fangs: {
    id: 'sk_beast_5',
    name: '伍ノ牙 狂い裂き',
    katagaki: '獣の呼吸',
    breathStyle: 'beast',
    bpCost: 10,
    power: 185,
    target: 'all',
    effectType: 'damage',
    description: '二振りの刃を四方八方に乱れ斬り、敵陣を切り裂く。',
    animation: 'beast_fangs'
  },
  beast_devour: {
    id: 'sk_beast_3',
    name: '参ノ牙 喰い裂き',
    katagaki: '獣の呼吸',
    breathStyle: 'beast',
    bpCost: 16,
    power: 245,
    target: 'single',
    effectType: 'damage',
    description: '獣の牙のように二本の刃で敵の首を挟み込んで一気に引き裂く。',
    animation: 'beast_fangs'
  },
  beast_rampage: {
    id: 'sk_beast_rampage',
    name: '狂乱爆裂猛進・獣の咆哮（奥義）',
    katagaki: '獣の呼吸・奥義',
    breathStyle: 'beast',
    bpCost: 30,
    power: 390,
    target: 'all',
    effectType: 'damage',
    description: '野性を極限まで解き放ち、猪突猛進に暴れまわる伊之助の怒涛の連撃。',
    animation: 'beast_fangs',
    isUltimate: true
  },

  // === 炎の呼吸 ===
  flame_shiranui: {
    id: 'sk_flame_1',
    name: '壱ノ型 不知火',
    katagaki: '炎の呼吸',
    breathStyle: 'flame',
    bpCost: 6,
    power: 140,
    target: 'single',
    effectType: 'damage',
    description: '炎の如き勢いで突進し、一閃で敵を切り伏せる。',
    animation: 'slash_flame'
  },
  flame_rising: {
    id: 'sk_flame_2',
    name: '弐ノ型 昇り炎天',
    katagaki: '炎の呼吸',
    breathStyle: 'flame',
    bpCost: 12,
    power: 190,
    target: 'single',
    effectType: 'damage',
    description: '炎を噴き上げるように下から上へと刃を斬り上げる。',
    animation: 'slash_flame'
  },
  flame_tiger: {
    id: 'sk_flame_5',
    name: '伍ノ型 炎虎',
    katagaki: '炎の呼吸',
    breathStyle: 'flame',
    bpCost: 18,
    power: 265,
    target: 'single',
    effectType: 'damage',
    description: '炎を纏う獰猛な虎の形となって突進する高威力の一撃。',
    animation: 'slash_flame'
  },
  flame_rengoku: {
    id: 'sk_flame_9',
    name: '玖ノ型 煉獄（炎柱奥義）',
    katagaki: '炎の呼吸・奥義',
    breathStyle: 'flame',
    bpCost: 36,
    power: 440,
    target: 'all',
    effectType: 'damage',
    description: '心を燃やし大地を抉る轟音の突進！炎柱が誇る最強の奥義。',
    animation: 'slash_flame',
    isUltimate: true
  },

  // === 蟲の呼吸 ===
  insect_bee: {
    id: 'sk_insect_bee',
    name: '蜂ノ舞 真靡き',
    katagaki: '蟲の呼吸',
    breathStyle: 'insect',
    bpCost: 6,
    power: 135,
    target: 'single',
    effectType: 'damage',
    description: '蜂の針のように鋭く踏み込み、毒を仕込んだ一突きを浴びせる。',
    animation: 'butterfly'
  },
  insect_dance: {
    id: 'sk_insect_1',
    name: '蝶ノ舞 戯れ',
    katagaki: '蟲の呼吸',
    breathStyle: 'insect',
    bpCost: 12,
    power: 190,
    target: 'single',
    effectType: 'damage',
    description: '蝶のように軽やかに舞い、藤の花の毒を仕込んだ針で急所を突く。',
    animation: 'butterfly'
  },
  insect_centipede: {
    id: 'sk_insect_centipede',
    name: '蜈蚣ノ舞 百足蛇腹（蟲柱奥義）',
    katagaki: '蟲の呼吸・奥義',
    breathStyle: 'insect',
    bpCost: 28,
    power: 380,
    target: 'single',
    effectType: 'damage',
    description: '百足のようにうねりながら全方向から死角を突き、致死量の毒を撃ち込む奥義。',
    animation: 'butterfly',
    isUltimate: true
  },

  // === 音の呼吸 ===
  sound_roar: {
    id: 'sk_sound_1',
    name: '壱ノ型 轟',
    katagaki: '音の呼吸',
    breathStyle: 'wind',
    bpCost: 8,
    power: 155,
    target: 'single',
    effectType: 'damage',
    description: '双刀を豪快に振り下ろし、爆薬とともに大音響で切り裂く。',
    animation: 'lightning'
  },
  sound_symphony: {
    id: 'sk_sound_5',
    name: '伍ノ型 鳴弦奏々（音柱奥義）',
    katagaki: '音の呼吸・奥義',
    breathStyle: 'wind',
    bpCost: 28,
    power: 400,
    target: 'all',
    effectType: 'damage',
    description: '炸裂玉と双刀を爆音とともに超高速回転させ、譜面通りに周囲を一掃するド派手な奥義。',
    animation: 'lightning',
    isUltimate: true
  },

  // === 霞の呼吸 ===
  mist_flow: {
    id: 'sk_mist_4',
    name: '肆ノ型 移流斬り',
    katagaki: '霞の呼吸',
    breathStyle: 'mist',
    bpCost: 8,
    power: 150,
    target: 'single',
    effectType: 'damage',
    description: '霞が流れるように素早くすれ違いざまに切り抜ける。',
    animation: 'mist_cut'
  },
  mist_sea: {
    id: 'sk_mist_5',
    name: '伍ノ型 霞雲の海',
    katagaki: '霞の呼吸',
    breathStyle: 'mist',
    bpCost: 14,
    power: 220,
    target: 'all',
    effectType: 'damage',
    description: '霞が立ち込めるように広範囲に無数の細かい斬撃を浴びせる。',
    animation: 'mist_cut'
  },
  mist_seventh: {
    id: 'sk_mist_7',
    name: '漆ノ型 朧（霞柱奥義）',
    katagaki: '霞の呼吸・奥義',
    breathStyle: 'mist',
    bpCost: 30,
    power: 410,
    target: 'single',
    effectType: 'damage',
    description: '霞の揺らぎのように緩急をつけ、敵の視界から完全に消え去り首を断つ無一郎の独自奥義。',
    animation: 'mist_cut',
    isUltimate: true
  },

  // === 恋の呼吸 ===
  love_shiver: {
    id: 'sk_love_1',
    name: '壱ノ型 初恋のわななき',
    katagaki: '恋の呼吸',
    breathStyle: 'love',
    bpCost: 8,
    power: 150,
    target: 'single',
    effectType: 'damage',
    description: 'しなる刀を走らせて滑らかに切り裂く。',
    animation: 'beast_fangs'
  },
  love_claws: {
    id: 'sk_love_5',
    name: '伍ノ型 揺らめく恋情・乱れ爪',
    katagaki: '恋の呼吸',
    breathStyle: 'love',
    bpCost: 18,
    power: 240,
    target: 'all',
    effectType: 'damage',
    description: '新体操のようにしなる日輪刀を振り回し、広範囲を切り刻む。',
    animation: 'beast_fangs'
  },
  love_cat_wind: {
    id: 'sk_love_6',
    name: '陸ノ型 猫足恋風（恋柱奥義）',
    katagaki: '恋の呼吸・奥義',
    breathStyle: 'love',
    bpCost: 28,
    power: 390,
    target: 'all',
    effectType: 'damage',
    description: '宙を回転しながら猫のように身軽にしなやかな刃の嵐を巻き起こす奥義。',
    animation: 'beast_fangs',
    isUltimate: true
  },

  // === 岩の呼吸 ===
  stone_double: {
    id: 'sk_stone_1',
    name: '壱ノ型 蛇紋岩・双極',
    katagaki: '岩の呼吸',
    breathStyle: 'stone',
    bpCost: 8,
    power: 160,
    target: 'single',
    effectType: 'damage',
    description: '鉄球と斧を同時に投擲し、敵を両側から挟み潰す。',
    animation: 'beast_fangs'
  },
  stone_ultimate: {
    id: 'sk_stone_5',
    name: '伍ノ型 瓦輪刑部（岩柱奥義）',
    katagaki: '岩の呼吸・奥義',
    breathStyle: 'stone',
    bpCost: 32,
    power: 430,
    target: 'all',
    effectType: 'damage',
    description: '空中から鉄球と斧を猛烈な勢いで乱れ撃ち、大地ごと敵を粉砕する岩柱の奥義。',
    animation: 'sun_burst',
    isUltimate: true
  },

  // === 風の呼吸 ===
  wind_dust: {
    id: 'sk_wind_1',
    name: '壱ノ型 塵旋風・削ぎ',
    katagaki: '風の呼吸',
    breathStyle: 'wind',
    bpCost: 8,
    power: 155,
    target: 'single',
    effectType: 'damage',
    description: '旋風を巻き起こしながら突進し、敵を削ぐように切り裂く。',
    animation: 'mist_cut'
  },
  wind_tengu: {
    id: 'sk_wind_7',
    name: '漆ノ型 勁風・天狗風（風柱奥義）',
    katagaki: '風の呼吸・奥義',
    breathStyle: 'wind',
    bpCost: 32,
    power: 420,
    target: 'all',
    effectType: 'damage',
    description: '宙を舞いながら無数の暴風の斬撃を叩きつけ、跡形もなく切り刻む奥義。',
    animation: 'mist_cut',
    isUltimate: true
  },

  // === 蛇の呼吸 ===
  serpent_slash: {
    id: 'sk_serpent_1',
    name: '壱ノ型 委蛇斬り',
    katagaki: '蛇の呼吸',
    breathStyle: 'serpent',
    bpCost: 8,
    power: 150,
    target: 'single',
    effectType: 'damage',
    description: 'うねる蛇のように不規則な軌道を描いて相手の急所を抉る。',
    animation: 'slash_water'
  },
  serpent_long: {
    id: 'sk_serpent_5',
    name: '伍ノ型 蜿蜿長蛇（蛇柱奥義）',
    katagaki: '蛇の呼吸・奥義',
    breathStyle: 'serpent',
    bpCost: 30,
    power: 410,
    target: 'all',
    effectType: 'damage',
    description: '大蛇の如く蛇行しながらすり抜け、全方向から敵陣の首を刎ねる奥義。',
    animation: 'slash_water',
    isUltimate: true
  },

  // === 花の呼吸 ===
  flower_plum: {
    id: 'sk_flower_2',
    name: '弐ノ型 御影梅',
    katagaki: '花の呼吸',
    breathStyle: 'flower',
    bpCost: 8,
    power: 145,
    target: 'single',
    effectType: 'damage',
    description: '自分の周囲に梅の花弁のような半円形の連撃を放つ。',
    animation: 'butterfly'
  },
  flower_final: {
    id: 'sk_flower_final',
    name: '終ノ型 彼岸朱眼（カナヲ奥義）',
    katagaki: '花の呼吸・奥義',
    breathStyle: 'flower',
    bpCost: 30,
    power: 400,
    target: 'single',
    effectType: 'damage',
    description: '動体視力を限界まで引き上げ、全てが止まって見える世界の中で放つ神速の一撃。',
    animation: 'butterfly',
    isUltimate: true
  },

  // === 血鬼術 ===
  blood_burst: {
    id: 'sk_blood_nezuko',
    name: '血鬼術 爆血',
    katagaki: '血鬼術',
    breathStyle: 'blood',
    bpCost: 14,
    power: 210,
    target: 'all',
    effectType: 'damage',
    description: '自らの血液を燃え上がらせ、鬼にのみ特大の炎ダメージを与える。',
    animation: 'sun_burst'
  },
  blood_burst_ultimate: {
    id: 'sk_blood_nezuko_ult',
    name: '血鬼術 爆血炎陣・鬼化覚醒（奥義）',
    katagaki: '血鬼術・覚醒奥義',
    breathStyle: 'blood',
    bpCost: 32,
    power: 420,
    target: 'all',
    effectType: 'damage',
    description: '角を生やし覚醒した禰豆子が放つ、鬼の再生力を完全に焼き尽くす灼熱の火炎嵐。',
    animation: 'sun_burst',
    isUltimate: true
  },
  blood_arrow: {
    id: 'sk_b_arrow',
    name: '血鬼術 紅潔の矢',
    katagaki: '血鬼術',
    breathStyle: 'blood',
    bpCost: 10,
    power: 140,
    target: 'single',
    effectType: 'damage',
    description: '不可視の矢印を飛ばし、敵を壁や地面に叩きつける。',
    animation: 'blood_dark'
  },
  blood_spider_threads: {
    id: 'sk_b_threads',
    name: '血鬼術 刻糸牢',
    katagaki: '血鬼術',
    breathStyle: 'blood',
    bpCost: 20,
    power: 240,
    target: 'all',
    effectType: 'damage',
    description: '日輪刀をもへし折る硬質な血の糸の網で敵全体を切り刻む。',
    animation: 'blood_dark'
  },
  blood_destructive_kill: {
    id: 'sk_b_compass',
    name: '血鬼術 破壊殺・羅針＆滅式（奥義）',
    katagaki: '上弦の参奥義',
    breathStyle: 'blood',
    bpCost: 34,
    power: 440,
    target: 'single',
    effectType: 'damage',
    description: '闘気を感知し、至高の武をもって放つ即死級の拳撃突進。',
    animation: 'sun_burst',
    isUltimate: true
  },
  blood_moon_slashes: {
    id: 'sk_b_moon',
    name: '月の呼吸 拾陸ノ型 月虹・片割れ月（奥義）',
    katagaki: '上弦の壱奥義',
    breathStyle: 'moon',
    bpCost: 36,
    power: 450,
    target: 'all',
    effectType: 'damage',
    description: '三日月の無数の刃を雨のように降らせて敵全体を切り刻む。',
    animation: 'mist_cut',
    isUltimate: true
  },
  blood_muzan_shockwave: {
    id: 'sk_b_muzan',
    name: '血鬼術 衝撃波・黒血枳棘（始祖奥義）',
    katagaki: '鬼の始祖奥義',
    breathStyle: 'blood',
    bpCost: 40,
    power: 480,
    target: 'all',
    effectType: 'damage',
    description: '背中と両腕から放つ衝撃波で敵全体を粉砕する。',
    animation: 'blood_dark',
    isUltimate: true
  },
  generic_hero_ultimate: {
    id: 'sk_generic_ultimate',
    name: '全集中・魂の極限連撃（奥義）',
    katagaki: '鬼殺隊の誇り',
    breathStyle: 'none',
    bpCost: 26,
    power: 360,
    target: 'single',
    effectType: 'damage',
    description: '仲間を守るため、己の命の炎を燃やして放つ渾身の特大連撃。',
    animation: 'sun_burst',
    isUltimate: true
  }
};

/**
 * Progression entry definition: learn at what level
 */
export interface SkillUnlock {
  level: number;
  skill: Skill;
}

/**
 * Character-specific skill unlock tables (Lv1 starter to Lv30+ ultimate!)
 */
export const CHARACTER_SKILL_TREES: Record<string, SkillUnlock[]> = {
  char_tanjiro: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 3, skill: MASTER_SKILLS.water_surface_slash },
    { level: 7, skill: MASTER_SKILLS.water_wheel },
    { level: 12, skill: MASTER_SKILLS.water_striking_tide },
    { level: 18, skill: MASTER_SKILLS.water_flow },
    { level: 22, skill: MASTER_SKILLS.hinokami_enbu },
    { level: 28, skill: MASTER_SKILLS.hinokami_clear_sky },
    { level: 36, skill: MASTER_SKILLS.hinokami_sun_dragon }
  ],
  char_zenitsu: [
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 1, skill: MASTER_SKILLS.starter_unarmed },
    { level: 3, skill: MASTER_SKILLS.thunder_clap },
    { level: 8, skill: MASTER_SKILLS.thunder_clap_sixfold },
    { level: 18, skill: MASTER_SKILLS.thunder_clap_godspeed },
    { level: 28, skill: MASTER_SKILLS.thunder_god }
  ],
  char_inosuke: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_unarmed },
    { level: 3, skill: MASTER_SKILLS.beast_pierce },
    { level: 7, skill: MASTER_SKILLS.beast_fangs },
    { level: 14, skill: MASTER_SKILLS.beast_devour },
    { level: 26, skill: MASTER_SKILLS.beast_rampage }
  ],
  char_nezuko: [
    { level: 1, skill: MASTER_SKILLS.weak_demon_scratch },
    { level: 1, skill: MASTER_SKILLS.starter_aid },
    { level: 4, skill: MASTER_SKILLS.blood_burst },
    { level: 15, skill: MASTER_SKILLS.heal_herb_advanced },
    { level: 26, skill: MASTER_SKILLS.blood_burst_ultimate }
  ],
  char_giyu: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 4, skill: MASTER_SKILLS.water_surface_slash },
    { level: 8, skill: MASTER_SKILLS.water_wheel },
    { level: 13, skill: MASTER_SKILLS.water_striking_tide },
    { level: 18, skill: MASTER_SKILLS.water_flow },
    { level: 25, skill: MASTER_SKILLS.water_dead_calm }
  ],
  char_shinobu: [
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 1, skill: MASTER_SKILLS.starter_aid },
    { level: 4, skill: MASTER_SKILLS.insect_bee },
    { level: 12, skill: MASTER_SKILLS.insect_dance },
    { level: 24, skill: MASTER_SKILLS.insect_centipede }
  ],
  char_rengoku: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 4, skill: MASTER_SKILLS.flame_shiranui },
    { level: 8, skill: MASTER_SKILLS.flame_rising },
    { level: 15, skill: MASTER_SKILLS.flame_tiger },
    { level: 24, skill: MASTER_SKILLS.flame_rengoku }
  ],
  char_tengen: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_unarmed },
    { level: 4, skill: MASTER_SKILLS.sound_roar },
    { level: 12, skill: MASTER_SKILLS.heal_herb },
    { level: 24, skill: MASTER_SKILLS.sound_symphony }
  ],
  char_muichiro: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 4, skill: MASTER_SKILLS.mist_flow },
    { level: 10, skill: MASTER_SKILLS.mist_sea },
    { level: 24, skill: MASTER_SKILLS.mist_seventh }
  ],
  char_mitsuri: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_unarmed },
    { level: 4, skill: MASTER_SKILLS.love_shiver },
    { level: 10, skill: MASTER_SKILLS.love_claws },
    { level: 24, skill: MASTER_SKILLS.love_cat_wind }
  ],
  char_gyomei: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_unarmed },
    { level: 4, skill: MASTER_SKILLS.stone_double },
    { level: 12, skill: MASTER_SKILLS.heal_herb },
    { level: 25, skill: MASTER_SKILLS.stone_ultimate }
  ],
  char_sanemi: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 4, skill: MASTER_SKILLS.wind_dust },
    { level: 12, skill: MASTER_SKILLS.heal_herb },
    { level: 25, skill: MASTER_SKILLS.wind_tengu }
  ],
  char_obanai: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 4, skill: MASTER_SKILLS.serpent_slash },
    { level: 12, skill: MASTER_SKILLS.heal_herb },
    { level: 25, skill: MASTER_SKILLS.serpent_long }
  ],
  char_kanao: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_aid },
    { level: 4, skill: MASTER_SKILLS.flower_plum },
    { level: 10, skill: MASTER_SKILLS.heal_herb },
    { level: 24, skill: MASTER_SKILLS.flower_final }
  ],
  char_yoriichi: [
    { level: 1, skill: MASTER_SKILLS.starter_slash },
    { level: 1, skill: MASTER_SKILLS.starter_thrust },
    { level: 4, skill: MASTER_SKILLS.hinokami_enbu },
    { level: 10, skill: MASTER_SKILLS.hinokami_clear_sky },
    { level: 20, skill: MASTER_SKILLS.hinokami_sun_dragon },
    { level: 30, skill: MASTER_SKILLS.yoriichi_thirteenth }
  ]
};

/**
 * Generic skill trees by breath style for any other character or mob
 */
export function getGenericSkillTree(style: BreathStyle, role: string): SkillUnlock[] {
  if (role === 'demon') {
    return [
      { level: 1, skill: MASTER_SKILLS.weak_demon_scratch },
      { level: 4, skill: MASTER_SKILLS.blood_arrow },
      { level: 12, skill: MASTER_SKILLS.blood_spider_threads },
      { level: 25, skill: MASTER_SKILLS.blood_destructive_kill }
    ];
  }

  // All slayers start with non-breathing apprentice basic swordsmanship at Lv.1
  // Breathing unlocks from Lv.4+, with the ultimate secret art at Lv.24-26
  switch (style) {
    case 'water':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.water_surface_slash },
        { level: 9, skill: MASTER_SKILLS.water_wheel },
        { level: 15, skill: MASTER_SKILLS.water_striking_tide },
        { level: 25, skill: MASTER_SKILLS.water_dead_calm }
      ];
    case 'flame':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.flame_shiranui },
        { level: 9, skill: MASTER_SKILLS.flame_rising },
        { level: 15, skill: MASTER_SKILLS.flame_tiger },
        { level: 25, skill: MASTER_SKILLS.flame_rengoku }
      ];
    case 'thunder':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_thrust },
        { level: 4, skill: MASTER_SKILLS.thunder_clap },
        { level: 9, skill: MASTER_SKILLS.thunder_clap_sixfold },
        { level: 18, skill: MASTER_SKILLS.thunder_clap_godspeed },
        { level: 26, skill: MASTER_SKILLS.thunder_god }
      ];
    case 'beast':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.beast_pierce },
        { level: 9, skill: MASTER_SKILLS.beast_fangs },
        { level: 15, skill: MASTER_SKILLS.beast_devour },
        { level: 25, skill: MASTER_SKILLS.beast_rampage }
      ];
    case 'wind':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.wind_dust },
        { level: 14, skill: MASTER_SKILLS.heal_herb },
        { level: 25, skill: MASTER_SKILLS.wind_tengu }
      ];
    case 'insect':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_thrust },
        { level: 4, skill: MASTER_SKILLS.insect_bee },
        { level: 11, skill: MASTER_SKILLS.insect_dance },
        { level: 24, skill: MASTER_SKILLS.insect_centipede }
      ];
    case 'mist':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.mist_flow },
        { level: 11, skill: MASTER_SKILLS.mist_sea },
        { level: 24, skill: MASTER_SKILLS.mist_seventh }
      ];
    case 'love':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.love_shiver },
        { level: 11, skill: MASTER_SKILLS.love_claws },
        { level: 24, skill: MASTER_SKILLS.love_cat_wind }
      ];
    case 'stone':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.stone_double },
        { level: 12, skill: MASTER_SKILLS.heal_herb },
        { level: 25, skill: MASTER_SKILLS.stone_ultimate }
      ];
    case 'serpent':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.serpent_slash },
        { level: 12, skill: MASTER_SKILLS.heal_herb },
        { level: 25, skill: MASTER_SKILLS.serpent_long }
      ];
    case 'flower':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.flower_plum },
        { level: 11, skill: MASTER_SKILLS.heal_herb },
        { level: 24, skill: MASTER_SKILLS.flower_final }
      ];
    case 'sun':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.hinokami_enbu },
        { level: 14, skill: MASTER_SKILLS.hinokami_clear_sky },
        { level: 26, skill: MASTER_SKILLS.hinokami_sun_dragon }
      ];
    case 'moon':
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 10, skill: MASTER_SKILLS.blood_spider_threads },
        { level: 25, skill: MASTER_SKILLS.blood_moon_slashes }
      ];
    default:
      return [
        { level: 1, skill: MASTER_SKILLS.starter_slash },
        { level: 4, skill: MASTER_SKILLS.water_surface_slash },
        { level: 12, skill: MASTER_SKILLS.heal_herb },
        { level: 24, skill: MASTER_SKILLS.generic_hero_ultimate }
      ];
  }
}

/**
 * Returns all skills a character should currently have based on their level
 */
export function getSkillsForLevel(char: Character): Skill[] {
  const tree = CHARACTER_SKILL_TREES[char.id] || getGenericSkillTree(char.breathStyle, char.role);
  const eligible = tree.filter(entry => entry.level <= char.level).map(entry => entry.skill);

  // Fallback: If for some reason empty, guarantee at least the starter skill
  if (eligible.length === 0) {
    eligible.push(MASTER_SKILLS.starter_slash || MASTER_SKILLS.weak_generic_slash);
  }

  // Deduplicate by id
  const map = new Map<string, Skill>();
  for (const s of eligible) {
    map.set(s.id, s);
  }
  return Array.from(map.values());
}

/**
 * Check if the character has learned any new skills between oldLevel and newLevel
 */
export function checkNewLearnedSkills(char: Character, oldLevel: number, newLevel: number): Skill[] {
  const tree = CHARACTER_SKILL_TREES[char.id] || getGenericSkillTree(char.breathStyle, char.role);
  const newUnlocks: Skill[] = [];

  for (const entry of tree) {
    if (entry.level > oldLevel && entry.level <= newLevel) {
      if (!char.skills.some(s => s.id === entry.skill.id)) {
        newUnlocks.push(entry.skill);
      }
    }
  }

  return newUnlocks;
}

/**
 * Registered IDs of the true STRONGEST ultimate secret arts (最強の呼吸)
 */
export const STRONGEST_ULTIMATE_SKILL_IDS = new Set<string>([
  'sk_sun_dragon',
  'sk_sun_yoriichi',
  'sk_thunder_7',
  'sk_beast_rampage',
  'sk_water_11',
  'sk_flame_9',
  'sk_sound_5',
  'sk_mist_7',
  'sk_love_6',
  'sk_stone_5',
  'sk_wind_7',
  'sk_serpent_5',
  'sk_flower_final',
  'sk_insect_centipede',
  'sk_blood_nezuko_ult',
  'sk_generic_ultimate',
  'sk_b_compass',
  'sk_b_moon',
  'sk_b_muzan'
]);

/**
 * Determines if a skill is the character's TRUE STRONGEST breathing technique!
 * カットイン演出は最強の呼吸・極限奥義のみ発動（初歩や中級の呼吸技では発動しない）
 */
export function isUltimateSkill(char: Character, skill: Skill): boolean {
  if (!skill) return false;
  // Non-damaging skills (heals, etc.) are never ultimate cuts
  if (skill.effectType === 'heal') return false;
  // Basic non-breathing attacks never trigger cut-in
  if (skill.breathStyle === 'none' && skill.id !== 'sk_generic_ultimate') return false;

  // Explicit ultimate flag
  if (skill.isUltimate) return true;

  // Registered strongest ultimate secret art IDs
  if (STRONGEST_ULTIMATE_SKILL_IDS.has(skill.id)) return true;

  // Katagaki check with high power threshold (>= 350)
  if (skill.katagaki && (
    skill.katagaki.includes('奥義') ||
    skill.katagaki.includes('神境') ||
    skill.katagaki.includes('始祖奥義')
  ) && skill.power >= 350) {
    return true;
  }

  return false;
}

/**
 * Dramatic battle quotes shouted during the ultimate cut-in animation!
 */
export function getCharacterCutInQuote(char: Character, skill: Skill): {
  shout: string;
  subText: string;
  accentColor: string;
} {
  const name = char.name;

  if (name.includes('炭治郎')) {
    if (skill.name.includes('ヒノカミ')) {
      return {
        shout: 'ヒノカミ神楽！心を燃やせ、限界を越えろォォッ！！',
        subText: '全集中・日の呼吸 極限一閃',
        accentColor: '#ef4444'
      };
    }
    return {
      shout: '全集中・水の呼吸！決して諦めるな、食らいつけ！！',
      subText: '全集中・怒涛の水流連撃',
      accentColor: '#38bdf8'
    };
  }

  if (name.includes('善逸')) {
    return {
      shout: '雷の呼吸 漆ノ型 火雷神！これは俺が考えた、俺だけの型だァッ！！',
      subText: '全集中・神速の居合抜刀',
      accentColor: '#facc15'
    };
  }

  if (name.includes('伊之助')) {
    return {
      shout: '猪突猛進！俺様が山の王・嘴平伊之助様だァァッ！！',
      subText: '全集中・野生の咆哮と牙',
      accentColor: '#22c55e'
    };
  }

  if (name.includes('禰豆子')) {
    return {
      shout: '血鬼術・爆血！！お兄ちゃんは…私が絶対に守る！！',
      subText: '覚醒・鬼の血脈の劫火',
      accentColor: '#f43f5e'
    };
  }

  if (name.includes('煉獄')) {
    return {
      shout: '心を燃やせ！歯を食いしばって前を向け！玖ノ型 煉獄！！',
      subText: '炎柱・不滅の闘志',
      accentColor: '#ea580c'
    };
  }

  if (name.includes('義勇')) {
    return {
      shout: '全集中・水の呼吸 拾壱ノ型 凪——静まり返れ。',
      subText: '水柱・静寂の極致',
      accentColor: '#0284c7'
    };
  }

  if (name.includes('しのぶ')) {
    return {
      shout: 'とっておきの毒です。痛くしないで逝かせますね。',
      subText: '蟲柱・百足の舞',
      accentColor: '#a855f7'
    };
  }

  if (name.includes('宇髄') || name.includes('天元')) {
    return {
      shout: 'ド派手に行くぜ！もう譜面は完成したァッ！！',
      subText: '音柱・鳴弦奏々の爆響',
      accentColor: '#eab308'
    };
  }

  if (name.includes('無一郎')) {
    return {
      shout: '霞の揺らぎのように消え去れ…君はもう終わりだよ。',
      subText: '霞柱・朧なる神速',
      accentColor: '#94a3b8'
    };
  }

  if (name.includes('蜜璃')) {
    return {
      shout: '胸がキュンキュンしちゃう！愛を込めて全力でいくわよっ！',
      subText: '恋柱・猫足恋風の嵐',
      accentColor: '#ec4899'
    };
  }

  if (name.includes('実弥')) {
    return {
      shout: '刻み刻んで塵に還しちまいなァッ！風神の刃を味わいな！',
      subText: '風柱・猛威の暴風',
      accentColor: '#10b981'
    };
  }

  if (name.includes('行冥')) {
    return {
      shout: '南無阿弥陀仏…哀れな魂よ、安らかに眠れ。',
      subText: '岩柱・慈悲と鉄輪の断罪',
      accentColor: '#78716c'
    };
  }

  if (name.includes('小芭内')) {
    return {
      shout: '信用しない。だが貴様を八つ裂きにすることだけは確実だ。',
      subText: '蛇柱・蜿蜿たる猛牙',
      accentColor: '#6366f1'
    };
  }

  if (name.includes('カナヲ')) {
    return {
      shout: '自分で決めたの…誰かのために戦うって！終ノ型 彼岸朱眼！',
      subText: '花の呼吸・覚醒の眼差し',
      accentColor: '#f472b6'
    };
  }

  if (name.includes('縁壱')) {
    return {
      shout: '道を極めし者が辿り着く場所は…常に同じだ。',
      subText: '日の呼吸・始まりの剣神',
      accentColor: '#f97316'
    };
  }

  if (char.role === 'demon') {
    return {
      shout: '血鬼術全解放！人間風情が…塵となって消え失せろ！！',
      subText: '異形・血鬼術の滅殺',
      accentColor: '#b91c1c'
    };
  }

  // Generic fallback
  return {
    shout: '命を燃やせ！全集中・魂の極限の一撃、喰らえェェッ！！',
    subText: '鬼殺隊士・決死の奥義一閃',
    accentColor: '#f59e0b'
  };
}
