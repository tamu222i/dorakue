/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Character } from '../domain/models/types.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { Sparkles, Award, Users, Shield, Zap, Heart, Sword, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface RecruitmentEvent {
  mainCharacter: Character;
  bonusCharacters?: Character[];
  dialogue?: string[];
}

interface RecruitmentCelebrationModalProps {
  event: RecruitmentEvent | null;
  activeParty: Character[];
  onConfirm: (targetSlotIndex?: number) => void;
  onSendToInn: () => void;
}

export const RecruitmentCelebrationModal: React.FC<RecruitmentCelebrationModalProps> = ({
  event,
  activeParty,
  onConfirm,
  onSendToInn,
}) => {
  const [selectedSwapSlot, setSelectedSwapSlot] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (event) {
      SoundEngine.playLevelUp();
    }
  }, [event]);

  if (!event) return null;

  const char = event.mainCharacter;
  const isPartyFull = activeParty.length >= 4;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm select-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-[#0d1527] to-slate-950 border-4 border-amber-400 rounded-xl shadow-[0_0_50px_rgba(251,191,36,0.5)] p-4 sm:p-6 text-white overflow-hidden font-['DotGothic16',monospace]"
        >
          {/* Top Decorative Banner */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
            <h2 className="text-xl sm:text-2xl font-black tracking-widest text-amber-300 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              【 仲 間 加 入 ！！ 】
            </h2>
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
          </div>

          {/* Subtitle / Chapter Lore */}
          <div className="text-center text-xs text-amber-200/90 mb-4 bg-amber-950/40 py-1 px-3 rounded-full border border-amber-500/40 mx-auto max-w-sm">
            新たな鬼殺の同志が貴方の隊へ加わりました！
          </div>

          {/* Character Spotlight */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 border-2 border-amber-500/60 rounded-lg p-3 sm:p-4 mb-3 shadow-inner">
            {/* Animated Sprite with Aura */}
            <div className="relative flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-800 to-slate-950 rounded-lg border border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <div className="absolute inset-0 bg-amber-400/10 rounded-lg animate-pulse" />
              <PixelSprite character={char} size={84} />
              <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                図鑑 No.{char.catalogNo}
              </span>
            </div>

            {/* Character Details & Stats */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="text-xs text-amber-400 font-bold tracking-wider mb-0.5">
                {char.title}
              </div>
              <div className="text-xl font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
                <span>{char.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700 font-normal">
                  階級: {char.rank}
                </span>
              </div>

              {/* Breathing & Role */}
              <div className="text-xs text-slate-300 mb-2 flex flex-wrap justify-center sm:justify-start gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
                  呼吸: {char.breathStyle}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-purple-300">
                  役割: {char.role === 'support' ? '後方支援' : '前線剣士'}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-yellow-300">
                  初期Lv.{char.level}
                </span>
              </div>

              {/* Combat Stats Grid */}
              <div className="grid grid-cols-4 gap-1 text-[11px] font-mono bg-slate-950/70 p-2 rounded border border-slate-800">
                <div className="flex flex-col items-center">
                  <span className="text-slate-400 text-[9px] flex items-center gap-0.5">
                    <Heart className="w-2.5 h-2.5 text-rose-400" /> HP
                  </span>
                  <span className="text-rose-300 font-bold">{char.stats.maxHp}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-slate-400 text-[9px] flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-amber-400" /> BP
                  </span>
                  <span className="text-amber-300 font-bold">{char.stats.maxBp}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-slate-400 text-[9px] flex items-center gap-0.5">
                    <Sword className="w-2.5 h-2.5 text-blue-400" /> 攻撃
                  </span>
                  <span className="text-blue-300 font-bold">{char.stats.attack}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-slate-400 text-[9px] flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5 text-emerald-400" /> 防御
                  </span>
                  <span className="text-emerald-300 font-bold">{char.stats.defense}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bonus Joined Characters (if any) */}
          {event.bonusCharacters && event.bonusCharacters.length > 0 && (
            <div className="mb-3 p-2 bg-indigo-950/40 border border-indigo-500/40 rounded-lg text-xs">
              <span className="text-indigo-300 font-bold flex items-center gap-1 mb-1.5">
                <Users className="w-3.5 h-3.5" />
                さらに以下の仲間も共に馳せ参じました！
              </span>
              <div className="flex flex-wrap gap-2">
                {event.bonusCharacters.map(b => (
                  <div key={b.id} className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded border border-slate-700">
                    <PixelSprite character={b} size={32} />
                    <span className="font-bold text-amber-200">{b.name}</span>
                    <span className="text-[10px] text-slate-400">({b.rank})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Joining Dialogue Quote */}
          {event.dialogue && event.dialogue.length > 0 && (
            <div className="bg-black/60 border-l-4 border-amber-400 p-2.5 rounded text-xs text-amber-100 italic mb-4 leading-relaxed">
              {event.dialogue.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>
          )}

          {/* Action Choice: Add to Active Squad vs Inn */}
          <div className="space-y-2">
            {isPartyFull ? (
              <div>
                <div className="text-xs text-amber-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>前線部隊（定員4名）の誰と入れ替えますか？</span>
                  <span className="text-[10px] text-slate-400">※いつでも宿屋で交代可能</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                  {activeParty.map((member, idx) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        SoundEngine.playCursor();
                        setSelectedSwapSlot(idx);
                      }}
                      className={`p-1.5 rounded border flex flex-col items-center text-xs transition-all ${
                        selectedSwapSlot === idx
                          ? 'border-amber-400 bg-amber-950/80 ring-2 ring-amber-400'
                          : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      <PixelSprite character={member} size={36} />
                      <span className="text-[11px] font-bold text-slate-200 truncate w-full text-center">
                        {member.name}
                      </span>
                      <span className="text-[9px] text-slate-400">枠 {idx + 1}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={selectedSwapSlot === null}
                    onClick={() => {
                      if (selectedSwapSlot !== null) {
                        SoundEngine.playConfirm();
                        onConfirm(selectedSwapSlot);
                      }
                    }}
                    className={`flex-1 py-2.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      selectedSwapSlot !== null
                        ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                        : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>選択した隊士と交代して前線に配属</span>
                  </button>

                  <button
                    onClick={() => {
                      SoundEngine.playConfirm();
                      onSendToInn();
                    }}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-600"
                  >
                    宿屋（控え）で待機
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    SoundEngine.playConfirm();
                    onConfirm();
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs sm:text-sm font-bold rounded-lg border-2 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>前線部隊（出撃メンバー）に迎え入れる！</span>
                </button>
                <button
                  onClick={() => {
                    SoundEngine.playConfirm();
                    onSendToInn();
                  }}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-600"
                >
                  宿屋で待機
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
