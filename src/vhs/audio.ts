"use client";

/**
 * Procedural Web Audio API foley for the analog VHS deck & CRT studio monitor.
 * Zero external audio files: synthesizes relay clicks, cassette snaps, B&W static switch, and RF channel glitch bursts.
 */
class VhsAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public get isMuted(): boolean {
    return this.muted;
  }

  public setMuted(val: boolean) {
    this.muted = val;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (!this.muted) this.playSwitch();
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Mechanical relay tick when spinning across VHS slots. */
  public playClick(pitch = 1) {
    if (this.muted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(760 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(145 * pitch, now + 0.032);
      gain.gain.setValueAtTime(0.065, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.034);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.038);
    } catch {}
  }

  /** Heavier mechanical plastic cassette thud when settling into center slot. */
  public playSnap() {
    if (this.muted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.075);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.078);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);
    } catch {}
  }

  /** High-voltage phosphor switch crackle (Color/B&W or Audio toggle). */
  public playSwitch() {
    if (this.muted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const len = Math.floor(ctx.sampleRate * 0.048);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.25));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1750;
      const gain = ctx.createGain();
      gain.gain.value = 0.06;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch {}
  }

  /** CRT RF-channel switch static burst + sub-bass pop when inserting a tape. */
  public playGlitch() {
    if (this.muted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const len = Math.floor(ctx.sampleRate * 0.085);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.34));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1250;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.075, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
      noise.connect(hp);
      hp.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);

      const osc = ctx.createOscillator();
      const oGain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.065);
      oGain.gain.setValueAtTime(0.07, now);
      oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.068);
      osc.connect(oGain);
      oGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.072);
    } catch {}
  }
}

export const vhsAudio = new VhsAudioEngine();
