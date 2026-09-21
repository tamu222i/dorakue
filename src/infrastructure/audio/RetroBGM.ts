/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Note frequency map for 8-bit retro chiptune
const NOTE_FREQ: Record<string, number> = {
  // Octave 2 & 3 (Bass)
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  // Octave 4 & 5 (Melody)
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50,
  '-': 0 // Rest
};

export interface NoteEvent {
  note: string;
  duration: number; // in beats (1 = quarter note, 0.5 = eighth note, etc.)
}

export type BgmTrackId = 'gurenge' | 'homura' | 'zankyou' | 'kizuna' | 'none';

export interface BgmTrack {
  id: BgmTrackId;
  title: string;
  subtitle: string;
  bpm: number;
  melody: NoteEvent[];
  bass: NoteEvent[];
}

// 1.「紅蓮華」(Gurenge) - 竈門炭治郎 立志編・サビ (8-bit FCアレンジ)
// 「強くなれる理由を知った 僕を連れて進め〜」
const GURENGE_TRACK: BgmTrack = {
  id: 'gurenge',
  title: '紅蓮華 (ぐれんげ)',
  subtitle: '竈門炭治郎 立志編 主題歌',
  bpm: 135,
  melody: [
    // つよくなれる
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 1.0 },
    // りゆうをしった
    { note: 'B4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 1.0 },

    // ぼくをつれて
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 1.0 },
    // すすめ
    { note: 'B4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'D5', duration: 1.5 },
    { note: 'B4', duration: 0.5 },

    // どろだらけの
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 1.0 },
    // そうまとうに
    { note: 'B4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 1.0 },

    // よう こわばるこころ
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'E4', duration: 1.0 },
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 1.0 },

    // ふるえるては つかみたいものがある
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'E4', duration: 1.0 },

    // それだけさ
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 1.0 },
    { note: 'E5', duration: 2.0 },
    { note: '-', duration: 1.0 }
  ],
  bass: [
    // Em -> C -> D -> G pattern
    { note: 'E3', duration: 1.0 }, { note: 'E3', duration: 1.0 },
    { note: 'C3', duration: 1.0 }, { note: 'C3', duration: 1.0 },
    { note: 'D3', duration: 1.0 }, { note: 'D3', duration: 1.0 },
    { note: 'G2', duration: 1.0 }, { note: 'B2', duration: 1.0 },

    { note: 'E3', duration: 1.0 }, { note: 'E3', duration: 1.0 },
    { note: 'C3', duration: 1.0 }, { note: 'C3', duration: 1.0 },
    { note: 'D3', duration: 1.0 }, { note: 'D3', duration: 1.0 },
    { note: 'E3', duration: 1.0 }, { note: 'E3', duration: 1.0 },

    { note: 'C3', duration: 1.0 }, { note: 'C3', duration: 1.0 },
    { note: 'D3', duration: 1.0 }, { note: 'D3', duration: 1.0 },
    { note: 'G2', duration: 1.0 }, { note: 'B2', duration: 1.0 },
    { note: 'E3', duration: 2.0 }, { note: '-', duration: 1.0 }
  ]
};

// 2.「炎」(Homura) - 劇場版 無限列車編・サビ (8-bit FCバラードアレンジ)
// 「さよなら ありがとう 声の限り〜」
const HOMURA_TRACK: BgmTrack = {
  id: 'homura',
  title: '炎 (ほむら)',
  subtitle: '無限列車編 主題歌',
  bpm: 80,
  melody: [
    // さよなら
    { note: 'E4', duration: 1.0 },
    { note: 'G4', duration: 1.0 },
    { note: 'D4', duration: 1.5 },
    { note: 'C4', duration: 0.5 },

    // ありがとう
    { note: 'C4', duration: 0.5 },
    { note: 'D4', duration: 0.5 },
    { note: 'E4', duration: 1.0 },
    { note: 'G4', duration: 2.0 },

    // こえのかぎり
    { note: 'A4', duration: 0.75 },
    { note: 'G4', duration: 0.75 },
    { note: 'E4', duration: 0.75 },
    { note: 'D4', duration: 0.75 },
    { note: 'E4', duration: 2.0 },

    // かなしみよりもっと
    { note: 'C4', duration: 0.5 },
    { note: 'D4', duration: 0.5 },
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 1.5 },

    // だいじなこと
    { note: 'C5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'E4', duration: 2.0 },

    // さりゆくせなかに つたえたくて
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'C5', duration: 1.0 },
    { note: 'B4', duration: 1.0 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'E4', duration: 2.0 },

    // ぬくもりと いたみに まにあうように
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'E4', duration: 3.0 },
    { note: '-', duration: 1.0 }
  ],
  bass: [
    { note: 'C3', duration: 2.0 }, { note: 'G2', duration: 2.0 },
    { note: 'A2', duration: 2.0 }, { note: 'E2', duration: 2.0 },
    { note: 'F2', duration: 2.0 }, { note: 'C3', duration: 2.0 },
    { note: 'D2', duration: 2.0 }, { note: 'G2', duration: 2.0 },
    { note: 'C3', duration: 2.0 }, { note: 'G2', duration: 2.0 },
    { note: 'A2', duration: 2.0 }, { note: 'E2', duration: 2.0 },
    { note: 'F2', duration: 2.0 }, { note: 'G2', duration: 2.0 },
    { note: 'C3', duration: 3.0 }, { note: '-', duration: 1.0 }
  ]
};

// 3.「残響散歌」(Zankyou Sanka) - 遊郭編・サビ (8-bit FC疾走アレンジ)
// 「誰が袖に咲く幻花 ただ そこに 藍を落とした〜」
const ZANKYOU_TRACK: BgmTrack = {
  id: 'zankyou',
  title: '残響散歌 (ざんきょうさんか)',
  subtitle: '遊郭編 主題歌',
  bpm: 160,
  melody: [
    // たがそでに
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    // さくげんか
    { note: 'D5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },

    // ただそこに
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    // あいをおとした
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'E4', duration: 1.5 },
    { note: '-', duration: 0.5 },

    // はでに ならせ
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'D5', duration: 0.5 },
    // とどろかせ
    { note: 'E5', duration: 0.5 },
    { note: 'D5', duration: 0.5 },
    { note: 'B4', duration: 1.0 },

    // ふかく ふかく
    { note: 'D5', duration: 0.5 },
    { note: 'E5', duration: 1.5 },
    { note: 'D5', duration: 0.5 },
    { note: 'B4', duration: 1.0 },

    // ざんきょう
    { note: 'D5', duration: 0.5 },
    { note: 'E5', duration: 2.0 },
    { note: '-', duration: 1.0 }
  ],
  bass: [
    { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 },
    { note: 'C3', duration: 0.5 }, { note: 'C3', duration: 0.5 }, { note: 'C3', duration: 0.5 }, { note: 'C3', duration: 0.5 },
    { note: 'D3', duration: 0.5 }, { note: 'D3', duration: 0.5 }, { note: 'D3', duration: 0.5 }, { note: 'D3', duration: 0.5 },
    { note: 'G2', duration: 0.5 }, { note: 'B2', duration: 0.5 }, { note: 'E3', duration: 1.0 },
    { note: 'C3', duration: 0.5 }, { note: 'C3', duration: 0.5 }, { note: 'D3', duration: 0.5 }, { note: 'D3', duration: 0.5 },
    { note: 'E3', duration: 2.0 }, { note: '-', duration: 1.0 }
  ]
};

// 4.「絆ノ奇跡」(Kizuna no Kiseki) - 刀鍛冶の里編・最終決戦サビ (8-bit FCアレンジ)
// 「闇夜を駆け抜けて どこへ向かう〜 照らせ陽の光よ」
const KIZUNA_TRACK: BgmTrack = {
  id: 'kizuna',
  title: '絆ノ奇跡 (きずなのきせき)',
  subtitle: 'MAN WITH A MISSION × milet / 最終決戦・感動のエンディング',
  bpm: 142,
  melody: [
    // やみよを (E4 - F#4 - G4 - A4)
    { note: 'E4', duration: 0.5 },
    { note: 'F#4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    // かけぬけて (B4 - B4 - A4 - B4)
    { note: 'B4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 1.0 },

    // どこへむかう (D5 - B4 - A4 - G4 - A4)
    { note: 'D5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 1.5 },
    { note: '-', duration: 0.5 },

    // つないだてを (E4 - G4 - A4 - B4 - C5 - B4)
    { note: 'E4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 1.0 },

    // はなさないで (B4 - C5 - D5 - E5 - D5)
    { note: 'B4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'D5', duration: 0.5 },
    { note: 'E5', duration: 1.5 },
    { note: 'D5', duration: 0.5 },

    // てらせひのひかりよ (B4 - C5 - B4 - A4 - G4 - E4)
    { note: 'B4', duration: 0.5 },
    { note: 'C5', duration: 0.5 },
    { note: 'B4', duration: 0.5 },
    { note: 'A4', duration: 0.5 },
    { note: 'G4', duration: 1.0 },
    { note: 'E4', duration: 2.0 },
    { note: '-', duration: 1.0 }
  ],
  bass: [
    { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 },
    { note: 'C3', duration: 0.5 }, { note: 'C3', duration: 0.5 }, { note: 'C3', duration: 0.5 }, { note: 'C3', duration: 0.5 },
    { note: 'D3', duration: 0.5 }, { note: 'D3', duration: 0.5 }, { note: 'D3', duration: 0.5 }, { note: 'D3', duration: 0.5 },
    { note: 'G2', duration: 0.5 }, { note: 'B2', duration: 0.5 }, { note: 'E3', duration: 1.0 },
    { note: 'C3', duration: 0.5 }, { note: 'C3', duration: 0.5 }, { note: 'D3', duration: 0.5 }, { note: 'D3', duration: 0.5 },
    { note: 'E3', duration: 0.5 }, { note: 'E3', duration: 0.5 }, { note: 'G3', duration: 1.0 },
    { note: 'A2', duration: 0.5 }, { note: 'B2', duration: 0.5 }, { note: 'C3', duration: 0.5 }, { note: 'D3', duration: 0.5 },
    { note: 'E3', duration: 2.0 }, { note: '-', duration: 1.0 }
  ]
};

export const TRACKS: Record<BgmTrackId, BgmTrack | null> = {
  gurenge: GURENGE_TRACK,
  homura: HOMURA_TRACK,
  zankyou: ZANKYOU_TRACK,
  kizuna: KIZUNA_TRACK,
  none: null
};

class RetroBgmEngine {
  private ctx: AudioContext | null = null;
  private currentTrackId: BgmTrackId = 'none';
  private isPlaying: boolean = false;
  private loopTimer: any = null;
  private scheduledNodes: OscillatorNode[] = [];
  public volume: number = 0.12; // Gentle retro background volume

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getCurrentTrack(): BgmTrackId {
    return this.currentTrackId;
  }

  public stop() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.scheduledNodes.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    });
    this.scheduledNodes = [];
  }

  public play(trackId: BgmTrackId) {
    if (trackId === 'none') {
      this.currentTrackId = 'none';
      this.stop();
      return;
    }

    const track = TRACKS[trackId];
    if (!track) return;

    this.stop();
    this.currentTrackId = trackId;
    this.isPlaying = true;

    this.playLoop(track);
  }

  private playLoop(track: BgmTrack) {
    if (!this.isPlaying || this.currentTrackId !== track.id) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const secondsPerBeat = 60 / track.bpm;
    const startTime = ctx.currentTime + 0.05;

    // 1. Play Melody (Square wave, Lead 8-bit pulse)
    let curTime = startTime;
    for (const noteEvt of track.melody) {
      const durSec = noteEvt.duration * secondsPerBeat;
      const freq = NOTE_FREQ[noteEvt.note] || 0;

      if (freq > 0 && this.isPlaying) {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, curTime);

          const noteVol = this.volume * 0.7;
          gain.gain.setValueAtTime(noteVol, curTime);
          // Quick retro ADSR decay
          gain.gain.exponentialRampToValueAtTime(0.0001, curTime + durSec * 0.95);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(curTime);
          osc.stop(curTime + durSec);
          this.scheduledNodes.push(osc);
        } catch {}
      }
      curTime += durSec;
    }

    const melodyEndTime = curTime;

    // 2. Play Bass (Triangle wave, Classic Famicom Bass)
    let bassCurTime = startTime;
    for (const noteEvt of track.bass) {
      const durSec = noteEvt.duration * secondsPerBeat;
      const freq = NOTE_FREQ[noteEvt.note] || 0;

      if (freq > 0 && this.isPlaying) {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, bassCurTime);

          const bassVol = this.volume * 0.85;
          gain.gain.setValueAtTime(bassVol, bassCurTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, bassCurTime + durSec * 0.92);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(bassCurTime);
          osc.stop(bassCurTime + durSec);
          this.scheduledNodes.push(osc);
        } catch {}
      }
      bassCurTime += durSec;
    }

    const totalDuration = Math.max(melodyEndTime, bassCurTime) - startTime;

    // Schedule next loop
    this.loopTimer = setTimeout(() => {
      if (this.isPlaying && this.currentTrackId === track.id) {
        this.scheduledNodes = [];
        this.playLoop(track);
      }
    }, Math.max(100, (totalDuration - 0.05) * 1000));
  }

  // Toggle between tracks: gurenge -> homura -> zankyou -> kizuna -> none
  public nextTrack(): BgmTrackId {
    const list: BgmTrackId[] = ['gurenge', 'homura', 'zankyou', 'kizuna', 'none'];
    const curIdx = list.indexOf(this.currentTrackId);
    const nextIdx = (curIdx + 1) % list.length;
    const nextId = list[nextIdx];
    this.play(nextId);
    return nextId;
  }
}

export const BgmEngine = new RetroBgmEngine();
