import React, { useState } from 'react';
import {
  Sparkles,
  Tv,
  Check,
  Flame,
  Globe,
  Compass,
  FileCheck2,
  Clock,
  Layers,
  RefreshCw,
  Copy,
  Sliders,
} from 'lucide-react';
import { EarthReport, SupportedLanguage, StoryboardFrame, HistoricalTrendPoint } from '../types';
import { paraphraseScriptApi } from '../services/api';

interface ParaphraseStudioProps {
  language: SupportedLanguage;
  currentReport: EarthReport;
  onUpdateParaphrase: (
    scriptEn: string,
    scriptFa: string,
    titleEn?: string,
    titleFa?: string,
    storyboard?: StoryboardFrame[],
    trends?: HistoricalTrendPoint[]
  ) => void;
}

export const ParaphraseStudio: React.FC<ParaphraseStudioProps> = ({
  language,
  currentReport,
  onUpdateParaphrase,
}) => {
  const isRtl = language === 'fa';

  const [selectedStyle, setSelectedStyle] = useState<string>('Investigative Intrigue');
  const [targetDuration, setTargetDuration] = useState<number>(currentReport.targetDurationSec || 90);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'en' | 'fa'>('both');

  const styles = [
    {
      id: 'Investigative Intrigue',
      labelEn: 'Investigative Intrigue (Vox / Johnny Harris)',
      labelFa: 'معمایی و ژورنالیستی (سبک جانی هریس و واکس)',
      descEn: 'Suspenseful geospatial hooks, satellite anomaly reveals, high retention',
      descFa: 'شروع با قلاب تعلیق‌برانگیز جغرافیایی، تحلیل لندست و ریتم تند',
    },
    {
      id: 'Orbital Scientific',
      labelEn: 'Orbital Scientific (NASA Earth Observatory)',
      labelFa: 'علمی و مدارگردی (سبک رصدخانه ناسا)',
      descEn: 'Multispectral band insights, hydrological precision, Landsat-9 data',
      descFa: 'داده‌های دقیق طیف‌سنجی، تغییرات هیدرولوژی و مدل رقومی ارتفاع',
    },
    {
      id: 'Geopolitical Chokepoint',
      labelEn: 'Geopolitical Chokepoint (RealLifeLore)',
      labelFa: 'ژئوپلیتیک و بحران‌های استراتژیک',
      descEn: 'Global energy choke, border tensions, resource crisis analysis',
      descFa: 'تنگه‌های نفتی، ژئوپلیتیک آب، امنیت مرزی و جریان تجارت جهانی',
    },
  ];

  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      const res = await paraphraseScriptApi({
        transcriptEn: currentReport.originalTranscript,
        transcriptFa: currentReport.originalTranscriptFa,
        style: selectedStyle,
        targetDurationSec: targetDuration,
        locationContext: `${currentReport.location.name} (${currentReport.location.coordinates})`,
      });

      if (res.data) {
        onUpdateParaphrase(
          res.data.paraphrasedScriptEn || currentReport.paraphrasedScriptEn,
          res.data.paraphrasedScriptFa || currentReport.paraphrasedScriptFa,
          res.data.titleEn,
          res.data.titleFa,
          res.data.storyboardFrames,
          res.data.historicalTrends
        );
      }
    } catch (err) {
      console.error('Paraphrase error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-bold text-cyan-400">
              2
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              {isRtl
                ? 'بازنویسی هوشمند به سبک یوتیوب «چرا اینجا» (Why Here)'
                : 'AI Paraphrase Engine: "Why Here" YouTube Format'}
            </h2>
            <span className="flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300">
              <Flame className="h-3 w-3 text-amber-400" /> High-Retention
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isRtl
              ? 'ارتقای دقت زبان، فصاحت و یکپارچگی متن در هر دو زبان فارسی و انگلیسی همراه با قلاب‌های رصدی زمین'
              : 'Improves language accuracy, narrative coherence, and Earth observation suspense for YouTube'}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{isRtl ? 'در حال بازنویسی و سناریونویسی...' : 'Optimizing "Why Here" Script...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>
                {isRtl ? 'بازنویسی با هوش مصنوعی (فارسی و انگلیسی)' : 'Generate "Why Here" Earth Narrative'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Style & Pacing Configuration Bar */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
        {/* Style Selector */}
        <div className="md:col-span-8">
          <label className="text-xs font-mono text-slate-400 mb-2 block flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
            {isRtl ? 'سبک روایی یوتیوب:' : 'YouTube Narrative Persona:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition ${
                  selectedStyle === s.id
                    ? 'border-cyan-400/50 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <span className="font-semibold text-slate-200">
                  {isRtl ? s.labelFa : s.labelEn}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {isRtl ? s.descFa : s.descEn}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Video Duration & WPM Pacing */}
        <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                {isRtl ? 'مدت هدف ویدیو:' : 'Target Video Duration:'}
              </span>
              <span className="font-bold text-cyan-300">{targetDuration}s (~{Math.round(targetDuration / 60 * 10) / 10} min)</span>
            </div>
            <input
              type="range"
              min="30"
              max="240"
              step="15"
              value={targetDuration}
              onChange={(e) => setTargetDuration(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
            <span>{isRtl ? 'کلمات تخمینی:' : 'Target Script Length:'}</span>
            <span className="text-emerald-400 font-bold">~{Math.round(targetDuration * 2.3)} words</span>
          </div>
        </div>
      </div>

      {/* Script Titles & Hook Callout */}
      <div className="mt-5 space-y-4">
        {/* Titles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Tv className="h-3.5 w-3.5" /> YouTube Title (English)
              </span>
              <button
                onClick={() => handleCopy(currentReport.title, 'titleEn')}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedField === 'titleEn' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                Copy
              </button>
            </div>
            <p className="mt-2 text-sm font-bold text-white font-['Space_Grotesk'] leading-snug">
              {currentReport.title}
            </p>
          </div>

          <div dir="rtl" className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 font-persian">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Tv className="h-3.5 w-3.5" /> عنوان بهینه‌شده یوتیوب (فارسی)
              </span>
              <button
                onClick={() => handleCopy(currentReport.titleFa, 'titleFa')}
                className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-sans"
              >
                {copiedField === 'titleFa' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                کپی
              </button>
            </div>
            <p className="mt-2 text-sm font-bold text-white leading-relaxed">
              {currentReport.titleFa}
            </p>
          </div>
        </div>

        {/* Dual-Language Paraphrased Scripts */}
        <div>
          {/* Tab Selector for View */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isRtl ? 'فیلم‌نامه و متن بازنویسی شده' : 'Paraphrased Narration Scripts'}
              </span>
            </div>

            <div className="flex rounded-md border border-slate-800 bg-slate-950 p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('both')}
                className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition ${
                  activeTab === 'both' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                }`}
              >
                {isRtl ? 'مقایسه دوزبانه' : 'Parallel Dual-View'}
              </button>
              <button
                onClick={() => setActiveTab('en')}
                className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition ${
                  activeTab === 'en' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                }`}
              >
                English Script
              </button>
              <button
                onClick={() => setActiveTab('fa')}
                className={`rounded px-2.5 py-0.5 text-[11px] font-medium font-persian transition ${
                  activeTab === 'fa' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                }`}
              >
                متن فارسی
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English Paraphrased Script */}
            {(activeTab === 'both' || activeTab === 'en') && (
              <div
                className={`flex flex-col rounded-xl border border-cyan-500/30 bg-slate-950/80 p-4 shadow-inner ${
                  activeTab === 'en' ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    English Master Narration Script ("Why Here" Pacing)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      {currentReport.paraphrasedScriptEn.split(' ').length} words
                    </span>
                    <button
                      onClick={() => handleCopy(currentReport.paraphrasedScriptEn, 'scriptEn')}
                      className="text-slate-400 hover:text-cyan-300"
                      title="Copy script"
                    >
                      {copiedField === 'scriptEn' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  value={currentReport.paraphrasedScriptEn}
                  onChange={(e) =>
                    onUpdateParaphrase(e.target.value, currentReport.paraphrasedScriptFa)
                  }
                  rows={9}
                  className="flex-1 w-full resize-none bg-transparent text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none scrollbar-thin font-['Plus_Jakarta_Sans']"
                />
              </div>
            )}

            {/* Persian Paraphrased Script */}
            {(activeTab === 'both' || activeTab === 'fa') && (
              <div
                dir="rtl"
                className={`flex flex-col rounded-xl border border-emerald-500/30 bg-slate-950/80 p-4 shadow-inner font-persian ${
                  activeTab === 'fa' ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    متن گویندگی فارسی (بهبود یافته و روان)
                  </div>
                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-[10px] font-mono text-slate-400">
                      {currentReport.paraphrasedScriptFa.split(' ').length} کلمه
                    </span>
                    <button
                      onClick={() => handleCopy(currentReport.paraphrasedScriptFa, 'scriptFa')}
                      className="text-slate-400 hover:text-emerald-300"
                      title="کپی متن"
                    >
                      {copiedField === 'scriptFa' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  value={currentReport.paraphrasedScriptFa}
                  onChange={(e) =>
                    onUpdateParaphrase(currentReport.paraphrasedScriptEn, e.target.value)
                  }
                  rows={9}
                  className="flex-1 w-full resize-none bg-transparent text-xs sm:text-sm text-slate-200 leading-loose focus:outline-none scrollbar-thin"
                />
              </div>
            )}
          </div>
        </div>

        {/* Storyboard Cues Bar */}
        {currentReport.storyboardFrames && currentReport.storyboardFrames.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Layers className="h-3.5 w-3.5" />
                {isRtl ? 'سرنخ‌های بصری و استوری‌بورد ماهواره‌ای:' : 'Earth Observation Storyboard Cues:'}
              </span>
              <span>{currentReport.storyboardFrames.length} Visual Cuts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {currentReport.storyboardFrames.map((frame, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1">
                    <span>{frame.timecode}</span>
                    <span className="text-slate-500">{frame.type}</span>
                  </div>
                  <h4 className="font-semibold text-slate-200 text-xs mb-1 line-clamp-1">
                    {frame.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {frame.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
