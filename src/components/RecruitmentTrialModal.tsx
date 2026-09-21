/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Character } from '../domain/models/types.ts';
import { CharacterTrial, getOrCreateTrial } from '../domain/services/RecruitmentTrials.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { Sparkles, CheckCircle, XCircle, ChevronRight, RotateCcw, X, HeartHandshake } from 'lucide-react';
import { isHashiraCharacter } from '../domain/services/CharacterCatalog.ts';
import { HashiraTrainingModal } from './HashiraTrainingModal.tsx';

interface RecruitmentTrialModalProps {
  character: Character;
  bonusCharacters?: Character[];
  isOpen: boolean;
  onClose: () => void;
  onSuccessRecruit: (character: Character, bonusCharacters?: Character[]) => void;
}

export const RecruitmentTrialModal: React.FC<RecruitmentTrialModalProps> = ({
  character,
  bonusCharacters,
  isOpen,
  onClose,
  onSuccessRecruit
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0, 1, 2
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [answeredHistory, setAnsweredHistory] = useState<boolean[]>([]); // true if matched
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [trialSessionKey, setTrialSessionKey] = useState<number>(0);

  const trial: CharacterTrial = useMemo(() => {
    return getOrCreateTrial(
      character.id,
      character.name,
      character.role,
      character.breathStyle
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id, character.name, character.role, character.breathStyle, trialSessionKey, isOpen]);

  if (!isOpen) return null;

  // Ultimate fail-safe: if the candidate is a Hashira, redirect to HashiraTrainingModal immediately!
  if (isHashiraCharacter(character)) {
    return (
      <HashiraTrainingModal
        hashira={character}
        bonusCharacters={bonusCharacters}
        isOpen={isOpen}
        onClose={onClose}
        onSuccessRecruit={onSuccessRecruit}
      />
    );
  }

  const currentQ = trial.questions[currentStep];

  const handleSelectOption = (index: number) => {
    if (isAnswerRevealed) return;
    SoundEngine.playConfirm();
    setSelectedOption(index);
    setIsAnswerRevealed(true);

    const isMatch = index === currentQ.matchingIndex;
    const newHistory = [...answeredHistory, isMatch];
    setAnsweredHistory(newHistory);

    if (isMatch) {
      SoundEngine.playConfirm();
    } else {
      SoundEngine.playCancel();
    }
  };

  const handleNextQuestion = () => {
    SoundEngine.playConfirm();
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      // Finished all 3 questions! Check if ALL matched
      const allMatched = answeredHistory.length === 3 && answeredHistory.every(h => h === true);
      if (allMatched) {
        SoundEngine.playFanfare();
        setIsFinished(true);
      } else {
        SoundEngine.playWipeout();
        setIsFailed(true);
      }
    }
  };

  const handleRetry = () => {
    SoundEngine.playConfirm();
    setTrialSessionKey(k => k + 1);
    setCurrentStep(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setAnsweredHistory([]);
    setIsFinished(false);
    setIsFailed(false);
  };

  const handleConfirmRecruit = () => {
    SoundEngine.playConfirm();
    onSuccessRecruit(character, bonusCharacters);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <DqFrame variant="gold" className="p-3 sm:p-4 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/40 mb-3">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-amber-400 animate-pulse" />
              <div className="text-sm sm:text-base font-bold text-amber-300">
                <FuriganaText text="隊[たい]士[し]の試[し]練[れん]（3問[もん]一致[いっち]で仲間[なかま]入り！）" />
              </div>
            </div>

            <button
              onClick={() => {
                SoundEngine.playCancel();
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="やめる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Character Profile Card */}
          <div className="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 mb-3">
            <div className="p-1 bg-slate-900 rounded border border-slate-700 shrink-0">
              <PixelSprite character={character} size={48} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-amber-400 font-bold">
                {character.title}
              </div>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{character.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">
                  Lv.{character.level}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                <FuriganaText text={trial.dialogueIntro} />
              </div>
            </div>
          </div>

          {/* Success State: All 3 questions matched! */}
          {isFinished ? (
            <div className="flex flex-col items-center text-center gap-3 p-4 bg-amber-950/40 border border-amber-400 rounded-lg">
              <div className="p-3 bg-amber-500/20 rounded-full border border-amber-400 animate-bounce">
                <Sparkles className="w-8 h-8 text-amber-300" />
              </div>

              <div>
                <div className="text-base sm:text-lg font-bold text-yellow-300 mb-1">
                  <FuriganaText text="【 全[ぜん]問[もん]一致[いっち]！心[こころ]が通[つう]じ合[あ]った！ 】" />
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-sm mx-auto">
                  <FuriganaText text={trial.successMessage} />
                </div>
              </div>

              {bonusCharacters && bonusCharacters.length > 0 && (
                <div className="text-xs text-cyan-300 bg-slate-900/80 px-3 py-1.5 rounded border border-cyan-700/60">
                  同行者：{bonusCharacters.map(b => b.name).join('、')} も一緒に仲間に加わります！
                </div>
              )}

              <button
                onClick={handleConfirmRecruit}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:from-amber-600 active:to-yellow-600 text-slate-950 font-bold text-sm rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all mt-2 touch-manipulation"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span><FuriganaText text="仲間[なかま]として迎[むか]え入[い]れる！" defaultRtColor="text-slate-900" /></span>
              </button>
            </div>
          ) : isFailed ? (
            /* Failed State: Mismatch occurred */
            <div className="flex flex-col items-center text-center gap-3 p-4 bg-rose-950/40 border border-rose-500/60 rounded-lg">
              <div className="p-3 bg-rose-500/20 rounded-full border border-rose-400">
                <XCircle className="w-8 h-8 text-rose-400" />
              </div>

              <div>
                <div className="text-sm sm:text-base font-bold text-rose-300 mb-1">
                  <FuriganaText text="【 残[ざん]念[ねん]… 気[き]持[も]ちが すれ違[ちが]った 】" />
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-sm mx-auto">
                  <FuriganaText text={trial.failMessage} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-xs rounded border border-amber-400 flex items-center justify-center gap-1.5 shadow touch-manipulation"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span><FuriganaText text="もう一度[いちど] 試[し]練[れん]を受[う]ける" /></span>
                </button>

                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded border border-slate-600 flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  <span>あきらめて戻る</span>
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Question Step (0, 1, 2) */
            <div className="flex flex-col gap-3">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((idx) => {
                    const isPassed = idx < answeredHistory.length && answeredHistory[idx];
                    const isMissed = idx < answeredHistory.length && !answeredHistory[idx];
                    const isCurrent = idx === currentStep;

                    return (
                      <div
                        key={idx}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                          isPassed
                            ? 'bg-emerald-800 text-emerald-200 border border-emerald-500'
                            : isMissed
                            ? 'bg-rose-800 text-rose-200 border border-rose-500'
                            : isCurrent
                            ? 'bg-amber-500 text-slate-950 border border-amber-300 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span>第{idx + 1}問</span>
                        {isPassed && <CheckCircle className="w-3 h-3 text-emerald-300" />}
                        {isMissed && <XCircle className="w-3 h-3 text-rose-300" />}
                      </div>
                    );
                  })}
                </div>

                <span className="text-[11px] text-amber-300 font-bold">
                  {currentStep + 1} / 3 問
                </span>
              </div>

              {/* Question Box */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-amber-500/50 shadow-inner">
                <div className="text-xs sm:text-sm font-bold text-amber-200 leading-relaxed">
                  <FuriganaText text={currentQ.question} />
                </div>
              </div>

              {/* 3 Choices Options */}
              <div className="flex flex-col gap-2">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isMatching = optIdx === currentQ.matchingIndex;

                  let btnStyle = 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100';
                  if (isAnswerRevealed) {
                    if (isSelected && isMatching) {
                      btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400';
                    } else if (isSelected && !isMatching) {
                      btnStyle = 'bg-rose-950/90 border-rose-400 text-rose-200 ring-2 ring-rose-400';
                    } else if (isMatching) {
                      btnStyle = 'bg-emerald-950/50 border-emerald-600 text-emerald-300';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all min-h-[50px] touch-manipulation ${btnStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-600">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                        <FuriganaText text={optionText} />
                      </div>
                      {isAnswerRevealed && isSelected && (
                        <span className="shrink-0 mt-0.5">
                          {isMatching ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 animate-bounce" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {isAnswerRevealed && (
                <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-700 animate-fade-in flex flex-col gap-2.5">
                  <div className="text-xs text-slate-200 leading-relaxed flex items-start gap-2">
                    {selectedOption === currentQ.matchingIndex ? (
                      <span className="text-emerald-400 font-bold shrink-0">【心の一致○】</span>
                    ) : (
                      <span className="text-rose-400 font-bold shrink-0">【不一致×】</span>
                    )}
                    <span>{currentQ.explanation}</span>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs sm:text-sm rounded border border-amber-300 shadow flex items-center justify-center gap-1.5 touch-manipulation transition-all"
                  >
                    <span>{currentStep < 2 ? '次[つぎ]の問[とい]へ進[すす]む' : '結[けっ]果[か]を確[かく]認[にん]する'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </DqFrame>
      </div>
    </div>
  );
};
