/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { generateCharacterCatalog, isHashiraCharacter } from './domain/services/CharacterCatalog.ts';
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
import { PartyFormationModal } from './components/PartyFormationModal.tsx';
import { HashiraTrainingModal } from './components/HashiraTrainingModal.tsx';
import { ZukanNotificationModal } from './components/ZukanNotificationModal.tsx';
import { EndingScreen } from './components/EndingScreen.tsx';
import { ClearProgressModal } from './components/ClearProgressModal.tsx';
import { TwelveKizukiService, HiddenKizukiEncounter } from './domain/services/TwelveKizukiService.ts';
import { EnemyGroupService } from './domain/services/EnemyGroupService.ts';
import { DqFrame } from './components/DqFrame.tsx';
import { FuriganaText } from './components/Ruby.tsx';
import { PixelSprite } from './infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from './infrastructure/audio/RetroSound.ts';
import { BgmEngine, BgmTrackId, TRACKS } from './infrastructure/audio/RetroBGM.ts';
import { Sparkles, Award, RefreshCw, Flame, Save, RotateCcw, Check, BookOpen, Music, Volume2, VolumeX, Users, ShieldCheck } from 'lucide-react';

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

  // Playthrough count & Clear milestones ("最終ステージクリアしたらいったんクリアにしてね。全ての仲間集めと上弦の鬼全種類倒したら完全クリアだよ。ストーリーで出て来ない12鬼月は2周目の各ステージに隠れているよ")
  const [playthroughCount, setPlaythroughCount] = useState<number>(() => {
    return savedData?.playthroughCount ?? 1;
  });
  const [hasClearedNormal, setHasClearedNormal] = useState<boolean>(() => {
    return savedData?.hasClearedNormal ?? false;
  });
  const [hasClearedTrue, setHasClearedTrue] = useState<boolean>(() => {
    return savedData?.hasClearedTrue ?? false;
  });
  const [defeatedDemonIds, setDefeatedDemonIds] = useState<Set<string>>(() => {
    return new Set(savedData?.defeatedDemonIds ?? []);
  });
  const [isClearProgressModalOpen, setIsClearProgressModalOpen] = useState<boolean>(false);

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
    enemies?: Character[];
    isBoss: boolean;
    chapter?: StoryChapter;
  } | null>(null);

  const [innMessage, setInnMessage] = useState<string | undefined>();
  const [rosterVersion, setRosterVersion] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [recruitmentEvent, setRecruitmentEvent] = useState<RecruitmentEvent | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isFormationModalOpen, setIsFormationModalOpen] = useState<boolean>(false);
  const [zukanNotificationCharacters, setZukanNotificationCharacters] = useState<Character[]>([]);
  const [activeTrial, setActiveTrial] = useState<{
    character: Character;
    bonusCharacters: Character[];
    choice: StoryChoice;
  } | null>(null);
  const [hashiraTrainingCandidate, setHashiraTrainingCandidate] = useState<{
    hashira: Character;
    bonusCharacters: Character[];
    choice: StoryChoice;
  } | null>(null);

  // Beginner Mode / 初心者お助けモード (Top screen control, persisted in localStorage)
  const [isEasyAssist, setIsEasyAssist] = useState<boolean>(() => {
    return localStorage.getItem('kimetsu_easy_assist') !== 'false';
  });

  const toggleEasyAssist = () => {
    SoundEngine.playConfirm();
    setIsEasyAssist(prev => {
      const next = !prev;
      localStorage.setItem('kimetsu_easy_assist', String(next));
      return next;
    });
  };

  // BGM playback state
  const [bgmTrack, setBgmTrack] = useState<BgmTrackId>('gurenge');
  const [isBgmStarted, setIsBgmStarted] = useState<boolean>(false);

  // Automatically start BGM on first user interaction (pointer/click/key)
  const handleStartBgmIfFirstTime = useCallback(() => {
    if (!isBgmStarted) {
      setIsBgmStarted(true);
      const initialTrack = screen === 'inn' ? 'homura' : (screen === 'battle' && currentBattle?.isBoss ? 'zankyou' : 'gurenge');
      setBgmTrack(initialTrack);
      BgmEngine.play(initialTrack);
    }
  }, [isBgmStarted, screen, currentBattle?.isBoss]);

  useEffect(() => {
    const startAudioOnGesture = () => {
      handleStartBgmIfFirstTime();
    };
    window.addEventListener('pointerdown', startAudioOnGesture, { once: true });
    window.addEventListener('keydown', startAudioOnGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startAudioOnGesture);
      window.removeEventListener('keydown', startAudioOnGesture);
    };
  }, [handleStartBgmIfFirstTime]);

  // Synchronize BGM according to current screen/scene
  useEffect(() => {
    if (!isBgmStarted) return;
    if (bgmTrack === 'none') {
      BgmEngine.stop();
      return;
    }

    let targetTrack: BgmTrackId = 'gurenge';
    if (screen === 'inn') {
      targetTrack = 'homura'; // 藤の家紋の宿: バラード「炎」
    } else if (screen === 'battle') {
      targetTrack = currentBattle?.isBoss ? 'zankyou' : 'gurenge'; // ボス戦:「残響散歌」 / 通常戦:「紅蓮華」
    } else {
      targetTrack = 'gurenge'; // フィールド・ストーリー・図鑑:「紅蓮華」
    }

    setBgmTrack(targetTrack);
    BgmEngine.play(targetTrack);
  }, [screen, currentBattle?.isBoss, isBgmStarted]);

  const handleCycleBgm = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundEngine.playConfirm();
    if (!isBgmStarted) {
      setIsBgmStarted(true);
      setBgmTrack('gurenge');
      BgmEngine.play('gurenge');
      return;
    }
    const next = BgmEngine.nextTrack();
    setBgmTrack(next);
  };

  // Helper to register new characters as encountered
  const registerEncounters = useCallback((ids: string[], options?: { notify?: boolean }) => {
    const shouldNotify = options?.notify ?? true;
    setEncounteredIds(prev => {
      let changed = false;
      const newlyAddedChars: Character[] = [];
      const next = new Set(prev);
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
          const found = catalog.find(c => c.id === id);
          if (found) {
            newlyAddedChars.push(found);
          }
        }
      }

      if (shouldNotify && newlyAddedChars.length > 0) {
        setZukanNotificationCharacters(prevList => [...prevList, ...newlyAddedChars]);
      }

      return changed ? next : prev;
    });
  }, [catalog]);

  // Save current game state to localStorage
  const triggerSave = useCallback(() => {
    SaveService.saveGame(currentChapterIndex, party, encounteredIds, {
      playthroughCount,
      hasClearedNormal,
      hasClearedTrue,
      defeatedDemonIds: Array.from(defeatedDemonIds)
    });
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, [currentChapterIndex, party, encounteredIds, playthroughCount, hasClearedNormal, hasClearedTrue, defeatedDemonIds]);

  // Auto-save whenever key progression or encounter state changes
  useEffect(() => {
    // Also ensure all party members in roster are marked as encountered
    const rosterIds = party.roster.map(m => m.id);
    registerEncounters(rosterIds);
    SaveService.saveGame(currentChapterIndex, party, encounteredIds, {
      playthroughCount,
      hasClearedNormal,
      hasClearedTrue,
      defeatedDemonIds: Array.from(defeatedDemonIds)
    });
  }, [currentChapterIndex, rosterVersion, encounteredIds, registerEncounters, party, playthroughCount, hasClearedNormal, hasClearedTrue, defeatedDemonIds]);

  // Set of unlocked/recruited character IDs for Zukan
  const partyRosterIds = useMemo(() => {
    return new Set(party.roster.map(m => m.id));
  }, [party.roster, rosterVersion]);

  // Handle Story Mode Choice Selection ("カンタンに仲間呼び出しできすぎるので、3問選択肢だしてすべて一致したときだけ仲間になるように調整して。")
  // And "柱を仲間にするのは柱稽古しないと無理だよね。タイミングミニゲームをクリアしたら仲間になるよ"
  // "柱のときは3問のクイズの代わりにタイミングミニゲームにしてよ。あと勝手にステージクリアで仲間にならないようにして。クイズかミニゲームかどちらかクリアで仲間だよ"
  const handleSelectStoryRecruit = (choice: StoryChoice, _chapter: StoryChapter) => {
    const recruitChar = catalog.find(c => c.id === choice.recruitCharacterId);
    if (!recruitChar) return;

    // Collect bonus characters
    const bonusChars: Character[] = [];
    if (choice.bonusCharacterIds) {
      for (const bId of choice.bonusCharacterIds) {
        const bChar = catalog.find(c => c.id === bId);
        if (bChar) bonusChars.push(bChar);
      }
    }

    // Check if the primary recruit OR any bonus character is a Hashira
    const hashira = isHashiraCharacter(recruitChar)
      ? recruitChar
      : bonusChars.find(c => isHashiraCharacter(c));

    if (hashira) {
      // It is a Hashira! ALWAYS trigger the Hashira Training timing mini-game!
      SoundEngine.playConfirm();
      const allRecruits = [recruitChar, ...bonusChars];
      const otherBonuses = allRecruits.filter(c => c.id !== hashira.id);

      setHashiraTrainingCandidate({
        hashira,
        bonusCharacters: otherBonuses,
        choice
      });
      return;
    }

    // Regular recruit (non-Hashira): Open the 3-question recruitment trial modal
    setActiveTrial({
      character: recruitChar,
      bonusCharacters: bonusChars,
      choice
    });
  };

  // Called when Hashira Training timing mini-game succeeds from story mode
  const handleSuccessStoryHashiraTraining = (hashira: Character, bonusCharacters?: Character[]) => {
    if (!party.hasMember(hashira.id)) {
      party.recruitMember(hashira);
    }
    const recruitedIds = [hashira.id];

    if (bonusCharacters) {
      for (const b of bonusCharacters) {
        if (!party.hasMember(b.id)) {
          party.recruitMember(b);
        }
        recruitedIds.push(b.id);
      }
    }

    registerEncounters(recruitedIds);
    setRosterVersion(v => v + 1);
    const prevChoice = hashiraTrainingCandidate?.choice;
    setHashiraTrainingCandidate(null);

    // Trigger prominent celebration modal
    setRecruitmentEvent({
      mainCharacter: hashira,
      bonusCharacters: bonusCharacters || [],
      dialogue: prevChoice?.resultDialogue || [
        `${hashira.name}「見事だ炭治郎！柱稽古の厳しい試練をよくぞ突破した！」`,
        `${hashira.name}「お前と共に、鬼舞辻無惨の首を断つまで戦い抜こう！」`
      ]
    });

    triggerSave();
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
    const enemies = EnemyGroupService.resolveEnemies(boss, catalog);

    // Register boss and all group members as encountered
    registerEncounters([boss.id, ...enemies.map(e => e.id)]);

    setCurrentBattle({
      enemy: { ...boss },
      enemies,
      isBoss: true,
      chapter
    });
    setScreen('battle');
  };

  // Handle Starting a Wild Demon Encounter (supports 1 to 4 enemies, Swamp demon is 3 bodies)
  const handleStartRandomBattle = (enemy: Character, specificEnemies?: Character[]) => {
    const enemies = specificEnemies && specificEnemies.length > 0
      ? specificEnemies
      : EnemyGroupService.resolveEnemies(enemy, catalog);

    // Register wild enemies as encountered
    registerEncounters([enemy.id, ...enemies.map(e => e.id)]);

    setCurrentBattle({
      enemy: { ...enemy },
      enemies,
      isBoss: false
    });
    setScreen('battle');
  };

  // Handle Starting a 2nd Playthrough Hidden Twelve Kizuki Battle ("ストーリーで出て来ない12鬼月は2周目の各ステージに隠れているよ")
  const handleStartHiddenKizukiBattle = (encounter: HiddenKizukiEncounter) => {
    SoundEngine.playConfirm();
    let enemy = catalog.find(c => c.id === encounter.demonId);
    if (!enemy) {
      enemy = catalog.find(c => c.name.includes(encounter.bossName)) || catalog.find(c => c.id.startsWith('demon_'));
    }
    if (enemy) {
      const enemies = EnemyGroupService.resolveEnemies(enemy, catalog);
      registerEncounters([enemy.id, ...enemies.map(e => e.id)]);
      setCurrentBattle({
        enemy: { ...enemy },
        enemies,
        isBoss: true
      });
      setScreen('battle');
    }
  };

  // Handle Starting 2nd Playthrough ("2周目の各ステージに隠れているよ")
  const handleStartSecondPlaythrough = () => {
    SoundEngine.playConfirm();
    setPlaythroughCount(prev => Math.max(2, prev + 1));
    setCurrentChapterIndex(0); // Reset chapter index to 0 so all stages can be explored with hidden Kizuki
    setScreen('world');
    triggerSave();
  };

  // Handle Victory in Battle
  const handleBattleVictory = (
    expGained: number,
    moneyGained: number,
    leveledUp: { name: string; newLevel: number }[] = []
  ) => {
    // Track defeated demon IDs for Upper Moon and 12 Kizuki completion
    if (currentBattle) {
      const allDefeatedIds = new Set<string>();
      if (currentBattle.enemy) allDefeatedIds.add(currentBattle.enemy.id);
      if (currentBattle.enemies) {
        currentBattle.enemies.forEach(e => allDefeatedIds.add(e.id));
      }

      setDefeatedDemonIds(prev => {
        const next = new Set(prev);
        allDefeatedIds.forEach(id => next.add(id));
        if (allDefeatedIds.has('demon_daki_gyutaro') || allDefeatedIds.has('demon_daki') || allDefeatedIds.has('demon_gyutaro')) {
          next.add('demon_daki');
          next.add('demon_gyutaro');
        }
        if (allDefeatedIds.has('demon_gyokko_hantengu') || allDefeatedIds.has('demon_gyokko') || allDefeatedIds.has('demon_zohakuten')) {
          next.add('demon_gyokko');
          next.add('demon_zohakuten');
        }
        if (allDefeatedIds.has('demon_enmu_akaza') || allDefeatedIds.has('demon_enmu') || allDefeatedIds.has('demon_akaza')) {
          next.add('demon_enmu');
          next.add('demon_akaza');
        }
        if (allDefeatedIds.has('demon_muzan_final')) {
          next.add('demon_kokushibo');
        }
        return next;
      });
    }

    // Level-up Zukan unlock mechanic:
    // When characters reach level thresholds (e.g. Lv. 3, 5, 8, 10, 15, 20, etc.),
    // unlock corresponding demon or ally characters into the Zukan!
    if (leveledUp.length > 0) {
      const newlyDiscoveredIds: string[] = [];
      const highestNewLevel = Math.max(...leveledUp.map(l => l.newLevel));

      // Find locked demons or allies in catalog within the player's level range that haven't been encountered
      const eligibleUnlocks = catalog.filter(c => 
        !encounteredIds.has(c.id) &&
        c.level <= highestNewLevel &&
        c.id !== currentBattle?.enemy.id
      );

      // Take up to 2 unlocks per level-up event
      for (const candidate of eligibleUnlocks.slice(0, 2)) {
        newlyDiscoveredIds.push(candidate.id);
      }

      if (newlyDiscoveredIds.length > 0) {
        registerEncounters(newlyDiscoveredIds);
      }
    }

    if (currentBattle?.isBoss && currentBattle.chapter) {
      const finishedChapterNum = currentBattle.chapter.chapterNumber;

      // Note: As requested by user ("あと勝手にステージクリアで仲間にならないようにして。クイズかミニゲームかどちらかクリアで仲間だよ"),
      // characters are NOT automatically added to the party upon clearing a stage.
      // Instead, they are registered in the Zukan (encountered) and made available to recruit
      // via the 3-question quiz trial or Hashira timing mini-game in Story Mode or the Inn.
      const chapterRecruitIds = currentBattle.chapter.unlockedRecruits || [];
      if (chapterRecruitIds.length > 0) {
        registerEncounters(chapterRecruitIds);
      }

      setRosterVersion(v => v + 1);

      // Advance chapter & check clearing milestones
      // 1周目の第8章（無惨討伐）をクリアすると、第9番目の最終隠しステージ「鬼化・炭治郎」が解放されます！
      // 1周目の第9章（鬼化・炭治郎）をクリアしたところで「いったんクリア（通常クリア）」となります。
      if (finishedChapterNum >= 9) {
        setHasClearedNormal(true);
        const completeCheck = TwelveKizukiService.checkTrueCompleteClear(
          party.roster,
          catalog,
          new Set([...defeatedDemonIds, currentBattle.enemy.id])
        );
        if (completeCheck.isTrueComplete) {
          setHasClearedTrue(true);
        }
        setScreen('ending');
        triggerSave();
        return;
      } else {
        const nextIdx = Math.max(currentChapterIndex, finishedChapterNum);
        setCurrentChapterIndex(nextIdx);

        // Pre-encounter next chapter's boss (e.g. Chapter 9 demon_tanjiro when Chapter 8 is cleared)
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

          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono flex-wrap">
            {/* Quick Formation Swap Button */}
            <button
              onClick={() => {
                SoundEngine.playConfirm();
                setIsFormationModalOpen(true);
              }}
              disabled={screen === 'battle'}
              className={`px-2 py-0.5 rounded border font-bold flex items-center gap-1 transition-all touch-manipulation ${
                screen === 'battle'
                  ? 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
                  : 'border-cyan-400 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-200 shadow-sm'
              }`}
              title="前線隊士の入れ替え・好きな隊士の特別招集"
            >
              <Users className="w-3 h-3 text-cyan-300" />
              <span><FuriganaText text="部隊[ぶたい]編成[へんせい]" /></span>
            </button>

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

            {/* Beginner Mode Toggle (Top Screen Header) */}
            <button
              onClick={toggleEasyAssist}
              className={`px-2.5 py-0.5 rounded border font-bold flex items-center gap-1.5 transition-all touch-manipulation ${
                isEasyAssist
                  ? 'border-emerald-400 bg-emerald-950/90 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
              title="初心者モード：被ダメージ40%軽減、毎ターン自動HP・BP回復、呼吸わざ強化"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isEasyAssist ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>
                <FuriganaText text={isEasyAssist ? '🔰初心者[しょしんしゃ]モード:ON' : '初心者[しょしんしゃ]モード:OFF'} />
              </span>
            </button>

            {/* Demon Slayer Retro BGM Toggle */}
            <button
              onClick={handleCycleBgm}
              className={`px-2 py-0.5 rounded border font-bold flex items-center gap-1 transition-all touch-manipulation ${
                bgmTrack === 'none'
                  ? 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                  : 'border-amber-400 bg-amber-950/90 text-amber-200 shadow-sm animate-pulse'
              }`}
              title="クリックで鬼滅の刃BGM切り替え（紅蓮華・炎・残響散歌・消音）"
            >
              {bgmTrack === 'none' ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Music className="w-3.5 h-3.5 text-yellow-400" />
              )}
              <span>
                {bgmTrack === 'gurenge' && '♪ 紅蓮華'}
                {bgmTrack === 'homura' && '♪ 炎(ほむら)'}
                {bgmTrack === 'zankyou' && '♪ 残響散歌'}
                {bgmTrack === 'none' && 'BGM切'}
              </span>
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
              討伐: <span className="text-amber-300 font-bold">
                {currentChapterIndex >= 8 ? '★最終隠し第9章（鬼の王）' : `第${currentChapterIndex + 1}章/全8章`}
              </span>
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
            enemies={currentBattle.enemies}
            isBoss={currentBattle.isBoss}
            isEasyAssist={isEasyAssist}
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
            playthroughCount={playthroughCount}
            defeatedDemonIds={defeatedDemonIds}
            onStartBossBattle={handleStartBossBattle}
            onStartRandomBattle={handleStartRandomBattle}
            onStartHiddenKizukiBattle={handleStartHiddenKizukiBattle}
            onGoToInn={() => {
              setInnMessage(undefined);
              setScreen('inn');
            }}
            onOpenZukan={() => setScreen('zukan')}
            onOpenStoryMode={() => setScreen('story')}
            onOpenClearProgress={() => setIsClearProgressModalOpen(true)}
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

        {/* 6. ENDING SCREEN (Normal Clear & True Complete Clear) */}
        {screen === 'ending' && (
          <EndingScreen
            party={party}
            catalog={catalog}
            encounteredIds={encounteredIds}
            defeatedDemonIds={defeatedDemonIds}
            playthroughCount={playthroughCount}
            onOpenZukan={() => setScreen('zukan')}
            onContinueJourney={() => setScreen('world')}
            onStartSecondPlaythrough={handleStartSecondPlaythrough}
          />
        )}
      </main>

      {/* Clear Progress Modal ("全ての仲間集めと上弦の鬼全種類倒したら完全クリアだよ") */}
      {isClearProgressModalOpen && (
        <ClearProgressModal
          roster={party.roster}
          catalog={catalog}
          defeatedDemonIds={defeatedDemonIds}
          playthroughCount={playthroughCount}
          hasClearedNormal={hasClearedNormal}
          onClose={() => setIsClearProgressModalOpen(false)}
        />
      )}

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

      {/* Flexible Party Formation Modal ("仲間の入れ替えが難しい。。好きな人と入れ替えられるようにして。") */}
      <PartyFormationModal
        party={party}
        catalog={catalog}
        isOpen={isFormationModalOpen}
        onClose={() => setIsFormationModalOpen(false)}
        onFormationChanged={() => {
          setRosterVersion(v => v + 1);
          triggerSave();
        }}
        onEncounter={registerEncounters}
      />

      {/* Hashira Training Timing Mini-Game Modal for Story Mode Recruitment */}
      {hashiraTrainingCandidate && (
        <HashiraTrainingModal
          hashira={hashiraTrainingCandidate.hashira}
          bonusCharacters={hashiraTrainingCandidate.bonusCharacters}
          isOpen={!!hashiraTrainingCandidate}
          onClose={() => setHashiraTrainingCandidate(null)}
          onSuccessRecruit={handleSuccessStoryHashiraTraining}
        />
      )}

      {/* Zukan Registration Modal ("図鑑に追加も分かりづらいので都度表示して") */}
      {zukanNotificationCharacters.length > 0 && (
        <ZukanNotificationModal
          characters={zukanNotificationCharacters}
          onClose={() => setZukanNotificationCharacters([])}
          onOpenZukan={() => {
            setZukanNotificationCharacters([]);
            setScreen('zukan');
          }}
        />
      )}
    </div>
  );
}
