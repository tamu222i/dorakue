/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Character, Skill } from '../domain/models/types.ts';
import {
  getCharacterBreathingProgression,
  isUltimateSkill
} from '../domain/services/SkillProgressionService.ts';
import { FuriganaText } from './Ruby.tsx';
import { Lock, Sparkles, Wind, Flame, Zap, Swords, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BreathingProgressViewProps {
  character: Character;
  compact?: boolean;
}

export const BreathingProgressView: React.FC<BreathingProgressViewProps> = ({
  character,
  compact = false
}) => {
  const progress = getCharacterBreathingProgression(character);

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'water':
        return { border: 'border-cyan-500/60', bg: 'bg-cyan-950/40', text: 'text-cyan-300', badge: 'bg-cyan-900/80 text-cyan-200 border-cyan-500' };
      case 'flame':
      case 'sun':
        return { border: 'border-rose-500/60', bg: 'bg-rose-950/40', text: 'text-rose-300', badge: 'bg-rose-900/80 text-rose-200 border-rose-500' };
      case 'thunder':
        return { border: 'border-amber-500/60', bg: 'bg-amber-950/40', text: 'text-amber-300', badge: 'bg-amber-900/80 text-amber-200 border-amber-500' };
      case 'beast':
      case 'wind':
        return { border: 'border-emerald-500/60', bg: 'bg-emerald-950/40', text: 'text-emerald-300', badge: 'bg-emerald-900/80 text-emerald-200 border-emerald-500' };
      case 'mist':
        return { border: 'border-slate-400/60', bg: 'bg-slate-900/60', text: 'text-slate-200', badge: 'bg-slate-800 text-slate-200 border-slate-500' };
      case 'love':
      case 'flower':
        return { border: 'border-pink-500/60', bg: 'bg-pink-950/40', text: 'text-pink-300', badge: 'bg-pink-900/80 text-pink-200 border-pink-500' };
      case 'insect':
        return { border: 'border-purple-500/60', bg: 'bg-purple-950/40', text: 'text-purple-300', badge: 'bg-purple-900/80 text-purple-200 border-purple-500' };
      case 'stone':
        return { border: 'border-stone-500/60', bg: 'bg-stone-900/60', text: 'text-stone-300', badge: 'bg-stone-800 text-stone-200 border-stone-500' };
      case 'serpent':
        return { border: 'border-indigo-500/60', bg: 'bg-indigo-950/40', text: 'text-indigo-300', badge: 'bg-indigo-900/80 text-indigo-200 border-indigo-500' };
      case 'moon':
        return { border: 'border-violet-500/60', bg: 'bg-violet-950/40', text: 'text-violet-300', badge: 'bg-violet-900/80 text-violet-200 border-violet-500' };
      default:
        return { border: 'border-slate-600', bg: 'bg-slate-900/60', text: 'text-slate-300', badge: 'bg-slate-800 text-slate-300 border-slate-600' };
    }
  };

  const styleTheme = getStyleColor(character.breathStyle);
  const percentComplete = progress.totalBreathCount > 0
    ? Math.round((progress.learnedBreathCount / progress.totalBreathCount) * 100)
    : 100;

  const titlePrefix = progress.isDemon ? '血鬼術' : '全集中・呼吸の型';

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Progression Gauge Header */}
      <div className={`p-2.5 rounded border ${styleTheme.border} ${styleTheme.bg} flex flex-col gap-1.5`}>
        <div className="flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-1.5">
            <Wind className={`w-4 h-4 ${styleTheme.text}`} />
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>{titlePrefix} 会得進捗</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${styleTheme.badge}`}>
                {character.breathStyle !== 'none' ? character.breathStyle : '無属性'}
              </span>
            </span>
          </div>

          <div className="text-xs font-mono font-bold flex items-center gap-1">
            <span className="text-amber-300">{progress.learnedBreathCount}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-200">{progress.totalBreathCount} 型</span>
            <span className="text-[10px] text-emerald-400 ml-1">({percentComplete}%)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950/80 rounded-full h-2 border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-yellow-300 transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* Secret summary hint */}
        <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
          <span className="flex items-center gap-1 text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>会得済み: {progress.learnedBreathCount} 型</span>
          </span>
          <span className="flex items-center gap-1 text-amber-300 font-medium">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>未解禁シークレット: 残り {progress.unlearnedBreathCount} 型</span>
          </span>
        </div>
      </div>

      {/* 1. Learned Breathing Techniques */}
      <div className="flex flex-col gap-1.5">
        <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>修得済みの型（{progress.learnedBreaths.length}）</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">戦闘で選択可能</span>
        </div>

        {progress.learnedBreaths.length === 0 ? (
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 text-center">
            まだ呼吸法を会得していません。実戦・修練を重ねてLv.3以上に成長することで目覚めます。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5">
            {progress.learnedBreaths.map((skill) => {
              const isUlt = isUltimateSkill(character, skill);
              return (
                <div
                  key={skill.id}
                  className={`p-2 rounded border transition-colors ${
                    isUlt
                      ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-rose-950/60 border-amber-400/80 shadow-sm'
                      : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-white">
                        <FuriganaText text={skill.name} />
                      </span>
                      {skill.katagaki && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {skill.katagaki}
                        </span>
                      )}
                      {isUlt && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-gradient-to-r from-amber-500 to-yellow-300 text-black border border-yellow-200 shadow-sm animate-pulse">
                          ★ 最強奥義 ★
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] font-mono font-bold text-cyan-300 shrink-0 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                      {skill.bpCost} BP
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                    <span className="text-amber-200">威力: {skill.power}</span>
                    <span>•</span>
                    <span>範囲: {skill.target === 'all' ? '敵全体' : skill.target === 'ally_all' ? '味方全体' : skill.target === 'ally_single' ? '味方単体' : '敵単体'}</span>
                  </div>

                  <div className="text-[10px] text-slate-300 leading-relaxed">
                    {skill.description}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Unacquired Secret Breathing Techniques (シークレットだが量と条件がわかる) */}
      {progress.unlearnedSecrets.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>未解禁の型（シークレット・残り {progress.unlearnedSecrets.length} 型）</span>
            </span>
            <span className="text-[10px] text-amber-400 font-mono">成長で解放</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {progress.unlearnedSecrets.map((secret, idx) => (
              <div
                key={`secret_${secret.level}_${idx}`}
                className={`p-2 rounded border border-dashed flex flex-col gap-1 select-none transition-all ${
                  secret.isUltimate
                    ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400/70'
                    : 'bg-slate-950/50 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                      <Lock className={`w-2.5 h-2.5 ${secret.isUltimate ? 'text-amber-400' : 'text-slate-400'}`} />
                    </div>
                    <span className={`font-mono text-xs font-bold tracking-widest ${secret.isUltimate ? 'text-amber-300' : 'text-slate-400'}`}>
                      {secret.isUltimate ? '【極限奥義】？？？？？？' : '【未解禁】？？？？？？'}
                    </span>
                    {secret.isUltimate && (
                      <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-950 border border-amber-500/60 text-amber-300">
                        最終奥義
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-amber-400 shrink-0">
                    Lv.{secret.level} で開眼
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 italic pl-5">
                  {secret.isUltimate
                    ? '「極限の死闘と鍛錬の果てに、全集中で放つ魂の最強奥義が覚醒する……」'
                    : '「日々の任務と鍛錬を積み重ねることで、未知なる強力な型へと到達する……」'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Starter Non-Breathing Skills (基礎技) */}
      {!compact && progress.starterSkills.length > 0 && (
        <div className="flex flex-col gap-1 mt-1 pt-1.5 border-t border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Swords className="w-3 h-3 text-slate-500" />
            <span>基礎技・素朴な攻撃（無呼吸 / 0BP）</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {progress.starterSkills.map(sk => (
              <span
                key={sk.id}
                className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1"
              >
                <span>{sk.name}</span>
                <span className="text-slate-500 font-mono">(威力:{sk.power})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
