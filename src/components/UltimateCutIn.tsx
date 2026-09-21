/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Character, Skill } from '../domain/models/types.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { getCharacterCutInQuote } from '../domain/services/SkillProgressionService.ts';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { Zap, Flame, Droplets, Sparkles, Wind } from 'lucide-react';

interface UltimateCutInProps {
  character: Character;
  skill: Skill;
  onComplete: () => void;
}

export const UltimateCutIn: React.FC<UltimateCutInProps> = ({
  character,
  skill,
  onComplete
}) => {
  const [phase, setPhase] = useState<'enter' | 'slash' | 'exit'>('enter');
  const quoteData = getCharacterCutInQuote(character, skill);

  useEffect(() => {
    // Play dramatic sound effects
    SoundEngine.playUltimateCutIn();
    const tSound = setTimeout(() => {
      SoundEngine.playSlash();
    }, 450);

    // Animation phases
    const tSlash = setTimeout(() => {
      setPhase('slash');
    }, 400);

    const tExit = setTimeout(() => {
      setPhase('exit');
    }, 1300);

    const tEnd = setTimeout(() => {
      onComplete();
    }, 1600);

    return () => {
      clearTimeout(tSound);
      clearTimeout(tSlash);
      clearTimeout(tExit);
      clearTimeout(tEnd);
    };
  }, [onComplete]);

  // Style icon selector
  const renderStyleIcon = () => {
    switch (skill.breathStyle) {
      case 'flame':
      case 'sun':
        return <Flame className="w-8 h-8 text-amber-400 animate-pulse" />;
      case 'thunder':
        return <Zap className="w-8 h-8 text-yellow-300 animate-bounce" />;
      case 'water':
        return <Droplets className="w-8 h-8 text-cyan-400 animate-pulse" />;
      case 'wind':
      case 'mist':
        return <Wind className="w-8 h-8 text-emerald-300 animate-pulse" />;
      default:
        return <Sparkles className="w-8 h-8 text-red-400 animate-spin" />;
    }
  };

  return (
    <div
      id="ultimate-cut-in-overlay"
      onClick={onComplete}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden cursor-pointer select-none transition-opacity duration-300 ${
        phase === 'exit' ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: 'rgba(5, 5, 10, 0.94)',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* Radial Speed lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 animate-pulse"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 20%, ${quoteData.accentColor}33 70%, #000 100%),
                       repeating-conic-gradient(from 0deg, transparent 0deg 4deg, rgba(255,255,255,0.08) 5deg 7deg)`
        }}
      />

      {/* Screen slash flash */}
      {phase === 'slash' && (
        <div
          className="absolute inset-0 bg-white/30 pointer-events-none animate-ping"
          style={{ animationDuration: '300ms' }}
        />
      )}

      {/* Dynamic Slanted Cut-in Ribbon (Diagonal Sash) */}
      <div
        className={`absolute w-[140%] h-44 sm:h-56 -rotate-6 transform transition-all duration-500 ease-out border-y-4 shadow-2xl flex items-center overflow-hidden ${
          phase === 'enter'
            ? '-translate-x-full opacity-0'
            : 'translate-x-0 opacity-100'
        }`}
        style={{
          background: `linear-gradient(90deg, #09090b 0%, #18181b 30%, ${quoteData.accentColor}cc 65%, #09090b 100%)`,
          borderColor: quoteData.accentColor,
          boxShadow: `0 0 50px ${quoteData.accentColor}88, inset 0 0 30px rgba(0,0,0,0.8)`
        }}
      >
        {/* Background Energy Streak lines inside Ribbon */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 15px, ${quoteData.accentColor} 15px, ${quoteData.accentColor} 30px)`
          }}
        />

        {/* Character Visual Showcase */}
        <div className="relative z-10 flex items-center gap-4 sm:gap-8 px-6 sm:px-20 max-w-5xl mx-auto w-full rotate-6">
          {/* Avatar frame with glowing aura */}
          <div className="relative flex-shrink-0">
            <div
              className="absolute -inset-3 rounded-2xl blur-md opacity-80 animate-pulse"
              style={{ backgroundColor: quoteData.accentColor }}
            />
            <div
              className="relative p-2 rounded-xl bg-black/80 border-2 shadow-2xl transform scale-110 sm:scale-125 origin-center"
              style={{ borderColor: quoteData.accentColor }}
            >
              <PixelSprite character={character} size={96} />
            </div>

            {/* Glowing Eye Flare */}
            <div
              className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white animate-ping"
              style={{ boxShadow: `0 0 16px 6px ${quoteData.accentColor}` }}
            />
          </div>

          {/* Dialogue & Breath Title */}
          <div className="flex-1 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {/* Top Subtext Banner */}
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs sm:text-sm font-black tracking-widest bg-black/60 border border-amber-400/60 text-amber-300">
                {renderStyleIcon()}
                {quoteData.subText}
              </span>
              <span className="text-xs text-stone-400 font-mono tracking-wider hidden sm:inline">
                威 力 【{skill.power}】 究 極 奥 義
              </span>
            </div>

            {/* Character Name & Shout Quote */}
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-amber-100 tracking-wide mb-1 leading-tight font-serif">
              「{quoteData.shout}」
            </h2>
            <div className="text-xs sm:text-sm font-bold text-stone-300 flex items-center gap-2">
              <span className="text-amber-400 font-black">{character.name}</span>
              <span className="text-stone-400">（{character.rank}）</span>
            </div>
          </div>
        </div>
      </div>

      {/* Massive Technique Name Banner (Bottom Slam) */}
      <div
        className={`absolute bottom-12 sm:bottom-16 z-20 text-center px-4 transition-all duration-500 ease-out transform ${
          phase === 'enter' ? 'translate-y-12 opacity-0 scale-90' : 'translate-y-0 opacity-100 scale-100'
        }`}
      >
        <div className="inline-block relative">
          {/* Back Glow */}
          <span
            className="absolute -inset-4 blur-xl opacity-60 rounded-full"
            style={{ backgroundColor: quoteData.accentColor }}
          />
          {/* Main Technique Kanji Label */}
          <div
            className="relative px-8 py-3 rounded-2xl bg-black/85 border-2 shadow-2xl flex flex-col items-center"
            style={{ borderColor: quoteData.accentColor }}
          >
            <div className="text-xs sm:text-sm font-bold tracking-widest text-amber-400 uppercase">
              ★ 最 強 奥 義 発 動 ★
            </div>
            <div
              className="text-2xl sm:text-4xl md:text-5xl font-black tracking-widest font-serif drop-shadow-[0_4px_12px_rgba(0,0,0,1)]"
              style={{
                color: '#ffffff',
                textShadow: `0 0 20px ${quoteData.accentColor}, 0 0 40px ${quoteData.accentColor}`
              }}
            >
              {skill.name}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-stone-400 animate-pulse tracking-widest">
          画面タップでスキップ
        </p>
      </div>
    </div>
  );
};
