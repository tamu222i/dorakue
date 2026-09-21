/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoryChapter, Character } from '../domain/models/types.ts';
import { STORY_CHAPTERS } from '../domain/services/StoryData.ts';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { MapPin, Swords, Bed, BookOpen, ShieldAlert, Award, RotateCcw, Sparkles } from 'lucide-react';

interface WorldMapScreenProps {
  party: PartyAggregate;
  catalog: Character[];
  currentChapterIndex: number;
  onStartBossBattle: (chapter: StoryChapter) => void;
  onStartRandomBattle: (enemy: Character) => void;
  onGoToInn: () => void;
  onOpenZukan: () => void;
  onOpenStoryMode: () => void;
  onResetGame?: () => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  party,
  catalog,
  currentChapterIndex,
  onStartBossBattle,
  onStartRandomBattle,
  onGoToInn,
  onOpenZukan,
  onOpenStoryMode,
  onResetGame
}) => {
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(currentChapterIndex);
  const [selectedTrainingTier, setSelectedTrainingTier] = useState<'stage1' | 'stage2' | 'current'>('stage1');
  const chapter = STORY_CHAPTERS[selectedChapterIdx] || STORY_CHAPTERS[0];

  // Helper to start training / wild demon encounter with specific tier
  const triggerWildDemonEncounter = (tier: 'stage1' | 'stage2' | 'current' = selectedTrainingTier) => {
    SoundEngine.playConfirm();
    let demonPool: Character[] = [];

    if (tier === 'stage1') {
      // Stage 1 (藤襲山・最弱 Lv.1-3 雑魚鬼) - guaranteed weak trash demons for leveling up!
      demonPool = catalog.filter(c => c.role === 'demon' && c.level <= 3);
    } else if (tier === 'stage2') {
      // Stage 2 (浅草 Lv.4-7 雑魚鬼)
      demonPool = catalog.filter(c => c.role === 'demon' && c.level >= 4 && c.level <= 7);
    } else {
      // Current chapter recommended level
      const targetLevel = chapter.recommendedLevel;
      demonPool = catalog.filter(c => c.role === 'demon' && Math.abs(c.level - targetLevel) <= 3);
    }

    const chosen = demonPool.length > 0
      ? demonPool[Math.floor(Math.random() * demonPool.length)]
      : catalog.find(c => c.role === 'demon')!;

    onStartRandomBattle({ ...chosen });
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
            <button
              onClick={() => {
                SoundEngine.playConfirm();
                onOpenStoryMode();
              }}
              className="px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded text-white text-xs font-bold flex items-center gap-1.5 border border-purple-400 shadow animate-pulse touch-manipulation"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span><FuriganaText text="原作[げんさく]ものがたり" /></span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playConfirm();
                onGoToInn();
              }}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white text-xs font-bold flex items-center gap-1.5 border border-amber-400 shadow touch-manipulation"
            >
              <Bed className="w-3.5 h-3.5" />
              <span><FuriganaText text="藤[ふじ]の家[か]紋[もん]の宿[やど]" /></span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playConfirm();
                onOpenZukan();
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-xs font-bold flex items-center gap-1.5 border border-indigo-400 shadow touch-manipulation"
            >
              <Award className="w-3.5 h-3.5" />
              <span><FuriganaText text="300種[しゅ]大[だい]図鑑[ずかん]" /></span>
            </button>
          </div>
        </div>
      </DqFrame>

      {/* Main Chapter Progression Bar (8 Canon Chapters) */}
      <DqFrame title="原作ストーリー討伐進行（全8章）" className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-center text-xs">
          {STORY_CHAPTERS.map((ch, idx) => {
            const unlocked = idx <= currentChapterIndex;
            const completed = idx < currentChapterIndex;
            const isCurrent = idx === currentChapterIndex;
            const isSelected = idx === selectedChapterIdx;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  SoundEngine.playCursor();
                  setSelectedChapterIdx(idx);
                }}
                className={`p-2 rounded border flex flex-col items-center justify-between min-h-[76px] transition-all touch-manipulation ${
                  isSelected
                    ? 'ring-2 ring-amber-400 border-amber-300 bg-slate-800'
                    : 'border-slate-700 bg-slate-900/80'
                } ${!unlocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-slate-800'}`}
              >
                <div className="text-[10px] font-bold text-slate-400">第{ch.chapterNumber}章</div>
                <div className="font-bold text-[11px] truncate w-full text-amber-200">
                  {ch.locationName.split('（')[0]}
                </div>
                <div>
                  {completed ? (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600/80 rounded text-white font-bold">討伐済</span>
                  ) : isCurrent ? (
                    <span className="text-[9px] px-1.5 py-0.2 bg-rose-600 rounded text-white font-bold animate-pulse">進行中</span>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  SoundEngine.playConfirm();
                  onOpenStoryMode();
                }}
                className="py-2.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white border border-purple-400 shadow-md touch-manipulation"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span><FuriganaText text="原作[げんさく]・3問[もん]試練[しれん]で仲間[なかま]集[あつ]めへ" /></span>
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
                className={`flex-1 py-2.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 border transition-all touch-manipulation ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border-red-400 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>
                  {chapter.chapterNumber === 8 ? (
                    <FuriganaText text="最終[さいしゅう]決戦[けっせん]！鬼舞辻[きぶつじ]無惨[むざん]に挑[いど]む" />
                  ) : (
                    <FuriganaText text={`討[とう]伐[ばつ]任務[にんむ]: ${chapter.bossName} に挑[いど]む`} />
                  )}
                </span>
              </button>
            </div>

            {/* Level-Up Training Section ("弱いステージの鬼をレベル上げに出してね") */}
            <div className="bg-slate-950/70 border border-amber-500/40 rounded p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <FuriganaText text="レベル上[あ]げ修[しゅ]業[ぎょう]場[じょう]（出現[しゅつげん]する鬼[おに]を選択[せんたく]）" />
                </span>
                <span className="text-[10px] text-slate-400">1タップで戦闘開始</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <button
                  onClick={() => triggerWildDemonEncounter('stage1')}
                  className="py-2.5 px-2 bg-emerald-950/80 hover:bg-emerald-900 active:bg-emerald-800 text-emerald-200 text-xs font-bold rounded border border-emerald-500 flex flex-col items-center justify-center gap-0.5 shadow transition-all touch-manipulation"
                >
                  <span className="text-[11px] text-emerald-300 font-bold">
                    <FuriganaText text="🔰 最弱[さいじゃく]・藤襲山[ふじかさねやま] (Lv.1〜3)" />
                  </span>
                  <span className="text-[9px] text-emerald-400/90">
                    <FuriganaText text="炭治郎[たんじろう]たちの安全[あんぜん]な育成[いくせい]！" />
                  </span>
                </button>

                <button
                  onClick={() => triggerWildDemonEncounter('stage2')}
                  className="py-2.5 px-2 bg-cyan-950/80 hover:bg-cyan-900 active:bg-cyan-800 text-cyan-200 text-xs font-bold rounded border border-cyan-500 flex flex-col items-center justify-center gap-0.5 shadow transition-all touch-manipulation"
                >
                  <span className="text-[11px] text-cyan-300 font-bold">
                    <FuriganaText text="🏮 初級[しょきゅう]・浅草街[あさくさがい] (Lv.4〜7)" />
                  </span>
                  <span className="text-[9px] text-cyan-400/90">
                    <FuriganaText text="足鬼[あしおに]・首鬼[くびおに]など新[しん]種[しゅ]の鬼！" />
                  </span>
                </button>

                <button
                  onClick={() => triggerWildDemonEncounter('current')}
                  className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-200 text-xs font-bold rounded border border-slate-600 flex flex-col items-center justify-center gap-0.5 shadow transition-all touch-manipulation"
                >
                  <span className="text-[11px] text-amber-300 font-bold">
                    <FuriganaText text={`⚔️ 現[げん]舞台[ぶたい]: 第[だい]${chapter.chapterNumber}章[しょう]`} />
                  </span>
                  <span className="text-[9px] text-slate-400">
                    推奨Lv.{chapter.recommendedLevel} 周辺の鬼
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

