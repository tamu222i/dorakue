# CHANGELOG.md - 鬼滅の刃クエスト 〜鬼殺隊列伝〜

All notable changes to this project will be documented in this file.

## [Unreleased]

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

## [1.8.0] - 2026-09-22 - Top Navigation Reorganization & Mode Switchers
- **「トップ上ボタン整理する。編成とやり直しは削除して。討伐モード、勧誘モード、宿モード追加」**:
  - トップ画面上部のヘッダーバーを整理し、誤操作しやすい「部隊編成」ボタンおよび「最初からやり直す」ボタンをトップから削除。
  - プレイヤーが直感的に主要画面・機能を切り替えられる3大モードボタンを新設：
    - **【討伐モード】**: 鬼の討伐・探索・ボス戦が繰り広げられるワールドマップ画面へ即座に移動。
    - **【勧誘モード】**: 藤の家紋の宿の「隊士勧誘」タブへ直接移動し、新たな仲間や柱の勧誘・試練にすぐ挑戦可能。
    - **【宿モード】**: 藤の家紋の宿の「休む（回復）」タブへ直接移動し、全回復や自動適用アイテムの購入を即座に実行可能。
  - 部隊編成は藤の家紋の家（宿屋）の編成メニューから落ち着いて行えるように統一し、ゲームやり直し機能はワールドマップ下部の初期化ボタンから安全に行えるよう配置を適正化。


