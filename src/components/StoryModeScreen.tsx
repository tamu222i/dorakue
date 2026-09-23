/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Character, StoryChapter, StoryChoice } from '../domain/models/types.ts';
import { STORY_CHAPTERS } from '../domain/services/StoryData.ts';
import { isHashiraCharacter, isStoryChoiceHashira } from '../domain/services/CharacterCatalog.ts';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { 
  BookOpen, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  Shuffle, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft, 
  Award,
  Users,
  HelpCircle,
  Swords,
  UserPlus
} from 'lucide-react';

interface StoryModeScreenProps {
  party: PartyAggregate;
  catalog: Character[];
  currentChapterIndex: number;
  onSelectStoryRecruit: (choice: StoryChoice, chapter: StoryChapter) => void;
  onStartStoryBoss: (chapter: StoryChapter) => void;
  onBack: () => void;
}

export const StoryModeScreen: React.FC<StoryModeScreenProps> = ({
  party,
  catalog,
  currentChapterIndex,
  onSelectStoryRecruit,
  onStartStoryBoss,
  onBack
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(currentChapterIndex);
  const chapter = STORY_CHAPTERS[selectedIdx] || STORY_CHAPTERS[0];

  const isUnlocked = selectedIdx <= currentChapterIndex;
  const isCompleted = selectedIdx < currentChapterIndex;

  // Find boss character
  const bossChar = catalog.find(c => c.id === chapter.bossCharacterId) || catalog.find(c => c.name.includes('鬼'));

  // Handler for picking a choice
  const handlePickChoice = (choice: StoryChoice) => {
    SoundEngine.playConfirm();
    onSelectStoryRecruit(choice, chapter);
  };

  // Handler for random choice
  const handleRandomChoice = () => {
    if (!chapter.choices || chapter.choices.length === 0) return;
    SoundEngine.playConfirm();
    const randomChoice = chapter.choices[Math.floor(Math.random() * chapter.choices.length)];
    onSelectStoryRecruit(randomChoice, chapter);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 p-2 select-none">
      {/* Top Header */}
      <DqFrame variant="gold" className="p-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              <span>
                <FuriganaText text="勧誘[かんゆう]モード（柱[はしら]は柱稽古[はしらげいこ]・隊士[たいし]は3問[もん]クイズで仲間[なかま]入り！）" />
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              <FuriganaText text="各章[かくしょう]の仲間[なかま]を勧誘[かんゆう]！柱[はしら]は柱稽古[はしらげいこ]（タイミング判定[はんてい]）、隊士[たいし]は3問[もん]クイズの試[し]練[れん]を突破[とっぱ]しよう！" />
            </p>
          </div>

          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onBack();
            }}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold rounded border border-red-600 flex items-center gap-1.5 touch-manipulation shadow"
            title="討伐モード（章マップ）へ戻る"
          >
            <Swords className="w-4 h-4 text-red-400" />
            <span><FuriganaText text="討伐[とうばつ]モードへ戻[もど]る" /></span>
          </button>
        </div>

        {/* Chapter Carousel / Selector */}
        <div className={`grid gap-1.5 mt-3 ${
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
          }).map((ch) => {
            const origIdx = ch.chapterNumber - 1;
            const unlocked = origIdx <= currentChapterIndex;
            const completed = origIdx < currentChapterIndex;
            const isCurrent = origIdx === currentChapterIndex;
            const isSelected = origIdx === selectedIdx;
            const isSecret = ch.chapterNumber === 9;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  SoundEngine.playCursor();
                  setSelectedIdx(origIdx);
                }}
                className={`p-2 rounded border flex flex-col items-center justify-between min-h-[72px] transition-all touch-manipulation ${
                  isSelected
                    ? isSecret ? 'ring-2 ring-rose-400 border-rose-300 bg-rose-950/80 shadow-md' : 'ring-2 ring-amber-400 border-amber-300 bg-slate-800 shadow-md'
                    : isSecret ? 'border-rose-700 bg-rose-950/40 hover:bg-rose-900/60' : 'border-slate-700 bg-slate-900/80 hover:bg-slate-800'
                } ${!unlocked ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
              >
                <div className={`text-[10px] font-bold ${isSecret ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                  {isSecret ? '★隠し第9章' : `第${ch.chapterNumber}章`}
                </div>
                <div className={`font-bold text-[11px] truncate w-full text-center ${isSecret ? 'text-rose-200' : 'text-amber-200'}`}>
                  {ch.locationName.split('（')[0]}
                </div>
                <div>
                  {completed ? (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600/80 rounded text-white font-bold">済</span>
                  ) : isCurrent ? (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded text-white font-bold animate-pulse ${isSecret ? 'bg-rose-600 ring-1 ring-rose-300' : 'bg-rose-600'}`}>
                      進行
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500">未</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DqFrame>

      {/* Chapter Story Narrative & Choices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left 2 Cols: Story choices and dialogues */}
        <div className="lg:col-span-2 space-y-3">
          <DqFrame title={`${chapter.title} - ${chapter.subTitle}`} className="p-4">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold mb-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>
                <FuriganaText text={`舞台[ぶたい]: ${chapter.locationName}`} />
              </span>
              <span className="text-slate-400">/ 推奨Lv: {chapter.recommendedLevel}</span>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4 bg-slate-950/60 p-3 rounded border border-slate-800">
              <FuriganaText text={chapter.description} />
            </div>

            {/* Canon Dialogues */}
            <div className="mb-4">
              <div className="text-xs font-bold text-amber-300 mb-1.5">
                <FuriganaText text="【物語[ものがたり]の幕[まく]開[あ]け】" />
              </div>
              <div className="bg-slate-900/90 border border-slate-700 rounded p-2.5 text-xs flex flex-col gap-1.5 text-slate-300 leading-relaxed">
                {chapter.introDialogues.map((dlg, i) => (
                  <div key={i} className="pl-2 border-l-2 border-amber-500/50">
                    <FuriganaText text={dlg} />
                  </div>
                ))}
              </div>
            </div>

            {/* Branching Recruitment Choices with Quiz requirement or Hashira Training */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <div className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>
                    <FuriganaText text="運命[うんめい]の選択[せんたく]（試練[しれん]クリアで仲間[なかま]入り！）" />
                  </span>
                </div>

                {chapter.choices && chapter.choices.length > 0 && (
                  <button
                    onClick={handleRandomChoice}
                    className="px-2.5 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold rounded border border-purple-500 flex items-center gap-1 shadow touch-manipulation"
                    title="誰が仲間になるか運を天に任せる"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-purple-300" />
                    <span><FuriganaText text="🎲 鎹鴉[かすがいがらす]の導[みちび]き（ランダム試練）" /></span>
                  </button>
                )}
              </div>

              {chapter.choices && chapter.choices.length > 0 ? (
                <div className="space-y-2">
                  {chapter.choices.map((choice) => {
                    const recruitChar = catalog.find(c => c.id === choice.recruitCharacterId);
                    const bonusChars = (choice.bonusCharacterIds || [])
                      .map(id => catalog.find(c => c.id === id))
                      .filter(Boolean) as Character[];
                    const alreadyHas = recruitChar ? party.hasMember(recruitChar.id) : false;
                    const isHashira = isStoryChoiceHashira(recruitChar, bonusChars);

                    return (
                      <div
                        key={choice.id}
                        className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                          alreadyHas
                            ? 'bg-slate-900/60 border-slate-700'
                            : isHashira
                            ? 'bg-gradient-to-r from-slate-900 via-rose-950/20 to-amber-950/40 border-amber-500/80 hover:border-amber-300 shadow-md'
                            : 'bg-gradient-to-r from-slate-900 to-amber-950/30 border-amber-500/60 hover:border-amber-400 shadow'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {recruitChar && (
                            <div className="p-1 bg-slate-950 rounded border border-slate-800 shrink-0">
                              <PixelSprite character={recruitChar} size={48} />
                            </div>
                          )}
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-amber-200 mb-0.5">
                              <FuriganaText text={choice.label} />
                            </div>
                            <div className="text-[11px] text-slate-300 leading-snug">
                              <FuriganaText text={choice.description} />
                            </div>
                            {recruitChar && (
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                                <span className="text-cyan-300 font-bold">{recruitChar.name}</span>
                                <span className={isHashira ? 'text-rose-300 font-bold' : ''}>({recruitChar.rank})</span>
                                {alreadyHas ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                    <CheckCircle className="w-3 h-3" /> 加入済み
                                  </span>
                                ) : isHashira ? (
                                  <span className="text-rose-300 font-bold flex items-center gap-0.5">
                                    <Swords className="w-3 h-3 text-amber-400" /> 柱稽古ミニゲーム
                                  </span>
                                ) : (
                                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                    <HelpCircle className="w-3 h-3" /> 3問クイズ挑戦
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handlePickChoice(choice)}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 border transition-all touch-manipulation ${
                            alreadyHas
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                              : isHashira
                              ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white border-amber-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                              : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          }`}
                        >
                          {isHashira && !alreadyHas ? (
                            <Swords className="w-3.5 h-3.5 text-yellow-300" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {alreadyHas ? (
                              <FuriganaText text="再[さい]挑戦[ちょうせん]・会話[かいわ]" defaultRtColor="text-slate-400" />
                            ) : isHashira ? (
                              <FuriganaText text="柱稽古[はしらげいこ]に挑[いど]む！（ミニゲーム）" defaultRtColor="text-white" />
                            ) : (
                              <FuriganaText text="3問[もん]の試[し]練[れん]に挑[いど]む！（クイズ）" defaultRtColor="text-slate-900" />
                            )}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs text-slate-400 text-center">
                  この章の特別な選択肢はありません。
                </div>
              )}
            </div>
          </DqFrame>
        </div>

        {/* Right Col: Boss info and Battle Start */}
        <div className="space-y-3">
          <DqFrame title="立ちはだかる鬼・決戦" variant="danger" className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex flex-col items-center p-4 bg-slate-900/90 rounded-lg border border-red-900/60 mb-3 shadow-inner">
                <span className="text-xs font-bold text-red-400 mb-2">
                  <FuriganaText text={chapter.bossName} />
                </span>
                {bossChar && <PixelSprite character={bossChar} size={84} />}
                <span className="mt-2 text-[11px] text-slate-400">
                  推奨レベル: Lv.{chapter.recommendedLevel}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 bg-slate-950/70 p-3 rounded border border-slate-800 mb-3 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">獲得経験値:</span>
                  <span className="text-emerald-300 font-bold">+{chapter.rewardExp} EXP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">獲得路銀:</span>
                  <span className="text-yellow-300 font-bold">+{chapter.rewardMoney} 銭</span>
                </div>
              </div>

              {isCompleted && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded text-xs text-emerald-200 mb-3">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span><FuriganaText text="討[とう]伐[ばつ]達成[たっせい]済み！" /></span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <FuriganaText text="別[べつ]ルートの選択肢[せんたくし]を選[えら]んで新[あら]たな仲間[なかま]の試[し]練[れん]を受[う]けることも可能[かのう]です。" />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (isUnlocked) {
                  SoundEngine.playConfirm();
                  onStartStoryBoss(chapter);
                } else {
                  SoundEngine.playCancel();
                }
              }}
              disabled={!isUnlocked}
              className={`w-full py-3 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all touch-manipulation ${
                isUnlocked
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span>
                {chapter.chapterNumber === 8 ? (
                  <FuriganaText text="討伐[とうばつ]: 最終[さいしゅう]決戦[けっせん]！鬼舞辻[きぶつじ]無惨[むざん]に挑[いど]む" />
                ) : (
                  <FuriganaText text={`討伐[とうばつ]: 第[だい]${chapter.chapterNumber}章[しょう] 決戦[けっせん]に挑[いど]む！`} />
                )}
              </span>
            </button>
          </DqFrame>
        </div>
      </div>
    </div>
  );
};

