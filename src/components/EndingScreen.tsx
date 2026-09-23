/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Character } from '../domain/models/types.ts';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { BgmEngine } from '../infrastructure/audio/RetroBGM.ts';
import { TwelveKizukiService } from '../domain/services/TwelveKizukiService.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { 
  Award, 
  Heart, 
  Sparkles, 
  Music, 
  BookOpen, 
  Compass, 
  CheckCircle2, 
  Sun,
  Flame,
  Users,
  RotateCcw,
  Skull,
  Circle
} from 'lucide-react';

interface EndingScreenProps {
  party: PartyAggregate;
  catalog: Character[];
  encounteredIds: Set<string>;
  defeatedDemonIds: Set<string>;
  playthroughCount: number;
  onOpenZukan: () => void;
  onContinueJourney: () => void;
  onStartSecondPlaythrough: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  party,
  catalog,
  encounteredIds,
  defeatedDemonIds,
  playthroughCount,
  onOpenZukan,
  onContinueJourney,
  onStartSecondPlaythrough
}) => {
  // Check complete clear status
  const { isTrueComplete, alliesStatus, upperMoonsStatus } = TwelveKizukiService.checkTrueCompleteClear(
    party.roster,
    catalog,
    defeatedDemonIds
  );

  // Identify alive members in active party and roster
  const aliveActiveMembers = party.activeMembers.filter(m => m.stats.hp > 0);
  const totalAliveCount = aliveActiveMembers.length > 0 ? aliveActiveMembers.length : party.activeMembers.length;

  // Check which key canon members are among alive active members
  const hasNezuko = aliveActiveMembers.some(m => m.name.includes('禰豆子'));
  const hasZenitsu = aliveActiveMembers.some(m => m.name.includes('善逸'));
  const hasInosuke = aliveActiveMembers.some(m => m.name.includes('伊之助'));
  const hasKanao = aliveActiveMembers.some(m => m.name.includes('カナヲ'));
  const hasGiyu = aliveActiveMembers.some(m => m.name.includes('義勇'));
  const hasHashira = aliveActiveMembers.some(m => m.rank === '柱');

  // Play fanfare and start Kizuna no Kiseki BGM on mount
  useEffect(() => {
    SoundEngine.playFanfare();
    const timer = setTimeout(() => {
      BgmEngine.play('kizuna');
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4 flex flex-col gap-4 text-center select-none animate-fadeIn">
      {/* Grand Title Frame */}
      <DqFrame
        variant={isTrueComplete ? 'gold' : 'default'}
        className="p-4 sm:p-6 flex flex-col items-center relative overflow-hidden"
      >
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/60 text-amber-300">
          <Music className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>BGM: 絆ノ奇跡 演奏中</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
          <Award className={`w-10 h-10 ${isTrueComplete ? 'text-yellow-300 animate-bounce' : 'text-amber-400'}`} />
          <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        {/* Clear Title */}
        {isTrueComplete ? (
          <>
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-yellow-400/80 text-yellow-300 text-xs font-bold mb-1 animate-pulse">
              ★ TRUE COMPLETE CLEAR ★
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 mb-1">
              【祝・真の完全クリア達成！！（鬼殺隊全盛の奇跡）】
            </h1>
            <p className="text-xs sm:text-sm text-yellow-200/90 font-bold mb-3">
              全ての仲間集結 ＆ 上弦の鬼全種類殲滅！千年の夜は完全に明けた！
            </p>
          </>
        ) : (
          <>
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-900/60 to-orange-900/60 border border-amber-500/60 text-amber-300 text-xs font-bold mb-1">
              STAGE CLEARED: 1周目 最終隠しステージクリア（一旦クリア）
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-200 mb-1">
              【祝・第9章 最終隠しステージ制覇！（一旦クリア達成）】
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 font-bold mb-3">
              鬼舞辻無惨を討ち、鬼化した炭治郎を救い出した！だが、真の完全クリアへの道が残されている…！
            </p>
          </>
        )}

        {/* Story Epilogue */}
        <div className="w-full bg-slate-950/80 border border-amber-500/40 rounded-lg p-3.5 text-left text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner mb-4 space-y-2">
          <div className="font-bold text-amber-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              生き残った仲間たちの絆の物語（生存者: {totalAliveCount} 名 / 仲間の総数: {party.roster.length} 名）
            </span>
          </div>

          <p className="text-slate-200">
            {isTrueComplete
              ? '鬼殺隊の全隊士と協力者が一人残らず手を取り合い、全ての上弦の鬼を打ち倒した。炭治郎は仲間たちの温もりによって人間の心を取り戻し、鬼のいない平和な世界がここに完成した。'
              : '激闘の果てに鬼舞辻無惨の肉体は朝日と共に崩れ去り、鬼の王となった炭治郎も仲間たちの絆で無事に人間に戻った。だが、2周目の各ステージに潜む十二鬼月、そして全ての仲間の集結が待っている…！'}
          </p>

          {/* Dynamic Dialogue snippets depending on who survived */}
          <div className="bg-slate-900/90 rounded p-2.5 border border-slate-700/80 space-y-2 text-xs">
            {hasNezuko && (
              <div className="text-pink-300 flex items-start gap-1.5">
                <span className="font-bold shrink-0">禰豆子:</span>
                <span>「お兄ちゃん…！ありがとう…！本当にお家に帰れるんだね…！」</span>
              </div>
            )}

            {hasZenitsu && hasInosuke && (
              <div className="text-amber-200 flex items-start gap-1.5">
                <span className="font-bold shrink-0">善逸＆伊之助:</span>
                <span>「炭治郎ーーーっ！！生きててよかったぁぁ！！俺たちはずっと一緒だぞ！！」</span>
              </div>
            )}

            {hasGiyu && (
              <div className="text-blue-300 flex items-start gap-1.5">
                <span className="font-bold shrink-0">冨岡義勇:</span>
                <span>「炭治郎…よく生き抜いた。姉さん、錆兎…約束を果たせた」</span>
              </div>
            )}

            {hasHashira && (
              <div className="text-emerald-300 flex items-start gap-1.5">
                <span className="font-bold shrink-0">柱たちの誓い:</span>
                <span>「鬼殺隊千年の悲願が成就した。命を繋いだ全ての隊士たちに、永遠の感謝を」</span>
              </div>
            )}

            {isTrueComplete && (
              <div className="text-yellow-300 flex items-start gap-1.5 border-t border-slate-800 pt-1.5">
                <span className="font-bold shrink-0">継国縁壱（魂の導き）:</span>
                <span>「道を極めし者が辿り着く場所はいつでも同じだ。お前たちが仲間と共に繋いだ光は、決して絶えることはない」</span>
              </div>
            )}
          </div>
        </div>

        {/* Complete Clear Conditions Box (Crucial user requirement) */}
        <div className={`w-full p-3.5 rounded-lg border text-left mb-4 space-y-3 ${
          isTrueComplete
            ? 'bg-amber-950/40 border-yellow-500/80 text-yellow-100'
            : 'bg-slate-900/90 border-amber-500/50 text-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>完全クリア判定（2大条件）</span>
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              isTrueComplete
                ? 'bg-yellow-500 text-slate-950 animate-pulse'
                : 'bg-amber-900/80 text-amber-200'
            }`}>
              {isTrueComplete ? '★ 完全クリア達成！ ★' : '一旦クリア（2周目で完全制覇へ！）'}
            </span>
          </div>

          {/* Condition 1: Collect All Allies (Hashira Only) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>条件①: 全ての仲間集め（九柱全員集結！）</span>
              </span>
              <span className="font-mono font-bold text-emerald-200">
                {alliesStatus.recruitedCount} / {alliesStatus.totalCount} 名
                {alliesStatus.isComplete && ' ✔️'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-green-400"
                style={{ width: `${Math.min(100, (alliesStatus.recruitedCount / alliesStatus.totalCount) * 100)}%` }}
              />
            </div>
            {!alliesStatus.isComplete && (
              <p className="text-[11px] text-slate-400">
                あと {alliesStatus.missingAllies.length} 名の柱が集まっていません！「勧誘モード」の柱稽古（タイミング判定）で仲間にできます。
              </p>
            )}
          </div>

          {/* Condition 2: Defeat All Upper Moons */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 font-bold text-rose-300">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>条件②: 上弦の鬼 全種類討伐</span>
              </span>
              <span className="font-mono font-bold text-rose-200">
                {upperMoonsStatus.defeatedCount} / {upperMoonsStatus.totalCount} 種
                {upperMoonsStatus.isComplete && ' ✔️'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400"
                style={{ width: `${Math.min(100, (upperMoonsStatus.defeatedCount / upperMoonsStatus.totalCount) * 100)}%` }}
              />
            </div>
            {!upperMoonsStatus.isComplete && (
              <p className="text-[11px] text-slate-400">
                あと {upperMoonsStatus.totalCount - upperMoonsStatus.defeatedCount} 種の上弦の鬼が未討伐です！
              </p>
            )}
          </div>

          {/* 2nd Playthrough Hidden 12 Kizuki explanation */}
          <div className="bg-purple-950/60 border border-purple-800 rounded p-2.5 text-[11px] text-purple-200 space-y-1">
            <div className="font-bold flex items-center gap-1 text-purple-300">
              <Skull className="w-3.5 h-3.5 text-purple-400" />
              <span>ストーリーで出て来ない12鬼月は2周目の各ステージに隠れているよ！</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              下弦の陸・釜鵺、下弦の肆・零余子、下弦の参・病葉、下弦の弐・轆轤、そして単独の真・上弦たち（獪岳、玉壺完全体、憎珀天、鳴女、童磨、黒死牟）は、
              <span className="text-amber-300 font-bold">2周目の各ステージ（藤襲山〜無限城）</span>に潜伏しています！
              2周目を開始すると、各ステージのワールドマップに「隠れ十二鬼月」が出現します！
            </p>
          </div>
        </div>

        {/* Survivors Showcase */}
        <div className="w-full mb-4">
          <div className="text-xs font-bold text-amber-300 mb-2 flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>最終決戦を戦い抜いたメンバー ({party.activeMembers.length}名)</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            {party.activeMembers.map(m => {
              const isFallen = m.stats.hp <= 0;
              return (
                <div key={m.id} className="flex flex-col items-center bg-slate-950/80 p-2 rounded border border-slate-800/80 min-w-[76px]">
                  <div className="relative">
                    <PixelSprite character={m} size={52} />
                    {isFallen && (
                      <span className="absolute bottom-0 right-0 text-[9px] bg-rose-900/90 text-rose-200 px-1 rounded font-bold border border-rose-600">
                        負傷
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-amber-200 mt-1 truncate max-w-[80px]">
                    {m.name}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    Lv.{m.level} {m.rank}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {/* 2nd Playthrough Button */}
          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onStartSecondPlaythrough();
            }}
            className="px-5 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-xs sm:text-sm font-bold border border-purple-300 flex items-center gap-2 shadow-lg transition-all active:scale-95 animate-pulse"
          >
            <RotateCcw className="w-4 h-4 text-yellow-300" />
            <span>
              {playthroughCount >= 2 
                ? `第${playthroughCount + 1}周目を開始（隠れ十二鬼月探索）` 
                : '【★ 2周目（隠れ十二鬼月解放）を開始する】'}
            </span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onOpenZukan();
            }}
            className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-white text-xs sm:text-sm font-bold border border-indigo-400 flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-indigo-200" />
            <span>大図鑑を開く</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onContinueJourney();
            }}
            className="px-4 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-lg text-white text-xs sm:text-sm font-bold border border-amber-400 flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Compass className="w-4 h-4 text-amber-200" />
            <span>修業と旅を続ける（世界地図へ）</span>
          </button>
        </div>
      </DqFrame>
    </div>
  );
};
