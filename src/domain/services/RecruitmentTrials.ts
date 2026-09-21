/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TrialQuestion {
  question: string; // 6歳向けふりがなつきの質問文
  options: string[]; // 3つの選択肢
  matchingIndex: number; // 0, 1, or 2（隊士の心と一致する選択肢）
  explanation: string; // 選択後の解説メッセージ
}

export interface CharacterTrial {
  characterId: string;
  characterName: string;
  dialogueIntro: string;
  questions: [TrialQuestion, TrialQuestion, TrialQuestion];
  successMessage: string;
  failMessage: string;
}

/**
 * 選択肢の配列と正解インデックスをランダムにシャッフルして、
 * 正解の位置（A, B, C）が均等に分散するようにするヘルパー関数
 */
export function shuffleQuestionOptions(q: TrialQuestion): TrialQuestion {
  const indices = [0, 1, 2];
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }

  const shuffledOptions = indices.map(idx => q.options[idx]);
  const newMatchingIndex = indices.indexOf(q.matchingIndex);

  return {
    ...q,
    options: shuffledOptions,
    matchingIndex: newMatchingIndex
  };
}

export const CHARACTER_TRIALS: Record<string, CharacterTrial> = {
  char_zenitsu: {
    characterId: 'char_zenitsu',
    characterName: '我妻善逸',
    dialogueIntro: '「ひぃぃ！鬼[おに]なんかに 会[あ]いたくないよぉ！俺[おれ]を 仲間[なかま]にする気[き]なの…！？」',
    questions: [
      {
        question: '第[だい]1問[もん]：善[ぜん]逸[いつ]が 怖[こわ]くて 震[ふる]えているとき、どう 声[こえ]をかける？',
        options: [
          '「いつまでも 泣[な]いてないで、さっさと 一人[ひとり]で 戦[たたか]え！」',
          '「大[だい]丈[じょう]夫[ぶ]！俺[おれ]が 一緒[いっしょ]にいるから 前[まえ]へ進[すす]もう！」',
          '「怖[こわ]がりは 邪[じゃ]魔[ま]だから 置[お]いていくぞ！」'
        ],
        matchingIndex: 1, // B
        explanation: '炭治郎のように優しく寄り添う言葉に、善逸の心が少し落ち着いた！'
      },
      {
        question: '第[だい]2問[もん]：善[ぜん]逸[いつ]が 命[いのち]懸[が]けで 守[まも]り抜[ぬ]いた「禰[ね]豆[ず]子[こ]の木[き]箱[ばこ]」、どうする？',
        options: [
          '重[おも]いから その辺[へん]に 捨[す]ててしまう',
          '箱[ばこ]を 蹴[け]っ飛[と]ばして 壊[こわ]してみる',
          '「命[いのち]より 大切[たいせつ]なものを 守[まも]ってくれて ありがとう！」と 感[かん]謝[しゃ]する'
        ],
        matchingIndex: 2, // C
        explanation: '善逸「炭治郎…！信じてくれていたんだね…！」と大号泣！'
      },
      {
        question: '第[だい]3問[もん]：善[ぜん]逸[いつ]が 極[きわ]めた 雷[かみなり]の呼[こ]吸[きゅう]の型[かた]は 何[なん]の型[かた]？',
        options: [
          '拾[じゅう]ノ型[かた]・居[い]眠[ねむ]りパンチ',
          '壱[いち]ノ型[かた]・霹[へき]靂[れき]一[いっ]閃[せん]（へきれきいっせん）',
          '弐[に]ノ型[かた]・逃[に]げ足[あし]ダッシュ'
        ],
        matchingIndex: 1, // B
        explanation: '善逸「一つしか使えないけど、誰よりも強靭な刃になれって爺ちゃんが言ってたんだ！」'
      }
    ],
    successMessage: '「3問[もん]すべて 一致[いっち]したぞ！善[ぜん]逸[いつ]は あなたを 心[こころ]から 信[しん]じ、共[とも]に戦[たたか]う 決[けつ]意[い]を固[かた]めた！」',
    failMessage: '「気[き]持[も]ちが すれ違[ちが]ってしまった…！善[ぜん]逸[いつ]『うわぁん！やっぱり 信[しん]じられないよぉ！もっと優[やさ]しくしてよ！』」'
  },

  char_kanao: {
    characterId: 'char_kanao',
    characterName: '栗花落カナヲ',
    dialogueIntro: '「……（銅[どう]貨[か]を 投[な]げようと 指[ゆび]に乗[の]せている）」',
    questions: [
      {
        question: '第[だい]1問[もん]：自[じ]分[ぶん]の 意[い]志[し]で 決[き]められない カナヲに、炭[たん]治[じ]郎[ろう]は 何[なん]と言[い]った？',
        options: [
          '「決[き]められないなら、一生[いっしょう] コインだけ 投[な]げていなさい」',
          '「誰[だれ]かの 言[い]うことだけ 聞[き]いていればいいよ」',
          '「表[おもて]が出[で]たら、カナヲは 心[こころ]の 声[こえ]を 聞[き]く！」'
        ],
        matchingIndex: 2, // C
        explanation: 'カナヲの瞳がハッとして大きく見開かれた！'
      },
      {
        question: '第[だい]2問[もん]：カナヲの 髪[かみ]飾[かざ]りの モチーフになっている 生[い]き物[もの]は？',
        options: [
          'オオカミ',
          '胡[こ]蝶[ちょう]（チョウチョ）',
          'コウモリ'
        ],
        matchingIndex: 1, // B
        explanation: 'カナエとしのぶから受け継いだ大切な蝶の髪飾りを優しく撫でた。'
      },
      {
        question: '第[だい]3問[もん]：カナヲが 使[つか]う 呼[こ]吸[きゅう]は？',
        options: [
          '花[はな]の呼[こ]吸[きゅう]',
          '泥[どろ]の呼[こ]吸[きゅう]',
          '鉄[てつ]の呼[こ]吸[きゅう]'
        ],
        matchingIndex: 0, // A
        explanation: '澄み渡る視力と花の呼吸で、カナヲが微笑んだ！'
      }
    ],
    successMessage: '「3問[もん]すべて 一致[いっち]！カナヲは コインを 投[な]げず、自[じ]分[ぶん]の心[こころ]で あなたと 進[すす]むことを 選[えら]んだ！」',
    failMessage: '「コインの 裏[うら]が出[で]てしまった… カナヲ『……（静[しず]かに 首[くび]を振[ふ]っている）』出直[でお]そう！」'
  },

  char_inosuke: {
    characterId: 'char_inosuke',
    characterName: '嘴平伊之助',
    dialogueIntro: '「猪[ちょ]突[とつ]猛[もう]進[しん]！！俺[おれ]様[さま]を 仲[なか]間[ま]にしたいだとォ！？受[う]けて立[た]つぜェ！」',
    questions: [
      {
        question: '第[だい]1問[もん]：伊[い]之[の]助[すけ]が 炭[たん]治[じ]郎[ろう]から おにぎりを もらったとき、どうなった？',
        options: [
          'お腹[なか]が 痛[いた]くなった',
          'ほわほわして 暖[あたた]かい 気[き]持[も]ちになった',
          '大[おお]怒[いか]りして 投[な]げ捨[す]てた'
        ],
        matchingIndex: 1, // B
        explanation: '伊之助の頭のまわりに「ほわほわ」が浮かび上がった！'
      },
      {
        question: '第[だい]2問[もん]：伊[い]之[の]助[すけ]の 日[にち]輪[りん]刀[とう]の 特[とく]徴[ちょう]は？',
        options: [
          '石[いし]で 叩[たた]いて ギザギザにした 二[に]刀[とう]流[りゅう]',
          'ピカピカに 磨[みが]かれた 鏡[かがみ]のような刀',
          'ピンク色[いろ]の リボンが ついている刀'
        ],
        matchingIndex: 0, // A
        explanation: '伊之助「カッカッカ！引き裂くような切れ味が最高なんだよ！」'
      },
      {
        question: '第[だい]3問[もん]：伊[い]之[の]助[すけ]が 編[あ]み出[だ]した 呼[こ]吸[きゅう]は？',
        options: [
          '豚[ぶた]の呼[こ]吸[きゅう]',
          '鳥[とり]の呼[こ]吸[きゅう]',
          '獣[けだもの]の呼[こ]吸[きゅう]'
        ],
        matchingIndex: 2, // C
        explanation: '山育ちの研ぎ澄まされた触覚が、あなたを親分と認めた！'
      }
    ],
    successMessage: '「全[ぜん]問[もん]一致[いっち]！伊[い]之[の]助[すけ]『よし！認[みと]めてやるぜ！ついて来[こ]い、子[こ]分[ぶん]共[ども]！！』」',
    failMessage: '「不[ふ]一[いっ]致[ち]！伊[い]之[の]助[すけ]『勝負[しょうぶ]勝負[しょうぶ]ゥ！お前[まえ]なんかに ついていくかァ！』」'
  },

  char_giyu: {
    characterId: 'char_giyu',
    characterName: '冨岡義勇',
    dialogueIntro: '「……俺[おれ]と 共[とも]に 来[く]るというのか。覚[かく]悟[ご]を 見[み]せてもらおう」',
    questions: [
      {
        question: '第[だい]1問[もん]：雪[ゆき]山[やま]で 炭[たん]治[じ]郎[ろう]に 義[ぎ]勇[ゆう]が 叫[さけ]んだ 名[めい]言[げん]は？',
        options: [
          '「寒[さむ]いから 帰[かえ]って こたつに 入[はい]ろう」',
          '「生[せい]殺[さつ]与[よ]奪[だつ]の権[けん]を 他[た]人[にん]に 握[にぎ]らせるな！」',
          '「お前[まえ]の 鮭[さけ]大[だい]根[こん]を 俺[おれ]に くれ！」'
        ],
        matchingIndex: 1, // B
        explanation: '厳しい言葉の裏にある深い慈悲と信念が胸に刺さる！'
      },
      {
        question: '第[だい]2問[もん]：義[ぎ]勇[ゆう]の 大[だい]好[す]きな 食[た]べ物[もの]は？',
        options: [
          'チョコレートパフェ',
          '激[げき]辛[から]カレー',
          '鮭[さけ]大[だい]根[こん]（さけだいこん）'
        ],
        matchingIndex: 2, // C
        explanation: '義勇の口元がほんのわずかに緩んだ…！'
      },
      {
        question: '第[だい]3問[もん]：義[ぎ]勇[ゆう]が 独[どく]自[じ]に 編[あ]み出[だ]した 水[みず]の呼[こ]吸[きゅう]・拾[じゅう]壱[いち]ノ型[かた]は？',
        options: [
          '凪[なぎ]（なぎ）',
          '嵐[あらし]',
          '津[つ]波[なみ]'
        ],
        matchingIndex: 0, // A
        explanation: '静寂がすべてを包み込み、義勇が深く頷いた！'
      }
    ],
    successMessage: '「3問[もん]すべて 一致[いっち]！義[ぎ]勇[ゆう]『……いいだろう。お前[まえ]たちと 共[とも]に 刀[かたな]を 振[ふ]るおう』」',
    failMessage: '「不[ふ]一[いっ]致[ち]… 義[ぎ]勇[ゆう]『俺[おれ]は 嫌[きら]われているわけではないが…まだ 早[はや]い』」'
  },

  char_shinobu: {
    characterId: 'char_shinobu',
    characterName: '胡蝶しのぶ',
    dialogueIntro: '「もしもし、大[だい]丈[じょう]夫[ぶ]ですか？ 私[わたし]と 仲[なか]良[よ]く 鬼[おに]退[たい]治[じ]をしてくれますか？」',
    questions: [
      {
        question: '第[だい]1問[もん]：しのぶは 腕[うで]力[りょく]で 首[くび]が 斬[き]れない代[か]わりに、何[なに]で 鬼[おに]を 倒[たお]す？',
        options: [
          'くすぐりの 刑[けい]',
          '藤[ふじ]の花[はな]の 毒[どく]',
          '大[おお]きな 声[こえ]'
        ],
        matchingIndex: 1, // B
        explanation: 'しのぶ「その通りです。鬼を殺せる毒を調合しています」'
      },
      {
        question: '第[だい]2問[もん]：しのぶが 管理[かんり]する、怪[け]我[が]した 隊[たい]士[し]を 治[なお]す 施[し]設[せつ]は？',
        options: [
          '遊[ゆう]園[えん]地[ち]',
          'おばけ屋[や]敷[しき]',
          '蝶[ちょう]屋[や]敷[しき]（ちょうやしき）'
        ],
        matchingIndex: 2, // C
        explanation: 'アオイやきよ、すみ、なほ達の優しい笑顔が浮かぶ！'
      },
      {
        question: '第[だい]3問[もん]：しのぶが 使う 呼[こ]吸[きゅう]は？',
        options: [
          '蟲[むし]の呼[こ]吸[きゅう]',
          '鳥[とり]の呼[こ]吸[きゅう]',
          '猫[ねこ]の呼[こ]吸[きゅう]'
        ],
        matchingIndex: 0, // A
        explanation: '蝶のように軽やかに舞い、優雅に微笑んだ！'
      }
    ],
    successMessage: '「3問[もん]すべて 一致[いっち]！しのぶ『ウフフ、素[す]敵[てき]ですね。共[とも]に 参[まい]りましょう！』」',
    failMessage: '「不[ふ]一[いっ]致[ち]！しのぶ『あらあら、それでは 困[こま]ってしまいますね。また 今[こん]度[ど]にしましょう』」'
  },

  char_rengoku: {
    characterId: 'char_rengoku',
    characterName: '煉獄杏寿郎',
    dialogueIntro: '「うむ！良[よ]い 眼[め]差[ざ]しだ！胸[むね]を 張[は]って 答[こた]えてみせよ！！」',
    questions: [
      {
        question: '第[だい]1問[もん]：煉[れん]獄[ごく]さんが 無[む]限[げん]列[れっ]車[しゃ]で 牛[ぎゅう]鍋[なべ]弁[べん]当[とう]を 食[た]べたときの 叫[さけ]びは？',
        options: [
          '「まずい！やりなおし！」',
          '「冷[つめ]たいから 温[あたた]めてくれ！」',
          '「うまい！うまい！うまい！」'
        ],
        matchingIndex: 2, // C
        explanation: '煉獄「うむ！弁当の味を噛み締めてこそ力が出るのだ！」'
      },
      {
        question: '第[だい]2問[もん]：母[はは]・瑠[る]火[か]様[さま]から 授[さず]かった 煉[れん]獄[ごく]さんの 使[し]命[めい]は？',
        options: [
          '強[つよ]く生[う]まれた者[もの]の 責[せき]務[む]として「弱[よわ]き人[ひと]を 助[たす]ける」こと',
          'お金[かね]を たくさん 稼[かせ]ぐこと',
          '鬼[おに]になって 不[ふ]老[ろう]不[ふ]死[し]になること'
        ],
        matchingIndex: 0, // A
        explanation: '誇り高き炎の魂が、あなたの言葉に呼応して燃え盛る！'
      },
      {
        question: '第[だい]3問[もん]：炭[たん]治[じ]郎[ろう]たちに 遺[のこ]した 魂[たましい]の言[こと]葉[ば]は？',
        options: [
          '「あきらめて 逃[に]げ出[だ]せ！」',
          '「心[こころ]を 燃[も]やせ！！」',
          '「寝[ね]て 忘[わす]れろ！」'
        ],
        matchingIndex: 1, // B
        explanation: 'カッと目を見開き、太陽のような笑顔を向けた！'
      }
    ],
    successMessage: '「全[ぜん]問[もん]一致[いっち]！煉[れん]獄[ごく]『見[み]事[ごと]だ！心[こころ]を燃[も]やし、共[とも]に責[せき]務[む]を果[は]たそう！俺[おれ]の継[つ]ぐ子[こ]になれ！』」',
    failMessage: '「不[ふ]一[いっ]致[ち]！煉[れん]獄[ごく]『うむ！まだ 迷[まよ]いがあるようだ！鍛[たん]錬[れん]を重[かさ]ねて 出直[でお]すがいい！』」'
  },

  char_genya: {
    characterId: 'char_genya',
    characterName: '不死川玄弥',
    dialogueIntro: '「チッ… 俺[おれ]と つるむ気[き]かよ。甘[あま]ったれは お断[ことわ]りだぜ」',
    questions: [
      {
        question: '第[だい]1問[もん]：玄[げん]弥[や]の 兄[あに]貴[き]は 誰[だれ]？',
        options: [
          '水[みず]柱[ばしら]・冨[とみ]岡[おか]義[ぎ]勇[ゆう]',
          '風[かぜ]柱[ばしら]・不[ふ]死[し]川[がわ]実[さね]弥[み]',
          '鋼[はがね]鐵[づか]塚[ほたる]'
        ],
        matchingIndex: 1, // B
        explanation: '玄弥「…兄貴に認めてもらいたい、それだけなんだ…」'
      },
      {
        question: '第[だい]2問[もん]：呼[こ]吸[きゅう]が 使[つか]えない 玄[げん]弥[や]が 戦[たたか]う 特[とく]異[い]体[たい]質[しつ]は？',
        options: [
          '何[なん]でも 吸[す]い込[こ]む 胃[い]袋[ぶくろ]',
          '壁[かべ]を すり抜[ぬ]ける 体[からだ]',
          '鬼[おに]を 食[く]らって 鬼[おに]の力[ちから]を 得[え]る「鬼[おに]喰[ぐ]い」'
        ],
        matchingIndex: 2, // C
        explanation: '銃と日輪刀を構え、覚悟を固めた！'
      },
      {
        question: '第[だい]3問[もん]：玄[げん]弥[や]が 女[おんな]の 子[こ]と 話[はな]すとき どうなる？',
        options: [
          '顔[かお]を 真[ま]っ赤[か]にして 照[て]れて 固[かた]まる',
          '大[おお]笑[わら]いする',
          '歌[うた]を 歌[うた]い出[だ]す'
        ],
        matchingIndex: 0, // A
        explanation: '玄弥「う、うるせえ！言うなバカ野郎！」と真っ赤になった！'
      }
    ],
    successMessage: '「全[ぜん]問[もん]一致[いっち]！玄[げん]弥[や]『…へっ、お前[まえ]なら 背[せ]中[なか]を 預[あず]けてやってもいいぜ！』」',
    failMessage: '「不[ふ]一[いっ]致[ち]！玄[げん]弥[や]『話[はなし]にならねえ！とっとと 失[う]せな！』」'
  },

  char_tamayo: {
    characterId: 'char_tamayo',
    characterName: '珠世',
    dialogueIntro: '「無[む]惨[ざん]を 倒[たお]すため、共[とも]に 歩[あゆ]んでくださいますか？」',
    questions: [
      {
        question: '第[だい]1問[もん]：珠[たま]世[よ]様[さま]の 夢[ゆめ]は？',
        options: [
          '世[せ]界[かい]中[じゅう]の お金[かね]を 集[あつ]めること',
          '鬼[おに]を 人[ひと]間[げん]に 戻[もど]す 薬[くすり]を 完[かん]成[せい]させること',
          '無[む]惨[ざん]の 手[て]下[した]になること'
        ],
        matchingIndex: 1, // B
        explanation: '禰豆子をはじめ、苦しむすべての鬼を救う慈愛に満ちた目標！'
      },
      {
        question: '第[だい]2問[もん]：珠[たま]世[よ]様[さま]の 助[じょ]手[しゅ]の 少[しょう]年[ねん]は？',
        options: [
          '善[ぜん]逸[いつ]',
          '手[て]鬼[おに]',
          '愈[ゆ]史[し]郎[ろう]'
        ],
        matchingIndex: 2, // C
        explanation: '愈史郎「珠世様を困らせるな！」と横から睨んでいる！'
      },
      {
        question: '第[だい]3問[もん]：珠[たま]世[よ]様[さま]の 血[けっ]鬼[き]術[じゅつ]は 何[なに]を 使[つか]う？',
        options: [
          '自[じ]分[ぶん]の 血[ち]の 匂[にお]い（惑[わく]血[ちつ]）',
          '大[おお]きな 石[いし]',
          '爆[ばく]発[はつ]する 矢[や]印[じるし]'
        ],
        matchingIndex: 0, // A
        explanation: '美しい幻惑の術式が優しく花開く！'
      }
    ],
    successMessage: '「全[ぜん]問[もん]一致[いっち]！珠[たま]世[よ]『ありがとう… 禰[ね]豆[ず]子[こ]さんを 必[かなら]ず 助[たす]けましょう』」',
    failMessage: '「不[ふ]一[いっ]致[ち]… 愈[ゆ]史[し]郎[ろう]『珠[たま]世[よ]様[さま]の 迷[めい]惑[わく]だ！出[で]ていけ！』」'
  }
};

/**
 * 固有の試練が未定義の隊士にも、6歳向けの3問選択肢を生成するジェネレータ
 * 正解の位置（matchingIndex）をA(0), B(1), C(2)にそれぞれ均等配置
 */
export function getOrCreateTrial(characterId: string, characterName: string, role: string, breathStyle: string): CharacterTrial {
  if (CHARACTER_TRIALS[characterId]) {
    const base = CHARACTER_TRIALS[characterId];
    return {
      ...base,
      questions: [
        shuffleQuestionOptions(base.questions[0]),
        shuffleQuestionOptions(base.questions[1]),
        shuffleQuestionOptions(base.questions[2])
      ]
    };
  }

  // Generate dynamic 3-question trial based on breath style and demon slayer values
  const breathLabel = breathStyle === 'water' ? '水[みず]'
    : breathStyle === 'flame' ? '炎[ほのお]'
    : breathStyle === 'thunder' ? '雷[かみなり]'
    : breathStyle === 'wind' ? '風[かぜ]'
    : breathStyle === 'stone' ? '岩[いわ]'
    : breathStyle === 'mist' ? '霞[かすみ]'
    : breathStyle === 'love' ? '恋[こい]'
    : breathStyle === 'serpent' ? '蛇[へび]'
    : breathStyle === 'sound' ? '音[おと]'
    : '全[ぜん]集[しゅう]中[ちゅう]';

  const rawQuestions: [TrialQuestion, TrialQuestion, TrialQuestion] = [
    {
      question: `第[だい]1問[もん]：鬼[おに]殺[さつ]隊[たい]の 隊[たい]士[し]が 一[いち]番[ばん] 大[たい]切[せつ]にすべき 心[こころ]は？`,
      options: [
        '自[じ]分[ぶん]だけ 助[たす]かればいいという「逃[に]げの心[こころ]」',
        '弱[よわ]き人[ひと]を 守[まも]り、仲間[なかま]を 信[しん]じる「不[ふ]屈[くつ]の心[こころ]」',
        '他[た]人[にん]を 傷[きず]つけて 笑[わら]う「悪[わる]い心[こころ]」'
      ],
      matchingIndex: 1, // B
      explanation: '炭治郎が貫く強い信念に、相手が深く頷いた！'
    },
    {
      question: `第[だい]2問[もん]：戦[たたか]いで 力[ちから]を 最[さい]大[だい]限[げん]に 引[ひ]き出[だ]す 技[わざ]は？`,
      options: [
        '目[め]を つぶって 暴[あば]れる',
        'お腹[なか]を すかせて 泣[な]く',
        `${breathLabel}の 呼[こ]吸[きゅう]・全[ぜん]集[しゅう]中[ちゅう]・常[じょう]中[ちゅう]`
      ],
      matchingIndex: 2, // C
      explanation: '肺を大きく広げ、血液の循環を高めて呼吸を研ぎ澄ませた！'
    },
    {
      question: `第[だい]3問[もん]：強[つよ]い 敵[てき]が 現[あらわ]れたとき、どう 行[こう]動[どう]する？`,
      options: [
        '仲間[なかま]と 力[ちから]を 合[あ]わせて 諦[あき]らめずに 立[た]ち向[む]かう！',
        '仲間[なかま]を 置[お]いて 逃[に]げ出[だ]す',
        '敵[てき]に 命[いのち]乞[ご]いをする'
      ],
      matchingIndex: 0, // A
      explanation: '燃え上がる闘志と絆が完全に一致した！'
    }
  ];

  return {
    characterId,
    characterName,
    dialogueIntro: `「私[わたし]を 呼[よ]び出[だ]すとは… お前[まえ]の 覚[かく]悟[ご]、試[ため]させてもらうぞ！」`,
    questions: [
      shuffleQuestionOptions(rawQuestions[0]),
      shuffleQuestionOptions(rawQuestions[1]),
      shuffleQuestionOptions(rawQuestions[2])
    ],
    successMessage: `「3問[もん]すべて 一致[いっち]！【${characterName}】と 心[こころ]が 通[つう]じ合[あ]い、仲間[なかま]に 加[くわ]わった！」`,
    failMessage: `「おしい！ 気[き]持[も]ちが すれ違[ちが]ってしまった…！もっと 修[しゅう]業[ぎょう]して 出[で]直[なお]そう！」`
  };
}
