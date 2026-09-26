import { EarthReport, VoiceConfig } from '../types';

export async function translateEnhanceSrtApi(srtContent: string): Promise<{
  continuousScript: string;
  translatedSrt: string;
  detectedTopic?: string;
  wordCount?: number;
  estimatedSpeakingTimeSec?: number;
}> {
  const res = await fetch('/api/srt-translate-enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ srtContent }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to translate SRT');
  }
  return await res.json();
}

export async function extractTranscriptApi(payload: {
  audioBase64?: string;
  mimeType?: string;
  rawText?: string;
  sampleId?: string;
}) {
  const res = await fetch('/api/extract-transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to extract transcript');
  }
  return await res.json();
}

export async function paraphraseScriptApi(payload: {
  transcriptEn: string;
  transcriptFa: string;
  style: string;
  targetDurationSec: number;
  locationContext?: string;
}) {
  const res = await fetch('/api/paraphrase-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to paraphrase script');
  }
  return await res.json();
}

export async function generateNarrationApi(payload: {
  text: string;
  voiceName: string;
  targetDurationSec?: number;
  pacingRate?: number;
  styleInstruction?: string;
}) {
  const res = await fetch('/api/generate-narration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate narration');
  }
  return await res.json();
}

export async function fetchVoiceSampleApi(voiceName: string): Promise<{ audioUrl: string; sampleText: string }> {
  const res = await fetch('/api/voice-sample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceName }),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch voice sample');
  }
  return await res.json();
}

export async function fetchReportsApi(): Promise<EarthReport[]> {
  const res = await fetch('/api/reports');
  if (!res.ok) {
    throw new Error('Failed to load reports from cloud vault');
  }
  const data = await res.json();
  return data.reports || [];
}

export async function saveReportApi(report: Partial<EarthReport>): Promise<EarthReport> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (!res.ok) {
    throw new Error('Failed to save report to cloud vault');
  }
  const data = await res.json();
  return data.report;
}

export async function deleteReportApi(id: string): Promise<void> {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete report');
  }
}
