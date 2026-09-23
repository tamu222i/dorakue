/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Item } from '../../domain/models/types.ts';
import { PartyAggregate } from '../../domain/aggregates/PartyAggregate.ts';

export interface SaveData {
  version: number;
  timestamp: number;
  currentChapterIndex: number;
  partyMoney: number;
  roster: Character[];
  activeMemberIds: string[];
  inventory: Item[];
  encounteredCharacterIds: string[];
  playthroughCount?: number;
  hasClearedNormal?: boolean;
  hasClearedTrue?: boolean;
  defeatedDemonIds?: string[];
}

const SAVE_KEY = 'kimetsu_quest_save_v2';

export class SaveService {
  /**
   * Save game state to localStorage
   */
  public static saveGame(
    currentChapterIndex: number,
    party: PartyAggregate,
    encounteredIds: Set<string> | string[],
    extraData?: {
      playthroughCount?: number;
      hasClearedNormal?: boolean;
      hasClearedTrue?: boolean;
      defeatedDemonIds?: Set<string> | string[];
    }
  ): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      const encounteredArray = Array.from(encounteredIds);
      const defeatedArray = extraData?.defeatedDemonIds
        ? Array.from(extraData.defeatedDemonIds)
        : [];

      const data: SaveData = {
        version: 2,
        timestamp: Date.now(),
        currentChapterIndex,
        partyMoney: party.money,
        roster: party.roster,
        activeMemberIds: party.activeMembers.map(m => m.id),
        inventory: party.inventory,
        encounteredCharacterIds: encounteredArray,
        playthroughCount: extraData?.playthroughCount ?? 1,
        hasClearedNormal: extraData?.hasClearedNormal ?? false,
        hasClearedTrue: extraData?.hasClearedTrue ?? false,
        defeatedDemonIds: defeatedArray
      };

      window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   */
  public static loadGame(): SaveData | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }

      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw) as SaveData;
      if (!data || !data.roster || !Array.isArray(data.roster) || data.roster.length === 0) {
        return null;
      }

      return data;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return null;
    }
  }

  /**
   * Check if save data exists
   */
  public static hasSaveData(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      return !!window.localStorage.getItem(SAVE_KEY);
    } catch {
      return false;
    }
  }

  /**
   * Delete save data and reset all game-related storage
   */
  public static clearSave(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(SAVE_KEY);
        // Clean up all kimetsu-related keys to guarantee complete deletion
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (key.startsWith('kimetsu_') || key.includes('kimetsu'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      }
    } catch (e) {
      console.error('Failed to clear save:', e);
    }
  }
}
