import { soundscapeEngine } from './soundscape';

export interface StudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  studioFilterActive: boolean;
}

class AudioStudioService {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private stateListeners: ((state: StudioPlaybackState) => void)[] = [];

  private isPlaying: boolean = false;
  private studioFilterActive: boolean = true;
  private playbackRate: number = 1.0;
  private currentAudioUrl: string | null = null;

  constructor() {
    // Lazily initialized on first user gesture
  }

  private initAudioPipeline() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';

      this.audioElement.addEventListener('timeupdate', () => {
        this.emitState();
      });

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        soundscapeEngine.setDucking(true);
        this.emitState();
      });

      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
        soundscapeEngine.setDucking(false);
        this.emitState();
      });

      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
        soundscapeEngine.setDucking(false);
        this.emitState();
      });
    }

    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();

      try {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);

        // Studio Filter Nodes
        // 1. High-pass filter at 100Hz to eliminate mic mud/rumble
        this.highPassFilter = this.audioCtx.createBiquadFilter();
        this.highPassFilter.type = 'highpass';
        this.highPassFilter.frequency.setValueAtTime(100, this.audioCtx.currentTime);

        // 2. High shelf presence filter at 3.5kHz for crisp broadcast clarity
        this.presenceFilter = this.audioCtx.createBiquadFilter();
        this.presenceFilter.type = 'peaking';
        this.presenceFilter.frequency.setValueAtTime(3200, this.audioCtx.currentTime);
        this.presenceFilter.gain.setValueAtTime(2.5, this.audioCtx.currentTime);
        this.presenceFilter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);

        // 3. Broadcast compressor for smooth studio dynamics
        this.compressor = this.audioCtx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.audioCtx.currentTime);
        this.compressor.knee.setValueAtTime(12, this.audioCtx.currentTime);
        this.compressor.ratio.setValueAtTime(3.5, this.audioCtx.currentTime);
        this.compressor.attack.setValueAtTime(0.005, this.audioCtx.currentTime);
        this.compressor.release.setValueAtTime(0.15, this.audioCtx.currentTime);

        this.connectNodes();
      } catch (e) {
        console.warn('Web Audio routing note:', e);
      }
    }
  }

  private connectNodes() {
    if (!this.audioCtx || !this.sourceNode) return;
    try {
      this.sourceNode.disconnect();
      if (this.highPassFilter) this.highPassFilter.disconnect();
      if (this.presenceFilter) this.presenceFilter.disconnect();
      if (this.compressor) this.compressor.disconnect();

      if (this.studioFilterActive && this.highPassFilter && this.presenceFilter && this.compressor) {
        this.sourceNode.connect(this.highPassFilter);
        this.highPassFilter.connect(this.presenceFilter);
        this.presenceFilter.connect(this.compressor);
        this.compressor.connect(this.audioCtx.destination);
      } else {
        this.sourceNode.connect(this.audioCtx.destination);
      }
    } catch (e) {
      console.warn('Audio routing reconnect:', e);
    }
  }

  public loadAudio(url: string, targetDuration?: number) {
    this.initAudioPipeline();
    if (!this.audioElement) return;

    this.currentAudioUrl = url;
    this.audioElement.src = url;
    this.audioElement.playbackRate = this.playbackRate;
    this.audioElement.load();
    this.emitState();
  }

  public play() {
    this.initAudioPipeline();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (this.audioElement && this.currentAudioUrl) {
      this.audioElement.play().catch((err) => {
        console.warn('Playback prevented by browser policy:', err);
      });
    }
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(timeSeconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(timeSeconds, this.audioElement.duration || 0));
      this.emitState();
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = Math.max(0.7, Math.min(1.6, rate));
    if (this.audioElement) {
      this.audioElement.playbackRate = this.playbackRate;
    }
    this.emitState();
  }

  public toggleStudioFilter(active?: boolean) {
    this.studioFilterActive = active !== undefined ? active : !this.studioFilterActive;
    this.connectNodes();
    this.emitState();
  }

  public getState(): StudioPlaybackState {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.audioElement?.currentTime || 0,
      duration: this.audioElement?.duration || 0,
      playbackRate: this.playbackRate,
      studioFilterActive: this.studioFilterActive,
    };
  }

  public subscribe(listener: (state: StudioPlaybackState) => void) {
    this.stateListeners.push(listener);
    listener(this.getState());
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener);
    };
  }

  private emitState() {
    const s = this.getState();
    this.stateListeners.forEach((l) => l(s));
  }
}

export const audioStudio = new AudioStudioService();
