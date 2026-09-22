/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Character } from '../domain/models/types.ts';
import { TwelveKizukiService, HIDDEN_TWELVE_KIZUKI_LIST, UPPER_MOON_LIST } from '../domain/services/TwelveKizukiService.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { Award, Users, Skull, CheckCircle2, Circle, HelpCircle, X, Sparkles, Flame } from 'lucide-react';

interface ClearProgressModalProps {
  roster: Character[];
  catalog: Character[];
  defeatedDemonIds: Set<string>;
  playthroughCount: number;
  hasClearedNormal: boolean;
  onClose: () => void;
}

export const ClearProgressModal: React.FC<ClearProgressModalProps> = ({
  roster,
  catalog,
  defeatedDemonIds,
  playthroughCount,
  hasClearedNormal,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'allies' | 'uppermoons' | 'kizuki'>('overview');

  const { isTrueComplete, alliesStatus, upperMoonsStatus } = TwelveKizukiService.checkTrueCompleteClear(
    roster,
    catalog,
    defeatedDemonIds
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <DqFrame
        variant={isTrueComplete ? 'gold' : 'default'}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col p-3 sm:p-5 overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Award className={`w-6 h-6 ${isTrueComplete ? 'text-yellow-400 animate-bounce' : 'text-amber-400'}`} />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-200">
                <FuriganaText text="完全[かんぜん]クリア達[たっ]成[せい]状[じょう]況[きょう] 確[かく]認[にん]" />
              </h2>
              <p className="text-[11px] text-slate-400">
                {playthroughCount >= 2 ? `周回状況: 第${playthroughCount}周目（隠れ十二鬼月出現中）` : '周回状況: 第1周目'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              SoundEngine.playCancel();
              onClose();
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-3 text-xs font-bold">
          <button
            onClick={() => {
              SoundEngine.playCursor();
              setActiveTab('overview');
            }}
            className={`py-2 px-1 rounded flex items-center justify-center gap-1 border transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-600 text-white border-amber-300 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="truncate">総合進捗</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playCursor();
              setActiveTab('allies');
            }}
            className={`py-2 px-1 rounded flex items-center justify-center gap-1 border transition-all ${
              activeTab === 'allies'
                ? 'bg-emerald-600 text-white border-emerald-300 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate">仲間 ({alliesStatus.recruitedCount}/{alliesStatus.totalCount})</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playCursor();
              setActiveTab('uppermoons');
            }}
            className={`py-2 px-1 rounded flex items-center justify-center gap-1 border transition-all ${
              activeTab === 'uppermoons'
                ? 'bg-rose-700 text-white border-rose-300 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-300 shrink-0" />
            <span className="truncate">上弦の鬼 ({upperMoonsStatus.defeatedCount}/{upperMoonsStatus.totalCount})</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playCursor();
              setActiveTab('kizuki');
            }}
            className={`py-2 px-1 rounded flex items-center justify-center gap-1 border transition-all ${
              activeTab === 'kizuki'
                ? 'bg-purple-700 text-white border-purple-300 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span className="truncate">隠れ12鬼月</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Overall Banner */}
              <div className={`p-3.5 rounded-lg border flex flex-col gap-2 ${
                isTrueComplete
                  ? 'bg-gradient-to-r from-amber-950 to-yellow-950 border-yellow-400/80 shadow-lg'
                  : 'bg-slate-900/90 border-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  {isTrueComplete ? (
                    <Award className="w-6 h-6 text-yellow-300 animate-spin-slow" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                  <h3 className="font-bold text-sm text-amber-200">
                    {isTrueComplete
                      ? '【祝・完全クリア条件 達成済！！】'
                      : '【完全クリアへの道（2大達成条件）】'}
                  </h3>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {isTrueComplete
                    ? '全ての仲間が集結し、全ての上弦の鬼を討伐しました！真のエンディングを迎える資格を得ました！'
                    : '1周目の第8章（無惨討伐）クリア後、隠し第9章（鬼化・炭治郎救出戦）が出現！これをクリアすると「いったんクリア（通常クリア）」となります。さらに「すべての仲間集め」と「上弦の鬼全種類討伐」の両方を達成すると「真の完全クリア」となります！'}
                </p>
              </div>

              {/* Requirement 1: All Allies */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-200">
                      条件①: 全ての仲間集め
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-300">
                    {alliesStatus.recruitedCount} / {alliesStatus.totalCount} 名
                    {alliesStatus.isComplete && ' (達成！)'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-green-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (alliesStatus.recruitedCount / alliesStatus.totalCount) * 100)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">
                  {alliesStatus.isComplete
                    ? '✔️ 鬼殺隊士・柱・協力者全員が揃いました！'
                    : `あと ${alliesStatus.missingAllies.length} 名の仲間が未加入です。「仲間」タブでヒントを確認できます。`}
                </p>
              </div>

              {/* Requirement 2: All Upper Moons */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-rose-200">
                      条件②: 上弦の鬼 全種類討伐
                    </span>
                  </div>
                  <span className="font-mono font-bold text-rose-300">
                    {upperMoonsStatus.defeatedCount} / {upperMoonsStatus.totalCount} 種
                    {upperMoonsStatus.isComplete && ' (達成！)'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (upperMoonsStatus.defeatedCount / upperMoonsStatus.totalCount) * 100)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">
                  {upperMoonsStatus.isComplete
                    ? '✔️ 上弦の鬼（陸・伍・肆・参・弐・壱、新旧含む全9種）を全滅させました！'
                    : `あと ${upperMoonsStatus.totalCount - upperMoonsStatus.defeatedCount} 種の上弦の鬼が未討伐です。`}
                </p>
              </div>

              {/* 2nd Playthrough Hidden 12 Kizuki Guidance */}
              <div className="p-3 bg-purple-950/40 border border-purple-800/80 rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-purple-200 font-bold">
                  <Skull className="w-4 h-4 text-purple-400" />
                  <span>ストーリーに出てこない十二鬼月について</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  ストーリー本編で戦えなかった十二鬼月（下弦の陸・釜鵺、下弦の肆・零余子、下弦の参・病葉、下弦の弐・轆轤や単独の上弦たち）は、
                  <span className="text-amber-300 font-bold">「2周目の各ステージ」</span>に潜伏しています！
                  2周目に進むと、ワールドマップの各章に「👁️隠れ十二鬼月の気配」が出現し、挑戦可能になります！
                </p>
              </div>
            </div>
          )}

          {activeTab === 'allies' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                <span className="font-bold text-slate-200">
                  集めた仲間: {alliesStatus.recruitedCount} / {alliesStatus.totalCount} 名
                </span>
                <span className="text-[11px] text-emerald-400 font-bold">
                  {alliesStatus.isComplete ? '全員集結完了！' : `未加入: 残り ${alliesStatus.missingAllies.length} 名`}
                </span>
              </div>

              {alliesStatus.missingAllies.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">
                    【未加入の仲間一覧＆加入のヒント】
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {alliesStatus.missingAllies.map(member => (
                      <div key={member.id} className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                        <PixelSprite character={member} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-amber-200 text-xs truncate">
                            {member.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {member.title} ({member.rank})
                          </div>
                          <div className="text-[9px] text-cyan-300 truncate">
                            💡 原作物語の柱稽古・試練クイズ または 宿屋で加入可能
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-emerald-950/30 border border-emerald-600 rounded-lg text-emerald-200 font-bold">
                  🎉 おめでとうございます！全ての仲間がロスターに集結しました！
                </div>
              )}
            </div>
          )}

          {activeTab === 'uppermoons' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                <span className="font-bold text-slate-200">
                  上弦の鬼 討伐状況: {upperMoonsStatus.defeatedCount} / {upperMoonsStatus.totalCount} 種
                </span>
                <span className={`text-[11px] font-bold ${upperMoonsStatus.isComplete ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {upperMoonsStatus.isComplete ? '全種討伐達成！' : `未討伐: 残り ${upperMoonsStatus.totalCount - upperMoonsStatus.defeatedCount} 種`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {upperMoonsStatus.details.map(moon => (
                  <div
                    key={moon.id}
                    className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                      moon.isDefeated
                        ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                          {moon.rankTitle}
                        </span>
                        <div className="font-bold text-xs mt-1 text-slate-200">
                          {moon.name}
                        </div>
                      </div>
                      {moon.isDefeated ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1">
                      {moon.isDefeated ? (
                        <span className="text-emerald-400 font-bold">討伐完了 ✔️</span>
                      ) : (
                        <span className="text-rose-400/90 font-bold">
                          {moon.id === 'demon_kaigaku' && '第6章(吉原) 2周目に出現'}
                          {moon.id === 'demon_gyokko' && '第7章(刀鍛冶) 本編または2周目'}
                          {moon.id === 'demon_zohakuten' && '第7章(刀鍛冶) 本編または2周目'}
                          {moon.id === 'demon_nakime' && '第8章(無限城) 2周目に出現'}
                          {moon.id === 'demon_doma' && '第8章(無限城) 2周目に出現'}
                          {moon.id === 'demon_kokushibo' && '第8章(無限城) 本編または2周目'}
                          {moon.id === 'demon_daki' && '第6章(吉原) 本編'}
                          {moon.id === 'demon_gyutaro' && '第6章(吉原) 本編'}
                          {moon.id === 'demon_akaza' && '第5章(無限列車) 本編'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'kizuki' && (
            <div className="space-y-2">
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
                <span className="font-bold text-amber-300">【2周目の各ステージに隠れた十二鬼月一覧】</span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  2周目突入後、ワールドマップ各章の「👁️隠れ十二鬼月の気配」から直接挑戦できます。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HIDDEN_TWELVE_KIZUKI_LIST.map(kizuki => {
                  const isDefeated = defeatedDemonIds.has(kizuki.demonId);
                  return (
                    <div
                      key={kizuki.chapterNumber}
                      className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                        isDefeated
                          ? 'bg-emerald-950/30 border-emerald-600/70'
                          : 'bg-slate-900/90 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-amber-300">
                            {kizuki.stageName}
                          </span>
                          {isDefeated ? (
                            <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-bold">
                              討伐済 ✔️
                            </span>
                          ) : (
                            <span className="text-[9px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded font-bold">
                              潜伏中
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-xs text-rose-300">
                          {kizuki.bossName} <span className="text-[10px] text-slate-400">(Lv.{kizuki.recommendedLevel})</span>
                        </div>

                        <div className="text-[10px] text-slate-300 mt-1">
                          隠れ場所: {kizuki.hiddenSpotName}
                        </div>

                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {kizuki.hint}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 pt-3 mt-3 flex justify-end">
          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-white border border-slate-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </DqFrame>
    </div>
  );
};
