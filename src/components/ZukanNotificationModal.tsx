/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Character } from '../domain/models/types.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { BookPlus, Sparkles, Check, ChevronRight } from 'lucide-react';

interface ZukanNotificationModalProps {
  characters: Character[];
  source?: 'battle' | 'level_up' | 'recruit' | 'scout';
  onClose: () => void;
  onOpenZukan?: () => void;
}

export const ZukanNotificationModal: React.FC<ZukanNotificationModalProps> = ({
  characters,
  source = 'battle',
  onClose,
  onOpenZukan
}) => {
  if (!characters || characters.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md animate-scale-up">
        <DqFrame
          variant="gold"
          className="p-4 bg-slate-950/95 border-2 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.4)]"
        >
          {/* Header */}
          <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-950/90 border border-amber-400 rounded-full text-amber-300 text-xs font-bold shadow mb-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
              <span>
                <FuriganaText text="新[しん]規[き]・大[だい]図鑑[ずかん]登[とう]録[ろく]！" />
              </span>
              <BookPlus className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {source === 'level_up' ? (
                <FuriganaText text="隊[たい]士[し]の成長[せいちょう]により新[あら]たな情報[じょうほう]が解禁[かいきん]されました！" />
              ) : (
                <FuriganaText text="新[あら]たな鬼[おに]・隊[たい]士[し]を図鑑[ずかん]に記録[きろく]しました！" />
              )}
            </h3>
            <p className="text-[11px] text-amber-200/90 mt-0.5">
              未遭遇の「？？？」から真の姿・能力値・奥義が解放されました
            </p>
          </div>

          {/* Character Cards List */}
          <div className="max-h-64 overflow-y-auto flex flex-col gap-2 my-2 pr-1">
            {characters.map(char => {
              const isDemon = char.role === 'demon';
              return (
                <div
                  key={char.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                    isDemon
                      ? 'bg-rose-950/60 border-rose-700/80 shadow-[0_0_10px_rgba(225,29,72,0.2)]'
                      : 'bg-slate-900/90 border-slate-700 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                  }`}
                >
                  <div className="relative p-1 bg-slate-950 rounded border border-slate-800 shrink-0">
                    <PixelSprite character={char} size={48} />
                    <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-slate-950 text-[9px] font-bold px-1 rounded-full font-mono">
                      NEW
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        No.{String(char.catalogNo).padStart(3, '0')}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {char.name}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isDemon
                            ? 'bg-rose-800 text-rose-100'
                            : 'bg-emerald-800 text-emerald-100'
                        }`}
                      >
                        {char.rank}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-300 truncate mt-0.5">
                      {char.title}
                    </div>

                    <div className="text-[10px] text-cyan-300 mt-0.5">
                      {char.breathStyle === 'blood' ? '血鬼術' : `呼吸: ${char.breathStyle}`}
                      {char.skills[0] ? ` / 【${char.skills[0].name}】` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-2 border-t border-slate-800">
            {onOpenZukan && (
              <button
                onClick={() => {
                  SoundEngine.playConfirm();
                  onClose();
                  onOpenZukan();
                }}
                className="flex-1 py-2 px-3 bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white text-xs font-bold rounded border border-indigo-400 flex items-center justify-center gap-1.5 shadow transition-colors touch-manipulation"
              >
                <span><FuriganaText text="大[だい]図鑑[ずかん]で詳細[しょうさい]を見[み]る" /></span>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
              </button>
            )}

            <button
              onClick={() => {
                SoundEngine.playConfirm();
                onClose();
              }}
              className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold rounded border border-amber-400 flex items-center justify-center gap-1.5 shadow transition-colors touch-manipulation"
            >
              <Check className="w-4 h-4" />
              <span><FuriganaText text="閉[と]じる" /></span>
            </button>
          </div>
        </DqFrame>
      </div>
    </div>
  );
};
