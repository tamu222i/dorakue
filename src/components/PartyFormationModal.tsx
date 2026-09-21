/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { Character } from '../domain/models/types.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import {
  Users,
  UserPlus,
  ArrowRightLeft,
  X,
  Check,
  Search,
  Sparkles,
  Shield,
  Swords,
  Heart,
  Zap,
  Star,
  ChevronDown
} from 'lucide-react';

interface PartyFormationModalProps {
  party: PartyAggregate;
  catalog: Character[];
  isOpen: boolean;
  onClose: () => void;
  onFormationChanged?: () => void;
  onEncounter?: (ids: string[]) => void;
}

type FormationTab = 'roster' | 'free_all';
type CategoryFilter = 'all' | 'hashira' | 'synchronous' | 'support';

export const PartyFormationModal: React.FC<PartyFormationModalProps> = ({
  party,
  catalog,
  isOpen,
  onClose,
  onFormationChanged,
  onEncounter
}) => {
  // Currently selected slot (0 to 3) for swapping
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<FormationTab>('roster');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState<string>('入れ替えたい【枠】を選び、下の隊士をタップしてください。');

  // Filter friendly characters from the entire catalog (role !== 'demon')
  const allFriendlyCharacters = useMemo(() => {
    return catalog.filter(c => c.role !== 'demon');
  }, [catalog]);

  // Filter for Tab 2 (All Catalog)
  const filteredCatalog = useMemo(() => {
    let list = allFriendlyCharacters;

    if (categoryFilter === 'hashira') {
      list = list.filter(c => c && (c.rank === '柱' || (c.title && c.title.includes('柱'))));
    } else if (categoryFilter === 'synchronous') {
      const syncNames = ['竈門炭治郎', '竈門禰豆子', '我妻善逸', '嘴平伊之助', '栗花落カナヲ', '不死川玄弥'];
      list = list.filter(c => c && syncNames.some(sn => c.name && c.name.includes(sn)));
    } else if (categoryFilter === 'support') {
      list = list.filter(c => c && (c.role === 'support' || c.rank === '育手' || c.rank === '隠' || c.rank === '刀鍛冶'));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.breathStyle && c.breathStyle.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allFriendlyCharacters, categoryFilter, searchQuery]);

  if (!isOpen) return null;

  // Handle slot click
  const handleSlotClick = (slotIdx: number) => {
    SoundEngine.playCursor();
    // If clicking a different slot while already having a slot selected, swap them!
    if (selectedSlot !== slotIdx && slotIdx < party.activeMembers.length && selectedSlot < party.activeMembers.length) {
      party.swapActiveSlots(selectedSlot, slotIdx);
      SoundEngine.playConfirm();
      setMessage(`部隊の並び順（前衛・後衛）を入れ替えました！`);
      onFormationChanged?.();
      setSelectedSlot(slotIdx);
      return;
    }

    setSelectedSlot(slotIdx);
    const curMember = party.activeMembers[slotIdx];
    if (curMember) {
      setMessage(`枠${slotIdx + 1}【${curMember.name}】と入れ替える隊士を下から選んでください。`);
    } else {
      setMessage(`枠${slotIdx + 1}（空き）に配置する隊士を下から選んでください。`);
    }
  };

  // Replace active slot with chosen character
  const handleSelectCharacter = (character: Character) => {
    SoundEngine.playLevelUp();
    party.replaceActiveMember(selectedSlot, character);
    onEncounter?.([character.id]);
    onFormationChanged?.();
    setMessage(`【${character.name}】を枠${selectedSlot + 1}に配属しました！`);

    // Advance selected slot to next available or keep
    const nextSlot = (selectedSlot + 1) % 4;
    setSelectedSlot(nextSlot);
  };

  // Remove from active party
  const handleRemoveFromParty = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (party.activeMembers.length <= 1) {
      SoundEngine.playCancel();
      setMessage('隊士が全滅しないよう、前線には最低1名の隊士が必要です。');
      return;
    }
    const target = party.activeMembers[slotIdx];
    if (!target) return;

    SoundEngine.playConfirm();
    party.removeMemberFromActive(slotIdx);
    setMessage(`【${target.name}】を前線から控えに下げました。`);
    if (selectedSlot >= party.activeMembers.length) {
      setSelectedSlot(Math.max(0, party.activeMembers.length - 1));
    }
    onFormationChanged?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[96vh] flex flex-col bg-slate-950 border-2 border-amber-400 rounded-lg shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-4 py-2.5 border-b border-amber-500/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
                <span>鬼殺隊・部隊編成（好きな人と入れ替え）</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                前線で戦う4名をお好きな隊士に自由に入れ替えられます。
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onClose();
            }}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-colors touch-manipulation"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guidance / Status Message Bar */}
        <div className="bg-amber-950/40 border-b border-amber-900/40 px-4 py-2 flex items-center gap-2 text-xs text-amber-200">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-bold">{message}</span>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* 1. TOP: Current Active 4 Slots (Clear Visual Representation) */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>現在出撃中の前線部隊 (タップして枠を選択 / 枠同士で並び替え):</span>
              </span>
              <span className="text-[10px] text-amber-400">
                選択中の枠: 【枠 {selectedSlot + 1}】
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[0, 1, 2, 3].map(slotIdx => {
                const member = party.activeMembers[slotIdx];
                const isSelected = selectedSlot === slotIdx;

                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleSlotClick(slotIdx)}
                    className={`relative p-2.5 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center text-center touch-manipulation ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] ring-2 ring-amber-400/50'
                        : member
                        ? 'bg-slate-900/90 border-slate-700 hover:border-amber-500/60 hover:bg-slate-800'
                        : 'bg-slate-950 border-dashed border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {/* Slot badge */}
                    <div className="w-full flex items-center justify-between mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isSelected ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                      }`}>
                        枠 {slotIdx + 1} {slotIdx === 0 ? '(先頭)' : ''}
                      </span>

                      {member && party.activeMembers.length > 1 && (
                        <button
                          onClick={(e) => handleRemoveFromParty(slotIdx, e)}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/80 hover:bg-red-700 text-red-200 border border-red-800/80 transition-colors"
                          title="前線から外す"
                        >
                          外す
                        </button>
                      )}
                    </div>

                    {member ? (
                      <>
                        <PixelSprite character={member} size={48} />
                        <div className="font-bold text-xs text-white mt-1 truncate max-w-full">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-amber-300 font-bold">
                          Lv.{member.level} / {member.rank}
                        </div>
                        <div className="text-[9px] text-cyan-300 mt-0.5 truncate max-w-full">
                          {member.breathStyle}
                        </div>

                        <div className="w-full bg-slate-950/90 p-1 rounded mt-1.5 text-[9px] font-mono grid grid-cols-2 gap-x-1 text-left text-slate-300">
                          <div>HP: <span className="text-emerald-400">{member.stats.hp}</span>/{member.stats.maxHp}</div>
                          <div>BP: <span className="text-cyan-400">{member.stats.bp}</span>/{member.stats.maxBp}</div>
                          <div>攻: <span className="text-yellow-400">{member.stats.attack}</span></div>
                          <div>防: <span className="text-blue-400">{member.stats.defense}</span></div>
                        </div>

                        <div className="mt-1.5 w-full text-[10px] py-0.5 rounded font-bold flex items-center justify-center gap-1 border border-amber-500/40 bg-amber-900/30 text-amber-200">
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>交代する</span>
                        </div>
                      </>
                    ) : (
                      <div className="py-6 flex flex-col items-center justify-center text-slate-500">
                        <UserPlus className="w-6 h-6 mb-1 text-slate-600" />
                        <span className="text-xs font-bold">空き枠</span>
                        <span className="text-[9px] mt-0.5 text-amber-400/80">下から選んで配置</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. BOTTOM: Selection Tabs (Roster vs All Friendly Characters) */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    SoundEngine.playCursor();
                    setActiveTab('roster');
                  }}
                  className={`px-3 py-1.5 rounded-t text-xs font-bold flex items-center gap-1.5 transition-colors touch-manipulation ${
                    activeTab === 'roster'
                      ? 'bg-amber-600 text-white border-t-2 border-amber-300'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>所属隊士・控えメンバー ({party.roster.length}名)</span>
                </button>

                <button
                  onClick={() => {
                    SoundEngine.playCursor();
                    setActiveTab('free_all');
                  }}
                  className={`px-3 py-1.5 rounded-t text-xs font-bold flex items-center gap-1.5 transition-colors touch-manipulation ${
                    activeTab === 'free_all'
                      ? 'bg-purple-600 text-white border-t-2 border-purple-300'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>全隊士から特別招集・自由編成 ({allFriendlyCharacters.length}名)</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="隊士名・柱名・呼吸で検索..."
                  className="pl-7 pr-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips for Free All Tab */}
            {activeTab === 'free_all' && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] text-slate-400 font-bold mr-1">絞り込み:</span>
                <button
                  onClick={() => { SoundEngine.playCursor(); setCategoryFilter('all'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-purple-600 border-purple-300 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  すべて ({allFriendlyCharacters.length})
                </button>
                <button
                  onClick={() => { SoundEngine.playCursor(); setCategoryFilter('hashira'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                    categoryFilter === 'hashira'
                      ? 'bg-amber-600 border-amber-300 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  ⚔️ 柱 9名 (煉獄・義勇・しのぶ・無一郎...)
                </button>
                <button
                  onClick={() => { SoundEngine.playCursor(); setCategoryFilter('synchronous'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                    categoryFilter === 'synchronous'
                      ? 'bg-emerald-600 border-emerald-300 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  🎋 同期隊士 (炭治郎・禰豆子・善逸・伊之助・カナヲ・玄弥)
                </button>
                <button
                  onClick={() => { SoundEngine.playCursor(); setCategoryFilter('support'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                    categoryFilter === 'support'
                      ? 'bg-cyan-600 border-cyan-300 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  🍵 育手・支援 (鱗滝・錆兎・真菰・珠世・アオイ)
                </button>
              </div>
            )}

            {/* List of Characters to Pick */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {(activeTab === 'roster' ? party.roster : filteredCatalog).map(character => {
                const isActive = party.activeMembers.some(m => m.id === character.id);
                const activeIndex = party.activeMembers.findIndex(m => m.id === character.id);
                const isSelectedForSlot = party.activeMembers[selectedSlot]?.id === character.id;

                return (
                  <div
                    key={character.id}
                    onClick={() => handleSelectCharacter(character)}
                    className={`p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-all touch-manipulation ${
                      isSelectedForSlot
                        ? 'bg-amber-950/70 border-amber-400 ring-1 ring-amber-400'
                        : isActive
                        ? 'bg-indigo-950/50 border-indigo-500/70 hover:bg-indigo-900/60'
                        : 'bg-slate-900/90 border-slate-700 hover:border-amber-500/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <PixelSprite character={character} size={38} />
                      <div className="truncate">
                        <div className="font-bold text-xs text-white truncate flex items-center gap-1">
                          <span>{character.name}</span>
                          {character.rank === '柱' && (
                            <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-black font-extrabold rounded">
                              柱
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {character.title}
                        </div>
                        <div className="text-[9px] text-cyan-300 flex items-center gap-2 mt-0.5">
                          <span>Lv.{character.level}</span>
                          <span>HP {character.stats.maxHp}</span>
                          <span>攻 {character.stats.attack}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-600 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>枠 {activeIndex + 1}</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCharacter(character);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded font-bold bg-amber-600 hover:bg-amber-500 text-white border border-amber-300 shadow-sm flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>枠{selectedSlot + 1}へ</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="bg-slate-900 border-t border-slate-700 px-4 py-2.5 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            現在の前線: <span className="text-amber-300 font-bold font-mono">{party.activeMembers.length}/4 名</span>
            （所属隊士: {party.roster.length}名）
          </div>

          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onClose();
            }}
            className="px-6 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded border border-amber-300 shadow flex items-center gap-1.5 touch-manipulation"
          >
            <Check className="w-4 h-4" />
            <span>編成を決定して閉じる</span>
          </button>
        </div>
      </div>
    </div>
  );
};
