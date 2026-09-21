/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { generateCharacterCatalog } from './domain/services/CharacterCatalog.ts';
import { PartyAggregate } from './domain/aggregates/PartyAggregate.ts';
import { STORY_CHAPTERS } from './domain/services/StoryData.ts';
import { Character, StoryChapter, StoryChoice } from './domain/models/types.ts';
import { InnService } from './application/InnUseCase.ts';
import { SaveService, SaveData } from './infrastructure/storage/SaveService.ts';
import { BattleScreen } from './components/BattleScreen.tsx';
import { WorldMapScreen } from './components/WorldMapScreen.tsx';
import { InnScreen } from './components/InnScreen.tsx';
import { ZukanScreen } from './components/ZukanScreen.tsx';
import { StoryModeScreen } from './components/StoryModeScreen.tsx';
import { RecruitmentCelebrationModal, RecruitmentEvent } from './components/RecruitmentCelebrationModal.tsx';
import { RecruitmentTrialModal } from './components/RecruitmentTrialModal.tsx';
import { ResetConfirmModal } from './components/ResetConfirmModal.tsx';
import { DqFrame } from './components/DqFrame.tsx';
import { FuriganaText } from './components/Ruby.tsx';
import { PixelSprite } from './infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from './infrastructure/audio/RetroSound.ts';
import { Sparkles, Award, RefreshCw, Flame, Save, RotateCcw, Check, BookOpen } from 'lucide-react';

type GameScreen = 'world' | 'battle' | 'inn' | 'zukan' | 'story' | 'ending';

export default function App() {
  // 1. Initialize 300-Character Catalog
  const catalog = useMemo(() => generateCharacterCatalog(), []);

  // Check for saved data in localStorage
  const savedData = useMemo(() => {
    return SaveService.loadGame();
  }, []);

  // 2. Initialize Party Aggregate (from save or default)
  const [party] = useState<PartyAggregate>(() => {
    const tanjiro = catalog.find(c => c.name === '竈門炭治郎') || catalog[0];
    const newParty = new PartyAggregate(tanjiro);

    if (savedData && savedData.roster && savedData.roster.length > 0) {
      newParty.restoreFromData(
        savedData.roster,
        savedData.activeMemberIds,
        savedData.partyMoney,
        savedData.inventory
      );
    } else {
      // Default initial partner: Nezuko
      const nezuko = catalog.find(c => c.name === '竈門禰豆子');
      if (nezuko) newParty.recruitMember(nezuko);
    }

    return newParty;
  });

  // 3. Game Progression State (loaded from save or default)
  const [screen, setScreen] = useState<GameScreen>('world');
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(() => {
    return savedData?.currentChapterIndex ?? 0;
  });

  // Set of encountered characters (for Zukan hiding)
  const [encounteredIds, setEncounteredIds] = useState<Set<string>>(() => {
    if (savedData?.encounteredCharacterIds && savedData.encounteredCharacterIds.length > 0) {
      return new Set(savedData.encounteredCharacterIds);
    }
    // Default initial encounters: Tanjiro, Nezuko, and Chapter 1 boss/recruits
    const initial = new Set<string>();
    const tanjiro = catalog.find(c => c.name === '竈門炭治郎');
    if (tanjiro) initial.add(tanjiro.id);
    const nezuko = catalog.find(c => c.name === '竈門禰豆子');
    if (nezuko) initial.add(nezuko.id);
    const handDemon = catalog.find(c => c.name.includes('手鬼'));
    if (handDemon) initial.add(handDemon.id);
    const uroko = catalog.find(c => c.name.includes('鱗滝'));
    if (uroko) initial.add(uroko.id);
    return initial;
  });

  const [currentBattle, setCurrentBattle] = useState<{
    enemy: Character;
    isBoss: boolean;
    chapter?: StoryChapter;
  } | null>(null);

  const [innMessage, setInnMessage] = useState<string | undefined>();
  const [rosterVersion, setRosterVersion] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [recruitmentEvent, setRecruitmentEvent] = useState<RecruitmentEvent | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [activeTrial, setActiveTrial] = useState<{
    character: Character;
    bonusCharacters: Character[];
    choice: StoryChoice;
  } | null>(null);

  // Helper to register new characters as encountered
  const registerEncounters = useCallback((ids: string[]) => {
    setEncounteredIds(prev => {
      let changed = false;
      const next = new Set(prev);
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  // Save current game state to localStorage
  const triggerSave = useCallback(() => {
    SaveService.saveGame(currentChapterIndex, party, encounteredIds);
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, [currentChapterIndex, party, encounteredIds]);

  // Auto-save whenever key progression or encounter state changes
  useEffect(() => {
    // Also ensure all party members in roster are marked as encountered
    const rosterIds = party.roster.map(m => m.id);
    registerEncounters(rosterIds);
    SaveService.saveGame(currentChapterIndex, party, encounteredIds);
  }, [currentChapterIndex, rosterVersion, encounteredIds, registerEncounters, party]);

  // Set of unlocked/recruited character IDs for Zukan
  const partyRosterIds = useMemo(() => {
    return new Set(party.roster.map(m => m.id));
  }, [party.roster, rosterVersion]);

  // Handle Story Mode Choice Selection ("カンタンに仲間呼び出しできすぎるので、3問選択肢だしてすべて一致したときだけ仲間になるように調整して。")
  const handleSelectStoryRecruit = (choice: StoryChoice, _chapter: StoryChapter) => {
    const recruitChar = catalog.find(c => c.id === choice.recruitCharacterId);
    if (!recruitChar) return;

    const bonusChars: Character[] = [];
    if (choice.bonusCharacterIds) {
      for (const bId of choice.bonusCharacterIds) {
        const bChar = catalog.find(c => c.id === bId);
        if (bChar) bonusChars.push(bChar);
      }
    }

    // Open the 3-question recruitment trial modal
    setActiveTrial({
      character: recruitChar,
      bonusCharacters: bonusChars,
      choice
    });
  };

  // Called ONLY when all 3 questions match in the recruitment trial
  const handleSuccessTrial = (character: Character, bonusCharacters?: Character[]) => {
    if (!activeTrial) return;

    // Add main character if not yet recruited
    if (!party.hasMember(character.id)) {
      party.recruitMember(character);
    }
    // Add bonus characters
    if (bonusCharacters) {
      for (const b of bonusCharacters) {
        if (!party.hasMember(b.id)) {
          party.recruitMember(b);
        }
      }
    }

    // Register encounters in Zukan
    const allIds = [character.id, ...(bonusCharacters ? bonusCharacters.map(b => b.id) : [])];
    registerEncounters(allIds);
    setRosterVersion(v => v + 1);

    const resultChoice = activeTrial.choice;
    setActiveTrial(null);

    // Trigger prominent recruitment celebration modal
    setRecruitmentEvent({
      mainCharacter: character,
      bonusCharacters: bonusCharacters || [],
      dialogue: resultChoice.resultDialogue
    });

    triggerSave();
  };

  // Handle Confirming / Swapping Member from Recruitment Modal
  const handleConfirmRecruitment = (swapSlotIndex?: number) => {
    if (recruitmentEvent) {
      const charId = recruitmentEvent.mainCharacter.id;
      if (typeof swapSlotIndex === 'number') {
        party.setPartySlot(swapSlotIndex, charId);
      } else if (party.activeMembers.length < 4 && !party.activeMembers.some(m => m.id === charId)) {
        party.setPartySlot(party.activeMembers.length, charId);
      }
      setRosterVersion(v => v + 1);
      triggerSave();
    }
    setRecruitmentEvent(null);
  };

  const handleSendRecruitToInn = () => {
    setRecruitmentEvent(null);
    triggerSave();
  };

  // Handle Starting a Boss Battle
  const handleStartBossBattle = (chapter: StoryChapter) => {
    const boss = catalog.find(c => c.id === chapter.bossCharacterId) || catalog.find(c => c.name.includes('鬼'))!;

    // Register boss as encountered
    registerEncounters([boss.id]);

    setCurrentBattle({
      enemy: { ...boss },
      isBoss: true,
      chapter
    });
    setScreen('battle');
  };

  // Handle Starting a Wild Demon Encounter
  const handleStartRandomBattle = (enemy: Character) => {
    // Register wild enemy as encountered
    registerEncounters([enemy.id]);

    setCurrentBattle({
      enemy: { ...enemy },
      isBoss: false
    });
    setScreen('battle');
  };

  // Handle Victory in Battle
  const handleBattleVictory = (expGained: number, moneyGained: number) => {
    if (currentBattle?.isBoss && currentBattle.chapter) {
      const finishedChapterNum = currentBattle.chapter.chapterNumber;

      // Unlock recruited characters for this chapter
      const newlyRecruitedIds: string[] = [];
      for (const recruitId of currentBattle.chapter.unlockedRecruits) {
        const recruitChar = catalog.find(c => c.id === recruitId);
        if (recruitChar && !party.hasMember(recruitChar.id)) {
          party.recruitMember(recruitChar);
          newlyRecruitedIds.push(recruitChar.id);
        }
      }

      // Mark recruits as encountered
      if (newlyRecruitedIds.length > 0) {
        registerEncounters(newlyRecruitedIds);
        const mainRecruit = catalog.find(c => c.id === newlyRecruitedIds[0]);
        const bonusRecruits = newlyRecruitedIds
          .slice(1)
          .map(id => catalog.find(c => c.id === id))
          .filter(Boolean) as Character[];

        if (mainRecruit) {
          // Open prominent recruitment celebration fanfare!
          setRecruitmentEvent({
            mainCharacter: mainRecruit,
            bonusCharacters: bonusRecruits,
            dialogue: currentBattle.chapter.victoryDialogues
          });
        }
      }

      setRosterVersion(v => v + 1);

      // Advance chapter
      if (finishedChapterNum >= 8) {
        // Defeated Muzan in Chapter 8! Roll Ending Credits
        setScreen('ending');
        triggerSave();
        return;
      } else {
        const nextIdx = Math.max(currentChapterIndex, finishedChapterNum);
        setCurrentChapterIndex(nextIdx);

        // Pre-encounter next chapter's boss
        const nextChapter = STORY_CHAPTERS[nextIdx];
        if (nextChapter) {
          registerEncounters([nextChapter.bossCharacterId]);
        }
      }
    }

    setCurrentBattle(null);
    setScreen('world');
    triggerSave();
  };

  // Handle Wipeout in Battle ("死んだら宿で復活だよ")
  const handleBattleWipeout = () => {
    // Revive at Inn using Domain Service
    const reviveResult = InnService.reviveAtInn(party);
    setInnMessage(reviveResult.message);
    setCurrentBattle(null);
    setScreen('inn');
    triggerSave();
  };

  // Reset / Clear Game State
  const handleResetGame = () => {
    SoundEngine.playCursor();
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    SaveService.clearSave();

    // Reset Tanjiro
    const tanjiro = catalog.find(c => c.name === '竈門炭治郎') || catalog[0];
    tanjiro.level = 1;
    tanjiro.exp = 0;
    tanjiro.stats.hp = tanjiro.stats.maxHp;
    tanjiro.stats.bp = tanjiro.stats.maxBp;

    // Reset party
    party.restoreFromData([tanjiro], [tanjiro.id], 500, []);

    // Recruit starting Nezuko
    const nezuko = catalog.find(c => c.name === '竈門禰豆子');
    if (nezuko) {
      nezuko.level = 1;
      nezuko.exp = 0;
      nezuko.stats.hp = nezuko.stats.maxHp;
      nezuko.stats.bp = nezuko.stats.maxBp;
      party.recruitMember(nezuko);
    }

    setCurrentChapterIndex(0);
    const initialSet = new Set<string>([tanjiro.id]);
    if (nezuko) initialSet.add(nezuko.id);
    setEncounteredIds(initialSet);
    setCurrentBattle(null);
    setRecruitmentEvent(null);
    setShowResetConfirm(false);
    setScreen('world');
    setRosterVersion(v => v + 1);

    // Persist brand new save data
    SaveService.saveGame(0, party, initialSet);
    setSaveStatus('saved');
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between font-['DotGothic16',monospace]">
      {/* Top Retro App Title Header */}
      <header className="border-b-2 border-slate-800 bg-[#070b14]/95 py-1.5 px-3 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <h1 className="font-bold text-amber-300 text-sm tracking-wide">
              <FuriganaText text="鬼滅[きめつ]の刃[やいば]クエスト 〜鬼[き]殺[さつ]隊[たい]列[れつ]伝[でん]〜" />
            </h1>
            <span className="hidden sm:inline text-[10px] text-slate-400">
              (全300種・雑魚鬼100体・指1本で快適プレイ)
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono">
            {/* Story Mode Quick Jump */}
            <button
              onClick={() => {
                SoundEngine.playConfirm();
                setScreen('story');
              }}
              className="px-2 py-0.5 rounded border border-purple-500 bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-bold flex items-center gap-1 transition-all touch-manipulation"
            >
              <BookOpen className="w-3 h-3 text-amber-300" />
              <span><FuriganaText text="物語[ものがたり]モード" /></span>
            </button>

            {/* Auto Save Status Indicator */}
            <div
              onClick={triggerSave}
              className={`cursor-pointer px-2 py-0.5 rounded border flex items-center gap-1 transition-all touch-manipulation ${
                saveStatus === 'saved'
                  ? 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
              title="クリックで手動セーブ（進行はローカルストレージに常時自動保存されます）"
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span><FuriganaText text="セーブ済[ずみ]" /></span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 text-slate-400" />
                  <span>セーブ</span>
                </>
              )}
            </div>

            {/* Prominent Reset Button ("最初からやり直しがどこにあるか分かりづらい。。") */}
            <button
              onClick={handleResetGame}
              className="px-2 py-0.5 rounded border border-rose-500/90 bg-rose-950/80 hover:bg-rose-900 active:bg-rose-950 text-rose-200 font-bold flex items-center gap-1 transition-all shadow-sm touch-manipulation"
              title="セーブデータを消去して第1章から最初からやり直す"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span><FuriganaText text="最初[さいしょ]からやり直[なお]す" /></span>
            </button>

            <span className="text-slate-400">
              討伐: <span className="text-amber-300 font-bold">第{currentChapterIndex + 1}章/全8章</span>
            </span>
            <span className="text-yellow-400 font-bold">
              {party.money} 銭
            </span>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-center py-2 px-1 sm:px-2">
        {/* 1. BATTLE SCREEN */}
        {screen === 'battle' && currentBattle && (
          <BattleScreen
            party={party}
            enemy={currentBattle.enemy}
            isBoss={currentBattle.isBoss}
            onVictory={handleBattleVictory}
            onEscape={() => {
              setCurrentBattle(null);
              setScreen('world');
            }}
            onWipeout={handleBattleWipeout}
          />
        )}

        {/* 2. WORLD MAP SCREEN */}
        {screen === 'world' && (
          <WorldMapScreen
            party={party}
            catalog={catalog}
            currentChapterIndex={currentChapterIndex}
            onStartBossBattle={handleStartBossBattle}
            onStartRandomBattle={handleStartRandomBattle}
            onGoToInn={() => {
              setInnMessage(undefined);
              setScreen('inn');
            }}
            onOpenZukan={() => setScreen('zukan')}
            onOpenStoryMode={() => setScreen('story')}
            onResetGame={handleResetGame}
          />
        )}

        {/* 3. STORY MODE SCREEN ("ストーリーモード追加・選択肢で誰が仲間になるかバラバラ") */}
        {screen === 'story' && (
          <StoryModeScreen
            party={party}
            catalog={catalog}
            currentChapterIndex={currentChapterIndex}
            onSelectStoryRecruit={handleSelectStoryRecruit}
            onStartStoryBoss={handleStartBossBattle}
            onBack={() => setScreen('world')}
          />
        )}

        {/* 4. INN SCREEN ("死んだら宿で復活だよ") */}
        {screen === 'inn' && (
          <InnScreen
            party={party}
            catalog={catalog}
            initialMessage={innMessage}
            onEncounter={registerEncounters}
            onBackToWorld={() => {
              setRosterVersion(v => v + 1);
              triggerSave();
              setScreen('world');
            }}
          />
        )}

        {/* 5. 300-CHARACTER ZUKAN SCREEN (Unencountered hidden) */}
        {screen === 'zukan' && (
          <ZukanScreen
            catalog={catalog}
            partyRosterIds={partyRosterIds}
            encounteredIds={encounteredIds}
            onBack={() => setScreen('world')}
          />
        )}

        {/* 6. ENDING SCREEN (Muzan Defeated) */}
        {screen === 'ending' && (
          <div className="max-w-2xl mx-auto p-4 flex flex-col items-center gap-4 text-center">
            <DqFrame variant="gold" className="p-6 flex flex-col items-center">
              <Award className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
              <h2 className="text-xl font-bold text-amber-300 mb-2">
                【千年の悲願達成・夜明けの凱歌】
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                鬼の始祖・鬼舞辻無惨の肉体は朝日を浴びて完全に消滅した。
                <br />
                竈門炭治郎、禰豆子、我妻善逸、嘴平伊之助、そして鬼殺隊の柱たち全員の魂が繋いだ勝利。
                <br />
                鬼のいない平和な世界が、ここに訪れました。
              </p>

              <div className="flex flex-wrap justify-center gap-2 my-4">
                {party.activeMembers.map(m => (
                  <div key={m.id} className="flex flex-col items-center">
                    <PixelSprite character={m} size={72} />
                    <span className="text-xs font-bold text-amber-200 mt-1">{m.name}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-xs text-slate-300 mb-4 font-mono">
                <div>総討伐章: 全8章クリア</div>
                <div>仲間にした鬼殺隊士: {party.roster.length} 名</div>
                <div>図鑑遭遇率: {encounteredIds.size} / 300 体</div>
                <div>セーブデータ: ローカルストレージに安全に保管中</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    SoundEngine.playConfirm();
                    setScreen('zukan');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-xs font-bold border border-indigo-400"
                >
                  300種大図鑑を見る
                </button>

                <button
                  onClick={() => {
                    SoundEngine.playConfirm();
                    setScreen('world');
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white text-xs font-bold border border-amber-400"
                >
                  修業の旅を続ける
                </button>
              </div>
            </DqFrame>
          </div>
        )}
      </main>

      {/* 3-Question Recruitment Trial Modal ("カンタンに仲間呼び出しできすぎるので、3問選択肢だしてすべて一致したときだけ仲間になるように調整して。") */}
      {activeTrial && (
        <RecruitmentTrialModal
          isOpen={!!activeTrial}
          character={activeTrial.character}
          bonusCharacters={activeTrial.bonusCharacters}
          onClose={() => setActiveTrial(null)}
          onSuccessRecruit={handleSuccessTrial}
        />
      )}

      {/* Prominent Recruitment Celebration Modal ("仲間になるときが分かりづらい。目立つようにして。") */}
      <RecruitmentCelebrationModal
        event={recruitmentEvent}
        activeParty={party.activeMembers}
        onConfirm={handleConfirmRecruitment}
        onSendToInn={handleSendRecruitToInn}
      />

      {/* Prominent Reset Game Confirmation Modal ("最初からやり直しがどこにあるか分かりづらい。。") */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirmReset={handleConfirmReset}
      />
    </div>
  );
}
