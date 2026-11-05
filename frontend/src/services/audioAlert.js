/**
 * Web Audio API Synthesizer: Industrial Klaxon & Nuclear Reactor Meltdown Siren
 * Synthesizes a high-urgency multi-oscillator emergency klaxon with sub-bass reactor rumble
 * when the HC-SR04 ultrasonic sensor detects an obstacle/produce < 5.0 cm.
 */

class ReactorAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.oscillators = [];
    this.gainNodes = [];
    this.intervalId = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  startSiren() {
    if (this.isPlaying || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Master Volume
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.1);
    masterGain.connect(this.ctx.destination);
    this.gainNodes.push(masterGain);

    // 1. Dual Sawtooth Klaxon Siren (Pitch modulated between 880Hz and 440Hz)
    const sirenOsc1 = this.ctx.createOscillator();
    const sirenOsc2 = this.ctx.createOscillator();
    sirenOsc1.type = "sawtooth";
    sirenOsc2.type = "square";
    sirenOsc2.detune.setValueAtTime(12, now); // slight chorus detune for harsh industrial tone

    const sirenGain = this.ctx.createGain();
    sirenGain.gain.setValueAtTime(0.3, now);

    sirenOsc1.connect(sirenGain);
    sirenOsc2.connect(sirenGain);
    sirenGain.connect(masterGain);

    sirenOsc1.start(now);
    sirenOsc2.start(now);
    this.oscillators.push(sirenOsc1, sirenOsc2);

    // Frequency modulation loop (War-siren wail)
    let high = true;
    const modulate = () => {
      if (!this.isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      const targetFreq = high ? 920 : 480;
      sirenOsc1.frequency.cancelScheduledValues(t);
      sirenOsc2.frequency.cancelScheduledValues(t);
      sirenOsc1.frequency.exponentialRampToValueAtTime(targetFreq, t + 0.35);
      sirenOsc2.frequency.exponentialRampToValueAtTime(targetFreq * 0.98, t + 0.35);
      high = !high;
    };
    modulate();
    this.intervalId = setInterval(modulate, 380);

    // 2. Sub-bass Reactor Core Rumble (55Hz pulsating square/sine)
    const rumbleOsc = this.ctx.createOscillator();
    rumbleOsc.type = "triangle";
    rumbleOsc.frequency.setValueAtTime(58, now);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.4, now);

    // LFO to create vibrating reactor shudder
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(8, now); // 8 Hz shudder
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.2, now);

    lfo.connect(lfoGain.gain);
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(masterGain);

    rumbleOsc.start(now);
    lfo.start(now);
    this.oscillators.push(rumbleOsc, lfo);
  }

  stopSiren() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNodes.forEach(g => {
        try {
          g.gain.cancelScheduledValues(now);
          g.gain.linearRampToValueAtTime(0.001, now + 0.15);
        } catch {}
      });
    }

    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.gainNodes.forEach(g => {
        try {
          g.disconnect();
        } catch {}
      });
      this.oscillators = [];
      this.gainNodes = [];
    }, 200);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlaying) {
      this.stopSiren();
    }
    return this.isMuted;
  }
}

export const reactorAudio = new ReactorAudioEngine();
