/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { Character } from '../domain/models/types.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { BreathingDetailModal } from './BreathingDetailModal.tsx';
import { getCharacterBreathingProgression } from '../domain/services/SkillProgressionService.ts';
import {
  Users,
  UserPlus,
  ArrowRightLeft,
  X,
  Check,
  Search,
  Sparkles,
  Shield,
  GripVertical,
  Wind
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
  // Selected slot in the active 4: 0, 1, 2, 3 or null if none selected
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  // Selected character from the bottom roster/catalog: Character | null
  const [selectedCandidate, setSelectedCandidate] = useState<Character | null>(null);

  // Drag-and-drop state
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [draggedCandidate, setDraggedCandidate] = useState<Character | null>(null);

  const [activeTab, setActiveTab] = useState<FormationTab>('roster');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingBreathingChar, setInspectingBreathingChar] = useState<Character | null>(null);
  const [message, setMessage] = useState<string>(
    '【1タップ目で選択】→【2タップ目で入れ替え】できます。ドラッグ＆ドロップでも入れ替え可能です！'
  );

  // Filter friendly characters from the catalog (role !== 'demon')
  const allFriendlyCharacters = useMemo(() => {
    return catalog.filter(c => c && c.role !== 'demon');
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

  // --- Click Logic: 1 tap to select, 2nd tap to swap ---

  const handleSlotClick = (slotIdx: number) => {
    // If a candidate from the roster is already selected, 2nd tap on slot puts them in!
    if (selectedCandidate) {
      party.replaceActiveMember(slotIdx, selectedCandidate);
      SoundEngine.playLevelUp();
      onEncounter?.([selectedCandidate.id]);
      onFormationChanged?.();
      setMessage(`【${selectedCandidate.name}】を枠${slotIdx + 1}に配属しました！`);
      setSelectedCandidate(null);
      setSelectedSlot(null);
      return;
    }

    // If no slot is selected, this is 1st tap: select this slot
    if (selectedSlot === null) {
      SoundEngine.playCursor();
      setSelectedSlot(slotIdx);
      const curMember = party.activeMembers[slotIdx];
      if (curMember) {
        setMessage(`枠${slotIdx + 1}【${curMember.name}】を選択しました。別の枠をタップして位置を交代、または下の隊士をタップして交代できます。`);
      } else {
        setMessage(`枠${slotIdx + 1}（空き枠）を選択しました。下の隊士をタップすると配置されます。`);
      }
      return;
    }

    // If the same slot is tapped again, unselect it
    if (selectedSlot === slotIdx) {
      SoundEngine.playCancel();
      setSelectedSlot(null);
      setMessage('枠の選択を解除しました。');
      return;
    }

    // If a different slot is clicked (2nd tap between slots): SWAP them!
    const memA = party.activeMembers[selectedSlot];
    const memB = party.activeMembers[slotIdx];

    if (slotIdx < party.activeMembers.length && selectedSlot < party.activeMembers.length) {
      party.swapActiveSlots(selectedSlot, slotIdx);
      SoundEngine.playConfirm();
      setMessage(`枠${selectedSlot + 1}【${memA?.name}】と 枠${slotIdx + 1}【${memB?.name}】を入れ替えました！`);
    } else if (memA && slotIdx >= party.activeMembers.length) {
      // Move member A to the empty slot
      party.replaceActiveMember(slotIdx, memA);
      party.removeMemberFromActive(selectedSlot);
      SoundEngine.playConfirm();
      setMessage(`【${memA.name}】を枠${slotIdx + 1}に移動しました！`);
    }

    onFormationChanged?.();
    setSelectedSlot(null);
  };

  const handleCandidateClick = (character: Character) => {
    // If an active slot is already selected (1st tap was a slot), 2nd tap on candidate replaces that slot!
    if (selectedSlot !== null) {
      party.replaceActiveMember(selectedSlot, character);
      SoundEngine.playLevelUp();
      onEncounter?.([character.id]);
      onFormationChanged?.();
      setMessage(`枠${selectedSlot + 1}に【${character.name}】を配属しました！`);
      setSelectedSlot(null);
      setSelectedCandidate(null);
      return;
    }

    // If no slot was selected:
    // If this candidate was already selected, unselect on 2nd tap
    if (selectedCandidate?.id === character.id) {
      SoundEngine.playCancel();
      setSelectedCandidate(null);
      setMessage('隊士の選択を解除しました。');
      return;
    }

    // 1st tap: select candidate
    SoundEngine.playCursor();
    setSelectedCandidate(character);
    setMessage(`【${character.name}】を選択中！上の出撃枠（枠1〜4）のいずれかをタップすると入れ替わります。`);
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
    if (selectedSlot === slotIdx) {
      setSelectedSlot(null);
    }
    onFormationChanged?.();
  };

  // --- Drag and Drop Handlers for Desktop / Touch ---

  const handleDragStartSlot = (e: React.DragEvent, slotIdx: number) => {
    setDraggedSlot(slotIdx);
    setDraggedCandidate(null);
    e.dataTransfer.setData('text/plain', `slot:${slotIdx}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStartCandidate = (e: React.DragEvent, character: Character) => {
    setDraggedCandidate(character);
    setDraggedSlot(null);
    e.dataTransfer.setData('text/plain', `char:${character.id}`);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot !== slotIdx) {
      setDragOverSlot(slotIdx);
    }
  };

  const handleDragLeave = (slotIdx: number) => {
    if (dragOverSlot === slotIdx) {
      setDragOverSlot(null);
    }
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    setDragOverSlot(null);

    // Dropped from another slot
    if (draggedSlot !== null) {
      if (draggedSlot === targetSlotIdx) {
        setDraggedSlot(null);
        return;
      }
      const memA = party.activeMembers[draggedSlot];
      const memB = party.activeMembers[targetSlotIdx];

      if (draggedSlot < party.activeMembers.length && targetSlotIdx < party.activeMembers.length) {
        party.swapActiveSlots(draggedSlot, targetSlotIdx);
        SoundEngine.playConfirm();
        setMessage(`ドラッグで 枠${draggedSlot + 1}【${memA?.name}】と 枠${targetSlotIdx + 1}【${memB?.name}】を入れ替えました！`);
      } else if (memA && targetSlotIdx >= party.activeMembers.length) {
        party.replaceActiveMember(targetSlotIdx, memA);
        party.removeMemberFromActive(draggedSlot);
        SoundEngine.playConfirm();
        setMessage(`ドラッグで【${memA.name}】を枠${targetSlotIdx + 1}へ移動しました！`);
      }
      onFormationChanged?.();
      setDraggedSlot(null);
      setSelectedSlot(null);
      return;
    }

    // Dropped from candidate roster/catalog
    if (draggedCandidate) {
      party.replaceActiveMember(targetSlotIdx, draggedCandidate);
      SoundEngine.playLevelUp();
      onEncounter?.([draggedCandidate.id]);
      onFormationChanged?.();
      setMessage(`ドラッグで【${draggedCandidate.name}】を枠${targetSlotIdx + 1}に配属しました！`);
      setDraggedCandidate(null);
      setSelectedCandidate(null);
      setSelectedSlot(null);
    }
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
                <span>鬼殺隊・部隊編成（入れ替え・ドラッグ対応）</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                1タップ目で選択し、2タップ目で交代！ドラッグ＆ドロップでも簡単に入れ替えられます。
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
        <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 py-2 flex items-center gap-2 text-xs text-amber-200">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className="font-bold">{message}</span>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* 1. TOP: Current Active 4 Slots */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between flex-wrap gap-1">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>現在出撃中の前線部隊（タップで選択 / ドラッグで入れ替え）:</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono">
                {selectedSlot !== null
                  ? `👉 枠${selectedSlot + 1}を選択中（別の枠または下の隊士をタップで交代）`
                  : selectedCandidate
                  ? `👉 【${selectedCandidate.name}】を選択中（配置したい枠をタップ）`
                  : '未選択（枠または隊士をタップ）'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[0, 1, 2, 3].map(slotIdx => {
                const member = party.activeMembers[slotIdx];
                const isSelected = selectedSlot === slotIdx;
                const isDragOver = dragOverSlot === slotIdx;

                return (
                  <div
                    key={slotIdx}
                    draggable={!!member}
                    onDragStart={(e) => handleDragStartSlot(e, slotIdx)}
                    onDragOver={(e) => handleDragOver(e, slotIdx)}
                    onDragLeave={() => handleDragLeave(slotIdx)}
                    onDrop={(e) => handleDropOnSlot(e, slotIdx)}
                    onClick={() => handleSlotClick(slotIdx)}
                    className={`relative p-2.5 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center text-center touch-manipulation select-none ${
                      isDragOver
                        ? 'bg-amber-800/80 border-yellow-300 scale-105 shadow-xl shadow-amber-500/50 ring-4 ring-yellow-400'
                        : isSelected
                        ? 'bg-amber-950/90 border-amber-400 shadow-lg shadow-amber-500/30 scale-[1.03] ring-2 ring-amber-400'
                        : member
                        ? 'bg-slate-900/90 border-slate-700 hover:border-amber-500/70 hover:bg-slate-800'
                        : 'bg-slate-950 border-dashed border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {/* Slot badge & Drag indicator */}
                    <div className="w-full flex items-center justify-between mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                        isSelected ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {member && <GripVertical className="w-3 h-3 text-slate-400" />}
                        <span>枠 {slotIdx + 1} {slotIdx === 0 ? '(先頭)' : ''}</span>
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
                        <div className="relative">
                          <PixelSprite character={member} size={48} />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] font-extrabold px-1 rounded-full animate-bounce">
                              選択中
                            </span>
                          )}
                        </div>
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

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            SoundEngine.playConfirm();
                            setInspectingBreathingChar(member);
                          }}
                          className="mt-1.5 w-full text-[9px] py-0.5 rounded font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-200 flex items-center justify-center gap-1 transition-colors touch-manipulation"
                          title="会得呼吸と未解禁シークレットを確認"
                        >
                          <Wind className="w-2.5 h-2.5 text-cyan-300" />
                          <span>呼吸確認 ({getCharacterBreathingProgression(member).learnedBreathCount}/{getCharacterBreathingProgression(member).totalBreathCount}型)</span>
                        </button>

                        <div className={`mt-1.5 w-full text-[10px] py-0.5 rounded font-bold flex items-center justify-center gap-1 border transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'border-amber-500/40 bg-amber-900/30 text-amber-200'
                        }`}>
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{isSelected ? '1タップ目: 選択中' : 'タップで選択'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="py-6 flex flex-col items-center justify-center text-slate-500">
                        <UserPlus className="w-6 h-6 mb-1 text-slate-600" />
                        <span className="text-xs font-bold">空き枠</span>
                        <span className="text-[9px] mt-0.5 text-amber-400/80">タップまたはドロップで配置</span>
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

            {/* Hint bar */}
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>隊士をタップして選択、または上の枠へ直接ドラッグして入れ替えてください:</span>
              {selectedCandidate && (
                <span className="text-amber-400 font-bold">
                  【{selectedCandidate.name}】選択中 → 上の枠をタップで配属
                </span>
              )}
            </div>

            {/* List of Characters to Pick */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {(activeTab === 'roster' ? party.roster : filteredCatalog).map(character => {
                const isActive = party.activeMembers.some(m => m.id === character.id);
                const activeIndex = party.activeMembers.findIndex(m => m.id === character.id);
                const isCandidateSelected = selectedCandidate?.id === character.id;
                const isSlotSelectedForChar = selectedSlot !== null && party.activeMembers[selectedSlot]?.id === character.id;

                return (
                  <div
                    key={character.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStartCandidate(e, character)}
                    onClick={() => handleCandidateClick(character)}
                    className={`p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-all touch-manipulation select-none ${
                      isCandidateSelected
                        ? 'bg-amber-950 border-amber-400 ring-2 ring-amber-400 scale-[1.02]'
                        : isSlotSelectedForChar
                        ? 'bg-amber-950/70 border-amber-400/80 ring-1 ring-amber-400'
                        : isActive
                        ? 'bg-indigo-950/50 border-indigo-500/70 hover:bg-indigo-900/60'
                        : 'bg-slate-900/90 border-slate-700 hover:border-amber-500/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="relative">
                        <PixelSprite character={character} size={38} />
                        {isCandidateSelected && (
                          <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[8px] font-extrabold px-1 rounded-full animate-bounce">
                            選
                          </span>
                        )}
                      </div>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          SoundEngine.playConfirm();
                          setInspectingBreathingChar(character);
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-slate-600 hover:border-cyan-400 flex items-center gap-1 transition-colors touch-manipulation"
                        title="会得呼吸と未解禁シークレットを確認"
                      >
                        <Wind className="w-2.5 h-2.5 text-cyan-300" />
                        <span>呼吸 {getCharacterBreathingProgression(character).learnedBreathCount}/{getCharacterBreathingProgression(character).totalBreathCount}型</span>
                      </button>

                      {isActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-600 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>枠 {activeIndex + 1}</span>
                        </span>
                      ) : isCandidateSelected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500 text-black flex items-center gap-1 animate-pulse">
                          <span>上の枠をタップ</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCandidateClick(character);
                          }}
                          className="text-[10px] px-2 py-1 rounded font-bold bg-amber-600 hover:bg-amber-500 text-white border border-amber-300 shadow-sm flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{selectedSlot !== null ? `枠${selectedSlot + 1}へ` : '選択する'}</span>
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

      {/* Breathing Technique Progress & Secrets Modal */}
      {inspectingBreathingChar && (
        <BreathingDetailModal
          character={inspectingBreathingChar}
          isOpen={!!inspectingBreathingChar}
          onClose={() => setInspectingBreathingChar(null)}
        />
      )}
    </div>
  );
};
