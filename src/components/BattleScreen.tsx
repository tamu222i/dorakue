/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Character, Skill, Item } from '../domain/models/types.ts';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { calculateDamage, isCriticalHit } from '../domain/services/DamageCalculator.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { Swords, Wind, Sparkles, Package, LogOut, FastForward, Play, RefreshCw } from 'lucide-react';

interface BattleScreenProps {
  party: PartyAggregate;
  enemy: Character;
  isBoss: boolean;
  onVictory: (expGained: number, moneyGained: number) => void;
  onEscape: () => void;
  onWipeout: () => void;
}

type BattleMenuMode = 'main' | 'skills' | 'items' | 'target';

export const BattleScreen: React.FC<BattleScreenProps> = ({
  party,
  enemy: initialEnemy,
  isBoss,
  onVictory,
  onEscape,
  onWipeout,
}) => {
  // Battle state
  const [enemy, setEnemy] = useState<Character>({ ...initialEnemy });
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0);
  const [menuMode, setMenuMode] = useState<BattleMenuMode>('main');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Turn action queue: actions chosen for each living party member
  const [memberActions, setMemberActions] = useState<
    { member: Character; type: 'attack' | 'skill' | 'item'; skill?: Skill; item?: Item }[]
  >([]);

  // Logs & animations
  const [battleLogs, setBattleLogs] = useState<string[]>([
    `${enemy.name} が あらわれた！`
  ]);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [enemyHit, setEnemyHit] = useState<boolean>(false);
  const [partyHitIndex, setPartyHitIndex] = useState<number | null>(null);
  const [damageNumber, setDamageNumber] = useState<{ value: number; isCrit: boolean; isHeal?: boolean } | null>(null);
  const [battleSpeed, setBattleSpeed] = useState<1 | 2>(1);
  const [isAutoBattle, setIsAutoBattle] = useState<boolean>(false);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll log to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLogs]);

  // Find first alive member when turn begins
  const currentMember = party.activeMembers[currentMemberIndex];

  // Helper to add log
  const addLog = (msg: string) => {
    setBattleLogs(prev => [...prev.slice(-15), msg]);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms / battleSpeed));

  // Check if enemy dead
  const checkEnemyDefeated = (currentHp: number) => {
    return currentHp <= 0;
  };

  // Turn execution
  const executeRound = async (actions: typeof memberActions) => {
    setIsProcessingTurn(true);

    let currentEnemyHp = enemy.stats.hp;

    // 1. Process player actions in speed order
    for (const action of actions) {
      const actor = action.member;
      if (actor.stats.hp <= 0) continue; // collapsed
      if (currentEnemyHp <= 0) break; // enemy already defeated

      if (action.type === 'attack') {
        SoundEngine.playAttack();
        addLog(`${actor.name} の こうげき！`);
        await delay(400);

        const isCrit = isCriticalHit(actor);
        if (isCrit) {
          SoundEngine.playCritical();
          addLog(`【隙の糸が見えた！】会心の一撃！！`);
        }

        const dmg = calculateDamage(actor, enemy, undefined, isCrit);
        currentEnemyHp = Math.max(0, currentEnemyHp - dmg);
        setEnemy(prev => ({ ...prev, stats: { ...prev.stats, hp: currentEnemyHp } }));

        setEnemyHit(true);
        setDamageNumber({ value: dmg, isCrit });
        await delay(500);
        setEnemyHit(false);
        setDamageNumber(null);

        addLog(`${enemy.name} に ${dmg} の ダメージを あたえた！`);
        await delay(300);

      } else if (action.type === 'skill' && action.skill) {
        const skill = action.skill;
        if (actor.stats.bp < skill.bpCost) {
          addLog(`${actor.name} は 呼吸力(BP) が 足りない！`);
          await delay(300);
          continue;
        }

        actor.stats.bp -= skill.bpCost;
        SoundEngine.playBreathSkill();
        addLog(`『${skill.katagaki ? skill.katagaki + ' ' : ''}${skill.name}』！`);
        await delay(500);

        if (skill.effectType === 'heal') {
          // Heal party member
          SoundEngine.playHeal();
          const target = party.activeMembers.find(m => m.stats.hp > 0 && m.stats.hp < m.stats.maxHp) || actor;
          const healVal = Math.round(actor.stats.attack * 1.5);
          target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healVal);
          setDamageNumber({ value: healVal, isCrit: false, isHeal: true });
          addLog(`${target.name} の HPが ${healVal} 回復した！`);
          await delay(400);
          setDamageNumber(null);
        } else {
          // Attack skill
          const isCrit = isCriticalHit(actor);
          if (isCrit) {
            SoundEngine.playCritical();
            addLog(`【隙の糸】呼吸の真髄が急所を貫く！！`);
          }
          const dmg = calculateDamage(actor, enemy, skill, isCrit);
          currentEnemyHp = Math.max(0, currentEnemyHp - dmg);
          setEnemy(prev => ({ ...prev, stats: { ...prev.stats, hp: currentEnemyHp } }));

          setEnemyHit(true);
          setDamageNumber({ value: dmg, isCrit });
          await delay(550);
          setEnemyHit(false);
          setDamageNumber(null);

          addLog(`${enemy.name} に ${dmg} の 怒涛のダメージ！！`);
          await delay(300);
        }

      } else if (action.type === 'item' && action.item) {
        SoundEngine.playHeal();
        const res = party.useItem(action.item.id, party.activeMembers.indexOf(actor));
        addLog(res.message);
        await delay(400);
      }

      // Check if enemy defeated after action
      if (checkEnemyDefeated(currentEnemyHp)) {
        break;
      }
    }

    // 2. Check Victory
    if (checkEnemyDefeated(currentEnemyHp)) {
      SoundEngine.playVictory();
      addLog(`討伐成功！ ${enemy.name} を たおした！`);
      await delay(800);

      const expReward = Math.round(enemy.level * 25 + (isBoss ? 200 : 30));
      const moneyReward = Math.round(enemy.level * 20 + (isBoss ? 300 : 50));
      const { leveledUp } = party.addExpAndMoney(expReward, moneyReward);

      addLog(`経験値 ${expReward} と ${moneyReward} 銭 を かくとくした！`);
      if (leveledUp.length > 0) {
        SoundEngine.playLevelUp();
        for (const l of leveledUp) {
          addLog(`★ ${l.name} は レベル ${l.newLevel} に あがった！ 全能力が向上！`);
        }
      }

      await delay(1200);
      setIsProcessingTurn(false);
      onVictory(expReward, moneyReward);
      return;
    }

    // 3. Enemy Turn (if still alive)
    await delay(300);
    const livingMembers = party.activeMembers.filter(m => m.stats.hp > 0);
    if (livingMembers.length > 0) {
      // Pick random skill or regular attack
      const useSkill = enemy.skills.length > 0 && Math.random() < 0.6 && enemy.stats.bp >= 10;
      const enemySkill = useSkill ? enemy.skills[Math.floor(Math.random() * enemy.skills.length)] : undefined;

      if (enemySkill) {
        SoundEngine.playBreathSkill();
        addLog(`${enemy.name} の ${enemySkill.name}！！`);
        await delay(500);

        if (enemySkill.target === 'all') {
          // Attack entire party
          for (let i = 0; i < party.activeMembers.length; i++) {
            const member = party.activeMembers[i];
            if (member.stats.hp <= 0) continue;
            const dmg = calculateDamage(enemy, member, enemySkill);
            member.stats.hp = Math.max(0, member.stats.hp - dmg);
            setPartyHitIndex(i);
            addLog(`${member.name} は ${dmg} の ダメージを うけた！`);
            await delay(300);
          }
          setPartyHitIndex(null);
        } else {
          // Target single
          const target = livingMembers[Math.floor(Math.random() * livingMembers.length)];
          const targetIndex = party.activeMembers.indexOf(target);
          const dmg = calculateDamage(enemy, target, enemySkill);
          target.stats.hp = Math.max(0, target.stats.hp - dmg);
          setPartyHitIndex(targetIndex);
          SoundEngine.playAttack();
          await delay(400);
          setPartyHitIndex(null);
          addLog(`${target.name} は ${dmg} の 深手を おった！`);
        }
      } else {
        // Normal attack
        const target = livingMembers[Math.floor(Math.random() * livingMembers.length)];
        const targetIndex = party.activeMembers.indexOf(target);
        SoundEngine.playAttack();
        addLog(`${enemy.name} の こうげき！`);
        await delay(400);

        const dmg = calculateDamage(enemy, target);
        target.stats.hp = Math.max(0, target.stats.hp - dmg);
        setPartyHitIndex(targetIndex);
        await delay(400);
        setPartyHitIndex(null);
        addLog(`${target.name} に ${dmg} の ダメージ！`);
      }
    }

    // 4. Check Wipeout ("死んだら宿で復活だよ")
    if (party.isAllDead()) {
      SoundEngine.playWipeout();
      addLog(`隊士たちは力尽き、全員たおれてしまった……！`);
      addLog(`隠（かくし）の部隊が駆けつけ、藤の家紋の宿へと搬送される……`);
      await delay(1500);
      setIsProcessingTurn(false);
      onWipeout();
      return;
    }

    // Reset round
    setMemberActions([]);
    setCurrentMemberIndex(0);
    setMenuMode('main');
    setIsProcessingTurn(false);
  };

  // Quick All-Attack handler for fast 1-tap mobile grinding
  const handleQuickAllAttack = () => {
    SoundEngine.playConfirm();
    const living = party.activeMembers.filter(m => m.stats.hp > 0);
    const actions = living.map(m => ({ member: m, type: 'attack' as const }));
    setMemberActions(actions);
    executeRound(actions);
  };

  // Next action handler
  const queueAction = (action: { member: Character; type: 'attack' | 'skill' | 'item'; skill?: Skill; item?: Item }) => {
    SoundEngine.playConfirm();
    const updated = [...memberActions, action];
    setMemberActions(updated);

    // Find next living member
    let nextIdx = currentMemberIndex + 1;
    while (nextIdx < party.activeMembers.length && party.activeMembers[nextIdx].stats.hp <= 0) {
      nextIdx++;
    }

    if (nextIdx < party.activeMembers.length) {
      setCurrentMemberIndex(nextIdx);
      setMenuMode('main');
    } else {
      // All actions selected, execute round!
      executeRound(updated);
    }
  };

  // Auto-battle loop
  useEffect(() => {
    if (isAutoBattle && !isProcessingTurn && memberActions.length === 0) {
      // Generate default attacks for all living members
      const autoActions = party.activeMembers
        .filter(m => m.stats.hp > 0)
        .map(m => {
          // If has plenty BP, use highest skill
          if (m.skills.length > 0 && m.stats.bp >= m.skills[0].bpCost && Math.random() < 0.7) {
            return { member: m, type: 'skill' as const, skill: m.skills[0] };
          }
          return { member: m, type: 'attack' as const };
        });
      executeRound(autoActions);
    }
  }, [isAutoBattle, isProcessingTurn, memberActions.length]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 min-h-[560px] p-2 select-none">
      {/* Top Header: Enemy Status & Speed Multiplier */}
      <div className="flex justify-between items-center px-2 py-1 bg-slate-900/90 rounded border border-slate-700 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-bold">{isBoss ? '【強敵・十二鬼月】' : '【野良鬼】'}</span>
          <span className="text-white font-bold">{enemy.name}</span>
          <span className="text-slate-400">Lv.{enemy.level}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              SoundEngine.playCursor();
              setBattleSpeed(prev => (prev === 1 ? 2 : 1));
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 border ${
              battleSpeed === 2 ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-300'
            }`}
          >
            <FastForward className="w-3 h-3" />
            <span>{battleSpeed}x速</span>
          </button>
          <button
            onClick={() => {
              SoundEngine.playCursor();
              setIsAutoBattle(prev => !prev);
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 border ${
              isAutoBattle ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-300'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>AUTO</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Battle Field & Monster Graphic */}
      <div className="relative w-full h-56 sm:h-64 rounded-lg bg-gradient-to-b from-[#0b0c16] via-[#16182a] to-[#0a0f1d] border-4 border-slate-600 shadow-inner flex flex-col items-center justify-center overflow-hidden">
        {/* Background Atmosphere: Moonlit Night / Wisteria Forest / Blood mist */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-900 to-transparent"></div>

        {/* Floating Damage Number */}
        {damageNumber && (
          <div
            className={`absolute top-10 font-extrabold text-2xl sm:text-3xl animate-bounce z-20 ${
              damageNumber.isHeal
                ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : damageNumber.isCrit
                ? 'text-amber-300 scale-125 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                : 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
            }`}
          >
            {damageNumber.isCrit && <span className="block text-xs text-amber-200 text-center">隙の糸！</span>}
            {damageNumber.isHeal ? `+${damageNumber.value}` : `-${damageNumber.value}`}
          </div>
        )}

        {/* Enemy Monster Graphic & HP Bar */}
        <div className="flex flex-col items-center relative z-10">
          <PixelSprite
            character={enemy}
            size={96}
            isHit={enemyHit}
            isCollapsed={enemy.stats.hp <= 0}
            className="transition-transform drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
          />
          <div className="w-36 sm:w-44 bg-slate-900 border border-slate-700 rounded-full h-3 mt-2 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, (enemy.stats.hp / enemy.stats.maxHp) * 100))}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-300 font-mono mt-0.5">
            HP {enemy.stats.hp} / {enemy.stats.maxHp}
          </div>
        </div>
      </div>

      {/* 4-Hero Status Bar (Dragon Quest Style Window) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {party.activeMembers.map((member, idx) => {
          const isCurrent = currentMember && member.id === currentMember.id && !isProcessingTurn;
          const isHit = partyHitIndex === idx;
          const isDead = member.stats.hp <= 0;

          return (
            <DqFrame
              key={member.id}
              variant={isCurrent ? 'gold' : 'default'}
              className={`p-2 transition-all ${
                isHit ? 'bg-red-950/80 border-red-500 animate-shake' : ''
              } ${isDead ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <PixelSprite character={member} size={28} isCollapsed={isDead} />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold truncate text-amber-200">{member.name}</div>
                  <div className="text-[10px] text-slate-400">Lv.{member.level}</div>
                </div>
              </div>

              {/* HP Bar */}
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-slate-400 font-bold">HP</span>
                <span className={`font-mono ${member.stats.hp < member.stats.maxHp * 0.3 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                  {member.stats.hp}/{member.stats.maxHp}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mb-1 border border-slate-700">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (member.stats.hp / member.stats.maxHp) * 100))}%` }}
                />
              </div>

              {/* BP Bar (Breath Points / 呼吸力) */}
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-cyan-300 font-bold">BP</span>
                <span className="font-mono text-cyan-300">
                  {member.stats.bp}/{member.stats.maxBp}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, (member.stats.bp / member.stats.maxBp) * 100))}%` }}
                />
              </div>
            </DqFrame>
          );
        })}
      </div>

      {/* Bottom Interface: Command Window + Battle Log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
        {/* Command Window */}
        <DqFrame
          title={currentMember && !isProcessingTurn ? `${currentMember.name} の 行動` : '状況'}
          className="md:col-span-1 p-2 flex flex-col justify-center"
        >
          {isProcessingTurn ? (
            <div className="flex flex-col items-center justify-center p-4 text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
              <span className="text-xs">戦況が動いている……</span>
            </div>
          ) : menuMode === 'main' && currentMember ? (
            <div className="flex flex-col gap-2">
              {/* Quick All-Attack for 1-thumb mobile speed grinding */}
              <button
                onClick={handleQuickAllAttack}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 active:scale-[0.98] text-white rounded border border-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md touch-manipulation transition-transform"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>
                  <FuriganaText text="⚡ 全員[ぜんいん]で突撃[とつげき]（指[ゆび]1本[ぽん]で戦[たたか]う）" />
                </span>
              </button>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => queueAction({ member: currentMember, type: 'attack' })}
                  className="flex items-center gap-1.5 p-2.5 min-h-[46px] bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded border border-slate-600 text-left transition-colors touch-manipulation"
                >
                  <Swords className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-bold">
                    <FuriganaText text="戦[たたか]う" />
                  </span>
                </button>

                <button
                  onClick={() => {
                    SoundEngine.playCursor();
                    setMenuMode('skills');
                  }}
                  className="flex items-center gap-1.5 p-2.5 min-h-[46px] bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 rounded border border-slate-600 text-left transition-colors touch-manipulation"
                >
                  <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-bold">
                    <FuriganaText text="呼吸[こきゅう]わざ" />
                  </span>
                </button>

                <button
                  onClick={() => {
                    SoundEngine.playCursor();
                    setMenuMode('items');
                  }}
                  className="flex items-center gap-1.5 p-2.5 min-h-[46px] bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 rounded border border-slate-600 text-left transition-colors touch-manipulation"
                >
                  <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">
                    <FuriganaText text="道具[どうぐ]" />
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (isBoss) {
                      addLog('ボス戦からは 逃げられない！');
                      SoundEngine.playCancel();
                    } else {
                      SoundEngine.playConfirm();
                      onEscape();
                    }
                  }}
                  className="flex items-center gap-1.5 p-2.5 min-h-[46px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded border border-slate-600 text-left transition-colors touch-manipulation"
                >
                  <LogOut className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-bold">
                    <FuriganaText text="逃[に]げる" />
                  </span>
                </button>
              </div>
            </div>
          ) : menuMode === 'skills' && currentMember ? (
            <div className="flex flex-col gap-1 max-h-44 overflow-y-auto">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-700 pb-1">
                <span>全集中・呼吸 / 血鬼術</span>
                <button
                  onClick={() => {
                    SoundEngine.playCancel();
                    setMenuMode('main');
                  }}
                  className="text-amber-400 hover:underline"
                >
                  [もどる]
                </button>
              </div>

              {currentMember.skills.map(sk => {
                const canUse = currentMember.stats.bp >= sk.bpCost;
                return (
                  <button
                    key={sk.id}
                    disabled={!canUse}
                    onClick={() => queueAction({ member: currentMember, type: 'skill', skill: sk })}
                    className={`flex items-center justify-between p-1.5 rounded border text-left text-xs transition-colors ${
                      canUse
                        ? 'bg-slate-800 hover:bg-cyan-900 border-slate-600 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-cyan-300">{sk.name}</div>
                      <div className="text-[10px] text-slate-400">{sk.description}</div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 shrink-0 ml-1">
                      {sk.bpCost}BP
                    </span>
                  </button>
                );
              })}
            </div>
          ) : menuMode === 'items' && currentMember ? (
            <div className="flex flex-col gap-1 max-h-44 overflow-y-auto">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-700 pb-1">
                <span>所持どうぐ</span>
                <button
                  onClick={() => {
                    SoundEngine.playCancel();
                    setMenuMode('main');
                  }}
                  className="text-amber-400 hover:underline"
                >
                  [もどる]
                </button>
              </div>

              {party.inventory.filter(i => i.count > 0).length === 0 ? (
                <div className="text-xs text-slate-500 p-2 text-center">どうぐを持っていません</div>
              ) : (
                party.inventory
                  .filter(i => i.count > 0)
                  .map(it => (
                    <button
                      key={it.id}
                      onClick={() => queueAction({ member: currentMember, type: 'item', item: it })}
                      className="flex items-center justify-between p-1.5 rounded border border-slate-600 bg-slate-800 hover:bg-emerald-900 text-xs text-left"
                    >
                      <div>
                        <div className="font-bold text-emerald-300">{it.name}</div>
                        <div className="text-[10px] text-slate-400">{it.description}</div>
                      </div>
                      <span className="text-xs text-amber-300 font-mono shrink-0 ml-1">x{it.count}</span>
                    </button>
                  ))
              )}
            </div>
          ) : null}
        </DqFrame>

        {/* Dragon Quest Classic Battle Text Log */}
        <DqFrame title="戦況ログ" className="md:col-span-2 p-2 flex flex-col justify-end">
          <div
            ref={logContainerRef}
            className="flex-1 max-h-36 overflow-y-auto font-mono text-xs leading-relaxed flex flex-col gap-1 pr-1"
          >
            {battleLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes('ダメージ')
                    ? 'text-rose-300'
                    : log.includes('回復')
                    ? 'text-emerald-300'
                    : log.includes('隙の糸') || log.includes('奥義')
                    ? 'text-amber-300 font-bold'
                    : log.includes('たおした') || log.includes('レベル')
                    ? 'text-yellow-400 font-bold'
                    : 'text-slate-200'
                }
              >
                ▶ {log}
              </div>
            ))}
          </div>
        </DqFrame>
      </div>
    </div>
  );
};
