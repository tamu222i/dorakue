/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Character, Skill, BreathStyle } from '../domain/models/types.ts';
import { DetailedLevelUp } from '../domain/aggregates/PartyAggregate.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { FuriganaText } from './Ruby.tsx';
import { getCharacterCutInQuote, isUltimateSkill } from '../domain/services/SkillProgressionService.ts';
import {
  Sparkles,
  Flame,
  Zap,
  Wind,
  Droplets,
  Sword,
  Shield,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Award,
  Star,
  Activity
} from 'lucide-react';

interface VictoryLevelUpModalProps {
  levelUps: DetailedLevelUp[];
  expGained: number;
  moneyGained: number;
  isOpen: boolean;
  onClose: () => void;
}

// Elemental styles for flashy breathing acquisition
const BREATH_THEME_STYLES: Record<BreathStyle, {
  border: string;
  bgGradient: string;
  glow: string;
  badgeBg: string;
  textColor: string;
  icon: React.ReactNode;
  crestLabel: string;
}> = {
  water: {
    border: 'border-cyan-400',
    bgGradient: 'from-cyan-950 via-slate-900 to-blue-950',
    glow: 'shadow-[0_0_50px_rgba(34,211,238,0.5)]',
    badgeBg: 'bg-cyan-900/80 border-cyan-400 text-cyan-200',
    textColor: 'text-cyan-300',
    icon: <Droplets className="w-5 h-5 text-cyan-400 animate-bounce" />,
    crestLabel: '水'
  },
  flame: {
    border: 'border-orange-500',
    bgGradient: 'from-amber-950 via-red-950 to-orange-950',
    glow: 'shadow-[0_0_50px_rgba(249,115,22,0.6)]',
    badgeBg: 'bg-red-900/80 border-orange-400 text-orange-200',
    textColor: 'text-orange-400',
    icon: <Flame className="w-5 h-5 text-orange-400 animate-pulse" />,
    crestLabel: '炎'
  },
  thunder: {
    border: 'border-yellow-400',
    bgGradient: 'from-amber-950 via-slate-900 to-yellow-950',
    glow: 'shadow-[0_0_50px_rgba(250,204,21,0.6)]',
    badgeBg: 'bg-yellow-900/80 border-yellow-300 text-yellow-100',
    textColor: 'text-yellow-300',
    icon: <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />,
    crestLabel: '雷'
  },
  beast: {
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    glow: 'shadow-[0_0_50px_rgba(52,211,153,0.5)]',
    badgeBg: 'bg-emerald-900/80 border-emerald-400 text-emerald-200',
    textColor: 'text-emerald-300',
    icon: <Wind className="w-5 h-5 text-emerald-400 animate-pulse" />,
    crestLabel: '獣'
  },
  sun: {
    border: 'border-amber-400 ring-2 ring-red-500',
    bgGradient: 'from-red-950 via-amber-950 to-orange-950',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.7)]',
    badgeBg: 'bg-gradient-to-r from-red-800 to-amber-700 border-amber-300 text-amber-100',
    textColor: 'text-amber-300',
    icon: <Flame className="w-5 h-5 text-amber-300 animate-spin" />,
    crestLabel: '日'
  },
  mist: {
    border: 'border-slate-300',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-950',
    glow: 'shadow-[0_0_45px_rgba(203,213,225,0.4)]',
    badgeBg: 'bg-slate-800 border-slate-300 text-slate-200',
    textColor: 'text-slate-200',
    icon: <Wind className="w-5 h-5 text-slate-300 animate-pulse" />,
    crestLabel: '霞'
  },
  insect: {
    border: 'border-purple-400',
    bgGradient: 'from-purple-950 via-slate-900 to-fuchsia-950',
    glow: 'shadow-[0_0_45px_rgba(192,132,252,0.5)]',
    badgeBg: 'bg-purple-900/80 border-purple-400 text-purple-200',
    textColor: 'text-purple-300',
    icon: <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />,
    crestLabel: '蟲'
  },
  wind: {
    border: 'border-teal-400',
    bgGradient: 'from-teal-950 via-slate-900 to-emerald-950',
    glow: 'shadow-[0_0_45px_rgba(45,212,191,0.5)]',
    badgeBg: 'bg-teal-900/80 border-teal-400 text-teal-200',
    textColor: 'text-teal-300',
    icon: <Wind className="w-5 h-5 text-teal-300 animate-bounce" />,
    crestLabel: '風'
  },
  love: {
    border: 'border-pink-400',
    bgGradient: 'from-pink-950 via-rose-950 to-slate-950',
    glow: 'shadow-[0_0_50px_rgba(244,114,182,0.6)]',
    badgeBg: 'bg-pink-900/80 border-pink-400 text-pink-200',
    textColor: 'text-pink-300',
    icon: <Heart className="w-5 h-5 text-pink-400 animate-pulse" />,
    crestLabel: '恋'
  },
  stone: {
    border: 'border-stone-400',
    bgGradient: 'from-stone-900 via-amber-950 to-stone-950',
    glow: 'shadow-[0_0_45px_rgba(168,162,158,0.5)]',
    badgeBg: 'bg-stone-800 border-stone-400 text-stone-200',
    textColor: 'text-stone-300',
    icon: <Shield className="w-5 h-5 text-stone-300" />,
    crestLabel: '岩'
  },
  serpent: {
    border: 'border-indigo-400',
    bgGradient: 'from-indigo-950 via-slate-900 to-purple-950',
    glow: 'shadow-[0_0_45px_rgba(129,140,248,0.5)]',
    badgeBg: 'bg-indigo-900/80 border-indigo-400 text-indigo-200',
    textColor: 'text-indigo-300',
    icon: <Droplets className="w-5 h-5 text-indigo-300" />,
    crestLabel: '蛇'
  },
  flower: {
    border: 'border-rose-400',
    bgGradient: 'from-rose-950 via-slate-900 to-pink-950',
    glow: 'shadow-[0_0_45px_rgba(251,113,133,0.5)]',
    badgeBg: 'bg-rose-900/80 border-rose-400 text-rose-200',
    textColor: 'text-rose-300',
    icon: <Sparkles className="w-5 h-5 text-rose-300 animate-pulse" />,
    crestLabel: '花'
  },
  moon: {
    border: 'border-rose-500',
    bgGradient: 'from-red-950 via-slate-950 to-purple-950',
    glow: 'shadow-[0_0_55px_rgba(225,29,72,0.6)]',
    badgeBg: 'bg-rose-950 border-rose-500 text-rose-200',
    textColor: 'text-rose-400',
    icon: <Star className="w-5 h-5 text-rose-400 animate-spin" />,
    crestLabel: '月'
  },
  blood: {
    border: 'border-red-600',
    bgGradient: 'from-red-950 via-black to-slate-950',
    glow: 'shadow-[0_0_55px_rgba(220,38,38,0.7)]',
    badgeBg: 'bg-red-950 border-red-500 text-red-100',
    textColor: 'text-red-400',
    icon: <Flame className="w-5 h-5 text-red-500 animate-pulse" />,
    crestLabel: '血'
  },
  none: {
    border: 'border-amber-400',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-950',
    glow: 'shadow-[0_0_45px_rgba(245,158,11,0.5)]',
    badgeBg: 'bg-slate-800 border-amber-400 text-amber-200',
    textColor: 'text-amber-300',
    icon: <Sword className="w-5 h-5 text-amber-400 animate-bounce" />,
    crestLabel: '滅'
  }
};

export const VictoryLevelUpModal: React.FC<VictoryLevelUpModalProps> = ({
  levelUps,
  expGained,
  moneyGained,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Play fanfare when modal opens or character changes
  useEffect(() => {
    if (!isOpen || levelUps.length === 0) return;
    const current = levelUps[currentIndex];
    if (current && current.newSkills.length > 0) {
      // Flashy breath fanfare!
      SoundEngine.playNewSkillFanfare();
    } else {
      // Standard level up fanfare
      SoundEngine.playLevelUp();
    }
  }, [isOpen, currentIndex, levelUps]);

  if (!isOpen || levelUps.length === 0) return null;

  const current = levelUps[currentIndex] || levelUps[0];
  const char = current.character;
  const hasNewSkills = current.newSkills.length > 0;
  const primarySkill = hasNewSkills ? current.newSkills[0] : null;
  const isPrimaryUltimate = primarySkill ? isUltimateSkill(char, primarySkill) : false;

  const theme = primarySkill && BREATH_THEME_STYLES[primarySkill.breathStyle]
    ? BREATH_THEME_STYLES[primarySkill.breathStyle]
    : BREATH_THEME_STYLES[char.breathStyle] || BREATH_THEME_STYLES.none;

  const quote = primarySkill ? getCharacterCutInQuote(char, primarySkill) : null;

  const handleNext = () => {
    SoundEngine.playConfirm();
    if (currentIndex < levelUps.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    SoundEngine.playCursor();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          key={`levelup_${currentIndex}_${char.id}`}
          initial={{ scale: 0.85, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className={`relative w-full max-w-xl bg-gradient-to-b ${theme.bgGradient} border-4 ${theme.border} rounded-xl ${theme.glow} p-4 sm:p-6 text-white overflow-hidden font-['DotGothic16',monospace]`}
        >
          {/* Animated decorative radiant backdrop beams */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none animate-pulse" />

          {/* Top Banner: FLASHY HEADER */}
          <div className="relative z-10 flex flex-col items-center mb-3">
            {hasNewSkills ? (
              <div className="flex flex-col items-center">
                {/* Kanji Crest Stamp with breathing flame/water aura */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl animate-bounce">⚡</span>
                  <div className="w-10 h-10 rounded-full border-2 border-amber-300 bg-red-950 flex items-center justify-center font-black text-xl text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.8)]">
                    {theme.crestLabel}
                  </div>
                  <span className="text-xl animate-bounce">⚡</span>
                </div>

                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
                  <h2 className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-pulse">
                    {isPrimaryUltimate ? '【 極 限 奥 義 会 得 ！！ 】' : '【 新 呼 吸 開 眼 ！！ 】'}
                  </h2>
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
                </div>
                <div className="text-[11px] text-amber-200/90 font-bold mt-0.5 tracking-wider bg-black/60 px-3 py-0.5 rounded-full border border-amber-400/50">
                  修練の果てに全集中が極致に達し、新たな技を体得した！
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400 animate-bounce" />
                  <h2 className="text-xl sm:text-2xl font-black tracking-widest text-amber-300 text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    【 レ ベ ル ア ッ プ ！！ 】
                  </h2>
                  <Award className="w-6 h-6 text-amber-400 animate-bounce" />
                </div>
                <div className="text-[11px] text-slate-300 font-bold mt-0.5 tracking-wider bg-black/50 px-3 py-0.5 rounded-full border border-slate-600">
                  死闘を制し、隊士の全能力が大幅に向上した！
                </div>
              </div>
            )}
          </div>

          {/* Character Badge & Level Transition */}
          <div className="relative z-10 flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-700 rounded-lg p-2.5 sm:p-3 mb-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center p-1 bg-slate-950 rounded-lg border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                <PixelSprite character={char} size={48} className="animate-bounce" />
              </div>
              <div>
                <div className="text-[11px] text-amber-400 font-bold tracking-wider">
                  {char.title || '鬼殺隊士'}
                </div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span>{char.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {char.breathStyle === 'none' ? '無呼吸' : `${char.breathStyle}の呼吸`}
                  </span>
                </div>
              </div>
            </div>

            {/* Level Transition Pill */}
            <div className="flex items-center gap-1.5 bg-black/70 px-3 py-1.5 rounded-lg border border-amber-400/80 shadow-md">
              <span className="text-slate-400 text-xs font-mono">Lv.{current.oldLevel}</span>
              <span className="text-amber-400 font-bold text-sm animate-pulse">➔</span>
              <span className="text-amber-300 font-black text-base sm:text-lg font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">
                Lv.{current.newLevel}
              </span>
            </div>
          </div>

          {/* FLASHY NEW BREATHING TECHNIQUE SPOTLIGHT (if learned) */}
          {hasNewSkills && (
            <div className="relative z-10 mb-3 space-y-2">
              {current.newSkills.map((sk) => {
                const isUlt = isUltimateSkill(char, sk);
                return (
                  <motion.div
                    key={sk.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`relative p-3 rounded-lg border-2 ${theme.border} bg-slate-950/90 shadow-[0_0_25px_rgba(0,0,0,0.8)] overflow-hidden`}
                  >
                    {/* Shimmering background accent */}
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-xl pointer-events-none" />

                    {/* Technique Header */}
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {theme.icon}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                          {sk.katagaki || '新呼吸'}
                        </span>
                        {isUlt && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-red-600 to-amber-600 text-white border border-amber-300 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
                            ★ 最強奥義 ★
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-amber-300 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        会得レベル: Lv.{current.newLevel}
                      </div>
                    </div>

                    {/* Technique Name (Grand display with furigana/ruby) */}
                    <div className="text-lg sm:text-xl font-black text-amber-200 tracking-wide my-1 flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      <span>『</span>
                      <FuriganaText text={sk.name} />
                      <span>』</span>
                    </div>

                    {/* BP Cost, Power, and Target attributes */}
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono bg-black/60 p-1.5 rounded border border-slate-800 my-1.5">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-[9px]">消費呼吸力(BP)</span>
                        <span className="text-cyan-300 font-bold">{sk.bpCost} BP</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-[9px]">技の威力</span>
                        <span className="text-rose-400 font-bold">{sk.power}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-[9px]">対象範囲</span>
                        <span className="text-amber-300 font-bold">
                          {sk.target === 'all' ? '敵全体' : sk.target === 'ally_all' ? '味方全体' : sk.target === 'ally_single' ? '味方単体' : '敵単体'}
                        </span>
                      </div>
                    </div>

                    {/* Technique Description */}
                    <div className="text-xs text-slate-200 bg-slate-900/80 p-2 rounded border border-slate-800 leading-relaxed">
                      {sk.description}
                    </div>

                    {/* Dramatic Character Quote */}
                    {quote && (
                      <div className="mt-2 bg-gradient-to-r from-red-950/70 via-black to-slate-950/70 border-l-4 border-amber-400 p-2 rounded text-xs text-amber-100 italic leading-relaxed">
                        <div className="font-bold text-amber-300 text-[10px] mb-0.5">
                          【{quote.subText}】
                        </div>
                        <div>「{quote.shout}」</div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Stat Growth Grid (全能力向上) */}
          <div className="relative z-10 bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 sm:p-3 mb-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                基礎能力の上昇値
              </span>
              <span className="text-[10px] text-slate-400">
                HP・BP全回復！
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 text-center font-mono">
              <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded">
                <span className="text-[9px] text-slate-400 block flex items-center justify-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 text-rose-400" /> HP
                </span>
                <span className="text-rose-300 font-bold text-xs sm:text-sm">
                  +{current.statGains.hp}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded">
                <span className="text-[9px] text-slate-400 block flex items-center justify-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-cyan-400" /> BP
                </span>
                <span className="text-cyan-300 font-bold text-xs sm:text-sm">
                  +{current.statGains.bp}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded">
                <span className="text-[9px] text-slate-400 block flex items-center justify-center gap-0.5">
                  <Sword className="w-2.5 h-2.5 text-amber-400" /> 攻撃
                </span>
                <span className="text-amber-300 font-bold text-xs sm:text-sm">
                  +{current.statGains.attack}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded">
                <span className="text-[9px] text-slate-400 block flex items-center justify-center gap-0.5">
                  <Shield className="w-2.5 h-2.5 text-emerald-400" /> 防御
                </span>
                <span className="text-emerald-300 font-bold text-xs sm:text-sm">
                  +{current.statGains.defense}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded">
                <span className="text-[9px] text-slate-400 block flex items-center justify-center gap-0.5">
                  <Wind className="w-2.5 h-2.5 text-indigo-400" /> 素早さ
                </span>
                <span className="text-indigo-300 font-bold text-xs sm:text-sm">
                  +{current.statGains.speed}
                </span>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between px-1">
              <span>獲得経験値: +{expGained} EXP</span>
              <span>獲得軍資金: +{moneyGained} 銭</span>
              <span>次のLvまで: あと {Math.max(0, char.nextExp - char.exp)} EXP</span>
            </div>
          </div>

          {/* Footer Controls: Pagination (if multiple members) & Confirm Button */}
          <div className="relative z-10 flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
            {levelUps.length > 1 ? (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentIndex === 0}
                  onClick={handlePrev}
                  className={`px-2.5 py-2 rounded text-xs font-bold flex items-center gap-1 border ${
                    currentIndex > 0
                      ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">前へ</span>
                </button>
                <span className="text-xs text-amber-300 font-mono px-2 py-1 bg-slate-950 rounded border border-slate-800">
                  隊士 {currentIndex + 1} / {levelUps.length}
                </span>
                <button
                  disabled={currentIndex === levelUps.length - 1}
                  onClick={handleNext}
                  className={`px-2.5 py-2 rounded text-xs font-bold flex items-center gap-1 border ${
                    currentIndex < levelUps.length - 1
                      ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">次へ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>更なる高みへ！</span>
              </div>
            )}

            <button
              onClick={handleNext}
              className="py-2.5 px-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm rounded-lg border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-2 active:scale-95 transition-transform"
            >
              {currentIndex < levelUps.length - 1 ? (
                <>
                  <span>次の隊士を確認</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>戦場を後にする（完了）</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
