"use client";

/**
 * Процедурный Web Audio движок для монитора C-47 и клиента «Славы».
 * Нулевой сетевой вес: все щелчки реле, писки картридера и клики меню синтезируются на лету.
 */
class KingMonitorAudio {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private ensure(): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /** Тихий пиксельный тик при наведении на карту или слот тома */
  playHover() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.025);
    gain.gain.setValueAtTime(0.022, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  /** Чёткий игровой клик вкладки / кнопки */
  playClick() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.045);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /** Двойной короткий писк USB-картридера «Славы» при чтении аккаунт-карты */
  playCardRead() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [880, 1320];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.055);
    });
  }

  /** Короткий сигнал системного OSD монитора */
  playOsd() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1040, now);
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  /** Включение монитора: щелчок реле + мягкий подъём кинескопа */
  playPowerOn() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.16);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  /** Выключение монитора кнопкой PWR: механический щелчок + схлопывание луча */
  playPowerOff() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "triangle";
    click.frequency.setValueAtTime(190, now);
    click.frequency.exponentialRampToValueAtTime(55, now + 0.05);
    clickGain.gain.setValueAtTime(0.08, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    click.connect(clickGain).connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.065);

    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = "sine";
    sweep.frequency.setValueAtTime(1400, now + 0.02);
    sweep.frequency.exponentialRampToValueAtTime(90, now + 0.28);
    sweepGain.gain.setValueAtTime(0.04, now + 0.02);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    sweep.connect(sweepGain).connect(ctx.destination);
    sweep.start(now + 0.02);
    sweep.stop(now + 0.32);
  }
}

export const kingAudio = new KingMonitorAudio();
