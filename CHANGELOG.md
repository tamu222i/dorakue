# CHANGELOG.md - 鬼滅の刃クエスト 〜鬼殺隊列伝〜

All notable changes to this project will be documented in this file.

## [Unreleased]

### 討伐モード（レベル上げ修業場）4段階難易度スケーリング＆ボス完全除外
- **ボスキャラの完全除外**:
  - レベル上げ用の「周辺の鬼」でボスキャラ（累・無惨・手鬼・猗窩座・下弦・上弦など）が出現して全滅していた問題を修正。
  - `EnemyGroupService.isMobDemon` によりボスキャラ・十二鬼月を厳格に除外。野良鬼・雑魚鬼（100体のモブ鬼）のみが選出されるよう変更。
  - モブ専用の技（`引っ掻き`, `噛みつき`, `飛びかかり`, `鬼の威嚇咆哮`）を設定し、ボスの即死全体攻撃による事故を完全に防止。
- **パーティ現在Lvに応じた4段階の動的修業難易度**:
  - 固定の章指定ではなく、現在のパーティ平均レベルを自動計算して4段階でボタンを配置。
    - **第1段階 (少し弱い・安心修業)**: パーティLvより少し弱い野良鬼（安全に経験値を稼ぐ）
    - **第2段階 (同格・適正修業)**: パーティLvと同格の野良鬼（バランス良く成長）
    - **第3段階 (少し強い・挑戦修業)**: パーティLvより少し強い野良鬼（多めの経験値と手応え）
    - **第4段階 (強い・集中猛特訓)**: パーティLvより強い野良鬼（大量経験値獲得）
  - 各段階で出現する野良鬼のステータス（HP・攻撃・防御・速度）を適正バランスで自動スケール。
  - レベル上げの快適性と安全性が大幅に向上。


### Initial Setup - [Red Stage]
- Initialized project requirements and schema-driven DDD plan.
- Designed 500-character dot art generator specification.
- Configured metadata, index.html title/fonts, retro DQ style sheets.
- Defined BDD and TDD test suites (character catalog, damage calculation, inn revive on wipeout, party scout).
- Git repository initialized.

### Core Implementation - [Green Stage]
- Implemented `/src/domain` schemas, types, entities, and services.
- Implemented 500 characters catalog engine with procedural & canonical attributes and dot art patterns.
- Implemented JRPG combat damage calculator with breath styles, critical hits (隙の糸), and BP costs.
- Implemented Application Layer: BattleUseCase, InnUseCase (death revive), ScoutUseCase, StoryUseCase.
- Implemented Infrastructure Layer: Web Audio 8-bit retro sound synthesizer (slashes, fanfares, inn jingle).
- Implemented UI: Dragon Quest authentic command windows, mobile virtual D-Pad, 500-character Zukan viewer, battle scenes, inn revive sequence.
- Verified test runner: all BDD & TDD tests passing.

### Polish & DDD Refactor - [Refactor Stage]
- Refactored state flow into clean responsive hooks and DDD stores.
- Added animated breathing cut-ins and blood demon art visual fx.
- Enhanced responsive mobile layout and 2x speed / AUTO battle for completing the full 8-chapter story in ~30 minutes.
- Verified production build and linting.

## [1.1.0] - 2026-09-21 - Visual Enhancement & Persistence Update
- **2x Resolution Pixel Art (32x32)**:
  - Upgraded sprite rendering from 16x16 to 32x32 crisp matrix (`shapeRendering="crispEdges"`, `imageRendering: "pixelated"`).
  - Enhanced fine details: hair highlights, eye reflections/pupils, forehead scars, hanafuda earrings, bamboo muzzle, haori patterns (Tanjiro checkered, Giyu split, Zenitsu triangles, Rengoku flame hem, Shinobu butterfly wings), Nichirin sword tsuba, and demon markings/horns.
- **Unencountered Character Masking in Zukan**:
  - Hidden characters (not yet met in story, battles, or inn scouting) now display as `？？？？？` with mysterious dark silhouettes.
  - Added discovery rate indicator (`XX / 500 体 (YY%)`) and toggle to filter between "Encountered only" and "All".
  - Auto-unlock characters upon story progression, battle encounters, and inn visits.
- **LocalStorage Game Persistence**:
  - Created `SaveService` to store and restore chapter progress, money, recruited roster, active party slots, items, and encountered catalog IDs.
  - Added auto-save triggers on battle victory, inn revival, member recruitment, and chapter progression.
  - Added manual save indicator and game reset option in top navigation header.
- **Testing**:
  - Added TDD/BDD scenarios for 32x32 resolution, zukan masking logic, and save/load state persistence. All 24 tests passing green.

## [1.2.0] - 2026-09-21 - Story Mode, Branching Recruitment & Catalog Pruning Update
- **Prominent Recruitment Fanfare (`RecruitmentCelebrationModal.tsx`)**:
  - Created an unmissable, celebratory full-screen modal whenever a new character is recruited.
  - Features glowing golden aura, 84px crisp animated pixel sprite, rank badge, breathing style, role, full combat stats (HP, BP, ATK, DEF), and authentic character dialogue quote.
  - Supports multi-character join events (e.g., Tamayo & Yushiro, Sabito & Makomo).
  - Provides one-touch instant assignment to active 4-man frontline squad (with easy replacement selection) or sending to the Inn.
  - Accompanied by level-up/fanfare retro 8-bit sound.
- **Dedicated Story Mode (`StoryModeScreen.tsx`)**:
  - Added dedicated 原作ストーリーモード (Story Mode) accessible from navigation bar, world map, and mobile controller.
  - Chapter selector (Chapters 1–8) with prologue lore, canon dialogues, and boss battle challenge.
  - Allows replaying unlocked chapters to explore alternative narrative branches.
- **Branching & Randomized Character Recruitment ("選択肢で誰が仲間になるかバラバラにして")**:
  - Implemented distinct narrative choices for all 8 chapters in `StoryData.ts`.
  - Different choices yield completely different recruits and companions.
  - Added "🎲 鎹鴉の導き（ランダム仲間）" button to randomize recruitment choices for surprise encounters.
- **Curated 200-Character Catalog (Pruned Featureless Trash Demons)**:
  - Removed repetitive generic trash demons ("ざこ鬼イラン。特徴のない鬼は全削除で500足りなくてイイ。200くらい？").
  - Catalog curated to exactly 200 unique characters covering all Hashira, main protagonists, named demons (Hand Demon, Swamp Demon, Yahaba, Susamaru, Kyogai, Rui & Spider Family, Enmu, Akaza, Daki & Gyutaro, Hantengu forms, Gyokko, Kokushibo, Kaigaku, Nakime, Muzan), Butterfly Mansion girls, and auxiliary allies.
  - Updated all UI headers, Zukan stats, and game ending screens to reflect the curated 200-character collection.
- **TDD & BDD Test Suite Expansion**:
  - Updated catalog tests for the 200 character ceiling.
  - Added BDD Scenario 6: Story Mode choices and distinct comrade recruitment verification.
  - All 28 tests passing green (0 failures).

## [1.3.0] - 2026-09-22 - 100 Mob Demons, Level Grinding & Hashira Training Mini-Game
- **100 Unique Mob Demons for Safe Level Grinding (Total 300 Characters)**:
  - Added 100 named, distinct wild mob demons (`demon_mob_1` to `demon_mob_100`) across all stages.
  - Fujikasane Stage 1 features weak Lv.1-3 demons allowing players to level up comfortably.
  - Multi-enemy wild demon squads (1 to 4 enemies) and Swamp Demon Trio (三身一体).
- **Skill Progression Tree (`SkillProgressionService.ts`)**:
  - Implemented level-based breathing skill progression from basic starter moves to ultimate secret techniques.
  - Dynamic ultimate cut-in animations with authentic character battle shouts (`UltimateCutIn.tsx`).
- **Hashira Training Timing Mini-Game (`HashiraTrainingModal.tsx`)**:
  - Hashira can no longer be recruited through simple quizzes; players must clear an interactive timing bar mini-game (柱稽古).
  - 3-Question Recruitment Trials (`RecruitmentTrialModal.tsx`) with balanced A/B/C options for all non-Hashira corps members.
- **Stage Clear Rule Hardening**:
  - Characters are no longer automatically recruited upon stage victory; they are registered in the Zukan and recruited via trials or Hashira training.

## [1.4.0] - 2026-09-22 - Chapter 9 (Demon King Tanjiro), Clear Milestones & 2nd Playthrough
- **Chapter 9: Final Secret Stage (鬼化・竈門炭治郎)**:
  - Added Chapter 9 unlocked upon defeating Muzan in Chapter 8.
  - Narrative battle to save Demon King Tanjiro using the bonds of Nezuko, Zenitsu, Inosuke, and Kanao.
- **Two-Tiered Clear System (Normal Clear & True Complete Clear)**:
  - Normal Clear (いったんクリア): Triggered upon defeating Chapter 9.
  - True Complete Clear (完全クリア): Requires recruiting all allies AND defeating all 9 Upper Moons & Twelve Kizuki.
  - Dedicated `ClearProgressModal.tsx` to track overall completion, allies recruited, and Kizuki defeated.
- **2nd Playthrough & Hidden Twelve Kizuki (`TwelveKizukiService.ts`)**:
  - Hidden Lower Moons (Kamanue, Mukago, Wakuraba, Rokuro) and Upper Moons (Kaigaku, Nakime, Doma) concealed in stage areas during 2nd playthrough.
- **SSR Safety & Test Suite Perfection**:
  - Made browser `localStorage` access fully SSR and Node-safe.
  - Expanded test runner to 37 comprehensive TDD & BDD tests passing with 0 errors.

## [1.5.0] - 2026-09-22 - Hashira-Only Allies, 2nd Playthrough Lock & Kizuna no Kiseki BGM
- **「全仲間は柱だけだよ」完全クリア条件の厳密化（九柱集結）**:
  - `TwelveKizukiService.getRecruitableAllies` を修正し、完全クリア判定の対象仲間を鬼殺隊の最高戦力【九柱】（冨岡義勇・胡蝶しのぶ・煉獄杏寿郎・宇髄天元・時透無一郎・甘露寺蜜璃・悲鳴嶼行冥・不死川実弥・伊黒小芭内）の9名に限定。
  - `ClearProgressModal` の仲間タブを「仲間・九柱集め (X/9)」に特化し、九柱それぞれの加入状況、呼吸、各章での柱稽古（タイミングミニゲーム）ヒントをカード形式で可視化。
  - `EndingScreen` の完全クリア判定表示も九柱全員の集結状況に合わせて同期。
- **「2周目は1周目クリアしないと闘えない」2周目戦闘ロックの徹底**:
  - 第9章（鬼化・炭治郎救出戦）で1周目をクリア（一旦クリア）するまで、2周目限定の隠れ十二鬼月戦への挑戦を完全にロック。
  - ワールドマップ画面で1周目未クリア時は「🔒 1周目クリアで解放」と明記し、挑戦ボタンを無効化。1周目クリア後に「第2周目を開始して隠れ十二鬼月に挑む！」ボタンから安全に2周目を開始・戦闘可能に設計。
- **「曲名が絆の奇跡が表示されないよ」BGM表示の修正**:
  - ヘッダーのレトロBGM切り替えボタンにおいて、刀鍛冶の里編・感動のエンディング曲「♪ 絆ノ奇跡」のトラック名が欠落していた問題を修正。
  - 切り替えサイクルに「♪ 絆ノ奇跡」を明示的に組み込み、エンディング画面および通常プレイ時にもBGM名が正しく表示されるよう改修。
- **自動テストの拡充**:
  - `test/runner.ts` にシナリオ10を追加し、九柱限定の仲間集め判定、2周目解放ガード、絆ノ奇跡トラックの表示・定義を包括検証（42/42全テストパス）。

## [1.6.0] - 2026-09-22 - Level-Gated Breathing Techniques & Strongest-Only Cut-Ins
- **「最初から呼吸は使えないよ。レベルが上がったら強力な呼吸が使えるように調整して」**:
  - 新米隊士として最初は呼吸を使えない原作設定を再現。
  - レベル1〜2の初期段階では基礎剣術・応急手当（`breathStyle: 'none'`）のみを使用可能に制限。
  - レベル上昇に伴い段階的に上位の呼吸技が解禁されるスキルツリーを `SkillProgressionService.ts` に実装：
    - Lv.1〜2: 基礎・袈裟斬り、基礎・直突き、徒手空拳・殴り、応急手当
    - Lv.3〜4: 壱ノ型（水面斬り、霹靂一閃、不知火、穿ち抜き等）
    - Lv.7〜18: 中級〜上級呼吸技（水車、六連、神速、狂い裂き、生生流転、炎虎等）
    - Lv.22〜36: 各柱・隊士の極限奥義（ヒノカミ神楽 日暈の龍 頭舞い、火雷神、凪、煉獄、朧等）
  - 戦闘中の技選択リストにも【基本技】・【呼吸技】・【最強奥義】のカラーバッジを表示。
- **「カットインは最強の呼吸だけだよ」演出の厳選・テンポ改善**:
  - 初歩の技や通常の型ではカットインを発生させず戦闘テンポを向上。
  - `isUltimateSkill` の判定基準を刷新し、隊士ごとの最強奥義（`isUltimate: true`）発動時のみ、全画面カットインと名台詞カットがドラマチックに作動するよう制御。
- **テスト拡充**:
  - `test/runner.ts` にシナリオ11を追加し、Lv.1での呼吸技未所持、レベル上昇での段階解禁、最強奥義のみのカットイン発動を包括検証（55/55全テストパス）。

## [1.7.0] - 2026-09-22 - Auto-Item Application & Speed-Based Dynamic Action Order
- **「アイテムは持っているだけで自動適用にして」全自動アイテムシステム**:
  - `AutoItemService.ts` を新規策定し、アイテムを手動で使用しなくてもインベントリに持っているだけでピンチ時に全自動発動する仕組みを実装：
    - **傷薬（薬草）**: 戦闘中にHPが45%以下になった瞬間、自動で傷を癒しHP 50回復。
    - **藤の花の霊水**: 鬼の強打で戦闘不能（HP 0）になった瞬間、自動で奇跡を起こしHP半分で即座に蘇生。
    - **特製おにぎり**: 呼吸技に必要なBPが不足している時、自動で食して呼吸力（BP）を25即時補給。
    - **鍛錬の瓢箪**: 持っているだけで全集中の常中鍛錬効果により素早さ+12、攻撃力+8の常時パッシブ強化。
    - **厄除の御守り**: 持っているだけで防御力+10、最大HP+25の常時パッシブ強化。
  - 宿屋の道具屋・所持品リスト・戦闘中の道具ウィンドウの表記を「戦闘中常時・全自動適用」に全面刷新。貴重な攻撃ターンを道具選択で無駄に消費せず、全集中で攻撃や奥義を放てる快適なバトルを実現。
- **「素早さによって攻撃の順番は変わるようにしないといつも同じ順番でつまらない」動的行動順タイムライン**:
  - 味方隊士と敵の素早さ（`speed`）および装備アイテム効果に基づき、毎ターン動的にイニシアチブ（行動値）を計算。
  - 善逸など素早さの高い隊士が先手を取ったり、敵味方の行動順がラウンドごとに入れ替わるスリリングな戦闘シーケンスを構築。
  - 戦闘画面上部に**「【素早さ行動順】タイムライン」**を新設。敵味方の行動順序（①善逸 ➔ ②猗窩座 ➔ ③炭治郎…）と現在の行動者が一目でわかるアクティブインジケーターを常時表示。
  - 素早さの高い味方が敵を行動前に撃破した場合、その敵の攻撃はキャンセルされるため、育成や瓢箪の装備による速度戦略性が大幅に向上。

## [1.9.0] - 2026-09-22 - Mode Disambiguation & Unification
- **「原作が２箇所でてきて分かりづらい。討伐モードか勧誘モードで分かりやすくして」**:
  - メイン画面（ワールドマップ）や各所において「原作」の呼称が混在していた問題を解消し、プレイ目的ごとに2大モードとして命名・役割を明確化：
    - **【討伐モード】**: 原作ストーリー全8章＋隠し第9章の鬼討伐進行・ボス決戦画面（「討伐モード進行（全8章の鬼討伐）」に統一）。
    - **【勧誘モード】**: 原作各章の仲間や九柱を、柱稽古（タイミング判定）や3問クイズ試練によってスカウト・仲間に加える専用モード（「勧誘モード（柱稽古＆試練で仲間集め）」に統一）。
  - 各種画面（ワールドマップ、章詳細パネル、完全クリア進捗、エンディング画面）のボタン・案内テキストを「討伐モード」「勧誘モード」に完全同期。

## [2.1.0] - 2026-09-22 - Subjugation Mode Blue Button Layout Fix
- **「討伐モードの青ボタンが表示が崩れてる。見た目を直してや。」修正**:
  - **章詳細アクションボタンの表示崩れ修正**:
    - 討伐モード（WorldMapScreen）内の各章詳細パネルにある青ボタン（勧誘モード直通ボタン）において、`<FuriganaText>` に長い括弧書き（「勧[かん]誘[ゆう]モード（柱稽古[はしらげいこ]＆試練[しれん]で仲間[なかま]集[あつ]め）」）が含まれていたため、ルビ描画の `（` と `）` が入れ子になり50文字以上のブラケット崩れと不自然な改行が発生していた問題を抜本修正。
    - ボタンテキストを `<FuriganaText text="勧[かん]誘[ゆう]モード" />` ＋専用の小型バッジ「仲間集め」にリファクタリングし、入れ子括弧を完全に解消。
    - ボタン配置を不均等なFlex横並びから、左右対称の均等2分割グリッド（`grid grid-cols-1 sm:grid-cols-2 gap-2`）に変更。赤のボス討伐ボタンと高さ（`min-h-[46px]`）・押しやすさを完全に一致させ、美しく整頓されたレトロJRPGスタイルに統一。
  - **修業場・トップバーのボタン折り返し・高さ整合**:
    - レベル上げ修業場の4つのボタン（藤襲山・浅草街・沼の鬼・現舞台）に統一の最低高さ（`min-h-[58px]`）と `whitespace-nowrap` を付与し、ボタンごとの不揃いな段差を解消。
    - 画面上部ヘッダーのナビゲーションボタン（討伐モード・勧誘モード・宿モード等）にも `whitespace-nowrap shrink-0` を追加し、狭小画面やレスポンシブ表示でもボタン内文字が途中で折れ曲がらないようUIを堅牢化。

## [2.0.0] - 2026-09-22 - Boss Difficulty Rebalance & Final Stage Ultimate Breathing Requirement
- **「肝心のボスキャラが弱すぎる。レベル5つ上げないと倒せないように調整」ボス難易度全面刷新**:
  - 全章のボス（手鬼、朱紗丸・矢琶羽、響凱、累、魘夢＆猗窩座、堕姫＆妓夫太郎、玉壺＆半天狗、黒死牟＆無惨、鬼化炭治郎）のステータス（HP・攻撃力・防御力）を約1.5倍〜2倍に大幅強化。
  - 各章の推奨レベル（`recommendedLevel`）を現状より5レベル引き上げ（第1章: Lv.6、第2章: Lv.11、第3章: Lv.16、第4章: Lv.21、第5章: Lv.27、第6章: Lv.33、第7章: Lv.39、第8章: Lv.45、第9章: Lv.50）。
  - 周辺の鬼でのレベル上げや呼吸技の習得、宿屋でのアイテム補充を戦略的に行わなければ突破できない歯ごたえある王道JRPG難易度に調整。
- **「最終ステージは最強の呼吸使わないと倒せないように調整」鬼の王・超再生ギミック**:
  - 最終決戦（第8章・第9章の鬼舞辻無惨・鬼化竈門炭治郎戦）において、鬼の王の【驚異の超再生】システムを実装：
    - 通常の「戦う」攻撃では肉体が硬質化し浅い傷しか与えられず、HPが1未満にならずトドメを刺せない。
    - 通常の初級呼吸技でも同様に超再生によってHPが1で耐え、再生ログ（`⚠️【驚異の超再生！】鬼の王の肉体が瞬時に塞がる！最強の呼吸（奥義）でなければトドメを刺せない！`）が発生。
    - 各隊士の【最強の呼吸（奥義）】を命中させた時のみ再生核を両断し、HPを0にして討伐・勝利することが可能。
    - 戦闘画面上部に警告バナー（`【最終決戦・鬼の王の超再生】通常攻撃・初級技ではトドメを刺せません！『最強の呼吸（奥義）』でトドメを刺せ！`）を常時表示。
    - コマンド選択画面の「戦う」ボタンに「※トドメ不可」表記、技一覧の奥義に「【★最強奥義・トドメ有効】」専用バッジを表示。
- **「2周目はレベル1上がっていく感じで調整して」周回ステージごとの動的レベルスケーリング**:
  - `EnemyGroupService.ts` に `scaleEnemyForPlaythrough` を実装。2周目以降、各ステージ（章）が進むごとに敵レベルが1ずつ上昇する動的スケールを適用：
    - 2周目 第1章: Lv.46
    - 2周目 第2章: Lv.47
    - 2周目 第3章: Lv.48
    - …
    - 2周目 第9章: Lv.54
  - レベル上昇に伴い最大HP・攻撃力・防御力・素早さが自動補正され、1周目をクリアした強力なパーティでも手応えのある冒険が楽しめるように調整。
- **「全削除で消えてないデータがある。1周目の討伐履歴とか。確実に全削除出来るようにして」対応**:
  - **討伐履歴・進行フラグの完全初期化**:
    - リセット実行時（`handleConfirmReset`）に、1周目・2周目の鬼討伐履歴（`defeatedDemonIds`）、周回数（`playthroughCount`）、通常クリアフラグ（`hasClearedNormal`）、完全クリアフラグ（`hasClearedTrue`）が初期化されずに残存していた問題を解決。
    - 全削除時にすべての討伐履歴（上弦の鬼・十二鬼月・隠れ鬼・ストーリーボス）を空集合（`Set<string>()`）に完全リセットし、周回数を1、章インデックスを0、クリアフラグを`false`に確実に巻き戻すよう修正。
  - **キャラクターカタログのクリーン再生成**:
    - `catalog` を `useState` で管理し、初期化時に `generateCharacterCatalog()` を再実行することで、育成された仲間やステータス変更を受けた全300キャラクターを初期Lv.1・基礎ステータスへ完全リフレッシュ。
  - **LocalStorageの徹底消去 (`SaveService.clearSave`)**:
    - メインのセーブキー（`kimetsu_quest_save_v2`）だけでなく、ブラウザ内に残存する可能性のあるすべての `kimetsu_` 関連キーを網羅的に走査・消去。
    - 初期化直後に初期状態（`defeatedDemonIds: []`, `playthroughCount: 1`, `hasClearedNormal: false`）を確実に上書き保存。
  - **初期化確認モーダル（`ResetConfirmModal.tsx`）の明示性向上**:
    - 討伐履歴（1周目／2周目・隠れ十二鬼月）、完全クリア進捗、図鑑遭遇履歴、仲間レベル・所持金が完全に消去される旨を詳細に明記。
  - **テスト拡充**:
    - `test/runner.ts` に「周回データ・討伐履歴付きセーブデータの全削除および完全初期化」の自動テストを追加し、討伐履歴が0件にリセットされることを厳密に検証（全65テスト合格）。



