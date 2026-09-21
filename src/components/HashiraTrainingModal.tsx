/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Character } from '../domain/models/types.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { Swords, Flame, Sparkles, CheckCircle, XCircle, RotateCcw, Award, Target, Zap } from 'lucide-react';

interface HashiraTrainingModalProps {
  hashira: Character;
  bonusCharacters?: Character[];
  isOpen: boolean;
  onClose: () => void;
  onSuccessRecruit: (hashira: Character, bonusCharacters?: Character[]) => void;
}

interface TrainingLesson {
  id: string;
  name: string;
  description: string;
  targetSpeed: number; // speed of the cursor oscillation
  targetZoneSize: number; // percentage width of the sweet spot
  targetZoneStart: number; // percentage offset of the sweet spot
  targetZoneText: string;
  drillQuote: string;
}

export const HashiraTrainingModal: React.FC<HashiraTrainingModalProps> = ({
  hashira,
  bonusCharacters = [],
  isOpen,
  onClose,
  onSuccessRecruit
}) => {
  // 3 sequential drills of Hashira training
  const [currentRound, setCurrentRound] = useState<number>(1); // 1, 2, 3
  const [drillSuccesses, setDrillSuccesses] = useState<boolean[]>([]);
  const [pointerPos, setPointerPos] = useState<number>(50); // 0 to 100%
  const [isOscillating, setIsOscillating] = useState<boolean>(true);
  const [drillResult, setDrillResult] = useState<'idle' | 'perfect' | 'great' | 'miss'>('idle');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const animRef = useRef<number | null>(null);
  const dirRef = useRef<number>(1);
  const posRef = useRef<number>(10);

  // Lesson configuration depending on Hashira
  const getLessons = useCallback((name: string): TrainingLesson[] => {
    return [
      {
        id: 'drill_1',
        name: '壱の試練: 基礎体力・足腰の強化',
        description: '柱の素早い打ち込みを見極め、反動に耐える足場を固めよ！',
        targetSpeed: 1.4,
        targetZoneSize: 22,
        targetZoneStart: 39,
        targetZoneText: '全集中・正中線',
        drillQuote: `${name}「まずは足腰！刃筋をぶらすな、踏み込め！」`
      },
      {
        id: 'drill_2',
        name: '弐の試練: 呼吸の巡りと筋力限界突破',
        description: '心拍数を急上昇させ、肺の隅々まで酸素を巡らせるタイミングを掴め！',
        targetSpeed: 2.1,
        targetZoneSize: 18,
        targetZoneStart: 41,
        targetZoneText: '全集中・常中',
        drillQuote: `${name}「呼吸を止めると血管が破裂するぞ！巡らせ続けろ！」`
      },
      {
        id: 'drill_3',
        name: '参の試練: 柱の奥義の一撃を受け止めよ',
        description: '極限の速度で放たれる柱の木刀！一瞬の隙に刃を合わせて認めてもらえ！',
        targetSpeed: 2.8,
        targetZoneSize: 14,
        targetZoneStart: 43,
        targetZoneText: '心技体・合一',
        drillQuote: `${name}「これが柱の太刀筋だ！全身全霊で跳ね返してみせろ！！」`
      }
    ];
  }, []);

  const lessons = getLessons(hashira.name);
  const currentLesson = lessons[currentRound - 1] || lessons[0];

  // Oscillation loop for the timing bar
  useEffect(() => {
    if (!isOpen || !isOscillating || isCompleted) return;

    let speed = currentLesson.targetSpeed;
    const animate = () => {
      posRef.current += dirRef.current * speed;
      if (posRef.current >= 98) {
        posRef.current = 98;
        dirRef.current = -1;
      } else if (posRef.current <= 2) {
        posRef.current = 2;
        dirRef.current = 1;
      }
      setPointerPos(posRef.current);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen, isOscillating, isCompleted, currentLesson.targetSpeed]);

  if (!isOpen) return null;

  // Handle User Striking the Timing Bar
  const handleStrike = () => {
    if (!isOscillating || isCompleted) return;

    setIsOscillating(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const hit = pointerPos;
    const zoneStart = currentLesson.targetZoneStart;
    const zoneEnd = zoneStart + currentLesson.targetZoneSize;
    const sweetSpotMid = zoneStart + currentLesson.targetZoneSize / 2;

    const isHit = hit >= zoneStart && hit <= zoneEnd;
    const isPerfect = Math.abs(hit - sweetSpotMid) <= 4;

    if (isHit) {
      if (isPerfect) {
        SoundEngine.playCritical();
        setDrillResult('perfect');
        setFeedbackMessage('【会心の太刀筋！！】柱の打ち込みを寸分狂わず跳ね返した！');
      } else {
        SoundEngine.playAttack();
        setDrillResult('great');
        setFeedbackMessage('【合格！！】見事に柱の気迫を受け止めた！');
      }

      const nextSuccesses = [...drillSuccesses, true];
      setDrillSuccesses(nextSuccesses);

      setTimeout(() => {
        if (currentRound < 3) {
          // Advance to next drill
          setCurrentRound(r => r + 1);
          setDrillResult('idle');
          setFeedbackMessage('');
          posRef.current = 10;
          dirRef.current = 1;
          setIsOscillating(true);
        } else {
          // All 3 drills cleared!
          setIsCompleted(true);
          SoundEngine.playFanfare();
        }
      }, 1300);
    } else {
      // Missed timing
      SoundEngine.playCancel();
      setDrillResult('miss');
      setFeedbackMessage('【不合格…！】太刀筋が逸れた！呼吸を整えてもう一度挑め！');
    }
  };

  // Retry the current drill or whole training
  const handleRetryDrill = () => {
    SoundEngine.playCursor();
    setDrillResult('idle');
    setFeedbackMessage('');
    posRef.current = 10;
    dirRef.current = 1;
    setIsOscillating(true);
  };

  const handleFinishRecruitment = () => {
    SoundEngine.playConfirm();
    onSuccessRecruit(hashira, bonusCharacters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn select-none">
      <div className="w-full max-w-xl">
        <DqFrame variant="gold" className="p-4 sm:p-5 relative flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-600/60 pb-2">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-amber-300">
                <FuriganaText text="柱稽古[はしらげいこ]・直伝[じきでん]の試練[しれん]" />
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2 py-1 rounded text-xs bg-slate-800 border border-slate-700"
            >
              諦めて戻る
            </button>
          </div>

          {/* Hashira Showcase */}
          <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-lg border border-slate-700">
            <PixelSprite character={hashira} size={56} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-amber-300">{hashira.name}</span>
                <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold">
                  {hashira.rank}
                </span>
                <span className="text-[10px] text-cyan-300">
                  {hashira.breathStyle}
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-1 italic font-serif">
                {currentLesson.drillQuote}
              </p>
            </div>
          </div>

          {/* Progress Indicators (3 Rounds) */}
          <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs">
            <span className="text-slate-400 font-bold">稽古達成度:</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(roundNum => {
                const passed = drillSuccesses.length >= roundNum;
                const active = currentRound === roundNum && !isCompleted;
                return (
                  <div
                    key={roundNum}
                    className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 border transition-all ${
                      passed
                        ? 'bg-emerald-700 border-emerald-400 text-white'
                        : active
                        ? 'bg-amber-600 border-amber-300 text-white animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {passed ? <CheckCircle className="w-3.5 h-3.5" /> : <span>第{roundNum}段</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Drill Instructions */}
          {!isCompleted ? (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
                  <Target className="w-4 h-4 text-rose-400" />
                  <span>{currentLesson.name}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentLesson.description}
                </p>
              </div>

              {/* TIMING BAR MINI-GAME */}
              <div className="bg-slate-950 p-4 rounded-lg border-2 border-slate-700 relative overflow-hidden">
                <div className="text-[11px] text-slate-400 mb-1 flex justify-between font-mono">
                  <span>← 呼吸を溜める</span>
                  <span className="text-amber-300 font-bold">【黄色のゾーンで一撃を放て！】</span>
                  <span>呼吸を吐く →</span>
                </div>

                {/* Bar Track */}
                <div className="w-full h-10 bg-slate-900 rounded-md relative border border-slate-600 overflow-hidden shadow-inner">
                  {/* Sweet Spot Zone */}
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-950 border-x-2 border-yellow-200 shadow-lg"
                    style={{
                      left: `${currentLesson.targetZoneStart}%`,
                      width: `${currentLesson.targetZoneSize}%`
                    }}
                  >
                    <span className="truncate px-1 select-none font-bold">
                      {currentLesson.targetZoneText}
                    </span>
                  </div>

                  {/* Moving Pointer (Nichirin Blade Strike) */}
                  <div
                    className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-rose-500 border-2 border-white rounded-sm shadow-md transition-none z-10"
                    style={{ left: `${pointerPos}%` }}
                  >
                    <div className="w-full h-full bg-white opacity-40 animate-ping" />
                  </div>
                </div>

                {/* Strike Action Button */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  {isOscillating ? (
                    <button
                      onClick={handleStrike}
                      className="w-full py-3 bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 active:scale-95 text-white font-bold rounded-lg border-2 border-rose-300 shadow-xl flex items-center justify-center gap-2 text-base touch-manipulation transition-all animate-pulse"
                    >
                      <Zap className="w-5 h-5 text-yellow-300" />
                      <span>【今だ！全集中の一撃を放つ！】（タップ/クリック）</span>
                    </button>
                  ) : drillResult === 'miss' ? (
                    <button
                      onClick={handleRetryDrill}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg border border-amber-300 flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>息を整えて再挑戦する</span>
                    </button>
                  ) : (
                    <div className="py-2.5 text-center text-sm font-bold text-emerald-300 animate-bounce">
                      集中力を持続せよ…！
                    </div>
                  )}
                </div>

                {/* Feedback Banner */}
                {feedbackMessage && (
                  <div
                    className={`mt-2 p-2 rounded text-xs font-bold text-center border ${
                      drillResult === 'perfect' || drillResult === 'great'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : 'bg-rose-950 border-rose-500 text-rose-200'
                    }`}
                  >
                    {feedbackMessage}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Training Complete Celebration */
            <div className="bg-slate-900/90 border border-amber-500/60 p-4 rounded-lg flex flex-col items-center text-center gap-3 animate-fadeIn">
              <Award className="w-12 h-12 text-yellow-300 animate-bounce" />
              <div>
                <h3 className="text-lg font-bold text-amber-300">
                  【柱稽古・全試練完全突破！！】
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1">
                  {hashira.name}「見事だ炭治郎！お前の気迫と太刀筋、確かに見届けた。
                  お前たち鬼殺隊と共に、鬼舞辻無惨の討伐へ向かおう！」
                </p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-700 w-full text-xs text-amber-200 font-bold">
                柱・{hashira.name}が鬼殺隊の陣営に正式合流しました！
              </div>

              <button
                onClick={handleFinishRecruitment}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg border-2 border-emerald-300 shadow-lg text-sm transition-all"
              >
                柱を仲間に迎えて隊列に加える
              </button>
            </div>
          )}
        </DqFrame>
      </div>
    </div>
  );
};
