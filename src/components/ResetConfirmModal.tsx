/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md">
        <DqFrame variant="danger" title="【 冒険の初期化（最初からやり直す） 】" className="p-4 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 bg-red-950/60 border border-red-500/50 rounded p-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs text-slate-200 leading-relaxed">
                <div className="font-bold text-red-300 text-sm mb-1">
                  <FuriganaText text="セーブデータを消[け]して最初[さいしょ]からやり直[なお]す" />
                </div>
                <FuriganaText text="これまでの仲間[なかま]のレベル、お金[かね]、物語[ものがたり]の進[すす]み具合[ぐあい]をすべて消[け]して、" />
                <span className="text-amber-300 font-bold ml-1">
                  <FuriganaText text="竈門[かまど]炭治郎[たんじろう]（Lv.1）" />
                </span>
                <FuriganaText text="で第[だい]1章[しょう]から新[あたら]しく冒険[ぼうけん]を始[はじ]めます。" />
              </div>
            </div>

            <p className="text-xs text-center text-slate-400">
              <FuriganaText text="※ 消[け]したデータは元[もと]に戻[もど]せません。本当[ほんとう]によろしいですか？" />
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  SoundEngine.playConfirm();
                  onConfirmReset();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 active:from-red-800 active:to-rose-800 text-white text-sm font-bold rounded border border-red-400 shadow-lg flex items-center justify-center gap-2 transition-all touch-manipulation"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  <FuriganaText text="全[ぜん]データを消[け]して最初[さいしょ]からやり直[なお]す" />
                </span>
              </button>

              <button
                onClick={() => {
                  SoundEngine.playCancel();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-bold rounded border border-slate-600 shadow flex items-center justify-center gap-1.5 transition-all touch-manipulation"
              >
                <X className="w-4 h-4 text-slate-400" />
                <span>
                  <FuriganaText text="やめる（今[いま]の冒険[ぼうけん]を続[つづ]ける）" />
                </span>
              </button>
            </div>
          </div>
        </DqFrame>
      </div>
    </div>
  );
};
