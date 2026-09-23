/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoryChapter, Character } from '../domain/models/types.ts';
import { STORY_CHAPTERS } from '../domain/services/StoryData.ts';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { TwelveKizukiService, HiddenKizukiEncounter } from '../domain/services/TwelveKizukiService.ts';
import { EnemyGroupService } from '../domain/services/EnemyGroupService.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { MapPin, Swords, Bed, BookOpen, ShieldAlert, Award, RotateCcw, Sparkles, Skull, CheckCircle2, UserPlus } from 'lucide-react';

interface WorldMapScreenProps {
  party: PartyAggregate;
  catalog: Character[];
  currentChapterIndex: number;
  playthroughCount: number;
  hasClearedNormal?: boolean;
  defeatedDemonIds: Set<string>;
  onStartBossBattle: (chapter: StoryChapter) => void;
  onStartRandomBattle: (enemy: Character, enemies?: Character[]) => void;
  onStartHiddenKizukiBattle: (encounter: HiddenKizukiEncounter) => void;
  onStartSecondPlaythrough?: () => void;
  onGoToInn: () => void;
  onOpenZukan: () => void;
  onOpenStoryMode: () => void;
  onOpenClearProgress: () => void;
  onResetGame?: () => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  party,
  catalog,
  currentChapterIndex,
  playthroughCount,
  hasClearedNormal = false,
  defeatedDemonIds,
  onStartBossBattle,
  onStartRandomBattle,
  onStartHiddenKizukiBattle,
  onStartSecondPlaythrough,
  onGoToInn,
  onOpenZukan,
  onOpenStoryMode,
  onOpenClearProgress,
  onResetGame
}) => {
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(currentChapterIndex);
  const chapter = STORY_CHAPTERS[selectedChapterIdx] || STORY_CHAPTERS[0];

  // 2周目は1周目クリアしないと闘えない
  const isSecondPlaythroughUnlocked = Boolean(hasClearedNormal);
  const isSecondPlaythroughActive = isSecondPlaythroughUnlocked && playthroughCount >= 2;

  // Check hidden Kizuki for selected chapter
  const hiddenKizuki = TwelveKizukiService.getHiddenKizukiForChapter(chapter.chapterNumber);
  const isHiddenKizukiDefeated = hiddenKizuki ? defeatedDemonIds.has(hiddenKizuki.demonId) : false;

  // Party's current average level (or active leader level)
  const activeMembers = party.activeMembers.length > 0 ? party.activeMembers : party.roster;
  const partyCurrentLevel = activeMembers.length > 0
    ? Math.max(1, Math.round(activeMembers.reduce((sum, m) => sum + m.level, 0) / activeMembers.length))
    : 1;

  // 4 progressive stages dynamically scaled around party's current level:
  // 段階1: 少し弱い (安心修業) - パーティLvより少し弱い野良鬼
  const tier1Level = Math.max(1, partyCurrentLevel <= 3 ? 1 : partyCurrentLevel - 3);
  // 段階2: 同格・適正 (標準修業) - パーティLvと同等の野良鬼
  const tier2Level = Math.max(1, partyCurrentLevel <= 1 ? 2 : partyCurrentLevel);
  // 段階3: 少し強い (挑戦修業) - パーティLvより少し強い野良鬼
  const tier3Level = partyCurrentLevel <= 1 ? 3 : partyCurrentLevel + 2;
  // 段階4: 強い・猛特訓 (集中猛特訓) - パーティLvより強い野良鬼（大量経験値）
  const tier4Level = partyCurrentLevel <= 1 ? 5 : partyCurrentLevel + 4;

  // Helper to start training / wild demon encounter with 1 to 4 mob demons (bosses strictly excluded)
  const triggerTrainingEncounter = (tier: 1 | 2 | 3 | 4) => {
    SoundEngine.playConfirm();

    let targetLevel: number;
    if (tier === 1) targetLevel = tier1Level;
    else if (tier === 2) targetLevel = tier2Level;
    else if (tier === 3) targetLevel = tier3Level;
    else targetLevel = tier4Level;

    // Generates 1 to 4 wild mob demons strictly excluding bosses, scaled to chosen level
    const group = EnemyGroupService.createTrainingMobGroup(catalog, targetLevel);
    const mainEnemy = group[0] || catalog.find(c => EnemyGroupService.isMobDemon(c)) || catalog[0];
    onStartRandomBattle(mainEnemy, group);
  };

  const isUnlocked = selectedChapterIdx <= currentChapterIndex;
  const isCompleted = selectedChapterIdx < currentChapterIndex;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 p-2 select-none">
      {/* Top Header: Party summary & Quick navigation */}
      <DqFrame className="p-2.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-300">
              <FuriganaText text="鬼[き]殺[さつ]隊[たい] 本[ほん]陣[じん]" />
            </span>
            <span className="text-xs text-slate-300">
              <FuriganaText text={`前線[ぜんせん]: ${party.activeMembers.map(m => m.name).join(', ')}`} />
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {isSecondPlaythroughActive && (
              <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-500 rounded text-xs font-bold flex items-center gap-1 shadow animate-pulse whitespace-nowrap shrink-0">
                <Skull className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>第{playthroughCount}周目（隠れ鬼出現中）</span>
              </span>
            )}

            <button
              onClick={() => {
                SoundEngine.playConfirm();
                onOpenClearProgress();
              }}
              className="px-3 py-2 bg-amber-700 hover:bg-amber-600 rounded text-white text-xs font-bold flex items-center gap-1.5 border border-amber-300 shadow touch-manipulation animate-pulse whitespace-nowrap shrink-0"
            >
              <Award className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span><FuriganaText text="完全[かんぜん]クリア進捗[しんちょく]" /></span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playConfirm();
                onOpenStoryMode();
              }}
              className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 rounded text-white text-xs font-bold flex items-center gap-1.5 border border-cyan-400 shadow touch-manipulation whitespace-nowrap shrink-0"
              title="各章の柱稽古やクイズ試練で仲間を勧誘する"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
              <span><FuriganaText text="勧誘[かんゆう]モード" /></span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playConfirm();
                onGoToInn();
              }}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white text-xs font-bold flex items-center gap-1.5 border border-amber-400 shadow touch-manipulation whitespace-nowrap shrink-0"
            >
              <Bed className="w-3.5 h-3.5 shrink-0" />
              <span><FuriganaText text="藤[ふじ]の家[か]紋[もん]の宿[やど]" /></span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playConfirm();
                onOpenZukan();
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-xs font-bold flex items-center gap-1.5 border border-indigo-400 shadow touch-manipulation whitespace-nowrap shrink-0"
            >
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span><FuriganaText text="300種[しゅ]大[だい]図鑑[ずかん]" /></span>
            </button>
          </div>
        </div>
      </DqFrame>

      {/* Main Chapter Progression Bar */}
      <DqFrame 
        title={currentChapterIndex >= 8 ? "討伐モード進行（全8章＋最終隠しステージ出現！）" : "討伐モード進行（全8章の鬼討伐）"} 
        className="p-3"
      >
        <div className={`grid gap-1.5 text-center text-xs ${
          currentChapterIndex >= 8 
            ? 'grid-cols-3 sm:grid-cols-5 md:grid-cols-9' 
            : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-8'
        }`}>
          {STORY_CHAPTERS.filter((ch) => {
            // Chapter 9 (hidden stage) is ONLY displayed if Chapter 8 is cleared (currentChapterIndex >= 8)
            if (ch.chapterNumber === 9) {
              return currentChapterIndex >= 8;
            }
            return true;
          }).map((ch, idx) => {
            // Note: ch.chapterNumber - 1 corresponds to original index
            const origIdx = ch.chapterNumber - 1;
            const unlocked = origIdx <= currentChapterIndex;
            const completed = origIdx < currentChapterIndex;
            const isCurrent = origIdx === currentChapterIndex;
            const isSelected = origIdx === selectedChapterIdx;
            const isSecret = ch.chapterNumber === 9;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  SoundEngine.playCursor();
                  setSelectedChapterIdx(origIdx);
                }}
                className={`p-2 rounded border flex flex-col items-center justify-between min-h-[76px] transition-all touch-manipulation ${
                  isSelected
                    ? isSecret ? 'ring-2 ring-rose-400 border-rose-300 bg-rose-950/80 shadow-md' : 'ring-2 ring-amber-400 border-amber-300 bg-slate-800'
                    : isSecret ? 'border-rose-700 bg-rose-950/40 hover:bg-rose-900/60' : 'border-slate-700 bg-slate-900/80'
                } ${!unlocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-slate-800'}`}
              >
                <div className={`text-[10px] font-bold ${isSecret ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                  {isSecret ? '★隠し第9章' : `第${ch.chapterNumber}章`}
                </div>
                <div className={`font-bold text-[11px] truncate w-full ${isSecret ? 'text-rose-200' : 'text-amber-200'}`}>
                  {ch.locationName.split('（')[0]}
                </div>
                <div>
                  {completed ? (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600/80 rounded text-white font-bold">討伐済</span>
                  ) : isCurrent ? (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded text-white font-bold animate-pulse ${isSecret ? 'bg-rose-600 ring-1 ring-rose-300' : 'bg-rose-600'}`}>
                      進行中
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500">未解放</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DqFrame>

      {/* Chapter Details & Deployment Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Chapter Overview & Dialogue */}
        <DqFrame
          title={`${chapter.title}`}
          variant={chapter.chapterNumber === 8 ? 'danger' : 'gold'}
          className="md:col-span-2 p-3 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                <FuriganaText text={`舞台[ぶたい]: ${chapter.locationName}`} />
              </span>
              <span className="text-slate-400">/ 推奨Lv: {chapter.recommendedLevel}</span>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed mb-3">
              <FuriganaText text={chapter.description} />
            </div>

            {/* Canon Intro Dialogue */}
            <div className="bg-slate-900/90 border border-slate-700 rounded p-2 text-xs flex flex-col gap-1 text-slate-300 mb-3">
              {chapter.introDialogues.map((dlg, i) => (
                <div key={i} className="leading-snug">
                  <FuriganaText text={dlg} />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons for this Chapter */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  SoundEngine.playConfirm();
                  onOpenStoryMode();
                }}
                className="py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 hover:from-cyan-600 hover:to-indigo-600 active:scale-[0.99] text-white border-2 border-cyan-300 shadow-md transition-all touch-manipulation min-h-[46px]"
                title="各章の柱稽古やクイズ試練で仲間を勧誘する"
              >
                <UserPlus className="w-4 h-4 text-cyan-200 shrink-0" />
                <div className="flex items-center gap-1.5 truncate">
                  <span><FuriganaText text="勧[かん]誘[ゆう]モード" /></span>
                  <span className="text-[10px] bg-cyan-950/80 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-400/60 font-normal shrink-0">
                    仲間集め
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  if (isUnlocked) {
                    SoundEngine.playConfirm();
                    onStartBossBattle(chapter);
                  } else {
                    SoundEngine.playCancel();
                  }
                }}
                disabled={!isUnlocked}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all touch-manipulation active:scale-[0.99] min-h-[46px] ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white border-red-400 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-300" />
                <span className="truncate">
                  {chapter.chapterNumber === 8 ? (
                    <FuriganaText text="最終[さいしゅう]決戦[けっせん]！鬼舞辻[きぶつじ]無惨[むざん]に挑[いど]む" />
                  ) : chapter.chapterNumber === 9 ? (
                    <FuriganaText text="最終[さいしゅう]隠[かく]し決戦[けっせん]！鬼化[おにか]炭治郎[たんじろう]に挑[いど]む" />
                  ) : (
                    <FuriganaText text={`討[とう]伐[ばつ]任務[にんむ]: ${chapter.bossName} に挑[いど]む`} />
                  )}
                </span>
              </button>
            </div>

            {/* 2nd Playthrough Hidden Twelve Kizuki Encounter ("2周目は1周目クリアしないと闘えない") */}
            {hiddenKizuki && (
              <div className={`rounded-lg p-3 border flex flex-col gap-2 shadow-md ${
                isSecondPlaythroughActive
                  ? isHiddenKizukiDefeated
                    ? 'bg-emerald-950/40 border-emerald-500/70'
                    : 'bg-purple-950/80 border-purple-500 ring-1 ring-purple-400/50 animate-pulse'
                  : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Skull className={`w-4 h-4 ${isSecondPlaythroughActive ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span>
                      <FuriganaText text={isSecondPlaythroughActive ? "【2周[しゅう]目[め]限定[げんてい]・隠[かく]れ十二[じゅうに]鬼[き]月[づき]の気配[けはい]！】" : "【2周[しゅう]目[め]限定[げんてい]・隠[かく]れ十二[じゅうに]鬼[き]月[づき]】"} />
                    </span>
                  </span>

                  {isSecondPlaythroughActive ? (
                    isHiddenKizukiDefeated ? (
                      <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>討伐済</span>
                      </span>
                    ) : (
                      <span className="text-[10px] bg-rose-700 text-white px-2 py-0.5 rounded font-bold animate-pulse">
                        潜伏中 ⚠️
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-amber-300 border border-slate-700 px-2 py-0.5 rounded font-bold">
                      {isSecondPlaythroughUnlocked ? '🎉 1周目クリア済（2周目へ）' : '🔒 1周目クリアで解放'}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-200">
                  <div className="font-bold text-amber-200 text-xs sm:text-sm">
                    {hiddenKizuki.bossName}{' '}
                    <span className="text-xs text-purple-300 font-normal">
                      ({hiddenKizuki.rankTitle} / 推奨Lv.{hiddenKizuki.recommendedLevel})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    <FuriganaText text={`隠[かく]れ場所[ばしょ]: ${hiddenKizuki.hiddenSpotName}`} />
                  </div>
                  <div className="text-[10px] text-purple-200/90 italic mt-0.5 bg-slate-900/60 p-1.5 rounded border border-purple-900/50">
                    「{hiddenKizuki.hint}」
                  </div>
                </div>

                {isSecondPlaythroughActive ? (
                  <button
                    onClick={() => {
                      SoundEngine.playConfirm();
                      onStartHiddenKizukiBattle(hiddenKizuki);
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-rose-700 hover:from-purple-600 hover:to-rose-600 rounded text-xs font-bold text-white border border-purple-300 flex items-center justify-center gap-2 shadow-md touch-manipulation active:scale-98"
                  >
                    <Swords className="w-4 h-4 text-yellow-300" />
                    <span>
                      {isHiddenKizukiDefeated
                        ? `${hiddenKizuki.bossName} に再挑戦する`
                        : `隠れ十二鬼月: ${hiddenKizuki.bossName} に挑む！`}
                    </span>
                  </button>
                ) : isSecondPlaythroughUnlocked ? (
                  <button
                    onClick={() => {
                      SoundEngine.playConfirm();
                      if (onStartSecondPlaythrough) onStartSecondPlaythrough();
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded text-xs font-bold border border-yellow-300 flex items-center justify-center gap-2 shadow-md touch-manipulation"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span>第2周目を開始して隠れ十二鬼月に挑む！</span>
                  </button>
                ) : (
                  <div className="text-[10px] text-rose-300/90 text-center py-2 px-2 bg-slate-900/80 rounded border border-rose-900/50">
                    ⚠️ 2周目は1周目をクリア（第9章クリア）しないと闘えません！まずは本編第9章クリアを目指しましょう。
                  </div>
                )}
              </div>
            )}

            {/* Level-Up Training Section ("パーティの現在のレベルより少し弱いものから強いものへ4段階で並べて") */}
            <div className="bg-slate-950/70 border border-amber-500/40 rounded p-2.5 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <FuriganaText text="レベル上[あ]げ修[しゅ]業[ぎょう]場[じょう]（パーティ現在[げんざい]Lvに応[おう]じた4段階[だんかい]）" />
                </span>
                <span className="text-[11px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 self-start sm:self-auto font-bold flex items-center gap-1">
                  <span>隊員平均:</span>
                  <span className="text-yellow-300 font-extrabold">Lv.{partyCurrentLevel}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* 段階1: 少し弱い */}
                <button
                  onClick={() => triggerTrainingEncounter(1)}
                  className="py-2.5 px-2 bg-emerald-950/85 hover:bg-emerald-900 active:bg-emerald-800 text-emerald-200 text-xs font-bold rounded-lg border-2 border-emerald-500 flex flex-col items-center justify-center gap-1 shadow transition-all touch-manipulation min-h-[64px] hover:scale-[1.01] active:scale-[0.99]"
                  title={`パーティ(Lv.${partyCurrentLevel})より少し弱い鬼(Lv.${tier1Level})で安全に経験値を稼ぐ`}
                >
                  <span className="text-[11px] text-emerald-300 font-bold whitespace-nowrap flex items-center gap-1">
                    <span>🔰</span>
                    <FuriganaText text={`段階[だんかい]1: 少[すこ]し弱[よわ]い (Lv.${tier1Level})`} />
                  </span>
                  <span className="text-[9px] text-emerald-400/90 whitespace-nowrap">
                    野良鬼の群れ (1〜4体)・安全修業
                  </span>
                </button>

                {/* 段階2: 同格・適正 */}
                <button
                  onClick={() => triggerTrainingEncounter(2)}
                  className="py-2.5 px-2 bg-cyan-950/85 hover:bg-cyan-900 active:bg-cyan-800 text-cyan-200 text-xs font-bold rounded-lg border-2 border-cyan-500 flex flex-col items-center justify-center gap-1 shadow transition-all touch-manipulation min-h-[64px] hover:scale-[1.01] active:scale-[0.99]"
                  title={`パーティ(Lv.${partyCurrentLevel})と同格の鬼(Lv.${tier2Level})でバランス良く鍛える`}
                >
                  <span className="text-[11px] text-cyan-300 font-bold whitespace-nowrap flex items-center gap-1">
                    <span>⚔️</span>
                    <FuriganaText text={`段階[だんかい]2: 同[どう]格[かく]・適正[てきせい] (Lv.${tier2Level})`} />
                  </span>
                  <span className="text-[9px] text-cyan-400/90 whitespace-nowrap">
                    野良鬼の群れ (1〜4体)・着実に育成
                  </span>
                </button>

                {/* 段階3: 少し強い */}
                <button
                  onClick={() => triggerTrainingEncounter(3)}
                  className="py-2.5 px-2 bg-amber-950/85 hover:bg-amber-900 active:bg-amber-800 text-amber-200 text-xs font-bold rounded-lg border-2 border-amber-500 flex flex-col items-center justify-center gap-1 shadow transition-all touch-manipulation min-h-[64px] hover:scale-[1.01] active:scale-[0.99]"
                  title={`パーティ(Lv.${partyCurrentLevel})より少し強い鬼(Lv.${tier3Level})で多めの経験値を獲得`}
                >
                  <span className="text-[11px] text-amber-300 font-bold whitespace-nowrap flex items-center gap-1">
                    <span>🔥</span>
                    <FuriganaText text={`段階[だんかい]3: 少[すこ]し強[つよ]い (Lv.${tier3Level})`} />
                  </span>
                  <span className="text-[9px] text-amber-300/90 whitespace-nowrap">
                    野良鬼の群れ (1〜4体)・多めの経験値
                  </span>
                </button>

                {/* 段階4: 強い・猛特訓 */}
                <button
                  onClick={() => triggerTrainingEncounter(4)}
                  className="py-2.5 px-2 bg-purple-950/85 hover:bg-purple-900 active:bg-purple-800 text-purple-200 text-xs font-bold rounded-lg border-2 border-purple-500 flex flex-col items-center justify-center gap-1 shadow transition-all touch-manipulation min-h-[64px] hover:scale-[1.01] active:scale-[0.99]"
                  title={`パーティ(Lv.${partyCurrentLevel})より強い鬼(Lv.${tier4Level})で大量の経験値を一気に獲得`}
                >
                  <span className="text-[11px] text-purple-300 font-bold whitespace-nowrap flex items-center gap-1">
                    <span>💀</span>
                    <FuriganaText text={`段階[だんかい]4: 強[つよ]い・猛特訓[もうとっくん] (Lv.${tier4Level})`} />
                  </span>
                  <span className="text-[9px] text-purple-300/90 whitespace-nowrap">
                    野良鬼の群れ (1〜4体)・大量経験値！
                  </span>
                </button>
              </div>
            </div>
          </div>
        </DqFrame>

        {/* Boss Preview & Rewards */}
        <DqFrame title="出現する鬼・討伐恩賞" className="p-3 flex flex-col justify-between">
          <div>
            <div className="flex flex-col items-center p-3 bg-slate-900 rounded border border-slate-800 mb-2">
              <span className="text-xs font-bold text-red-400 mb-2">
                <FuriganaText text={chapter.bossName} />
              </span>
              {/* Find boss character from catalog */}
              {(() => {
                const bossChar = catalog.find(c => c.id === chapter.bossCharacterId) || catalog.find(c => c.name.includes('鬼'));
                return bossChar ? (
                  <PixelSprite character={bossChar} size={64} />
                ) : null;
              })()}
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">獲得経験値:</span>
                <span className="font-mono text-emerald-300">+{chapter.rewardExp} EXP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">獲得路銀:</span>
                <span className="font-mono text-yellow-300">+{chapter.rewardMoney} 銭</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-amber-200/80 bg-slate-900/60 p-2 rounded border border-slate-800 mt-2">
            <FuriganaText text="※ 討伐[とうばつ]に成功[せいこう]すると鬼[おに]殺[さつ]隊[たい]の柱[はしら]たちが新[あら]たに呼[よ]び出[だ]せます！" />
          </div>
        </DqFrame>
      </div>

      {/* Prominent Reset Game Section at Bottom ("最初からやり直しがどこにあるか分かりづらい。。") */}
      {onResetGame && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={onResetGame}
            className="w-full sm:w-auto px-6 py-3 bg-rose-950/90 hover:bg-rose-900 active:bg-rose-950 border-2 border-rose-500 text-rose-100 text-xs sm:text-sm font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all touch-manipulation"
          >
            <RotateCcw className="w-5 h-5 text-rose-400 animate-spin-slow" />
            <span>
              <FuriganaText text="冒険[ぼうけん]を最初[さいしょ]からやり直[なお]す（セーブデータを消去[しょうきょ]して初期化[しょきか]）" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

