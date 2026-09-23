/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoryChapter } from '../models/types.ts';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'chap_1',
    chapterNumber: 1,
    title: '第1章: 最終選別の試練',
    subTitle: '狭霧山・藤襲山での修行と激闘',
    locationName: '藤襲山（ふじかさねやま）',
    description: '鱗滝のもとで過酷な修行を終えた炭治郎。鬼殺隊員となるため、藤の花が咲き誇る藤襲山の最終選別へと挑む。山に封じられた巨魁「手鬼」が立ち塞がる！',
    bossCharacterId: 'demon_hand',
    bossName: '手鬼（藤襲山の異形鬼）',
    recommendedLevel: 6,
    unlockedRecruits: ['char_zenitsu'],
    choices: [
      {
        id: 'c1_zenitsu',
        label: '怯えてうずくまる金髪の少年を励まし、共に進む',
        description: '雷の呼吸の継承者・我妻善逸と相棒の雀・チュン太郎が仲間に加わります。',
        recruitCharacterId: 'char_zenitsu',
        bonusCharacterIds: ['char_chuntaro'],
        resultDialogue: [
          '善逸「うわぁぁ助かったぁぁ！死ぬかと思ったよ炭治郎！俺を置いていかないでね！？」',
          'チュン太郎「チュン！チュン！（しっかりしろと怒っている！）」',
          '我妻善逸＆チュン太郎が心強い味方として隊に加わった！'
        ]
      },
      {
        id: 'c1_kanao',
        label: '静かに藤の花を見つめる可憐な少女に声をかける',
        description: '花の呼吸の継承者・栗花落カナヲが仲間に加わります。',
        recruitCharacterId: 'char_kanao',
        resultDialogue: [
          'カナヲ「……（コインを投げ、表が出る）…一緒に行く。鬼を倒す」',
          '炭治郎「カナヲ、よろしく頼む！君の鋭い視線は頼もしいよ！」',
          '栗花落カナヲが仲間として加わった！'
        ]
      },
      {
        id: 'c1_genya',
        label: '粗暴だが鬼への強い復讐心を抱く少年に加勢する',
        description: '鬼喰いの異能と銃剣術を持つ・不死川玄弥が仲間に加わります。',
        recruitCharacterId: 'char_genya',
        resultDialogue: [
          '玄弥「チッ…馴れ合う気はねえが、鬼をぶっ潰すためなら背中を預けてやる」',
          '炭治郎「ありがとう玄弥！一緒に行こう！」',
          '不死川玄弥が仲間として加わった！'
        ]
      },
      {
        id: 'c1_sabito',
        label: '狭霧山で稽古をつけてくれた錆兎と真菰の幻影に誓う',
        description: '水の呼吸の兄弟子・錆兎と真菰が仲間に加わります。',
        recruitCharacterId: 'char_sabito',
        bonusCharacterIds: ['char_makomo'],
        resultDialogue: [
          '錆兎「よくぞ岩を斬ったな炭治郎。お前の努力は決して無駄にはならん！」',
          '真菰「炭治郎、頑張ってね。私たちがずっと見守っているわ」',
          '錆兎と真菰の魂が隊に加わった！'
        ]
      }
    ],
    introDialogues: [
      '炭治郎「鱗滝さん、錆兎、真菰…見ていてくれ！俺は必ず生きて戻る！」',
      '手鬼「カッカッカァ！また鱗滝の狐小僧が来たかァ！喰ってやるぞォ！」',
    ],
    victoryDialogues: [
      '炭治郎「成仏してください…神様、どうかこの人が今度生まれてくるときは鬼になんてなりませんように…」',
      '案内役「お見事でございます。これより貴方様を鬼殺隊の隊士としてお認めいたします」',
      '【最終選別を突破！鎹鴉と日輪刀を授かり、新たな隊士たちが仲間に加わった！】'
    ],
    rewardExp: 50,
    rewardMoney: 150
  },
  {
    id: 'chap_2',
    chapterNumber: 2,
    title: '第2章: 浅草の幻惑と鬼の始祖',
    subTitle: '夜の東京・浅草と珠世との邂逅',
    locationName: '浅草（東京府）',
    description: '初めて訪れた大都会・浅草。人の波の中で炭治郎は鬼舞辻無惨の匂いを嗅ぎつける！無惨が放った刺客・朱紗丸と矢琶羽が夜の街を襲撃する。',
    bossCharacterId: 'demon_yahaba_susamaru',
    bossName: '朱紗丸 ＆ 矢琶羽',
    recommendedLevel: 11,
    unlockedRecruits: ['char_tamayo', 'char_yushiro'],
    choices: [
      {
        id: 'c2_tamayo',
        label: '人を喰わぬ鬼の医師・珠世と愈史郎の診療所へ身を寄せる',
        description: '心優しき医者鬼・珠世と愈史郎が仲間に加わり、回復と解毒を支援します。',
        recruitCharacterId: 'char_tamayo',
        bonusCharacterIds: ['char_yushiro'],
        resultDialogue: [
          '珠世「炭治郎さん、禰豆子さんを必ず人間に戻す薬を完成させましょう」',
          '愈史郎「珠世様の傍を離れるな！だが…お前たちの戦いは認めてやる」',
          '珠世＆愈史郎が心強い味方として加わった！'
        ]
      },
      {
        id: 'c2_goto',
        label: '浅草の路地裏で鬼の痕跡を回収する隠の部隊を救出する',
        description: '義理堅い隠の隊士・後藤と血を運ぶ三毛猫・茶々丸が仲間に加わります。',
        recruitCharacterId: 'char_goto',
        bonusCharacterIds: ['char_chachamaru'],
        resultDialogue: [
          '後藤「おいおい、危ねえところを助けてくれて恩に着るぜ！後方支援は任せな！」',
          '茶々丸「ニャーン！（背中の箱から特効薬を差し出す）」',
          '後藤＆茶々丸が仲間として加わった！'
        ]
      },
      {
        id: 'c2_matsuemon',
        label: '指令を運ぶ優秀な鎹鴉・天王寺松右衛門と絆を結ぶ',
        description: '知性豊かで口が達者な鎹鴉・天王寺松右衛門が仲間に加わります。',
        recruitCharacterId: 'char_matsuemon',
        resultDialogue: [
          '松右衛門「カァー！竈門炭治郎！南南東へ行ケ！ワシが空から索敵シテヤルゾ！」',
          '炭治郎「松右衛門、よろしくな！案内を頼むよ！」',
          '鎹鴉・天王寺松右衛門が仲間に加わった！'
        ]
      }
    ],
    introDialogues: [
      '朱紗丸「キャハハ！十二鬼月である我らの毬遊びに付き合いな！」',
      '矢琶羽「矢印に導かれ死ぬがいい。無惨様にその首を捧げるのだ」',
      '炭治郎「禰豆子、珠世さんたちを守りながら戦うんだ！」'
    ],
    victoryDialogues: [
      '珠世「炭治郎さん、無惨の血を採取してまいりましょう。私が必ず禰豆子さんを人間に戻す薬を完成させます」',
      '【珠世と愈史郎の支援を得た！藤の花の回復薬が購入可能になった！】'
    ],
    rewardExp: 120,
    rewardMoney: 300
  },
  {
    id: 'chap_3',
    chapterNumber: 3,
    title: '第3章: 響く鼓屋敷',
    subTitle: '回転する部屋と猪突猛進の同志',
    locationName: '鼓屋敷（つづみやしき）',
    description: '鎹鴉の指示で向かった不気味な屋敷。そこでは元下弦の鬼・響凱が鼓を打ち鳴らし部屋ごと空間を操っていた。恐怖に震える善逸と、猪頭の伊之助と合流！',
    bossCharacterId: 'demon_kyogai',
    bossName: '元下弦の陸・響凱',
    recommendedLevel: 16,
    unlockedRecruits: ['char_inosuke'],
    choices: [
      {
        id: 'c3_inosuke',
        label: '「猪突猛進！」と叫び二刀流を振り回す野性児に突撃する',
        description: '獣の呼吸の使い手・嘴平伊之助が仲間に加わります。',
        recruitCharacterId: 'char_inosuke',
        resultDialogue: [
          '伊之助「猪突猛進！猪突猛進！俺の親分になろうってんなら、俺より強くなってみせろ！」',
          '炭治郎「よろしく頼むぞ伊之助！怪我をしないように気をつけてくれ！」',
          '嘴平伊之助が主力として仲間に加わった！'
        ]
      },
      {
        id: 'c3_aoi',
        label: '屋敷の生存者を治療するため、蝶屋敷の救護隊と合流する',
        description: '医療隊士・神崎アオイと看護三人娘（なほ・きよ・すみ）が仲間に加わります。',
        recruitCharacterId: 'char_aoi',
        bonusCharacterIds: ['char_naho', 'char_kiyo', 'char_sumi'],
        resultDialogue: [
          '神崎アオイ「怪我人の手当は私たちが引き受けます！炭治郎さん、無茶は禁物ですよ！」',
          'きよ・す・なほ「炭治郎さん、頑張ってください！」',
          '神崎アオイ＆蝶屋敷三人娘が仲間に加わった！'
        ]
      },
      {
        id: 'c3_murata',
        label: '屋敷の別室で鬼に襲われていた先輩隊士・村田を救出する',
        description: '並外れた強運を誇る同期隊士・村田が仲間に加わります。',
        recruitCharacterId: 'char_murata',
        resultDialogue: [
          '村田「助かったぁぁ！俺は庚の村田だ！お前たち、新入りのくせに頼もしすぎるぞ！」',
          '炭治郎「村田さん、一緒に脱出しましょう！」',
          '先輩隊士・村田が仲間に加わった！'
        ]
      }
    ],
    introDialogues: [
      '善逸「無理だよォ！死んじゃうよォ！炭治郎助けてぇぇぇ！」',
      '伊之助「猪突猛進！猪突猛進！どけぇ雑魚ども！俺の獲物だ！」',
      '響凱「小生の原稿を踏むな…！小生の部屋で回れ、回れェ！」'
    ],
    victoryDialogues: [
      '響凱「…小生の…血鬼術は…凄かったか…？」',
      '炭治郎「凄かった。でも人を殺したことは決して許せない」',
      '【善逸と伊之助が正式に隊の主力として結束した！藤の家紋の家で休養可能に！】'
    ],
    rewardExp: 220,
    rewardMoney: 500
  },
  {
    id: 'chap_4',
    chapterNumber: 4,
    title: '第4章: 那田蜘蛛山の死闘',
    subTitle: '下弦の伍・累と水柱・蟲柱の来援',
    locationName: '那田蜘蛛山（なたぐもやま）',
    description: '多数の隊士が糸に操られ全滅の危機に瀕する那田蜘蛛山。家族の偽りの絆を強要する十二鬼月・累の鋼鉄の糸が炭治郎の日輪刀を折る！ヒノカミ神楽が今、覚醒する。',
    bossCharacterId: 'demon_rui',
    bossName: '下弦の伍・累（るい）',
    recommendedLevel: 21,
    unlockedRecruits: ['char_giyu', 'char_shinobu'],
    choices: [
      {
        id: 'c4_giyu',
        label: '静寂の湖で一刀のもとに鬼を斬る水柱・冨岡義勇と背中を合わせる',
        description: '水柱・冨岡義勇が仲間に加わり「水の呼吸 拾壱ノ型 凪」を解禁します。',
        recruitCharacterId: 'char_giyu',
        resultDialogue: [
          '冨岡義勇「俺は嫌われていない。……炭治郎、よくぞここまで生き延びた」',
          '炭治郎「義勇さん！また一緒に戦えて光栄です！」',
          '水柱・冨岡義勇が仲間に加わった！'
        ]
      },
      {
        id: 'c4_shinobu',
        label: '藤の花の毒をまとい蝶のように舞う蟲柱・胡蝶しのぶと行動する',
        description: '蟲柱・胡蝶しのぶが仲間に加わり、高速刺突と藤の毒で敵を翻弄します。',
        recruitCharacterId: 'char_shinobu',
        resultDialogue: [
          '胡蝶しのぶ「もしもし。鬼と仲良くするのは無理そうですね。でも炭治郎君の夢、応援しますよ」',
          '炭治郎「しのぶさん、ありがとうございます！」',
          '蟲柱・胡蝶しのぶが仲間に加わった！'
        ]
      },
      {
        id: 'c4_ozaki',
        label: '蜘蛛の糸に捕らわれた先輩隊士・尾崎たちを救出し連係する',
        description: '花の呼吸の使い手・尾崎隊士が仲間に加わります。',
        recruitCharacterId: 'char_ozaki',
        resultDialogue: [
          '尾崎「糸を切ってくれてありがとう！私の花の呼吸で援護射撃をするわ！」',
          '炭治郎「尾崎さん、無事でよかった！一緒に山を駆け抜けましょう！」',
          '隊士・尾崎が仲間に加わった！'
        ]
      }
    ],
    introDialogues: [
      '累「僕たちの絆は本物だ。邪魔をするなら、八つ裂きにして刻み殺すよ」',
      '炭治郎「強い絆からは信頼の匂いがする！恐怖で縛り付けるのは偽物の絆だ！」',
      '禰豆子「（血鬼術…爆血…！！）」'
    ],
    victoryDialogues: [
      '冨岡義勇「全集中・水の呼吸 拾壱ノ型 凪――」',
      '胡蝶しのぶ「もしもし、大丈夫ですか？鬼殺隊当主様より柱合会議への招集がかかりましたよ」',
      '【那田蜘蛛山を平定！水柱・冨岡義勇と蟲柱・胡蝶しのぶが参戦可能になった！】'
    ],
    rewardExp: 450,
    rewardMoney: 800
  },
  {
    id: 'chap_5',
    chapterNumber: 5,
    title: '第5章: 無限列車と炎柱の誇り',
    subTitle: '心を燃やせ！下弦の壱・魘夢 ＆ 上弦の参・猗窩座',
    locationName: '無限列車（むげんれっしゃ）',
    description: '短期間で40人以上が神隠しに遭った無限列車。炎柱・煉獄杏寿郎と合流した一行は夢の世界に閉じ込められる。夢を打ち破った先には、上弦の参・猗窩座が強襲！',
    bossCharacterId: 'demon_enmu_akaza',
    bossName: '魘夢 ＆ 上弦の参・猗窩座',
    recommendedLevel: 27,
    unlockedRecruits: ['char_rengoku'],
    choices: [
      {
        id: 'c5_rengoku',
        label: '「心を燃やせ！」炎柱・煉獄杏寿郎と共に先頭車両へ突撃する',
        description: '炎柱・煉獄杏寿郎が仲間に加わり「炎の呼吸 奥義・煉獄」を解禁します。',
        recruitCharacterId: 'char_rengoku',
        resultDialogue: [
          '煉獄杏寿郎「竈門少年！胸を張って生きろ！心を燃やせ！俺の魂は共にある！」',
          '炭治郎「煉獄さん！あなたの誇りを決して汚しません！」',
          '炎柱・煉獄杏寿郎が仲間に加わった！'
        ]
      },
      {
        id: 'c5_tanjuro',
        label: '夢の中の神楽舞を思い出し、父・竈門炭十郎の教えを心に刻む',
        description: '日の呼吸の先達・竈門炭十郎と母・葵枝の加護が仲間に加わります。',
        recruitCharacterId: 'char_tanjuro',
        bonusCharacterIds: ['char_kie'],
        resultDialogue: [
          '炭十郎「炭治郎、耳飾りと神楽舞だけは途絶えさせず継承していくのだ…」',
          '炭治郎「父さん…ヒノカミ神楽の呼吸の繋ぎ方が、見えてきた！」',
          '竈門炭十郎＆葵枝の魂が仲間に加わった！'
        ]
      },
      {
        id: 'c5_senjuro',
        label: '煉獄の家を訪れ、弟の千寿郎と父・槇寿郎に杏寿郎の意志を繋ぐ',
        description: '煉獄千寿郎と元炎柱・煉獄槇寿郎が支援仲間として加わります。',
        recruitCharacterId: 'char_senjuro',
        bonusCharacterIds: ['char_shinjuro'],
        resultDialogue: [
          '千寿郎「兄上の鍔を受け取ってください！兄上はきっと貴方を応援しています！」',
          '槇寿郎「杏寿郎…お前は立派な息子だった。竈門少年、我が炎を貸してやろう」',
          '煉獄千寿郎＆槇寿郎が仲間に加わった！'
        ]
      }
    ],
    introDialogues: [
      '煉獄杏寿郎「うまい！うまい！うまい！竈門少年、私の継子になるといい！」',
      '猗窩座「素晴らしい闘気だ杏寿郎！お前も鬼にならないか？至高の領域へ行こう！」',
      '煉獄杏寿郎「老いることも死ぬことも、人間という儚い生き物の美しさだ。俺は如何なる理由があろうと鬼にはならない！」'
    ],
    victoryDialogues: [
      '煉獄杏寿郎「胸を張って生きろ。己の弱さや不甲斐なさにどれだけ打ちのめされようと、心を燃やせ…！」',
      '炭治郎「煉獄さんの勝ちだ！誰も死なせなかった！煉獄さんは負けてない！！」',
      '【炎柱・煉獄杏寿郎の魂を継承！炎の呼吸の極意を宿した！】'
    ],
    rewardExp: 750,
    rewardMoney: 1200
  },
  {
    id: 'chap_6',
    chapterNumber: 6,
    title: '第6章: 吉原遊郭の夜宴',
    subTitle: '音柱・宇髄天元と上弦の陸・兄妹の猛毒',
    locationName: '吉原遊郭（よしわらゆうかく）',
    description: '不夜城・吉原遊郭に潜む上弦の陸。音柱・宇髄天元とともに潜入した炭治郎たち。堕姫の帯攻撃と、背中から現れた真の恐怖・妓夫太郎の猛毒血鎌が襲いかかる！',
    bossCharacterId: 'demon_daki_gyutaro',
    bossName: '上弦の陸・堕姫 ＆ 妓夫太郎',
    recommendedLevel: 33,
    unlockedRecruits: ['char_tengen'],
    choices: [
      {
        id: 'c6_tengen',
        label: '「ド派手に行くぜ！」音柱・宇髄天元と共に爆薬と二刀流で暴れ回る',
        description: '音柱・宇髄天元が仲間に加わり「音の呼吸 伍ノ型 鳴弦奏々」を解禁します。',
        recruitCharacterId: 'char_tengen',
        resultDialogue: [
          '宇髄天元「へっ、派手にキメたじゃねえか！命を一番に考えて戦い抜くぞ！」',
          '炭治郎「宇髄さん！譜面の完成まで付いていきます！」',
          '音柱・宇髄天元が仲間に加わった！'
        ]
      },
      {
        id: 'c6_kunoichi',
        label: '遊郭に潜入していた宇髄の妻たち（須磨・まきを・雛鶴）を救出する',
        description: '三人の凄腕くのいち（須磨・まきを・雛鶴）が支援部隊として仲間に加わります。',
        recruitCharacterId: 'char_suma',
        bonusCharacterIds: ['char_makio', 'char_hinatsuru'],
        resultDialogue: [
          '須磨「うわぁぁ炭治郎さんありがとう〜！天元様はどこ〜！？」',
          'まきを「泣いてんじゃないわよ須磨！藤の花の毒クナイで援護するわよ！」',
          '雛鶴「炭治郎さん、どうぞこれをお使いください」',
          '須磨・まきを・雛鶴のくのいち三人衆が仲間に加わった！'
        ]
      },
      {
        id: 'c6_kanae',
        label: '蝶屋敷に伝わる元花柱・胡蝶カナエの優しき剣の型を想起する',
        description: '元花柱・胡蝶カナエの魂が仲間に加わり、華麗な花呼吸で援護します。',
        recruitCharacterId: 'char_kanae',
        resultDialogue: [
          '胡蝶カナエ「炭治郎君、どんなときも笑顔を忘れないで。悲しい鬼たちを救ってあげてね」',
          '炭治郎「カナエさん…あなたのように優しく、強い剣士になります！」',
          '元花柱・胡蝶カナエが仲間に加わった！'
        ]
      }
    ],
    introDialogues: [
      '宇髄天元「こっからはド派手に行くぜ！俺の譜面が完成した！勝ちに行くぞォ！」',
      '妓夫太郎「いいなぁお前らは恵まれててなぁ…妬ましいなぁ…！毒で死んじまえよなぁ！」'
    ],
    victoryDialogues: [
      '炭治郎「二人同時に首を切り落とす…！俺のありったけの力で…ヒノカミ神楽！！」',
      '宇髄天元「へっ…派手にやり遂げたじゃねえか。これで上弦の首を百余年ぶりに討ち取ったぞ！」',
      '【音柱・宇髄天元が鬼殺隊の陣営に合流！遊郭の特製煙幕玉を入手！】'
    ],
    rewardExp: 2200,
    rewardMoney: 2500
  },
  {
    id: 'chap_7',
    chapterNumber: 7,
    title: '第7章: 刀鍛冶の隠れ里',
    subTitle: '霞柱・時透無一郎＆恋柱・甘露寺蜜璃の覚醒',
    locationName: '刀鍛冶の里（かたなかじのさと）',
    description: '刃毀れした刀を研ぎ直すため訪れた刀鍛冶の里。突如現れた上弦の肆・半天狗と上弦の伍・玉壺！時透の霞の記憶、蜜璃の恋の剛力、そして赫刀が闇を切り裂く！',
    bossCharacterId: 'demon_gyokko_hantengu',
    bossName: '上弦の肆・半天狗 ＆ 上弦の伍・玉壺',
    recommendedLevel: 39,
    unlockedRecruits: ['char_muichiro', 'char_mitsuri'],
    choices: [
      {
        id: 'c7_muichiro',
        label: '失われた記憶を取り戻し透き通る世界に至る霞柱・時透無一郎と共闘する',
        description: '霞柱・時透無一郎が仲間に加わり「霞の呼吸 漆ノ型 朧」を解禁します。',
        recruitCharacterId: 'char_muichiro',
        resultDialogue: [
          '時透無一郎「僕は炭治郎のおかげで自分を取り戻せたんだ。今度は僕が守る番だよ」',
          '炭治郎「無一郎！君の剣の冴えは本当に素晴らしいよ！」',
          '霞柱・時透無一郎が仲間に加わった！'
        ]
      },
      {
        id: 'c7_mitsuri',
        label: 'しなやかな筋肉と剛力で鬼の首を刈る恋柱・甘露寺蜜璃を全力で応援する',
        description: '恋柱・甘露寺蜜璃が仲間に加わり「恋の呼吸 陸ノ型 猫足恋風」を解禁します。',
        recruitCharacterId: 'char_mitsuri',
        resultDialogue: [
          '甘露寺蜜璃「きゃあっ炭治郎君！私、皆の笑顔を守るために全力でキュンキュン戦うわ！」',
          '炭治郎「甘露寺さん、その調子で頼みます！」',
          '恋柱・甘露寺蜜璃が仲間に加わった！'
        ]
      },
      {
        id: 'c7_zero',
        label: '里の秘密兵器・縁壱零式で極限修行を行い、鋼鐵塚の名刀を受け取る',
        description: '六本腕の戦闘絡繰・縁壱零式と刀鍛冶・鋼鐵塚蛍＆小鉄が仲間に加わります。',
        recruitCharacterId: 'char_zero_type',
        bonusCharacterIds: ['char_haganezuka', 'char_kotetsu'],
        resultDialogue: [
          '小鉄「炭治郎さん！零式の動きを完全に見切りましたね！凄い！」',
          '鋼鐵塚蛍「炭治郎ォ！研ぎ澄ましたこの漆黒の日輪刀を折ったら許さんぞォ！」',
          '縁壱零式＆鋼鐵塚＆小鉄が仲間に加わった！'
        ]
      }
    ],
    introDialogues: [
      '時透無一郎「ねえ…邪魔だからさ、さっさと消えてくれない？霞の呼吸 漆ノ型 朧…」',
      '甘露寺蜜璃「私、悪いやつには絶対に負けないんだから！恋の呼吸、全開よ！」',
      '半天狗（憎珀天）「極悪人どもめ…！弱き者を虐げる悪鬼どもを許すわけにはいかぬ！」'
    ],
    victoryDialogues: [
      '炭治郎「禰豆子が…太陽を克服した…！？よかった…本当によかった…！」',
      '鋼鐵塚蛍「炭治郎！初代の極上日輪刀を研ぎ上げたぞ！これを持って無惨を討て！」',
      '【霞柱・時透無一郎＆恋柱・甘露寺蜜璃が合流！究極の日輪刀を入手！】'
    ],
    rewardExp: 3800,
    rewardMoney: 4000
  },
  {
    id: 'chap_8',
    chapterNumber: 8,
    title: '最終章: 無限城・黎明の決戦',
    subTitle: '鬼舞辻無惨の殲滅と鬼殺隊の千年の悲願',
    locationName: '無限城・地上（日の出の戦場）',
    description: '産屋敷邸の自爆から開かれた異空間・無限城。上弦の壱・黒死牟を打ち破り、柱全員と炭治郎たちが結集！太陽が昇るその瞬間まで、鬼の始祖・鬼舞辻無惨を繋ぎ止めよ！',
    bossCharacterId: 'demon_muzan_final',
    bossName: '鬼舞辻無惨（始祖形態）＆ 黒死牟',
    recommendedLevel: 45,
    unlockedRecruits: ['char_gyomei', 'char_sanemi', 'char_obanai'],
    choices: [
      {
        id: 'c8_pillars',
        label: '鬼殺隊最強の岩柱・悲鳴嶼行冥と風柱・不死川実弥と共に黒死牟へ立ち向かう',
        description: '岩柱・悲鳴嶼行冥と風柱・不死川実弥が仲間に加わります。',
        recruitCharacterId: 'char_gyomei',
        bonusCharacterIds: ['char_sanemi'],
        resultDialogue: [
          '悲鳴嶼行冥「南無阿弥陀仏…子供たちがここまで立派に育った。我が命を賭して道を拓く」',
          '不死川実弥「テメェは俺が八つ裂きにしてやる！弟には指一本触れさせねェ！」',
          '岩柱・悲鳴嶼行冥＆風柱・不死川実弥が仲間に加わった！'
        ]
      },
      {
        id: 'c8_obanai',
        label: '蛇柱・伊黒小芭内と相棒の白蛇・鏑丸と共に鳴女の琵琶空間を突破する',
        description: '蛇柱・伊黒小芭内と鏑丸が仲間に加わります。',
        recruitCharacterId: 'char_obanai',
        bonusCharacterIds: ['char_kaburamaru'],
        resultDialogue: [
          '伊黒小芭内「甘露寺に怪我をさせたら万死に値する。無惨の首は俺たちが断つ」',
          '鏑丸「シャーッ！（炭治郎の周囲を警戒して視界を共有する）」',
          '蛇柱・伊黒小芭内＆鏑丸が仲間に加わった！'
        ]
      },
      {
        id: 'c8_yoriichi',
        label: '四百年の時を超え、始まりの呼吸の剣士・継国縁壱の神速の剣筋を顕現させる',
        description: '神話の最強剣士・継国縁壱が仲間に加わり「日の呼吸拾参ノ型」を完全継承します。',
        recruitCharacterId: 'char_yoriichi',
        resultDialogue: [
          '継国縁壱「道を極めた者が辿り着く場所は、いつも同じだ。炭治郎、恐れることは何もない」',
          '炭治郎「縁壱さん…！この刃に、千年の想いと全ての呼吸を込めます！！」',
          '始まりの呼吸の剣士・継国縁壱が仲間に加わった！'
        ]
      }
    ],
    introDialogues: [
      '鬼舞辻無惨「しつこい…お前たちは本当にしつこい。私を殺すことなど不可能なのだ」',
      '悲鳴嶼行冥「南無阿弥陀仏…千年続いた惨劇に、今宵こそ終止符を打つ！」',
      '炭治郎「無惨！お前はこの世にいてはならない存在だ！皆で繋ぐんだ、朝日が昇るまで！！」'
    ],
    victoryDialogues: [
      '炭治郎「陽が昇る…！無惨の体が崩れていく…！」',
      '鬼舞辻無惨「ぐわぁぁぁぁっ！陽の光が…私の体が…消滅する…！！」',
      'しかし…！無惨は消滅の間際、己のすべての血と想いを炭治郎に注ぎ込んだ…！',
      '【無惨を討伐！だが炭治郎が…異変を起こしている！？最終隠しステージへ！】'
    ],
    rewardExp: 5000,
    rewardMoney: 10000
  },
  {
    id: 'chap_9',
    chapterNumber: 9,
    title: '最終隠しステージ: 絆の奇跡・鬼の王',
    subTitle: '鬼化した炭治郎と仲間たちの魂の救出戦',
    locationName: '黎明の廃墟（太陽の下の悲劇）',
    description: '無惨の怨念と血を注ぎ込まれ、日光を克服した「鬼の王」として覚醒してしまった炭治郎！太陽の下でも焼けず、暴走する炭治郎を仲間たちの絆で正気に戻し、人間に連れ戻せ！',
    bossCharacterId: 'demon_tanjiro',
    bossName: '鬼化・竈門炭治郎（鬼の王）',
    recommendedLevel: 50,
    unlockedRecruits: ['char_tamayo', 'char_yushiro'],
    choices: [
      {
        id: 'c9_nezuko',
        label: '人間に戻った妹・禰豆子が涙を流しながら炭治郎に抱きつく',
        description: '禰豆子の命懸けの呼びかけが、炭治郎の残された心を激しく揺さぶります。',
        recruitCharacterId: 'char_nezuko',
        bonusCharacterIds: ['char_chachamaru'],
        resultDialogue: [
          '禰豆子「お兄ちゃん…！帰ろう、お家に帰ろう…！噛まないで、私を思い出して…！」',
          '鬼化炭治郎「グ…アァァァッ…！（妹の声に激しく葛藤し咆哮をあげる）」',
          '禰豆子の愛と絆が、鬼の王の攻撃の威力を鈍らせる！'
        ]
      },
      {
        id: 'c9_trio',
        label: '同期の善逸と伊之助が涙ながらに刃を止め、炭治郎に呼びかける',
        description: '我妻善逸と嘴平伊之助が命を賭けて炭治郎の暴走を受け止めます。',
        recruitCharacterId: 'char_zenitsu',
        bonusCharacterIds: ['char_inosuke'],
        resultDialogue: [
          '伊之助「斬れねえよ…！俺にはお前を斬れねえよ炭治郎…！！俺たち仲間だろ…！」',
          '善逸「炭治郎やめろぉぉ！禰豆子ちゃんを泣かせるな！お前が一番優しい奴だって知ってるよ！！」',
          '同期の熱い友情の叫びが、炭治郎の意識の奥底に届き始める！'
        ]
      },
      {
        id: 'c9_kanao',
        label: 'カナヲがしのぶから託された「人間に戻す薬」を持って彼岸朱眼で決死の突入',
        description: '栗花落カナヲが藤の花の薬を打ち込み、炭治郎の鬼化を食い止めます。',
        recruitCharacterId: 'char_kanao',
        resultDialogue: [
          'カナヲ「炭治郎…泣かないで…禰豆子ちゃんを困らせちゃ駄目だよ…（薬を藤の花の針で注入する）」',
          '鬼化炭治郎「……！！（体内の鬼の細胞が急速に人間に戻り始める！）」',
          'カナヲが決死の想いで人間に戻す薬を打ち込んだ！'
        ]
      }
    ],
    introDialogues: [
      '禰豆子「お兄ちゃん！やめて！人を傷つけないで！お願いだから人間に戻って！！」',
      '伊之助「炭治郎…！なんでお前が鬼になっちまうんだよ…嘘だろ…！」',
      '鬼化炭治郎「ガァァァァッ！！（口から陽光の衝撃波を放ち、理性を失って襲いかかる！）」'
    ],
    victoryDialogues: [
      '炭治郎「……みんな……？俺は……」',
      '禰豆子「お兄ちゃん…！目が覚めたのね…！よかった…本当によかったぁぁ！！」',
      '善逸・伊之助・義勇「炭治郎ーーーっ！！」',
      '【奇跡が起きた！無惨の呪縛を打ち破り、炭治郎は人間に戻った！千年の夜が明け、本当の平和が訪れる！】'
    ],
    rewardExp: 8000,
    rewardMoney: 20000
  }
];
