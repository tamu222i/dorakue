/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { Character, Item } from '../domain/models/types.ts';
import { InnService } from '../application/InnUseCase.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { Bed, UserPlus, Users, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';

interface InnScreenProps {
  party: PartyAggregate;
  catalog: Character[];
  onBackToWorld: () => void;
  initialMessage?: string;
  onEncounter?: (ids: string[]) => void;
}

type InnTab = 'rest' | 'scout' | 'formation' | 'shop';

export const InnScreen: React.FC<InnScreenProps> = ({
  party,
  catalog,
  onBackToWorld,
  initialMessage,
  onEncounter
}) => {
  const [activeTab, setActiveTab] = useState<InnTab>(initialMessage ? 'rest' : 'rest');
  const [dialogue, setDialogue] = useState<string>(
    initialMessage ||
    '女将「ようこそ、藤の家紋の家へ。鬼狩りの皆様、傷を癒し、隊の結束を固めていってくださいね」'
  );
  const [scoutCandidates, setScoutCandidates] = useState<Character[]>(() => {
    const candidates = InnService.getScoutCandidates(catalog, party);
    onEncounter?.(candidates.map(c => c.id));
    return candidates;
  });

  // Shop items for sale
  const SHOP_ITEMS: Item[] = [
    { id: 'item_herb', name: '傷薬（薬草）', description: 'HPを50回復する。', cost: 30, type: 'heal_hp', value: 50, count: 1 },
    { id: 'item_riceball', name: '特製おにぎり', description: '呼吸力（BP）を25回復する。', cost: 40, type: 'heal_bp', value: 25, count: 1 },
    { id: 'item_wisteria_water', name: '藤の花の霊水', description: '戦闘不能の味方をHP半分で蘇生する。', cost: 150, type: 'revive', value: 50, count: 1 },
  ];

  // Rest action
  const handleRest = () => {
    SoundEngine.playInnJingle();
    const res = InnService.restAtInn(party);
    setDialogue(res.message);
  };

  // Scout member
  const handleScout = (candidate: Character) => {
    const scoutCost = Math.max(50, candidate.level * 30);
    if (party.money < scoutCost) {
      SoundEngine.playCancel();
      setDialogue(`女将「路銀（所持金）が足りないようです…（必要: ${scoutCost}銭）」`);
      return;
    }

    party.money -= scoutCost;
    party.recruitMember(candidate);
    onEncounter?.([candidate.id]);
    SoundEngine.playLevelUp();
    setDialogue(`【勧誘成功！】${candidate.name}（${candidate.title}）が鬼殺隊の陣営に合流しました！`);
    // Refresh scout candidates
    const nextCandidates = InnService.getScoutCandidates(catalog, party);
    onEncounter?.(nextCandidates.map(c => c.id));
    setScoutCandidates(nextCandidates);
  };

  // Buy item
  const handleBuy = (item: Item) => {
    if (party.money < item.cost) {
      SoundEngine.playCancel();
      setDialogue(`女将「路銀が不足しております（必要: ${item.cost}銭）」`);
      return;
    }

    party.money -= item.cost;
    const existing = party.inventory.find(i => i.id === item.id);
    if (existing) {
      existing.count += 1;
    } else {
      party.inventory.push({ ...item, count: 1 });
    }
    SoundEngine.playConfirm();
    setDialogue(`『${item.name}』を 1つ 購入しました！（残金: ${party.money}銭）`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 p-2 select-none">
      {/* Top Banner: Location Header */}
      <DqFrame variant="gold" className="p-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
              <span>藤の家紋の宿（ふじのかもんのやど）＆ 蝶屋敷</span>
            </h2>
            <p className="text-xs text-slate-300">
              鬼殺隊士を無償で受け入れ、傷を癒し英気を養う安らぎの拠点。
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700">
            <span className="text-xs text-slate-400">所持金:</span>
            <span className="text-sm font-bold text-yellow-400 font-mono">{party.money} 銭</span>
          </div>
        </div>
      </DqFrame>

      {/* Innkeeper Dialogue Box */}
      <DqFrame title="女将の言葉" className="p-3">
        <div className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed min-h-[48px]">
          {dialogue}
        </div>
      </DqFrame>

      {/* Main Tab Navigation */}
      <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
        <button
          onClick={() => {
            SoundEngine.playCursor();
            setActiveTab('rest');
          }}
          className={`flex items-center justify-center gap-1.5 p-2 rounded border transition-colors touch-manipulation ${
            activeTab === 'rest'
              ? 'bg-amber-600 border-amber-300 text-white shadow'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span><FuriganaText text="休[やす]む(回復[かいふく])" /></span>
        </button>

        <button
          onClick={() => {
            SoundEngine.playCursor();
            setActiveTab('scout');
          }}
          className={`flex items-center justify-center gap-1.5 p-2 rounded border transition-colors touch-manipulation ${
            activeTab === 'scout'
              ? 'bg-cyan-600 border-cyan-300 text-white shadow'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span><FuriganaText text="隊士[たいし]勧誘[かんゆう]" /></span>
        </button>

        <button
          onClick={() => {
            SoundEngine.playCursor();
            setActiveTab('formation');
          }}
          className={`flex items-center justify-center gap-1.5 p-2 rounded border transition-colors touch-manipulation ${
            activeTab === 'formation'
              ? 'bg-purple-600 border-purple-300 text-white shadow'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span><FuriganaText text="部隊[ぶたい]編成[へんせい]" /></span>
        </button>

        <button
          onClick={() => {
            SoundEngine.playCursor();
            setActiveTab('shop');
          }}
          className={`flex items-center justify-center gap-1.5 p-2 rounded border transition-colors touch-manipulation ${
            activeTab === 'shop'
              ? 'bg-emerald-600 border-emerald-300 text-white shadow'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span><FuriganaText text="道具屋[どうぐや]" /></span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1">
        {/* 1. REST TAB */}
        {activeTab === 'rest' && (
          <DqFrame title="休養と宿泊" className="p-4 flex flex-col items-center gap-4">
            <div className="text-center max-w-md">
              <p className="text-xs sm:text-sm text-slate-300 mb-2">
                藤の香りが焚かれた座敷で休息をとります。隊員全員の HP と 呼吸力(BP) が全回復します。
              </p>
              <div className="flex justify-center gap-4 my-3">
                {party.activeMembers.map(m => (
                  <div key={m.id} className="flex flex-col items-center">
                    <PixelSprite character={m} size={48} />
                    <span className="text-[10px] text-amber-200 mt-1 truncate max-w-[64px]">{m.name}</span>
                    <span className="text-[9px] text-emerald-400 font-mono">HP {m.stats.hp}/{m.stats.maxHp}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleRest}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-md border-2 border-amber-300 shadow-lg flex items-center gap-2 text-sm transition-all"
            >
              <Bed className="w-4 h-4" />
              <span>一晩休む（HP・BP全回復）</span>
            </button>
          </DqFrame>
        )}

        {/* 2. SCOUT TAB ("味方は鬼殺隊を仲間にできるよ") */}
        {activeTab === 'scout' && (
          <DqFrame title="各地から集った鬼殺隊士の勧誘" className="p-3">
            <p className="text-xs text-slate-400 mb-2">
              藤の家紋の宿には任務の合間に立ち寄った隊士たちが集まります。路銀を渡して仲間に迎え入れましょう！
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {scoutCandidates.map(candidate => {
                const scoutCost = Math.max(50, candidate.level * 30);
                const canAfford = party.money >= scoutCost;

                return (
                  <div
                    key={candidate.id}
                    className="p-2.5 bg-slate-900 border border-slate-700 rounded flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <PixelSprite character={candidate} size={40} />
                        <div>
                          <div className="font-bold text-xs text-amber-200">{candidate.name}</div>
                          <div className="text-[10px] text-slate-400">階級: {candidate.rank} / Lv.{candidate.level}</div>
                          <div className="text-[10px] text-cyan-300">呼吸: {candidate.breathStyle}</div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 line-clamp-2 mb-2">
                        {candidate.lore}
                      </div>

                      <div className="bg-slate-950 p-1.5 rounded text-[9px] font-mono text-slate-300 grid grid-cols-2 gap-1 mb-2">
                        <div>HP: {candidate.stats.maxHp}</div>
                        <div>BP: {candidate.stats.maxBp}</div>
                        <div>攻: {candidate.stats.attack}</div>
                        <div>防: {candidate.stats.defense}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleScout(candidate)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                        canAfford
                          ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-300 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>仲間にする ({scoutCost}銭)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </DqFrame>
        )}

        {/* 3. FORMATION TAB */}
        {activeTab === 'formation' && (
          <DqFrame title="戦闘部隊の編成 (最大4人)" className="p-3">
            <div className="text-xs text-slate-300 mb-2">
              前線で戦う4名の戦闘隊士を選択してください。（現在加入総数: {party.roster.length}名）
            </div>

            {/* Current Active 4 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[0, 1, 2, 3].map(slotIdx => {
                const member = party.activeMembers[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className="p-2 bg-slate-900 border-2 border-amber-400/80 rounded flex flex-col items-center text-center"
                  >
                    <span className="text-[9px] text-amber-300 font-bold mb-1">枠 {slotIdx + 1}</span>
                    {member ? (
                      <>
                        <PixelSprite character={member} size={36} />
                        <span className="text-xs font-bold text-white mt-1 truncate max-w-full">{member.name}</span>
                        <span className="text-[10px] text-slate-400">Lv.{member.level}</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 py-4">空き</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Roster Pool to swap from */}
            <div className="text-xs font-bold text-slate-300 mb-1">所属隊士一覧（クリックして前線へ配置）:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {party.roster.map(member => {
                const isActive = party.activeMembers.some(m => m.id === member.id);
                return (
                  <div
                    key={member.id}
                    className={`p-1.5 rounded border flex items-center justify-between text-xs ${
                      isActive ? 'bg-indigo-950/60 border-indigo-500/80' : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <PixelSprite character={member} size={28} />
                      <div className="truncate">
                        <div className="font-bold text-white truncate">{member.name}</div>
                        <div className="text-[10px] text-slate-400">Lv.{member.level} / {member.rank}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive ? (
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-600 rounded text-white font-bold">前線参戦中</span>
                      ) : (
                        <button
                          onClick={() => {
                            SoundEngine.playConfirm();
                            party.setPartySlot(party.activeMembers.length < 4 ? party.activeMembers.length : 0, member.id);
                            setDialogue(`${member.name} を前線部隊に編入しました！`);
                          }}
                          className="text-[10px] px-2 py-0.5 bg-amber-600 hover:bg-amber-500 rounded text-white font-bold border border-amber-300"
                        >
                          前線へ
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </DqFrame>
        )}

        {/* 4. SHOP TAB */}
        {activeTab === 'shop' && (
          <DqFrame title="藤の薬舗・道具調達" className="p-3">
            <p className="text-xs text-slate-400 mb-2">
              任務に必要な傷薬や霊水を調達できます。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SHOP_ITEMS.map(it => {
                const canAfford = party.money >= it.cost;
                const currentCount = party.inventory.find(i => i.id === it.id)?.count || 0;

                return (
                  <div
                    key={it.id}
                    className="p-3 bg-slate-900 border border-slate-700 rounded flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-emerald-300 mb-0.5">{it.name}</div>
                      <div className="text-[10px] text-slate-400 mb-2">{it.description}</div>
                      <div className="text-[10px] text-slate-300 font-mono mb-2">
                        価格: <span className="text-yellow-400 font-bold">{it.cost}銭</span> / 所持: {currentCount}個
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuy(it)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>購入する</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </DqFrame>
        )}
      </div>

      {/* Bottom Action: Return to World Journey */}
      <div className="flex justify-end mt-1">
        <button
          onClick={() => {
            SoundEngine.playConfirm();
            onBackToWorld();
          }}
          className="px-5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded border border-indigo-400 flex items-center gap-2 shadow"
        >
          <span>任務（鬼退治の世界）へ出立する</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
