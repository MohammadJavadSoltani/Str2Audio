export type SupportedLanguage = 'en' | 'fa';

export interface LocationData {
  name: string;
  country: string;
  coordinates: string;
  elevation?: string;
}

export interface HistoricalTrendPoint {
  year: number;
  waterAreaKm2: number;
  salinityGPerL: number;
  ndviAnomaly: number; // -1.0 to +1.0
  event: string;
}

export interface StoryboardFrame {
  timecode: string;
  title: string;
  prompt: string;
  type: string; // e.g. "Satellite Multispectral", "Infrared False-Color", "3D Topographic CAD", "Cinematic Landscape"
  visualOverlay: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tone: string;
  toneFa: string;
  description: string;
  descriptionFa: string;
  accent: string;
}

export interface VoiceConfig {
  voiceName: string;
  gender: 'male' | 'female';
  tone: string;
  pacingRate: number; // 0.8x to 1.5x
  studioFilter: boolean;
  audioDurationSec?: number;
  audioUrl?: string;
}

export interface SoundscapeConfig {
  preset: 'Orbital Drift' | 'Geospatial Radar Sweep' | 'Desolate Expanse' | 'Cyber Reconnaissance';
  volume: number; // 0.0 to 1.0
  autoDucking: boolean;
  active: boolean;
}

export interface EarthReport {
  id: string;
  title: string;
  titleFa: string;
  channel: string;
  category: string;
  location: LocationData;
  createdAt: string;
  lastModified: string;
  status: string;
  vaultHash: string;
  originalTranscript: string;
  originalTranscriptFa: string;
  paraphrasedScriptEn: string;
  paraphrasedScriptFa: string;
  targetDurationSec: number;
  voiceConfig: VoiceConfig;
  soundscape: SoundscapeConfig;
  historicalTrends: HistoricalTrendPoint[];
  storyboardFrames: StoryboardFrame[];
  videoUrl?: string;
}

export interface TranscriptSegment {
  time: string;
  textEn: string;
  textFa: string;
}
