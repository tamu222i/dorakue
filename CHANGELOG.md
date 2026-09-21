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

