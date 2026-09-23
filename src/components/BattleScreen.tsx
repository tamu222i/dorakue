/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Character, Skill, Item, StoryChapter } from '../domain/models/types.ts';
import { PartyAggregate } from '../domain/aggregates/PartyAggregate.ts';
import { calculateDamage, isCriticalHit } from '../domain/services/DamageCalculator.ts';
import { PixelSprite } from '../infrastructure/renderer/PixelSprite.tsx';
import { SoundEngine } from '../infrastructure/audio/RetroSound.ts';
import { isUltimateSkill } from '../domain/services/SkillProgressionService.ts';
import { EnemyGroupService } from '../domain/services/EnemyGroupService.ts';
import { AutoItemService } from '../domain/services/AutoItemService.ts';
import { UltimateCutIn } from './UltimateCutIn.tsx';
import { DqFrame } from './DqFrame.tsx';
import { FuriganaText } from './Ruby.tsx';
import { Swords, Wind, Sparkles, Package, LogOut, FastForward, Play, RefreshCw, Flame, Target, Zap } from 'lucide-react';

interface BattleScreenProps {
  party: PartyAggregate;
  enemy: Character;
  enemies?: Character[];
  isBoss: boolean;
  chapter?: StoryChapter;
  isEasyAssist?: boolean;
  onVictory: (expGained: number, moneyGained: number, leveledUp: { name: string; newLevel: number }[]) => void;
  onEscape: () => void;
  onWipeout: () => void;
}

type BattleMenuMode = 'main' | 'skills' | 'items';

interface QueuedAction {
  member: Character;
  type: 'attack' | 'skill' | 'item';
  targetEnemyIndex?: number;
  skill?: Skill;
  item?: Item;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  party,
  enemy: initialEnemy,
  enemies: initialEnemies,
  isBoss,
  chapter,
  isEasyAssist = true,
  onVictory,
  onEscape,
  onWipeout,
}) => {
  // Helper to determine if an enemy is the final stage boss (最終ボス: 鬼の王・竈門炭治郎 or 鬼舞辻無惨)
  const isFinalBossDemon = (e: Character): boolean => {
    if (!e) return false;
    if (e.id === 'demon_tanjiro' || e.id === 'demon_muzan_final') return true;
    if (e.name.includes('鬼化・竈門炭治郎') || e.name.includes('鬼の王') || e.name.includes('鬼舞辻無惨')) return true;
    if (chapter && chapter.chapterNumber >= 8 && isBoss) return true;
    return false;
  };

  const isFinalStage = useMemo(() => {
    if (chapter && chapter.chapterNumber >= 8) return true;
    return isFinalBossDemon(initialEnemy) || (initialEnemies && initialEnemies.some(e => isFinalBossDemon(e)));
  }, [chapter, initialEnemy, initialEnemies]);
  // Multi-enemy team state (1 to 4 enemies)
  const [enemies, setEnemies] = useState<Character[]>(() => {
    if (initialEnemies && initialEnemies.length > 0) {
      return initialEnemies.map(e => ({ ...e, stats: { ...e.stats } }));
    }
    return EnemyGroupService.resolveEnemies(initialEnemy, []).map(e => ({ ...e, stats: { ...e.stats } }));
  });

  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(0);
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0);
  const [menuMode, setMenuMode] = useState<BattleMenuMode>('main');

  // Turn action queue: actions chosen for each living party member
  const [memberActions, setMemberActions] = useState<QueuedAction[]>([]);

  // Logs & animations
  const [battleLogs, setBattleLogs] = useState<string[]>(() => {
    const list = (initialEnemies && initialEnemies.length > 0)
      ? initialEnemies
      : EnemyGroupService.resolveEnemies(initialEnemy, []);
    const appearMsg = list.length === 1
      ? `${list[0].name} が あらわれた！`
      : `${list.map(e => e.name).join('、')} が あらわれた！`;

    if (chapter && chapter.chapterNumber >= 8) {
      return [
        appearMsg,
        '⚠️【最終決戦・鬼の王の超再生】鬼の王は驚異の超再生力を誇る！『最強の呼吸（極限奥義）』でなければトドメを刺すことはできない！！'
      ];
    }
    return [appearMsg];
  });

  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [enemyHitIndices, setEnemyHitIndices] = useState<number[]>([]);
  const [partyHitIndex, setPartyHitIndex] = useState<number | null>(null);
  const [damageNumbers, setDamageNumbers] = useState<Record<number, { value: number; isCrit: boolean; isHeal?: boolean }>>({});
  const [partyDamageNumber, setPartyDamageNumber] = useState<{ value: number; isHeal?: boolean } | null>(null);
  const [battleSpeed, setBattleSpeed] = useState<1 | 2>(1);
  const [isAutoBattle, setIsAutoBattle] = useState<boolean>(false);
  const [roundTimeline, setRoundTimeline] = useState<{ id: string; name: string; isPlayer: boolean; speed: number; initiative: number }[]>([]);
  const [activeCombatantId, setActiveCombatantId] = useState<string | null>(null);
  const [activeCutIn, setActiveCutIn] = useState<{ character: Character; skill: Skill } | null>(null);
  const cutInResolverRef = useRef<(() => void) | null>(null);

  // Predicted speed rankings for living combatants
  const speedRankings = useMemo(() => {
    const passive = AutoItemService.getPassiveStatBonuses(party.inventory);
    const combatants = [
      ...party.activeMembers
        .filter(m => m.stats.hp > 0)
        .map(m => ({
          id: `player_${m.id}`,
          name: m.name,
          isPlayer: true,
          speed: m.stats.speed + passive.bonusSpd
        })),
      ...enemies
        .filter(e => e.stats.hp > 0)
        .map((e, idx) => ({
          id: `enemy_${e.id}_${idx}`,
          name: e.name,
          isPlayer: false,
          speed: e.stats.speed
        }))
    ];
    return combatants.sort((a, b) => b.speed - a.speed);
  }, [party.activeMembers, party.inventory, enemies]);

  const triggerCutIn = (character: Character, skill: Skill): Promise<void> => {
    return new Promise<void>((resolve) => {
      cutInResolverRef.current = resolve;
      setActiveCutIn({ character, skill });
    });
  };

  const handleCutInComplete = () => {
    setActiveCutIn(null);
    if (cutInResolverRef.current) {
      cutInResolverRef.current();
      cutInResolverRef.current = null;
    }
  };

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll log to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLogs]);

  // Helper to ensure target index points to a living enemy
  const getActiveTargetIndex = (list: Character[] = enemies): number => {
    if (list[selectedTargetIndex] && list[selectedTargetIndex].stats.hp > 0) {
      return selectedTargetIndex;
    }
    const firstLiving = list.findIndex(e => e.stats.hp > 0);
    return firstLiving >= 0 ? firstLiving : 0;
  };

  // Find first alive member when turn begins
  const currentMember = party.activeMembers[currentMemberIndex];

  // Sort skills so the most powerful breathing techniques appear at the very top
  const sortedCurrentMemberSkills = useMemo(() => {
    if (!currentMember || !currentMember.skills) return [];
    return [...currentMember.skills].sort((a, b) => {
      if (b.power !== a.power) return b.power - a.power;
      return b.bpCost - a.bpCost;
    });
  }, [currentMember]);

  // Helper to add log
  const addLog = (msg: string) => {
    setBattleLogs(prev => [...prev.slice(-16), msg]);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms / battleSpeed));

  // Check if all enemies are defeated
  const areAllEnemiesDefeated = (list: Character[]) => {
    return list.every(e => e.stats.hp <= 0);
  };

  // Turn execution: Speed-based interleaved actions & Auto-Item Application
  const executeRound = async (actions: QueuedAction[]) => {
    setIsProcessingTurn(true);

    const currentEnemies = enemies.map(e => ({ ...e, stats: { ...e.stats } }));
    const passive = AutoItemService.getPassiveStatBonuses(party.inventory);

    // お助けサポート（藤の花の加護＆全集中の力）
    if (isEasyAssist) {
      let healedAny = false;
      for (const m of party.activeMembers) {
        if (m.stats.hp > 0) {
          const healAmount = Math.max(25, Math.round(m.stats.maxHp * 0.12));
          if (m.stats.hp < m.stats.maxHp) {
            m.stats.hp = Math.min(m.stats.maxHp, m.stats.hp + healAmount);
            healedAny = true;
          }
          m.stats.bp = Math.min(m.stats.maxBp, m.stats.bp + 15);
        }
      }
      if (healedAny) {
        addLog(`【藤の花の加護】隊士たちの傷が癒え、呼吸力(BP)が回復した！`);
        await delay(300);
      }
    }

    // Build unified combatants queue sorted by speed with initiative roll!
    interface RoundParticipant {
      id: string;
      name: string;
      isPlayer: boolean;
      speed: number;
      initiative: number;
      playerAction?: QueuedAction;
      enemyIndex?: number;
    }

    const participants: RoundParticipant[] = [];

    // Player combatants
    for (const action of actions) {
      if (action.member.stats.hp <= 0) continue;
      const effectiveSpeed = action.member.stats.speed + passive.bonusSpd;
      const variance = Math.floor(Math.random() * (effectiveSpeed * 0.3 + 3));
      const initiative = Math.round(effectiveSpeed * 0.85) + variance;
      participants.push({
        id: `player_${action.member.id}`,
        name: action.member.name,
        isPlayer: true,
        speed: effectiveSpeed,
        initiative,
        playerAction: action
      });
    }

    // Living enemies
    currentEnemies.forEach((e, idx) => {
      if (e.stats.hp <= 0) return;
      const variance = Math.floor(Math.random() * (e.stats.speed * 0.3 + 3));
      const initiative = Math.round(e.stats.speed * 0.85) + variance;
      participants.push({
        id: `enemy_${e.id}_${idx}`,
        name: e.name,
        isPlayer: false,
        speed: e.stats.speed,
        initiative,
        enemyIndex: idx
      });
    });

    // Sort strictly by initiative (素早さによって攻撃の順番が変わる)
    participants.sort((a, b) => b.initiative - a.initiative);

    setRoundTimeline(participants.map(p => ({
      id: p.id,
      name: p.name,
      isPlayer: p.isPlayer,
      speed: p.speed,
      initiative: p.initiative
    })));

    // Process all combatants in speed order
    for (const p of participants) {
      if (areAllEnemiesDefeated(currentEnemies)) break;
      if (party.isAllDead()) break;

      setActiveCombatantId(p.id);

      if (p.isPlayer && p.playerAction) {
        const action = p.playerAction;
        const actor = action.member;
        if (actor.stats.hp <= 0) continue; // collapsed before acting

        if (action.type === 'attack') {
          SoundEngine.playAttack();
          addLog(`${actor.name} の こうげき！ (素早さ:${p.speed})`);
          await delay(350);

          let tIdx = action.targetEnemyIndex ?? getActiveTargetIndex(currentEnemies);
          if (!currentEnemies[tIdx] || currentEnemies[tIdx].stats.hp <= 0) {
            tIdx = getActiveTargetIndex(currentEnemies);
          }
          const targetEnemy = currentEnemies[tIdx];
          if (!targetEnemy || targetEnemy.stats.hp <= 0) continue;

          const isCrit = isEasyAssist ? (Math.random() < 0.25 || isCriticalHit(actor)) : isCriticalHit(actor);
          if (isCrit) {
            SoundEngine.playCritical();
            addLog(`【隙の糸が見えた！】会心の一撃！！`);
          }

          const isFinal = isFinalBossDemon(targetEnemy);
          let dmg = calculateDamage(actor, targetEnemy, undefined, isCrit, isEasyAssist);
          if (isFinal) {
            // Normal attacks cannot pierce the immortal demon body
            dmg = Math.max(1, Math.round(dmg * 0.25));
            addLog(`【鬼の王の硬質肉体】通常の攻撃では浅い傷しかつかない！最強の呼吸（奥義）でなければ致命傷を与えられない！`);
          }

          let newHp = targetEnemy.stats.hp - dmg;
          if (isFinal && newHp <= 0) {
            newHp = 1;
            addLog(`⚠️【驚異の超再生！】鬼の王の肉体が瞬時に塞がる！最強の呼吸（奥義）でなければトドメを刺せない！`);
          }
          targetEnemy.stats.hp = Math.max(0, newHp);
          setEnemies([...currentEnemies]);

          setEnemyHitIndices([tIdx]);
          setDamageNumbers({ [tIdx]: { value: dmg, isCrit } });
          await delay(450);
          setEnemyHitIndices([]);
          setDamageNumbers({});

          addLog(`${targetEnemy.name} に ${dmg} の ダメージを あたえた！`);
          if (targetEnemy.stats.hp <= 0) {
            if (isFinal) {
              addLog(`💥【滅殺！】${actor.name} の猛攻が鬼の王を打ち滅ぼした！！`);
            } else {
              addLog(`💥 ${targetEnemy.name} を たおした！`);
            }
          }
          await delay(250);

        } else if (action.type === 'skill' && action.skill) {
          const skill = action.skill;

          // Check Auto-Replenish BP if actor lacks BP (アイテム持っているだけで自動適用)
          if (actor.stats.bp < skill.bpCost) {
            const autoBp = AutoItemService.checkAutoBpReplenish(party, actor, skill.bpCost);
            if (autoBp) {
              SoundEngine.playHeal();
              addLog(autoBp.message!);
              await delay(300);
            }
          }

          if (actor.stats.bp < skill.bpCost) {
            addLog(`${actor.name} は 呼吸力(BP) が 足りない！`);
            await delay(300);
            continue;
          }

          actor.stats.bp -= skill.bpCost;

          // Ultimate cut-in strictly for the character's strongest breathing technique
          if (isUltimateSkill(actor, skill)) {
            addLog(`★【最強奥義】${actor.name} は 全神経を研ぎ澄まし、最強の呼吸『${skill.name}』を放つ！！`);
            await triggerCutIn(actor, skill);
          }

          SoundEngine.playBreathSkill();
          addLog(`『${skill.katagaki ? skill.katagaki + ' ' : ''}${skill.name}』！ (素早さ:${p.speed})`);
          await delay(450);

          if (skill.effectType === 'heal') {
            SoundEngine.playHeal();
            const target = party.activeMembers.find(m => m.stats.hp > 0 && m.stats.hp < m.stats.maxHp) || actor;
            const healVal = Math.round(actor.stats.attack * (isEasyAssist ? 2.2 : 1.5));
            target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healVal);
            setPartyDamageNumber({ value: healVal, isHeal: true });
            addLog(`${target.name} の HPが ${healVal} 回復した！`);
            await delay(400);
            setPartyDamageNumber(null);
          } else if (skill.target === 'all') {
            const livingIndices = currentEnemies
              .map((e, idx) => (e.stats.hp > 0 ? idx : -1))
              .filter(idx => idx >= 0);

            const hitMap: Record<number, { value: number; isCrit: boolean }> = {};
            const isUltimate = isUltimateSkill(actor, skill);

            for (const idx of livingIndices) {
              const targetEnemy = currentEnemies[idx];
              const isFinal = isFinalBossDemon(targetEnemy);
              const isCrit = isEasyAssist ? (Math.random() < 0.25 || isCriticalHit(actor)) : isCriticalHit(actor);
              let dmg = calculateDamage(actor, targetEnemy, skill, isCrit, isEasyAssist);
              if (isFinal && isUltimate) {
                dmg = Math.round(dmg * 1.3); // bonus devastation
              }
              let newHp = targetEnemy.stats.hp - dmg;
              if (isFinal && !isUltimate && newHp <= 0) {
                newHp = 1;
                addLog(`⚠️【驚異の超再生！】鬼の王の肉体が瞬時に塞がる！最強の呼吸（奥義）でなければトドメを刺せない！`);
              }
              targetEnemy.stats.hp = Math.max(0, newHp);
              hitMap[idx] = { value: dmg, isCrit };
            }

            setEnemies([...currentEnemies]);
            setEnemyHitIndices(livingIndices);
            setDamageNumbers(hitMap);
            await delay(550);
            setEnemyHitIndices([]);
            setDamageNumbers({});

            for (const idx of livingIndices) {
              const targetEnemy = currentEnemies[idx];
              const isFinal = isFinalBossDemon(targetEnemy);
              addLog(`${targetEnemy.name} に ${hitMap[idx].value} の 怒涛のダメージ！！`);
              if (targetEnemy.stats.hp <= 0) {
                if (isFinal) {
                  addLog(`💥【滅殺！】${actor.name} の最強奥義『${skill.name}』が鬼の王の再生核を完全に両断した！！`);
                } else {
                  addLog(`💥 ${targetEnemy.name} を たおした！`);
                }
              }
            }
            await delay(250);

          } else {
            let tIdx = action.targetEnemyIndex ?? getActiveTargetIndex(currentEnemies);
            if (!currentEnemies[tIdx] || currentEnemies[tIdx].stats.hp <= 0) {
              tIdx = getActiveTargetIndex(currentEnemies);
            }
            const targetEnemy = currentEnemies[tIdx];
            if (!targetEnemy || targetEnemy.stats.hp <= 0) continue;

            const isFinal = isFinalBossDemon(targetEnemy);
            const isUltimate = isUltimateSkill(actor, skill);
            const isCrit = isEasyAssist ? (Math.random() < 0.25 || isCriticalHit(actor)) : isCriticalHit(actor);
            if (isCrit) {
              SoundEngine.playCritical();
              addLog(`【隙の糸】呼吸の真髄が急所を貫く！！`);
            }

            let dmg = calculateDamage(actor, targetEnemy, skill, isCrit, isEasyAssist);
            if (isFinal && isUltimate) {
              dmg = Math.round(dmg * 1.3); // bonus devastation
            }
            let newHp = targetEnemy.stats.hp - dmg;
            if (isFinal && !isUltimate && newHp <= 0) {
              newHp = 1;
              addLog(`⚠️【驚異の超再生！】鬼の王の肉体が瞬時に塞がる！最強の呼吸（奥義）でなければトドメを刺せない！`);
            }
            targetEnemy.stats.hp = Math.max(0, newHp);
            setEnemies([...currentEnemies]);

            setEnemyHitIndices([tIdx]);
            setDamageNumbers({ [tIdx]: { value: dmg, isCrit } });
            await delay(500);
            setEnemyHitIndices([]);
            setDamageNumbers({});

            addLog(`${targetEnemy.name} に ${dmg} の 怒涛のダメージ！！`);
            if (targetEnemy.stats.hp <= 0) {
              if (isFinal) {
                addLog(`💥【滅殺！】${actor.name} の最強奥義『${skill.name}』が鬼の王の急所を断ち切った！ 永きにわたる鬼との死闘に終止符を打った！！`);
              } else {
                addLog(`💥 ${targetEnemy.name} を たおした！`);
              }
            }
            await delay(250);
          }

        } else if (action.type === 'item' && action.item) {
          SoundEngine.playHeal();
          const res = party.useItem(action.item.id, party.activeMembers.indexOf(actor));
          addLog(res.message);
          await delay(350);
        }

      } else if (!p.isPlayer && p.enemyIndex !== undefined) {
        // Enemy Turn in Speed Order
        const livingEnemy = currentEnemies[p.enemyIndex];
        if (!livingEnemy || livingEnemy.stats.hp <= 0) {
          // Defeated by faster slayer earlier this round!
          continue;
        }

        const livingMembers = party.activeMembers.filter(m => m.stats.hp > 0);
        if (livingMembers.length === 0) break;

        const useSkill = livingEnemy.skills.length > 0 && Math.random() < 0.6 && livingEnemy.stats.bp >= 10;
        const enemySkill = useSkill ? livingEnemy.skills[Math.floor(Math.random() * livingEnemy.skills.length)] : undefined;

        if (enemySkill) {
          SoundEngine.playBreathSkill();
          addLog(`${livingEnemy.name} の ${enemySkill.name}！！ (素早さ:${p.speed})`);
          await delay(450);

          if (enemySkill.target === 'all') {
            for (let i = 0; i < party.activeMembers.length; i++) {
              const member = party.activeMembers[i];
              if (member.stats.hp <= 0) continue;
              const dmg = calculateDamage(livingEnemy, member, enemySkill, false, isEasyAssist);
              member.stats.hp = Math.max(0, member.stats.hp - dmg);
              setPartyHitIndex(i);
              addLog(`${member.name} は ${dmg} の ダメージを うけた！`);
              await delay(250);

              // Auto Item Application check on damage
              if (member.stats.hp <= 0) {
                const reviveRes = AutoItemService.checkAutoRevive(party, member);
                if (reviveRes) {
                  SoundEngine.playHeal();
                  addLog(reviveRes.message!);
                  setPartyDamageNumber({ value: reviveRes.recoveredAmount || 50, isHeal: true });
                  await delay(350);
                  setPartyDamageNumber(null);
                }
              } else if (member.stats.hp <= Math.round(member.stats.maxHp * 0.45)) {
                const healRes = AutoItemService.checkAutoHpHeal(party, member);
                if (healRes) {
                  SoundEngine.playHeal();
                  addLog(healRes.message!);
                  setPartyDamageNumber({ value: healRes.recoveredAmount || 50, isHeal: true });
                  await delay(350);
                  setPartyDamageNumber(null);
                }
              }
            }
            setPartyHitIndex(null);
          } else {
            const target = livingMembers[Math.floor(Math.random() * livingMembers.length)];
            const targetIndex = party.activeMembers.indexOf(target);
            const dmg = calculateDamage(livingEnemy, target, enemySkill, false, isEasyAssist);
            target.stats.hp = Math.max(0, target.stats.hp - dmg);
            setPartyHitIndex(targetIndex);
            SoundEngine.playAttack();
            await delay(350);
            setPartyHitIndex(null);
            addLog(`${target.name} は ${dmg} の 深手を おった！`);

            // Auto Item Application check on damage
            if (target.stats.hp <= 0) {
              const reviveRes = AutoItemService.checkAutoRevive(party, target);
              if (reviveRes) {
                SoundEngine.playHeal();
                addLog(reviveRes.message!);
                setPartyDamageNumber({ value: reviveRes.recoveredAmount || 50, isHeal: true });
                await delay(350);
                setPartyDamageNumber(null);
              }
            } else if (target.stats.hp <= Math.round(target.stats.maxHp * 0.45)) {
              const healRes = AutoItemService.checkAutoHpHeal(party, target);
              if (healRes) {
                SoundEngine.playHeal();
                addLog(healRes.message!);
                setPartyDamageNumber({ value: healRes.recoveredAmount || 50, isHeal: true });
                await delay(350);
                setPartyDamageNumber(null);
              }
            }
          }
        } else {
          // Normal attack
          const target = livingMembers[Math.floor(Math.random() * livingMembers.length)];
          const targetIndex = party.activeMembers.indexOf(target);
          SoundEngine.playAttack();
          addLog(`${livingEnemy.name} の こうげき！ (素早さ:${p.speed})`);
          await delay(350);

          const dmg = calculateDamage(livingEnemy, target, undefined, false, isEasyAssist);
          target.stats.hp = Math.max(0, target.stats.hp - dmg);
          setPartyHitIndex(targetIndex);
          await delay(350);
          setPartyHitIndex(null);
          addLog(`${target.name} に ${dmg} の ダメージ！`);

          // Auto Item Application check on damage
          if (target.stats.hp <= 0) {
            const reviveRes = AutoItemService.checkAutoRevive(party, target);
            if (reviveRes) {
              SoundEngine.playHeal();
              addLog(reviveRes.message!);
              setPartyDamageNumber({ value: reviveRes.recoveredAmount || 50, isHeal: true });
              await delay(350);
              setPartyDamageNumber(null);
            }
          } else if (target.stats.hp <= Math.round(target.stats.maxHp * 0.45)) {
            const healRes = AutoItemService.checkAutoHpHeal(party, target);
            if (healRes) {
              SoundEngine.playHeal();
              addLog(healRes.message!);
              setPartyDamageNumber({ value: healRes.recoveredAmount || 50, isHeal: true });
              await delay(350);
              setPartyDamageNumber(null);
            }
          }
        }
      }
    }

    setActiveCombatantId(null);

    // 2. Check Victory
    if (areAllEnemiesDefeated(currentEnemies)) {
      SoundEngine.playVictory();
      const defeatedSummary = currentEnemies.length === 1
        ? `${currentEnemies[0].name}`
        : `${currentEnemies.map(e => e.name).join('、')}`;
      addLog(`討伐成功！ ${defeatedSummary} を たおした！`);
      await delay(800);

      const expReward = Math.round(
        currentEnemies.reduce((sum, e) => sum + e.level * 25, 0) + (isBoss ? 250 : 40)
      );
      const moneyReward = Math.round(
        currentEnemies.reduce((sum, e) => sum + e.level * 20, 0) + (isBoss ? 350 : 60)
      );
      const { leveledUp, learnedSkills } = party.addExpAndMoney(expReward, moneyReward);

      addLog(`経験値 ${expReward} と ${moneyReward} 銭 を かくとくした！`);
      if (leveledUp.length > 0) {
        SoundEngine.playLevelUp();
        for (const l of leveledUp) {
          addLog(`★ ${l.name} は レベル ${l.newLevel} に あがった！ 全能力が向上！`);
        }
      }
      if (learnedSkills && learnedSkills.length > 0) {
        for (const ls of learnedSkills) {
          addLog(`✨【新呼吸会得！】${ls.characterName} は 新たな型『${ls.skill.name}』を会得した！！`);
        }
      }

      await delay(1200);
      setIsProcessingTurn(false);
      onVictory(expReward, moneyReward, leveledUp);
      return;
    }

    // 3. Check Wipeout ("死んだら宿で復活だよ")
    if (party.isAllDead()) {
      SoundEngine.playWipeout();
      addLog(`隊士たちは力尽き、全員たおれてしまった……！`);
      addLog(`隠（かくし）の部隊が駆けつけ、藤の家紋の宿へと搬送される……`);
      await delay(1500);
      setIsProcessingTurn(false);
      onWipeout();
      return;
    }

    // Reset round state
    setMemberActions([]);
    setCurrentMemberIndex(0);
    setMenuMode('main');
    setIsProcessingTurn(false);
  };

  // Quick All-Attack handler for fast 1-tap mobile grinding
  const handleQuickAllAttack = () => {
    SoundEngine.playConfirm();
    const living = party.activeMembers.filter(m => m.stats.hp > 0);
    const targetIdx = getActiveTargetIndex();
    const actions: QueuedAction[] = living.map(m => ({
      member: m,
      type: 'attack' as const,
      targetEnemyIndex: targetIdx
    }));
    setMemberActions(actions);
    executeRound(actions);
  };

  // Next action handler
  const queueAction = (action: QueuedAction) => {
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
      const targetIdx = getActiveTargetIndex();
      const autoActions: QueuedAction[] = party.activeMembers
        .filter(m => m.stats.hp > 0)
        .map(m => {
          if (m.skills.length > 0 && m.stats.bp >= m.skills[0].bpCost && Math.random() < 0.7) {
            return { member: m, type: 'skill' as const, skill: m.skills[0], targetEnemyIndex: targetIdx };
          }
          return { member: m, type: 'attack' as const, targetEnemyIndex: targetIdx };
        });
      executeRound(autoActions);
    }
  }, [isAutoBattle, isProcessingTurn, memberActions.length]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 min-h-[560px] p-2 select-none">
      {/* Top Header: Enemy Status & Speed Multiplier */}
      <div className="flex justify-between items-center px-2 py-1.5 bg-slate-900/95 rounded border border-slate-700 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-red-400 font-bold shrink-0">
            {isBoss ? '【強敵・十二鬼月】' : '【鬼の群れ】'}
          </span>
          <span className="text-white font-bold truncate">
            {enemies.map(e => e.name).join(' / ')}
          </span>
          <span className="text-slate-400 text-[10px] shrink-0">
            (全{enemies.length}体)
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
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

      {/* Final Stage Boss Special Banner */}
      {isFinalStage && (
        <div className="bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border border-amber-400/80 rounded px-3 py-1.5 text-xs text-amber-200 flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">
              【最終決戦・鬼の王の超再生】通常攻撃・初級技ではトドメを刺せません！『最強の呼吸（奥義）』でトドメを刺せ！
            </span>
          </div>
          <span className="text-[10px] bg-red-800 text-white px-2 py-0.5 rounded font-black border border-amber-300 shrink-0">
            最強の呼吸必須 ⚡
          </span>
        </div>
      )}

      {/* Speed Action Order Bar (素早さ行動順・タイムライン) */}
      <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded px-2.5 py-1.5 flex items-center justify-between gap-2 overflow-x-auto text-[11px] shadow-sm">
        <div className="flex items-center gap-1.5 shrink-0 text-amber-300 font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="whitespace-nowrap">
            <FuriganaText text="素早[すばや]さ行動順:" />
          </span>
        </div>
        <div className="flex items-center gap-1 flex-1 overflow-x-auto py-0.5">
          {(isProcessingTurn && roundTimeline.length > 0 ? roundTimeline : speedRankings).map((c, i) => {
            const isActive = isProcessingTurn && activeCombatantId === c.id;
            return (
              <React.Fragment key={c.id}>
                {i > 0 && <span className="text-slate-600 text-[10px] shrink-0">➔</span>}
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-black scale-105 shadow-md animate-pulse'
                      : c.isPlayer
                      ? 'bg-cyan-950/80 border border-cyan-700 text-cyan-200'
                      : 'bg-rose-950/80 border border-rose-700 text-rose-200'
                  }`}
                >
                  <span className="font-mono text-[9px] opacity-75">{i + 1}.</span>
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{c.name.split(' ')[0]}</span>
                  <span className="font-mono text-[9px] text-amber-300 bg-slate-950/60 px-1 rounded">
                    速{c.speed}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Center Stage: Battlefield with 1 to 4 Enemies side-by-side */}
      <div className="relative w-full min-h-[200px] sm:min-h-[220px] rounded-lg bg-gradient-to-b from-[#0b0c16] via-[#16182a] to-[#0a0f1d] border-4 border-slate-600 shadow-inner flex flex-col justify-end p-2 sm:p-4 overflow-hidden">
        {/* Atmosphere aura */}
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-900 to-transparent" />

        {/* Global party damage/heal indicator */}
        {partyDamageNumber && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 font-extrabold text-2xl text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] z-30 animate-bounce">
            +{partyDamageNumber.value}
          </div>
        )}

        {/* 1 to 4 Enemies Row (Dragon Quest Style) */}
        <div className="flex items-end justify-center gap-1.5 sm:gap-4 z-10 w-full mb-1">
          {enemies.map((em, idx) => {
            const isTarget = getActiveTargetIndex() === idx && em.stats.hp > 0;
            const isHit = enemyHitIndices.includes(idx);
            const isDead = em.stats.hp <= 0;
            const dmg = damageNumbers[idx];

            // Sizing: 1 enemy = 96px, 2 = 80px, 3 = 70px, 4 = 60px
            const spriteSize = enemies.length === 1 ? 96 : enemies.length === 2 ? 80 : enemies.length === 3 ? 70 : 60;

            return (
              <div
                key={em.id + '_' + idx}
                onClick={() => {
                  if (em.stats.hp > 0 && !isProcessingTurn) {
                    SoundEngine.playCursor();
                    setSelectedTargetIndex(idx);
                  }
                }}
                className={`relative flex flex-col items-center cursor-pointer select-none transition-all px-1.5 py-1 rounded-lg ${
                  isTarget ? 'bg-amber-950/40 ring-2 ring-amber-400 scale-105' : 'hover:bg-slate-800/40'
                } ${isDead ? 'opacity-30 grayscale pointer-events-none' : ''}`}
              >
                {/* Target Arrow cursor */}
                {isTarget && !isDead && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-300 font-bold text-xs animate-bounce flex items-center gap-0.5 z-20 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    <span>▼</span>
                    <span className="text-[10px]">標的</span>
                  </div>
                )}

                {/* Floating Damage Number */}
                {dmg && (
                  <div
                    className={`absolute -top-7 left-1/2 -translate-x-1/2 z-30 font-black text-xl animate-bounce pointer-events-none whitespace-nowrap ${
                      dmg.isCrit
                        ? 'text-amber-300 scale-125 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                        : 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    }`}
                  >
                    {dmg.isCrit && <span className="block text-xs text-amber-200 text-center">会心！</span>}
                    -{dmg.value}
                  </div>
                )}

                <PixelSprite
                  character={em}
                  size={spriteSize}
                  isHit={isHit}
                  isCollapsed={isDead}
                  className="transition-transform drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                />

                {/* Enemy Name */}
                <div className={`text-[10px] sm:text-xs font-bold mt-1 max-w-[85px] sm:max-w-[120px] truncate text-center ${isTarget ? 'text-amber-300' : 'text-slate-200'}`}>
                  {em.name}
                </div>

                {/* Enemy HP Bar */}
                <div className="w-16 sm:w-24 bg-slate-900 border border-slate-700 rounded-full h-2 mt-0.5 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (em.stats.hp / em.stats.maxHp) * 100))}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-300 font-mono mt-0.5">
                  {isDead ? '討伐済' : `${Math.max(0, em.stats.hp)}/${em.stats.maxHp}`}
                </div>
              </div>
            );
          })}
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

              {/* BP Bar */}
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
          title={
            currentMember && !isProcessingTurn
              ? `${currentMember.name} (素早さ:${currentMember.stats.speed + AutoItemService.getPassiveStatBonuses(party.inventory).bonusSpd})`
              : '状況'
          }
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

              {/* Target selector chip if multiple enemies */}
              {enemies.length > 1 && (
                <div className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded border border-slate-700 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Target className="w-3 h-3 text-amber-400" />
                    標的:
                  </span>
                  <div className="flex gap-1 overflow-x-auto">
                    {enemies.map((em, idx) => (
                      <button
                        key={em.id + '_' + idx}
                        disabled={em.stats.hp <= 0}
                        onClick={() => {
                          SoundEngine.playCursor();
                          setSelectedTargetIndex(idx);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          em.stats.hp <= 0
                            ? 'opacity-30 border-slate-800 text-slate-500 line-through'
                            : getActiveTargetIndex() === idx
                            ? 'bg-amber-500 border-amber-300 text-slate-950 shadow'
                            : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {em.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => queueAction({
                    member: currentMember,
                    type: 'attack',
                    targetEnemyIndex: getActiveTargetIndex()
                  })}
                  className="flex items-center gap-1.5 p-2.5 min-h-[46px] bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded border border-slate-600 text-left transition-colors touch-manipulation"
                >
                  <Swords className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold">
                      <FuriganaText text="戦[たたか]う" />
                    </span>
                    {isFinalStage && (
                      <span className="text-[8px] text-amber-400/90 leading-none">※トドメ不可</span>
                    )}
                  </div>
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
                  className="flex items-center gap-1.5 p-2 min-h-[46px] bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 rounded border border-slate-600 text-left transition-colors touch-manipulation"
                >
                  <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-bold flex items-center gap-1">
                      <FuriganaText text="道具[どうぐ]" />
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-700 text-white rounded font-normal">自動適用</span>
                    </span>
                    <span className="text-[9px] text-slate-400 truncate">
                      {party.inventory.filter(i => i.count > 0).length}種を所持
                    </span>
                  </div>
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
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-700 pb-1 sticky top-0 bg-slate-900 z-10">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>全集中・呼吸 / 技（強力な順）</span>
                </span>
                <button
                  onClick={() => {
                    SoundEngine.playCancel();
                    setMenuMode('main');
                  }}
                  className="text-amber-400 hover:underline px-1 py-0.5"
                >
                  [もどる]
                </button>
              </div>

              {sortedCurrentMemberSkills.map((sk, idx) => {
                const canUse = currentMember.stats.bp >= sk.bpCost;
                const isUltimate = isUltimateSkill(currentMember, sk);
                const isAllTarget = sk.target === 'all';

                return (
                  <button
                    key={sk.id}
                    disabled={!canUse}
                    onClick={() => queueAction({
                      member: currentMember,
                      type: 'skill',
                      skill: sk,
                      targetEnemyIndex: getActiveTargetIndex()
                    })}
                    className={`flex items-center justify-between p-2 rounded border text-left text-xs transition-all touch-manipulation ${
                      !canUse
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                        : isUltimate
                        ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/80 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:border-amber-300 active:scale-[0.98]'
                        : idx === 0
                        ? 'bg-slate-800 hover:bg-slate-700 border-amber-500/60 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isUltimate ? (
                          <span className={`px-1.5 py-0.5 text-[9px] font-black rounded flex items-center gap-0.5 shadow ${
                            isFinalStage
                              ? 'bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 text-slate-950 ring-1 ring-amber-300 animate-pulse'
                              : 'bg-gradient-to-r from-amber-500 to-red-500 text-slate-950'
                          }`}>
                            <Flame className="w-2.5 h-2.5 text-slate-950" />
                            {isFinalStage ? '【★最強奥義・トドメ有効】' : '【最強奥義】'}
                          </span>
                        ) : sk.breathStyle !== 'none' ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-700 text-white rounded">
                            【呼吸技】
                          </span>
                        ) : sk.effectType === 'heal' ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-600 text-white rounded">
                            【回復】
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-700 text-slate-200 rounded">
                            【基本技】
                          </span>
                        )}

                        {isAllTarget && (
                          <span className="px-1 py-0.5 text-[9px] font-bold bg-purple-600 text-white rounded">
                            全体攻撃
                          </span>
                        )}

                        <span className={`font-bold ${isUltimate ? 'text-amber-300' : 'text-cyan-300'}`}>
                          {sk.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {sk.effectType === 'heal' ? `回復力:${sk.power}` : `威力:${sk.power}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{sk.description}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-1.5 py-0.5 bg-slate-950/80 rounded border border-slate-700 text-[10px] font-mono text-amber-300 font-bold">
                        {sk.bpCost}BP
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : menuMode === 'items' && currentMember ? (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-700 pb-1 sticky top-0 bg-slate-900 z-10">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>所持道具（戦闘中常時・全自動適用）</span>
                </span>
                <button
                  onClick={() => {
                    SoundEngine.playCancel();
                    setMenuMode('main');
                  }}
                  className="text-amber-400 hover:underline px-1 py-0.5"
                >
                  [もどる]
                </button>
              </div>

              <div className="text-[10px] text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 p-2 rounded leading-relaxed">
                ★【自動適用】アイテムは持っているだけで、ピンチ時に全自動で即座に発動します！（HP低下時に傷薬、死亡時に霊水で即時蘇生、BP不足時におにぎり、御守り・瓢箪は常時能力UP）
              </div>

              {party.inventory.filter(i => i.count > 0).length === 0 ? (
                <div className="text-xs text-slate-500 p-3 text-center bg-slate-900/50 rounded">
                  現在所持している道具はありません（宿屋で購入可能）
                </div>
              ) : (
                party.inventory
                  .filter(i => i.count > 0)
                  .map(it => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between p-2 rounded border border-slate-700 bg-slate-800/90 text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-emerald-300">{it.name}</span>
                          <span className="px-1.5 py-0.2 text-[9px] bg-emerald-900 text-emerald-200 border border-emerald-600 rounded">
                            自動適用
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{it.description}</div>
                      </div>
                      <span className="text-xs text-amber-300 font-mono shrink-0 ml-1 font-bold">x{it.count}</span>
                    </div>
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
                ▶ <FuriganaText text={log} />
              </div>
            ))}
          </div>
        </DqFrame>
      </div>

      {/* Dramatic Ultimate Breathing Technique Cut-In Overlay */}
      {activeCutIn && (
        <UltimateCutIn
          character={activeCutIn.character}
          skill={activeCutIn.skill}
          onComplete={handleCutInComplete}
        />
      )}
    </div>
  );
};
