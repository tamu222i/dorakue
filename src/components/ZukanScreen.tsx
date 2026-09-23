/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Character, BreathStyle } from '../domain/models/types.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { BreathingProgressView } from './BreathingProgressView.tsx';
import { Search, ArrowLeft, Filter, Sparkles, Book, Eye, EyeOff, Users } from 'lucide-react';

interface ZukanScreenProps {
  catalog: Character[];
  partyRoster?: Character[];
  partyRosterIds: Set<string>;
  encounteredIds: Set<string>;
  onBack: () => void;
}

export const ZukanScreen: React.FC<ZukanScreenProps> = ({
  catalog,
  partyRoster,
  partyRosterIds,
  encounteredIds,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'slayer' | 'demon' | 'hashira' | 'kizuki'>('all');
  const [breathFilter, setBreathFilter] = useState<string>('all');
  // 'recruited_only' (ユーザー要望: 仲間にしたものだけ表示), 'encountered_only', 'all'
  const [visibilityFilter, setVisibilityFilter] = useState<'recruited_only' | 'encountered_only' | 'all'>('recruited_only');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(() => {
    // Select first recruited, then first encountered, or first in catalog
    const firstRecruited = catalog.find(c => partyRosterIds.has(c.id));
    if (firstRecruited) return firstRecruited;
    const firstEncountered = catalog.find(c => encounteredIds.has(c.id));
    return firstEncountered || catalog[0];
  });

  // Calculate metrics
  const recruitedCount = useMemo(() => {
    return catalog.filter(c => partyRosterIds.has(c.id)).length;
  }, [catalog, partyRosterIds]);

  const encounteredCount = useMemo(() => {
    return catalog.filter(c => encounteredIds.has(c.id)).length;
  }, [catalog, encounteredIds]);

  const encounterRate = Math.round((encounteredCount / catalog.length) * 100);

  // Filtering
  const filteredList = useMemo(() => {
    return catalog.filter(c => {
      const isEncountered = encounteredIds.has(c.id);
      const isRecruited = partyRosterIds.has(c.id);

      // Visibility filter
      if (visibilityFilter === 'recruited_only') {
        if (!isRecruited) return false;
      } else if (visibilityFilter === 'encountered_only') {
        if (!isEncountered) return false;
      }

      // Search (only search real name if encountered, or search No.)
      if (searchTerm) {
        const noMatch = String(c.catalogNo).includes(searchTerm);
        if (isEncountered) {
          const nameMatch = c.name.includes(searchTerm) || c.title.includes(searchTerm);
          if (!nameMatch && !noMatch) return false;
        } else {
          // If not encountered, user can only search by number or "??"
          if (!noMatch && !searchTerm.includes('?')) return false;
        }
      }

      // Role filter
      if (roleFilter === 'slayer' && c.role !== 'slayer') return false;
      if (roleFilter === 'demon' && c.role !== 'demon') return false;
      if (roleFilter === 'hashira' && c.rank !== '柱') return false;
      if (roleFilter === 'kizuki' && c.rank !== '上弦' && c.rank !== '下弦' && c.rank !== '鬼の始祖') return false;

      // Breath filter
      if (breathFilter !== 'all' && c.breathStyle !== breathFilter) return false;

      return true;
    });
  }, [catalog, searchTerm, roleFilter, breathFilter, visibilityFilter, encounteredIds, partyRosterIds]);

  const isSelectedEncountered = encounteredIds.has(selectedCharacter.id);
  const isSelectedRecruited = partyRosterIds.has(selectedCharacter.id);
  const liveCharacter = partyRoster?.find(m => m.id === selectedCharacter.id) || selectedCharacter;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 p-2 select-none">
      {/* Header Bar */}
      <DqFrame variant="gold" className="p-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
              <Book className="w-5 h-5 text-amber-400" />
              <span>
                <FuriganaText text={`鬼[き]殺[さつ]・鬼[おに] ${catalog.length}種[しゅ] 大[だい]図鑑[ずかん]（縦横[じゅうおう]2倍[ばい]・高精細[こうせいさい]ドット絵[え]）`} />
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              <FuriganaText text="戦闘[せんとう]・隊[たい]士[し]のレベルアップ・宿屋[やどや]での勧誘[かんゆう]で新[あら]たな鬼[おに]や仲間[なかま]が図鑑[ずかん]に追加[ついか]されます！" />
            </p>
          </div>

          <button
            onClick={() => {
              SoundEngine.playConfirm();
              onBack();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-xs font-bold rounded border border-slate-600 flex items-center gap-1.5 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span><FuriganaText text="世界[せかい]へもどる" /></span>
          </button>
        </div>

        {/* Discovery Progress Meter */}
        <div className="mt-2.5 pt-2 border-t border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-300 font-bold">
                <FuriganaText text="確実[かくじつ]な仲間[なかま]:" />
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700">
                {recruitedCount} 名
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-300 font-bold">
                <FuriganaText text="遭遇[そうぐう]・撃破[げきは]数[すう]:" />
              </span>
              <span className="font-mono text-yellow-400 font-bold">
                {encounteredCount} / {catalog.length} 体 ({encounterRate}%)
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 bg-slate-900 border border-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-yellow-300 transition-all duration-500"
              style={{ width: `${Math.min(100, (encounteredCount / catalog.length) * 100)}%` }}
            />
          </div>
        </div>
      </DqFrame>

      {/* Filter & Search Bar */}
      <DqFrame className="p-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="隊士名・鬼名、または図鑑番号で検索"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          {/* Visibility Toggle: 仲間のみ (Recruited only) vs 遭遇済み (Encountered only) vs 全種 (All) */}
          <div className="flex rounded border border-slate-700 overflow-hidden text-xs">
            <button
              onClick={() => {
                SoundEngine.playCursor();
                setVisibilityFilter('recruited_only');
              }}
              className={`px-2.5 py-1.5 font-bold flex items-center gap-1 transition-colors ${
                visibilityFilter === 'recruited_only'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-300" />
              <span>仲間のみ ({recruitedCount})</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playCursor();
                setVisibilityFilter('encountered_only');
              }}
              className={`px-2.5 py-1.5 font-bold flex items-center gap-1 transition-colors border-l border-slate-700 ${
                visibilityFilter === 'encountered_only'
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>遭遇済 ({encounteredCount})</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playCursor();
                setVisibilityFilter('all');
              }}
              className={`px-2.5 py-1.5 font-bold flex items-center gap-1 transition-colors border-l border-slate-700 ${
                visibilityFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>全種</span>
            </button>
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap gap-1 text-[11px]">
            {[
              { id: 'all', label: '全役割' },
              { id: 'slayer', label: '鬼殺隊' },
              { id: 'demon', label: '鬼' },
              { id: 'hashira', label: '柱 (9名)' },
              { id: 'kizuki', label: '十二鬼月/始祖' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  SoundEngine.playCursor();
                  setRoleFilter(f.id as any);
                }}
                className={`px-2 py-1 rounded border transition-colors ${
                  roleFilter === f.id
                    ? 'bg-amber-600 border-amber-300 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Breath Filter */}
          <select
            value={breathFilter}
            onChange={e => {
              SoundEngine.playCursor();
              setBreathFilter(e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-200 focus:outline-none"
          >
            <option value="all">全呼吸 / 術</option>
            <option value="water">水の呼吸</option>
            <option value="sun">ヒノカミ神楽/日</option>
            <option value="flame">炎の呼吸</option>
            <option value="thunder">雷の呼吸</option>
            <option value="beast">獣の呼吸</option>
            <option value="insect">蟲の呼吸</option>
            <option value="mist">霞の呼吸</option>
            <option value="love">恋の呼吸</option>
            <option value="wind">風の呼吸</option>
            <option value="stone">岩の呼吸</option>
            <option value="serpent">蛇の呼吸</option>
            <option value="moon">月の呼吸</option>
            <option value="blood">血鬼術</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400 mt-1.5 flex justify-between">
          <span>
            表示中: <span className="font-bold text-amber-300 font-mono">{filteredList.length}</span> 体
          </span>
          <span className="text-slate-400">
            ※ 未遭遇のキャラクターはシルエット（？？？）で隠蔽されます
          </span>
        </div>
      </DqFrame>

      {/* Main Grid + Detail View Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Left 2 Cols: 500-Character Scrollable Grid */}
        <DqFrame title="キャラクター名鑑（クリックで詳細閲覧）" className="md:col-span-2 p-2 max-h-[520px] overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
            {filteredList.map(char => {
              const isSelected = selectedCharacter.id === char.id;
              const isEncountered = encounteredIds.has(char.id);
              const recruited = partyRosterIds.has(char.id);

              return (
                <button
                  key={char.id}
                  onClick={() => {
                    SoundEngine.playCursor();
                    setSelectedCharacter(char);
                  }}
                  className={`p-1.5 rounded border flex flex-col items-center justify-between text-center transition-all relative ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/50 ring-2 ring-amber-400 shadow'
                      : isEncountered
                      ? 'border-slate-700 bg-slate-900/90 hover:bg-slate-800'
                      : 'border-slate-800/80 bg-slate-950/90 hover:bg-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full px-0.5">
                    <span className="text-[9px] font-mono text-slate-400">
                      No.{String(char.catalogNo).padStart(3, '0')}
                    </span>
                    {recruited ? (
                      <span className="text-[8px] bg-emerald-500 text-slate-950 px-1 rounded font-bold shadow-sm animate-pulse">
                        仲間
                      </span>
                    ) : isEncountered ? (
                      <span className="text-[8px] bg-amber-500/80 text-slate-950 px-1 rounded font-medium">
                        遭遇
                      </span>
                    ) : null}
                  </div>

                  {/* High Definition 32x32 sprite (silhouette if unencountered) */}
                  <PixelSprite
                    character={char}
                    size={48}
                    isSilhouette={!isEncountered}
                    className="my-1"
                  />

                  <div className={`text-[10px] font-bold truncate w-full ${isEncountered ? 'text-slate-200' : 'text-slate-500'}`}>
                    {isEncountered ? char.name : '？？？？？'}
                  </div>
                  <div className={`text-[8px] truncate w-full ${isEncountered ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isEncountered ? char.rank : '未遭遇'}
                  </div>
                </button>
              );
            })}
          </div>
        </DqFrame>

        {/* Right Col: Selected Character Profile */}
        <DqFrame
          title={`No.${String(selectedCharacter.catalogNo).padStart(3, '0')} 詳細情報`}
          variant={!isSelectedEncountered ? 'default' : selectedCharacter.role === 'demon' ? 'danger' : 'gold'}
          className="p-3 flex flex-col justify-between"
        >
          {isSelectedEncountered ? (
            <div>
              {/* Encountered Character Profile */}
              <div className="flex flex-col items-center p-3 bg-slate-900 rounded border border-slate-800 mb-3">
                <PixelSprite character={liveCharacter} size={112} className="mb-2" />
                <div className="font-bold text-sm text-amber-300">{liveCharacter.name}</div>
                <div className="text-xs text-slate-300 font-bold">{liveCharacter.title}</div>
                <div className="text-[11px] text-cyan-300 mt-1">
                  【{liveCharacter.rank}】 / 呼吸・術: {liveCharacter.breathStyle} / Lv.{liveCharacter.level}
                </div>
              </div>

              {/* Lore Box */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded border border-slate-800 mb-3">
                {liveCharacter.lore}
              </div>

              {/* Base Stats */}
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-xs font-mono mb-3">
                <div className="text-[10px] text-amber-400 font-bold mb-1">
                  【能力値{isSelectedRecruited ? '（現在鍛錬中）' : ''}】
                </div>
                <div className="grid grid-cols-2 gap-1 text-slate-300 text-[11px]">
                  <div>HP: {liveCharacter.stats.maxHp}</div>
                  <div>BP: {liveCharacter.stats.maxBp}</div>
                  <div>攻撃: {liveCharacter.stats.attack}</div>
                  <div>防御: {liveCharacter.stats.defense}</div>
                  <div>素早さ: {liveCharacter.stats.speed}</div>
                  <div>運(隙の糸): {liveCharacter.stats.luck}</div>
                </div>
              </div>

              {/* Breathing Techniques & Secret Arts Progress View */}
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800 text-xs mb-3">
                <BreathingProgressView character={liveCharacter} />
              </div>
            </div>
          ) : (
            <div>
              {/* Unencountered Hidden Silhouette Profile */}
              <div className="flex flex-col items-center p-3 bg-slate-900 rounded border border-slate-800 mb-3">
                <PixelSprite character={selectedCharacter} size={112} isSilhouette={true} className="mb-2" />
                <div className="font-bold text-sm text-slate-400">？？？？？？</div>
                <div className="text-xs text-slate-500 font-bold">【未遭遇の存在】</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  【？？？】 / 呼吸・術: ？？？
                </div>
              </div>

              {/* Lore Box for Hidden */}
              <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/70 p-3 rounded border border-slate-800 mb-3">
                まだ見ぬ鬼殺隊士、あるいは人知れず暗闇に潜む鬼。
                <br />
                任務の遂行、各章のボス討伐、野良鬼との遭遇、または藤の家紋の宿でのスカウト候補として出会うことで、真の姿と能力が解禁されます。
              </div>

              {/* Masked Stats */}
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-xs font-mono mb-3">
                <div className="text-[10px] text-slate-500 font-bold mb-1">【能力値（未解明）】</div>
                <div className="grid grid-cols-2 gap-1 text-slate-600 text-[11px]">
                  <div>HP: ？？？</div>
                  <div>BP: ？？？</div>
                  <div>攻撃: ？？？</div>
                  <div>防御: ？？？</div>
                  <div>素早さ: ？？？</div>
                  <div>運: ？？？</div>
                </div>
              </div>

              {/* Masked Skills */}
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-xs mb-3">
                <div className="text-[10px] text-slate-500 font-bold mb-1">【奥義・血鬼術】</div>
                <div className="text-[11px] text-slate-600">
                  【？？？？？？】（遭遇後に判明）
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-xs py-1.5 px-2 rounded bg-slate-900 border border-slate-800">
            {!isSelectedEncountered ? (
              <span className="text-slate-500 font-bold">未遭遇（？？？）</span>
            ) : selectedCharacter.role === 'demon' ? (
              <span className="text-rose-400 font-bold">鬼討伐対象（遭遇済）</span>
            ) : isSelectedRecruited ? (
              <span className="text-emerald-400 font-bold">★ 鬼殺隊陣営に加入済</span>
            ) : (
              <span className="text-amber-400">宿屋（藤の家紋の家）で勧誘可能</span>
            )}
          </div>
        </DqFrame>
      </div>
    </div>
  );
};
