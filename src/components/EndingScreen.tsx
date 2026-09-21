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
  Volume2
} from 'lucide-react';

interface EndingScreenProps {
  party: PartyAggregate;
  catalog: Character[];
  encounteredIds: Set<string>;
  onOpenZukan: () => void;
  onContinueJourney: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  party,
  catalog,
  encounteredIds,
  onOpenZukan,
  onContinueJourney
}) => {
  const [activeTab, setActiveTab] = useState<'kizuna' | 'survivors' | 'records'>('kizuna');

  // Identify alive members in active party and roster
  const aliveActiveMembers = party.activeMembers.filter(m => m.stats.hp > 0);
  const fallenActiveMembers = party.activeMembers.filter(m => m.stats.hp <= 0);
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
    // Fanfare first, then Kizuna no Kiseki BGM
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
      <DqFrame variant="gold" className="p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/60 text-amber-300">
          <Music className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>BGM: 絆ノ奇跡 演奏中</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
          <Award className="w-10 h-10 text-yellow-300 animate-bounce" />
          <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 mb-1">
          【最終決戦完全勝利・絆ノ奇跡エンディング】
        </h1>
        <p className="text-xs sm:text-sm text-amber-200/90 font-bold mb-3">
          鬼化・竈門炭治郎を救出！千年の鬼の宿業に幕を下ろした勇士たち
        </p>

        {/* Dynamic Story Epilogue based on Survivor Composition */}
        <div className="w-full bg-slate-950/80 border border-amber-500/40 rounded-lg p-3.5 text-left text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner mb-4 space-y-2">
          <div className="font-bold text-amber-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              生き残った仲間たちの絆の物語（生存者: {totalAliveCount} 名）
            </span>
          </div>

          <p className="text-slate-200">
            陽光が昇る中、人間に戻す薬と仲間たちの必死の叫びが炭治郎の心に届いた。
            鬼の王としての肉体は滅び、人間・竈門炭治郎として再び目を覚ました。
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

            {hasZenitsu && !hasInosuke && (
              <div className="text-yellow-300 flex items-start gap-1.5">
                <span className="font-bold shrink-0">善逸:</span>
                <span>「炭治郎！死ぬかと思ったよぉ！でもお前が戻ってきてくれて本当によかった…！」</span>
              </div>
            )}

            {hasInosuke && !hasZenitsu && (
              <div className="text-cyan-300 flex items-start gap-1.5">
                <span className="font-bold shrink-0">伊之助:</span>
                <span>「フン…！勝ったな炭治郎！俺の親分はお前だけだ！！」</span>
              </div>
            )}

            {hasKanao && (
              <div className="text-rose-300 flex items-start gap-1.5">
                <span className="font-bold shrink-0">カナヲ:</span>
                <span>「炭治郎…薬が間に合ってよかった…しのぶ姉さん、私たちやり遂げたよ…」</span>
              </div>
            )}

            {hasGiyu && (
              <div className="text-blue-300 flex items-start gap-1.5">
                <span className="font-bold shrink-0">冨岡義勇:</span>
                <span>「炭治郎…お前を鬼にして死なせずに済んだ。姉さん、錆兎…約束を果たせた」</span>
              </div>
            )}

            {hasHashira && (
              <div className="text-emerald-300 flex items-start gap-1.5">
                <span className="font-bold shrink-0">柱たちの誓い:</span>
                <span>「鬼殺隊千年の悲願が成就した。尊い命を繋いだ全ての隊士たちに、永遠の感謝を」</span>
              </div>
            )}

            {/* Custom generic ending line if none of the above matches */}
            {!hasNezuko && !hasZenitsu && !hasInosuke && !hasKanao && !hasGiyu && (
              <div className="text-slate-300">
                駆けつけた仲間たちの温かい手が炭治郎を抱き起こす。誰もが流した涙が、これからの温かい未来を照らしていた。
              </div>
            )}
          </div>
        </div>

        {/* Survivors Showcase */}
        <div className="w-full mb-4">
          <div className="text-xs font-bold text-amber-300 mb-2 flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>激闘を生き抜いた出撃メンバー ({party.activeMembers.length}名)</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            {party.activeMembers.map(m => {
              const isFallen = m.stats.hp <= 0;
              return (
                <div key={m.id} className="flex flex-col items-center bg-slate-950/80 p-2 rounded border border-slate-800/80 min-w-[76px]">
                  <div className="relative">
                    <PixelSprite character={m} size={56} />
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

        {/* Clear Statistics */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 font-mono mb-5">
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded flex flex-col items-center">
            <span className="text-[10px] text-slate-400">最終章制覇</span>
            <span className="text-amber-400 font-bold text-sm">全9章クリア</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded flex flex-col items-center">
            <span className="text-[10px] text-slate-400">仲間にした隊士</span>
            <span className="text-emerald-400 font-bold text-sm">{party.roster.length} 名</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded flex flex-col items-center">
            <span className="text-[10px] text-slate-400">図鑑遭遇率</span>
            <span className="text-cyan-400 font-bold text-sm">{encounteredIds.size} / {catalog.length}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded flex flex-col items-center">
            <span className="text-[10px] text-slate-400">所持金</span>
            <span className="text-yellow-400 font-bold text-sm">{party.money.toLocaleString()} 銭</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onOpenZukan();
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs sm:text-sm font-bold border border-indigo-400 flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-indigo-200" />
            <span>大図鑑を開く（仲間のみ表示対応）</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onContinueJourney();
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-xs sm:text-sm font-bold border border-amber-400 flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Compass className="w-4 h-4 text-amber-200" />
            <span>修業と旅を続ける（世界地図へ）</span>
          </button>
        </div>
      </DqFrame>
    </div>
  );
};
