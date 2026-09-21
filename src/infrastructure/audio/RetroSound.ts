/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 8-bit Retro Web Audio API Synthesizer (Dragon Quest style)
class RetroAudioSynthesizer {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

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

  // Play a simple tone
  private playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gainLevel = 0.15) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // Audio error silent fallback
      }
    }, delay * 1000);
  }

  // Cursor click / Menu select
  public playCursor() {
    this.playTone(880, 'square', 0.05, 0, 0.08);
  }

  // Confirm / Enter command
  public playConfirm() {
    this.playTone(523, 'square', 0.06, 0, 0.1);
    this.playTone(659, 'square', 0.08, 0.05, 0.1);
  }

  // Cancel / Back
  public playCancel() {
    this.playTone(392, 'square', 0.05, 0, 0.1);
    this.playTone(330, 'square', 0.08, 0.04, 0.1);
  }

  // Standard sword attack slash
  public playAttack() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  // Critical hit (隙の糸 / 会心の一撃)
  public playCritical() {
    this.playTone(880, 'sawtooth', 0.08, 0, 0.25);
    this.playTone(1320, 'square', 0.12, 0.06, 0.25);
    this.playTone(1760, 'square', 0.2, 0.12, 0.3);
  }

  // Breathing Technique / Blood Art
  public playBreathSkill() {
    this.playTone(330, 'triangle', 0.08, 0, 0.15);
    this.playTone(440, 'sine', 0.1, 0.06, 0.2);
    this.playTone(660, 'sine', 0.14, 0.12, 0.25);
    this.playTone(880, 'triangle', 0.25, 0.18, 0.3);
  }

  // Heal / Medicine
  public playHeal() {
    this.playTone(523, 'sine', 0.1, 0, 0.15);
    this.playTone(659, 'sine', 0.1, 0.08, 0.15);
    this.playTone(784, 'sine', 0.1, 0.16, 0.15);
    this.playTone(1046, 'sine', 0.25, 0.24, 0.18);
  }

  // Iconic Dragon Quest style Inn Rest Jingle (宿屋ジングル)
  public playInnJingle() {
    const notes = [
      { f: 523, d: 0.15, t: 0 },
      { f: 587, d: 0.15, t: 0.15 },
      { f: 659, d: 0.2, t: 0.3 },
      { f: 523, d: 0.15, t: 0.55 },
      { f: 659, d: 0.2, t: 0.7 },
      { f: 784, d: 0.45, t: 0.95 }
    ];
    notes.forEach(n => this.playTone(n.f, 'triangle', n.d, n.t, 0.22));
  }

  // Level Up Fanfare
  public playLevelUp() {
    const notes = [
      { f: 440, d: 0.08, t: 0 },
      { f: 440, d: 0.08, t: 0.08 },
      { f: 440, d: 0.08, t: 0.16 },
      { f: 554, d: 0.25, t: 0.24 },
      { f: 494, d: 0.15, t: 0.45 },
      { f: 554, d: 0.15, t: 0.6 },
      { f: 659, d: 0.5, t: 0.75 }
    ];
    notes.forEach(n => this.playTone(n.f, 'square', n.d, n.t, 0.18));
  }

  // Victory fanfare after battle
  public playVictory() {
    const notes = [
      { f: 523, d: 0.1, t: 0 },
      { f: 523, d: 0.1, t: 0.1 },
      { f: 523, d: 0.1, t: 0.2 },
      { f: 523, d: 0.3, t: 0.3 },
      { f: 415, d: 0.3, t: 0.55 },
      { f: 466, d: 0.3, t: 0.8 },
      { f: 523, d: 0.6, t: 1.05 }
    ];
    notes.forEach(n => this.playTone(n.f, 'square', n.d, n.t, 0.18));
  }

  // Fanfare for recruitment / quiz clear
  public playFanfare() {
    const notes = [
      { f: 523, d: 0.1, t: 0 },
      { f: 659, d: 0.1, t: 0.1 },
      { f: 784, d: 0.12, t: 0.2 },
      { f: 1046, d: 0.35, t: 0.32 }
    ];
    notes.forEach(n => this.playTone(n.f, 'square', n.d, n.t, 0.2));
  }

  // Wipeout / Defeat chime
  public playWipeout() {
    const notes = [
      { f: 440, d: 0.2, t: 0 },
      { f: 415, d: 0.2, t: 0.2 },
      { f: 392, d: 0.25, t: 0.4 },
      { f: 370, d: 0.6, t: 0.65 }
    ];
    notes.forEach(n => this.playTone(n.f, 'sawtooth', n.d, n.t, 0.2));
  }

  // Ultimate Cut-In dramatic riser & flash
  public playUltimateCutIn() {
    this.playTone(220, 'triangle', 0.15, 0, 0.2);
    this.playTone(440, 'sawtooth', 0.18, 0.08, 0.25);
    this.playTone(880, 'square', 0.25, 0.18, 0.3);
    this.playTone(1320, 'square', 0.35, 0.28, 0.35);
  }

  // Powerful slash impact
  public playSlash() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }
}

export const SoundEngine = new RetroAudioSynthesizer();
