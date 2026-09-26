/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Mic,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  User,
  Tv,
  ArrowRight,
  Waves,
  Zap,
  Globe2,
  FileDown,
} from 'lucide-react';
import { translateEnhanceSrtApi, generateNarrationApi, fetchVoiceSampleApi } from './services/api';
import { audioStudio, StudioPlaybackState } from './services/audioStudio';

const SAMPLE_PERSIAN_SRT = `1
00:00:01,000 --> 00:00:04,500
به این نقطه در بیابان موریتانی دقیق نگاه کنید.

2
00:00:05,000 --> 00:00:09,800
از فضا، یک نشانه حلقوی ۴۰ کیلومتری درست به اعماق آسمان خیره شده است.

3
00:00:10,200 --> 00:00:15,000
دهه‌ها تصور می‌شد اینجا محل برخورد یک شهاب‌سنگ باستانی یا دهانه یک آتشفشان خاموش است.

4
00:00:15,500 --> 00:00:20,500
اما رادارهای ماهواره‌ای واقعیتی شگفت‌انگیزتر را آشکار می‌کنند: صد میلیون سال فرسایش لایه‌های کوارتزیت.

5
00:00:21,000 --> 00:00:25,500
چرا اینجا؟ در این اپیزود از 'چرا اینجا'، راز چشم صحرا را بررسی می‌کنیم.`;

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tone: string;
  description: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'male',
    tone: 'Deep Cinematic Documentary',
    description: 'Resonant, authoritative, and solemn. Perfect for high-stakes Earth observation.',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'male',
    tone: 'Dynamic Storyteller',
    description: 'Engaging, curious, and fast-paced YouTube investigative style.',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'male',
    tone: 'Scientific Precision',
    description: 'Measured, precise, and articulate data breakdown analyst.',
  },
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'female',
    tone: 'Warm & Immersive Narrator',
    description: 'Expressive, rich, warm, and cinematic narrative poise.',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'female',
    tone: 'Investigative Clarity',
    description: 'Crisp, razor-sharp broadcast articulation with high retention.',
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'female',
    tone: 'Atmospheric & Poised',
    description: 'Melodic, balanced resonance, suited for vast landscapes.',
  },
];

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  // States
  const [persianSrt, setPersianSrt] = useState<string>(SAMPLE_PERSIAN_SRT);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>('sample_earth_anomaly.srt');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedScript, setTranslatedScript] = useState<string>(
    "Look closely at this patch of the Mauritanian desert. From low-Earth orbit, a colossal forty-kilometer bullseye stares straight back out into the cosmos. For decades, researchers wondered: was this an ancient extraterrestrial impact, or the remnants of a forgotten caldera? But satellite radar telemetry reveals a far more shocking reality: one hundred million years of Cretaceous quartzite dome erosion. Why here? In this episode of Why Here, we uncover the secrets of the Eye of the Sahara."
  );
  const [translatedSrt, setTranslatedSrt] = useState<string>(
    `1\n00:00:01,000 --> 00:00:04,500\nLook closely at this patch of the Mauritanian desert.\n\n2\n00:00:05,000 --> 00:00:09,800\nFrom low-Earth orbit, a colossal 40-kilometer bullseye stares straight back out into the cosmos.\n\n3\n00:00:10,200 --> 00:00:15,000\nFor decades, researchers wondered: was this an ancient extraterrestrial impact?\n\n4\n00:00:15,500 --> 00:00:20,500\nSatellite radar telemetry reveals a far more shocking reality: 100 million years of quartzite dome erosion.\n\n5\n00:00:21,000 --> 00:00:25,500\nWhy here? In this episode of Why Here, we uncover the secrets of the Eye of the Sahara.`
  );
  const [activeScriptTab, setActiveScriptTab] = useState<'script' | 'srt'>('script');
  const [selectedVoice, setSelectedVoice] = useState<string>('Fenrir');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [pacingRate, setPacingRate] = useState<number>(1.0);
  const [studioFilter, setStudioFilter] = useState<boolean>(true);

  // Sample voice state
  const [playingSampleVoice, setPlayingSampleVoice] = useState<string | null>(null);
  const [sampleLoadingVoice, setSampleLoadingVoice] = useState<string | null>(null);

  // Final Narration Generation State
  const [isGeneratingVoice, setIsGeneratingVoice] = useState<boolean>(false);
  const [finalAudioUrl, setFinalAudioUrl] = useState<string | null>(null);
  const [finalDurationSec, setFinalDurationSec] = useState<number>(26);
  const [playbackState, setPlaybackState] = useState<StudioPlaybackState>(audioStudio.getState());
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Subscribe to audio studio playback state
  useEffect(() => {
    const unsub = audioStudio.subscribe((s) => {
      setPlaybackState(s);
    });
    return unsub;
  }, []);

  // Handle .srt file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPersianSrt(content);
      }
    };
    reader.readAsText(file);
  };

  // Translate and Enhance Persian SRT
  const handleTranslateAndEnhance = async () => {
    if (!persianSrt.trim()) return;
    setIsTranslating(true);
    try {
      const res = await translateEnhanceSrtApi(persianSrt);
      if (res.continuousScript) {
        setTranslatedScript(res.continuousScript);
      }
      if (res.translatedSrt) {
        setTranslatedSrt(res.translatedSrt);
      }
      if (res.estimatedSpeakingTimeSec) {
        setFinalDurationSec(res.estimatedSpeakingTimeSec);
      }
    } catch (err) {
      console.warn('Translation warning:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Play instant sample of selected voice
  const handlePlayVoiceSample = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingSampleVoice === voiceId) {
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
      }
      setPlayingSampleVoice(null);
      return;
    }

    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
    }

    setSampleLoadingVoice(voiceId);
    try {
      const res = await fetchVoiceSampleApi(voiceId);
      if (res.audioUrl) {
        if (!sampleAudioRef.current) {
          sampleAudioRef.current = new Audio();
          sampleAudioRef.current.onended = () => setPlayingSampleVoice(null);
        }
        sampleAudioRef.current.src = res.audioUrl;
        sampleAudioRef.current.play();
        setPlayingSampleVoice(voiceId);
      }
    } catch (err) {
      console.warn('Voice preview error:', err);
    } finally {
      setSampleLoadingVoice(null);
    }
  };

  // Generate Final Narration Audio
  const handleGenerateFinalVoice = async () => {
    if (!translatedScript.trim()) return;
    setIsGeneratingVoice(true);
    try {
      const res = await generateNarrationApi({
        text: translatedScript,
        voiceName: selectedVoice,
        pacingRate: pacingRate,
        styleInstruction: `Professional YouTube narrator for the channel 'Why Here'. Clean broadcast studio quality, flawless cadence.`,
      });

      if (res.audioUrl) {
        setFinalAudioUrl(res.audioUrl);
        setFinalDurationSec(res.durationSec || 30);
        audioStudio.loadAudio(res.audioUrl);
        audioStudio.play();
      }
    } catch (err) {
      console.error('Final narration error:', err);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Download Final Audio (.wav)
  const handleDownloadAudio = () => {
    if (!finalAudioUrl) return;
    const link = document.createElement('a');
    link.href = finalAudioUrl;
    link.download = `WhyHere_${selectedVoice}_Narration.wav`;
    link.click();
  };

  // Download Translated .SRT file
  const handleDownloadSrt = () => {
    const blob = new Blob([translatedSrt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WhyHere_English_Subtitles.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy English script
  const handleCopyScript = () => {
    navigator.clipboard.writeText(translatedScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredVoices = VOICE_OPTIONS.filter((v) =>
    genderFilter === 'all' ? true : v.gender === genderFilter
  );

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Clean Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 sm:px-8 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/40 bg-red-950/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-lg font-bold text-white tracking-tight">
                  WHY HERE
                </span>
                <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300 uppercase">
                  Studio Audio Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Persian .SRT Subtitles → Enhanced English Narration & Final Studio Voice
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
            <Waves className="h-3.5 w-3.5" />
            <span>24kHz Studio Audio Pipeline</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        {/* Step 1: Input Persian .SRT Subtitle File */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Step 1
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <FileText className="h-5 w-5 text-cyan-400" />
                Input Persian Subtitle (.SRT)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your Persian .srt file or paste your subtitle timecodes directly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".srt,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload .SRT File</span>
              </button>

              <button
                onClick={() => {
                  setPersianSrt(SAMPLE_PERSIAN_SRT);
                  setUploadedFileName('sample_eye_of_sahara.srt');
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
              >
                Load Sample .SRT
              </button>
            </div>
          </div>

          {/* Subtitle Textarea (Persian RTL) */}
          <div className="relative rounded-xl border border-amber-500/30 bg-slate-950/80 p-3.5 font-mono shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80 mb-2">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Persian .SRT Input ({uploadedFileName || 'Custom Input'})
              </span>
              <span className="text-[11px]">
                {persianSrt.split('\n').filter((l) => l.includes('-->')).length} Subtitle Blocks
              </span>
            </div>
            <textarea
              dir="rtl"
              value={persianSrt}
              onChange={(e) => setPersianSrt(e.target.value)}
              rows={8}
              className="w-full resize-y bg-transparent text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none scrollbar-thin font-['Vazirmatn']"
              placeholder="1&#10;00:00:01,000 --> 00:00:04,500&#10;متن زیرنویس فارسی خود را اینجا وارد کنید..."
            />
          </div>

          {/* Translate Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleTranslateAndEnhance}
              disabled={isTranslating || !persianSrt.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition"
            >
              {isTranslating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Translating & Enhancing for "Why Here"...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Translate & Enhance into English Script</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Step 2: Translated & Enhanced English Script */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Step 2
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <Globe2 className="h-5 w-5 text-cyan-400" />
                Enhanced English Script ("Why Here" YouTube Format)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Language accuracy improved, elevated narrative suspense, fact-checked for Earth observation voiceover.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs">
                <button
                  onClick={() => setActiveScriptTab('script')}
                  className={`rounded px-2.5 py-1 transition ${
                    activeScriptTab === 'script'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  Narration Script
                </button>
                <button
                  onClick={() => setActiveScriptTab('srt')}
                  className={`rounded px-2.5 py-1 transition ${
                    activeScriptTab === 'srt'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  English .SRT Subtitles
                </button>
              </div>

              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition"
                title="Copy script"
              >
                {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={handleDownloadSrt}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition"
                title="Download English .SRT"
              >
                <FileDown className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">.SRT</span>
              </button>
            </div>
          </div>

          {/* Script Content Area */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-4 shadow-inner">
            {activeScriptTab === 'script' ? (
              <textarea
                value={translatedScript}
                onChange={(e) => setTranslatedScript(e.target.value)}
                rows={7}
                className="w-full resize-y bg-transparent text-xs sm:text-sm text-slate-100 leading-relaxed focus:outline-none scrollbar-thin font-['Plus_Jakarta_Sans'] font-medium"
                placeholder="Enhanced English narration script will appear here..."
              />
            ) : (
              <textarea
                value={translatedSrt}
                onChange={(e) => setTranslatedSrt(e.target.value)}
                rows={7}
                className="w-full resize-y bg-transparent text-xs font-mono text-cyan-300 leading-relaxed focus:outline-none scrollbar-thin"
              />
            )}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>{translatedScript.split(' ').filter(Boolean).length} Words</span>
              <span>Estimated Duration: ~{Math.round((translatedScript.split(' ').filter(Boolean).length / 140) * 60)}s</span>
            </div>
          </div>
        </section>

        {/* Step 3: Select Natural Voice Actor (With Instant Play Sample) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Step 3
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <Mic className="h-5 w-5 text-cyan-400" />
                Select Voice Actor & Listen to Studio Samples
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fluent, natural English male and female voices. Click <strong>"Play Sample"</strong> on any voice to preview.
              </p>
            </div>

            {/* Gender Filters */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
              <button
                onClick={() => setGenderFilter('all')}
                className={`rounded px-2.5 py-1 transition ${
                  genderFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                All Voices
              </button>
              <button
                onClick={() => setGenderFilter('male')}
                className={`rounded px-2.5 py-1 transition ${
                  genderFilter === 'male' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Men
              </button>
              <button
                onClick={() => setGenderFilter('female')}
                className={`rounded px-2.5 py-1 transition ${
                  genderFilter === 'female' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                Women
              </button>
            </div>
          </div>

          {/* Voice Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredVoices.map((voice) => {
              const isSelected = selectedVoice === voice.id;
              const isPlayingThisSample = playingSampleVoice === voice.id;
              const isLoadingThisSample = sampleLoadingVoice === voice.id;

              return (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`relative cursor-pointer rounded-xl border p-4 transition duration-200 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/50'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold ${
                          voice.gender === 'female'
                            ? 'border-fuchsia-500/30 bg-fuchsia-950/40 text-fuchsia-300'
                            : 'border-blue-500/30 bg-blue-950/40 text-blue-300'
                        }`}
                      >
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                          {voice.name}
                          <span className="text-[10px] font-mono text-slate-400">
                            ({voice.gender})
                          </span>
                        </h3>
                        <p className="text-[11px] font-mono text-cyan-400">
                          {voice.tone}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                    {voice.description}
                  </p>

                  {/* Play Sample Button */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                    <button
                      onClick={(e) => handlePlayVoiceSample(voice.id, e)}
                      disabled={isLoadingThisSample}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition ${
                        isPlayingThisSample
                          ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60'
                      }`}
                    >
                      {isLoadingThisSample ? (
                        <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      ) : isPlayingThisSample ? (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Play Sample</span>
                        </>
                      )}
                    </button>

                    <span className="text-[10px] font-mono text-emerald-400">
                      Studio Sample
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls & Generate Button */}
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">Pacing Speed:</span>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={pacingRate}
                onChange={(e) => {
                  setPacingRate(parseFloat(e.target.value));
                  audioStudio.setPlaybackRate(parseFloat(e.target.value));
                }}
                className="w-28 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-cyan-300 font-bold">{pacingRate.toFixed(2)}x</span>
            </div>

            {/* Main Action: Generate Final Voice */}
            <button
              onClick={handleGenerateFinalVoice}
              disabled={isGeneratingVoice || !translatedScript.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 transition"
            >
              {isGeneratingVoice ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Studio Audio with {selectedVoice}...</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span>Generate Final Studio Voice ({selectedVoice})</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Step 4: Final Studio Voice Audio Player & Download */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Step 4
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <Waves className="h-5 w-5 text-emerald-400" />
                Final Studio Narration Audio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Your finished studio voiceover ready for YouTube video editing.
              </p>
            </div>

            {finalAudioUrl && (
              <button
                onClick={handleDownloadAudio}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition"
              >
                <Download className="h-4 w-4" />
                <span>Download Final Audio (.WAV)</span>
              </button>
            )}
          </div>

          {/* Audio Player Component */}
          {finalAudioUrl ? (
            <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => audioStudio.togglePlay()}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 hover:bg-cyan-400 transition"
                  >
                    {playbackState.isPlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => audioStudio.seek(0)}
                    className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white transition"
                    title="Restart"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedVoice} Narration Track</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        24kHz Master WAV
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Duration: {formatTime(playbackState.duration || finalDurationSec)}
                    </div>
                  </div>
                </div>

                <div className="font-mono text-sm text-cyan-300">
                  {formatTime(playbackState.currentTime)} / {formatTime(playbackState.duration || finalDurationSec)}
                </div>
              </div>

              {/* Scrubber */}
              <input
                type="range"
                min="0"
                max={playbackState.duration || finalDurationSec || 100}
                value={playbackState.currentTime}
                onChange={(e) => audioStudio.seek(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center text-slate-500">
              <Mic className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">Click "Generate Final Studio Voice" above to render your narration audio.</p>
            </div>
          )}
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 text-center text-xs font-mono text-slate-500">
        <p>Why Here Studio // Earth Observation YouTube Translation & Voice Pipeline</p>
      </footer>
    </div>
  );
}
