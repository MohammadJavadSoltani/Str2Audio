import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Radio,
  Clock,
  Gauge,
  Zap,
  Activity,
  User,
  Music,
  Waves,
} from 'lucide-react';
import { EarthReport, SupportedLanguage, VoiceConfig, VoiceOption } from '../types';
import { generateNarrationApi, fetchVoiceSampleApi } from '../services/api';
import { audioStudio, StudioPlaybackState } from '../services/audioStudio';

interface VoiceNarrationStudioProps {
  language: SupportedLanguage;
  currentReport: EarthReport;
  onUpdateVoiceConfig: (config: VoiceConfig) => void;
}

export const VoiceNarrationStudio: React.FC<VoiceNarrationStudioProps> = ({
  language,
  currentReport,
  onUpdateVoiceConfig,
}) => {
  const isRtl = language === 'fa';

  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playingSampleVoice, setPlayingSampleVoice] = useState<string | null>(null);
  const [sampleLoadingVoice, setSampleLoadingVoice] = useState<string | null>(null);

  const voiceOptions: VoiceOption[] = [
    {
      id: 'Fenrir',
      name: 'Fenrir',
      gender: 'male',
      tone: 'Deep Cinematic Documentary',
      toneFa: 'بم، پرصلابت و سینمایی (سبک مستندهای حیات‌وحش و رصد زمین)',
      description: 'Authoritative, resonant, and solemn. Perfect for high-stakes environmental collapse.',
      descriptionFa: 'صدایی گرم، عمیق و پرطنین مناسب روایت بحران‌های ژئوپلیتیک',
      accent: 'Neutral English',
    },
    {
      id: 'Puck',
      name: 'Puck',
      gender: 'male',
      tone: 'Dynamic Storyteller',
      toneFa: 'پرانرژی، کنجکاو و سریع (سبک یوتیوبرهای پیشرو)',
      description: 'Engaging, fast-paced, curious, classic YouTube investigative documentary tone.',
      descriptionFa: 'ریتم تند و پرسشگرانه، ایده‌آل برای ویدیوهای سرگرم‌کننده و جذاب',
      accent: 'Engaging American',
    },
    {
      id: 'Charon',
      name: 'Charon',
      gender: 'male',
      tone: 'Scientific Precision',
      toneFa: 'تحلیلی، آرام و علمی (سبک رصدخانه‌های ناسا)',
      description: 'Measured, precise, clinical and articulate. Ideal for data telemetry breakdowns.',
      descriptionFa: 'لحنی متین و سنجیده برای تشریح داده‌های آماری و تصاویر راداری',
      accent: 'Formal English',
    },
    {
      id: 'Kore',
      name: 'Kore',
      gender: 'female',
      tone: 'Warm & Immersive Narrator',
      toneFa: 'گرم، گیرا و غوطه‌ورکننده (صدای زنانه مستند شاهکار)',
      description: 'Expressive, rich, warm, and highly engaging for long-form narrative arcs.',
      descriptionFa: 'بیانی احساسی و گیرا که مخاطب را مجذوب داستان جغرافیایی می‌کند',
      accent: 'Cinematic English',
    },
    {
      id: 'Zephyr',
      name: 'Zephyr',
      gender: 'female',
      tone: 'Investigative Clarity',
      toneFa: 'شفاف، صریح و ژورنالیستی (سبک گزارشگری تحقیقی)',
      description: 'Crisp, razor-sharp articulation with modern high-retention pacing.',
      descriptionFa: 'بیان رسا و مقتدر با وضوح بالا برای تشریح پدیده‌های اسرارآمیز',
      accent: 'Sharp Broadcast',
    },
    {
      id: 'Aoede',
      name: 'Aoede',
      gender: 'female',
      tone: 'Atmospheric & Poised',
      toneFa: 'آرامش‌بخش، شاعرانه و متین',
      description: 'Poised, melodic resonance, atmospheric and reflective pacing.',
      descriptionFa: 'لحنی دلنشین و باوقار متناسب با سکوت کویر و افق‌های دوردست',
      accent: 'Poised English',
    },
  ];

  const [selectedVoice, setSelectedVoice] = useState<string>(
    currentReport.voiceConfig?.voiceName || 'Fenrir'
  );
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [studioFilter, setStudioFilter] = useState<boolean>(
    currentReport.voiceConfig?.studioFilter !== false
  );
  const [playbackState, setPlaybackState] = useState<StudioPlaybackState>(audioStudio.getState());
  const [pacingRate, setPacingRate] = useState<number>(currentReport.voiceConfig?.pacingRate || 1.0);

  // Subscribe to audio playback state
  useEffect(() => {
    const unsubscribe = audioStudio.subscribe((s) => {
      setPlaybackState(s);
    });
    return unsubscribe;
  }, []);

  // When voice config audio changes in currentReport, load into audioStudio
  useEffect(() => {
    if (currentReport.voiceConfig?.audioUrl) {
      audioStudio.loadAudio(currentReport.voiceConfig.audioUrl, currentReport.targetDurationSec);
    }
  }, [currentReport.voiceConfig?.audioUrl]);

  const filteredVoices = voiceOptions.filter((v) =>
    genderFilter === 'all' ? true : v.gender === genderFilter
  );

  // Play voice sample handler
  const handlePlayVoiceSample = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // If already playing this voice sample, toggle pause
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
      console.warn('Voice sample preview error:', err);
    } finally {
      setSampleLoadingVoice(null);
    }
  };

  const handleGenerateVoice = async () => {
    setIsGenerating(true);
    try {
      const activeVoiceObj = voiceOptions.find((v) => v.id === selectedVoice);
      const textToNarrate = currentReport.paraphrasedScriptEn || currentReport.originalTranscript;

      const res = await generateNarrationApi({
        text: textToNarrate,
        voiceName: selectedVoice,
        targetDurationSec: currentReport.targetDurationSec,
        pacingRate: pacingRate,
        styleInstruction: `Professional documentary narrator for "Why Here" channel. Tone: ${activeVoiceObj?.tone}. Super clean studio delivery, flawless cadence.`,
      });

      if (res.audioUrl) {
        onUpdateVoiceConfig({
          voiceName: selectedVoice,
          gender: activeVoiceObj?.gender || 'male',
          tone: activeVoiceObj?.tone || 'Documentary',
          pacingRate: pacingRate,
          studioFilter: studioFilter,
          audioDurationSec: res.durationSec,
          audioUrl: res.audioUrl,
        });

        audioStudio.loadAudio(res.audioUrl, currentReport.targetDurationSec);
        audioStudio.play();
      }
    } catch (err) {
      console.error('Narration generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-fit pacing to video duration
  const handleAutoFitPacing = () => {
    const target = currentReport.targetDurationSec || 90;
    const currentAudioDur = currentReport.voiceConfig?.audioDurationSec || target;
    if (currentAudioDur > 0) {
      const idealRate = Math.max(0.8, Math.min(1.45, currentAudioDur / target));
      const rounded = Math.round(idealRate * 100) / 100;
      setPacingRate(rounded);
      audioStudio.setPlaybackRate(rounded);
      onUpdateVoiceConfig({
        ...currentReport.voiceConfig,
        pacingRate: rounded,
      });
    }
  };

  const handlePacingSliderChange = (rate: number) => {
    setPacingRate(rate);
    audioStudio.setPlaybackRate(rate);
    onUpdateVoiceConfig({
      ...currentReport.voiceConfig,
      pacingRate: rate,
    });
  };

  const handleToggleStudioFilter = () => {
    const nextVal = !studioFilter;
    setStudioFilter(nextVal);
    audioStudio.toggleStudioFilter(nextVal);
    onUpdateVoiceConfig({
      ...currentReport.voiceConfig,
      studioFilter: nextVal,
    });
  };

  // Formatter for time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-bold text-cyan-400">
              3
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              {isRtl
                ? 'گویندگی استودیویی با نمونه‌های صوتی و هماهنگی دقیق سرعت با ویدیو'
                : 'Studio Narration & Fluent Voice Previews (Natural Men & Women)'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isRtl
              ? 'گوش دادن فوری به نمونه صدای هر گوینده، فیلتر اکوستیک استودیو و تنظیم دقیق سرعت کلام با زمان‌بندی ویدیو'
              : 'Listen to instant studio voice samples, toggle DSP acoustic filters, and auto-sync narration duration'}
          </p>
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            onClick={() => setGenderFilter('all')}
            className={`rounded px-2.5 py-1 transition ${
              genderFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            {isRtl ? 'همه صداها' : 'All Voices'}
          </button>
          <button
            onClick={() => setGenderFilter('male')}
            className={`rounded px-2.5 py-1 transition ${
              genderFilter === 'male' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            {isRtl ? 'صداهای مرد' : 'Men'}
          </button>
          <button
            onClick={() => setGenderFilter('female')}
            className={`rounded px-2.5 py-1 transition ${
              genderFilter === 'female' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            {isRtl ? 'صداهای زن' : 'Women'}
          </button>
        </div>
      </div>

      {/* Voice Selection Cards Grid with Audio Samples */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredVoices.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isPlayingThisSample = playingSampleVoice === voice.id;
          const isLoadingThisSample = sampleLoadingVoice === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`relative cursor-pointer rounded-xl border p-3.5 transition duration-200 ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/50'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${
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
                      {isRtl ? voice.toneFa : voice.tone}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <p className="mt-2.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {isRtl ? voice.descriptionFa : voice.description}
              </p>

              {/* Sample Audio Player Button & Status */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                <button
                  onClick={(e) => handlePlayVoiceSample(voice.id, e)}
                  disabled={isLoadingThisSample}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                    isPlayingThisSample
                      ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60'
                  }`}
                  title="Listen to studio voice sample"
                >
                  {isLoadingThisSample ? (
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  ) : isPlayingThisSample ? (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      <span>{isRtl ? 'توقف نمونه' : 'Stop Sample'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{isRtl ? 'شنیدن نمونه صدا' : 'Play Sample'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <Waves className="h-3 w-3 text-emerald-400" />
                  <span>24kHz Studio</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Studio DSP Filter & Pacing Control Deck */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Studio Filter Toggle */}
          <div className="md:col-span-4 flex items-center justify-between border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">
                  {isRtl ? 'پردازش اکوستیک استودیو' : 'Studio Acoustic DSP'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isRtl
                  ? 'برش فرکانس‌های بم، تقویت وضوح صدا و کمپرسور برادکست'
                  : '100Hz rumble high-pass, 3.2kHz air boost, optical compressor'}
              </p>
            </div>

            <button
              onClick={handleToggleStudioFilter}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                studioFilter ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  studioFilter ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Pacing Speed & Auto-Fit to Video Duration */}
          <div className="md:col-span-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                  {isRtl ? 'ضریب سرعت گویندگی:' : 'Pacing Playback Rate:'}
                </span>
                <span className="font-bold text-cyan-300">{pacingRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.02"
                value={pacingRate}
                onChange={(e) => handlePacingSliderChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0.80x (Cinematic)</span>
                <span>1.0x (Standard)</span>
                <span>1.40x (Fast-Paced Shorts)</span>
              </div>
            </div>

            {/* Auto-Fit Button */}
            <button
              onClick={handleAutoFitPacing}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 transition shadow-[0_0_10px_rgba(6,182,212,0.1)] whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>{isRtl ? 'تراز خودکار با ویدیو' : 'Auto-Fit Pacing to Video'}</span>
            </button>
          </div>
        </div>

        {/* Studio Audio Player Scrubber & Generator Trigger */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Player controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => audioStudio.togglePlay()}
              disabled={!currentReport.voiceConfig?.audioUrl}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 hover:bg-cyan-400 disabled:opacity-40 transition"
            >
              {playbackState.isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => audioStudio.seek(0)}
              disabled={!currentReport.voiceConfig?.audioUrl}
              className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white disabled:opacity-40 transition"
              title="Restart from beginning"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Scrubber */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-cyan-300 w-10 text-right">
                {formatTime(playbackState.currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={playbackState.duration || 100}
                value={playbackState.currentTime}
                onChange={(e) => audioStudio.seek(parseFloat(e.target.value))}
                disabled={!currentReport.voiceConfig?.audioUrl}
                className="w-32 sm:w-48 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-slate-500 w-10">
                {formatTime(playbackState.duration || currentReport.targetDurationSec || 90)}
              </span>
            </div>
          </div>

          {/* Main Action: Generate Speech */}
          <button
            onClick={handleGenerateVoice}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 transition"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>{isRtl ? 'در حال ضبط استودیویی صدا...' : 'Generating Clean Studio Narration...'}</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>
                  {isRtl
                    ? `تولید گویندگی با صدای ${selectedVoice}`
                    : `Synthesize Narration Audio (${selectedVoice})`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
