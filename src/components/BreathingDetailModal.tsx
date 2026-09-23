/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Character } from '../domain/models/types.ts';
import { BreathingProgressView } from './BreathingProgressView.tsx';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { X, Sparkles, Wind } from 'lucide-react';

interface BreathingDetailModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BreathingDetailModal: React.FC<BreathingDetailModalProps> = ({
  character,
  isOpen,
  onClose
}) => {
  if (!isOpen || !character) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="breathing-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <DqFrame
          title={`全集中・呼吸の型 修練帳`}
          variant="gold"
          className="p-3 sm:p-4 flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header with Character Info */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-slate-900 border border-slate-700 shrink-0">
                <PixelSprite character={character} size={48} />
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span id="breathing-modal-title" className="font-bold text-sm sm:text-base text-amber-300">
                    {character.name}
                  </span>
                  {character.rank && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-600 text-white">
                      {character.rank}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-cyan-300 font-bold">
                    Lv.{character.level}
                  </span>
                </div>
                <div className="text-xs text-slate-300">{character.title}</div>
              </div>
            </div>

            <button
              onClick={() => {
                SoundEngine.playCancel();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-colors"
              aria-label="閉じる"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Breathing Techniques List */}
          <div className="overflow-y-auto pr-1 flex-1">
            <BreathingProgressView character={character} />
          </div>

          {/* Footer Controls */}
          <div className="pt-3 mt-3 border-t border-slate-700/80 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400">
              ※実戦や宿屋での鍛錬でレベルが上がると、未解禁の呼吸が自動で開眼します。
            </span>

            <button
              onClick={() => {
                SoundEngine.playCancel();
                onClose();
              }}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded border border-slate-600 shadow"
            >
              閉じる
            </button>
          </div>
        </DqFrame>
      </div>
    </div>
  );
};
