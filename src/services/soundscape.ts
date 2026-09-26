// Web Audio API procedural soundscape engine for Earth Observation storytelling

class ProceduralSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private duckingGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Nodes for drone
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Nodes for wind / noise
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;

  // Nodes for radar sweep
  private radarTimer: any = null;

  private currentPreset: string = 'Orbital Drift';
  private targetVolume: number = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(preset: string = 'Orbital Drift', volume: number = 0.25) {
    this.initContext();
    if (!this.ctx) return;

    if (this.isRunning) {
      this.stop();
    }

    this.currentPreset = preset;
    this.targetVolume = volume;

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);

    // Auto-ducking gain stage
    this.duckingGain = this.ctx.createGain();
    this.duckingGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Analyser node for UI waveform monitor
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    this.duckingGain.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.isRunning = true;
    this.applyPreset(preset);
  }

  public applyPreset(preset: string) {
    this.currentPreset = preset;
    if (!this.ctx || !this.isRunning || !this.duckingGain) return;

    // Clear previous elements
    this.cleanupNodes();

    const t = this.ctx.currentTime;

    if (preset === 'Orbital Drift') {
      // Cosmic Sub Drone with harmonic LFO
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc2.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, t); // A1 note
      this.droneOsc2.frequency.setValueAtTime(110.5, t); // slight detune

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(180, t);
      this.droneFilter.Q.setValueAtTime(4, t);

      // Slow orbital modulation LFO (0.08 Hz)
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.08, t);
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(90, t);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.droneFilter.frequency);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.35, t);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(droneGain);
      droneGain.connect(this.duckingGain);

      this.droneOsc1.start(t);
      this.droneOsc2.start(t);
      this.lfo.start(t);

      // Subtle cosmic background hiss
      this.startFilteredNoise(120, 0.08);

    } else if (preset === 'Geospatial Radar Sweep') {
      // Periodic ping with deep resonance
      this.startRadarPingLoop();
      // Low sub rumble
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'triangle';
      this.droneOsc1.frequency.setValueAtTime(45, t);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.3, t);
      this.droneOsc1.connect(subGain);
      subGain.connect(this.duckingGain);
      this.droneOsc1.start(t);

    } else if (preset === 'Desolate Expanse') {
      // Wind over desert dunes
      this.startFilteredNoise(280, 0.45, true);

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(65.4, t); // C2 note
      const humGain = this.ctx.createGain();
      humGain.gain.setValueAtTime(0.2, t);
      this.droneOsc1.connect(humGain);
      humGain.connect(this.duckingGain);
      this.droneOsc1.start(t);

    } else if (preset === 'Cyber Reconnaissance') {
      // Rhythmic telemetry pulse
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc1.type = 'triangle';
      this.droneOsc2.type = 'square';
      this.droneOsc1.frequency.setValueAtTime(73.4, t);
      this.droneOsc2.frequency.setValueAtTime(146.8, t);

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'bandpass';
      this.droneFilter.frequency.setValueAtTime(320, t);
      this.droneFilter.Q.setValueAtTime(6, t);

      const cyberGain = this.ctx.createGain();
      cyberGain.gain.setValueAtTime(0.25, t);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(cyberGain);
      cyberGain.connect(this.duckingGain);

      this.droneOsc1.start(t);
      this.droneOsc2.start(t);
      this.startTelemetryClicks();
    }
  }

  private startFilteredNoise(cutoff = 300, volume = 0.2, modulate = false) {
    if (!this.ctx || !this.duckingGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(volume, this.ctx.currentTime);

    if (modulate) {
      const windLfo = this.ctx.createOscillator();
      windLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
      const windLfoGain = this.ctx.createGain();
      windLfoGain.gain.setValueAtTime(cutoff * 0.6, this.ctx.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(this.noiseFilter.frequency);
      windLfo.start();
    }

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.duckingGain);
    this.noiseNode.start();
  }

  private startRadarPingLoop() {
    if (this.radarTimer) clearInterval(this.radarTimer);
    const triggerPing = () => {
      if (!this.ctx || !this.isRunning || !this.duckingGain) return;
      const t = this.ctx.currentTime;
      const pingOsc = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(880, t);
      pingOsc.frequency.exponentialRampToValueAtTime(440, t + 0.35);

      pingGain.gain.setValueAtTime(0.2, t);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      pingOsc.connect(pingGain);
      pingGain.connect(this.duckingGain);

      pingOsc.start(t);
      pingOsc.stop(t + 1.3);
    };

    triggerPing();
    this.radarTimer = setInterval(triggerPing, 4000);
  }

  private startTelemetryClicks() {
    if (this.radarTimer) clearInterval(this.radarTimer);
    const triggerClick = () => {
      if (!this.ctx || !this.isRunning || !this.duckingGain) return;
      const t = this.ctx.currentTime;
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'highpass' as any;
      clickOsc.frequency.setValueAtTime(1600 + Math.random() * 800, t);

      clickGain.gain.setValueAtTime(0.08, t);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      clickOsc.connect(clickGain);
      clickGain.connect(this.duckingGain);

      clickOsc.start(t);
      clickOsc.stop(t + 0.06);
    };

    this.radarTimer = setInterval(triggerClick, 750);
  }

  // Smooth auto-ducking when narration is active
  public setDucking(isSpeaking: boolean) {
    if (!this.ctx || !this.duckingGain) return;
    const t = this.ctx.currentTime;
    const currentVal = this.duckingGain.gain.value;
    this.duckingGain.gain.cancelScheduledValues(t);
    this.duckingGain.gain.setValueAtTime(currentVal, t);

    if (isSpeaking) {
      // Duck down to 25% of background volume quickly (200ms)
      this.duckingGain.gain.linearRampToValueAtTime(0.25, t + 0.2);
    } else {
      // Swell back up smoothly to 100% (600ms)
      this.duckingGain.gain.linearRampToValueAtTime(1.0, t + 0.6);
    }
  }

  public setVolume(vol: number) {
    this.targetVolume = vol;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public evolveWithTimeline(intensity0to1: number) {
    if (!this.ctx || !this.isRunning) return;
    // Modulate filter cutoff dynamically with historical crisis/anomaly intensity!
    if (this.droneFilter) {
      const baseFreq = 160;
      const targetFreq = baseFreq + intensity0to1 * 400;
      this.droneFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.4);
    }
  }

  public getVisualizerData(buffer: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(buffer as any);
    }
  }

  public stop() {
    this.cleanupNodes();
    if (this.radarTimer) {
      clearInterval(this.radarTimer);
      this.radarTimer = null;
    }
    this.isRunning = false;
  }

  private cleanupNodes() {
    if (this.radarTimer) {
      clearInterval(this.radarTimer);
      this.radarTimer = null;
    }
    try {
      if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); this.droneOsc1 = null; }
      if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); this.droneOsc2 = null; }
      if (this.lfo) { this.lfo.stop(); this.lfo.disconnect(); this.lfo = null; }
      if (this.noiseNode) { this.noiseNode.stop(); this.noiseNode.disconnect(); this.noiseNode = null; }
    } catch (e) {
      // ignore stopped errors
    }
  }

  public getState() {
    return {
      isRunning: this.isRunning,
      preset: this.currentPreset,
      volume: this.targetVolume,
    };
  }
}

export const soundscapeEngine = new ProceduralSoundscapeEngine();
