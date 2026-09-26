import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Activity,
  AlertTriangle,
  Info,
  Droplets,
  Layers,
} from 'lucide-react';
import { EarthReport, SupportedLanguage, HistoricalTrendPoint } from '../types';

interface InteractiveTimelineProps {
  language: SupportedLanguage;
  currentReport: EarthReport;
  activeYear: number;
  onYearChange: (year: number) => void;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  language,
  currentReport,
  activeYear,
  onYearChange,
}) => {
  const isRtl = language === 'fa';
  const trends = currentReport.historicalTrends || [];

  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  const minYear = trends.length > 0 ? trends[0].year : 1984;
  const maxYear = trends.length > 0 ? trends[trends.length - 1].year : 2026;

  // Find closest trend data point for activeYear
  const currentDataPoint: HistoricalTrendPoint =
    trends.find((t) => t.year === activeYear) ||
    trends.reduce((prev, curr) =>
      Math.abs(curr.year - activeYear) < Math.abs(prev.year - activeYear) ? curr : prev
    , trends[0] || { year: activeYear, waterAreaKm2: 1200, salinityGPerL: 380, ndviAnomaly: -0.15, event: 'Satellite surveillance' });

  // Auto-play loop for timeline
  useEffect(() => {
    let timer: any = null;
    if (isPlayingTimeline) {
      timer = setInterval(() => {
        onYearChange(activeYear >= maxYear ? minYear : activeYear + 2);
      }, 900);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingTimeline, activeYear, minYear, maxYear, onYearChange]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-bold text-cyan-400">
              6
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              {isRtl
                ? 'تایم‌لاین تعاملی و پایش زمانی تغییرات ماهواره‌ای'
                : 'Interactive Historical Trend Timeline (1984 - 2026)'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isRtl
              ? 'پیمایش دهه‌های رصد ماهواره‌ای لندست و سنتینل؛ سنجش مساحت آبی، شوری و پوشش گیاهی'
              : 'Scrub through decades of Landsat surveillance; dynamically inspect water recession and ecological milestones'}
          </p>
        </div>

        {/* Playback & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              isPlayingTimeline
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60'
            }`}
          >
            {isPlayingTimeline ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>{isRtl ? 'توقف پیمایش' : 'Pause Time-Lapse'}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                <span>{isRtl ? 'پخش مرور زمان' : 'Play Time-Lapse'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onYearChange(minYear)}
            className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-white transition"
            title="Reset to 1984"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time Metric Gauges Bar */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Active Year Callout */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-3 text-center shadow-inner">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
            {isRtl ? 'سال رصد ماهواره‌ای' : 'Observation Year'}
          </span>
          <span className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-white mt-1 block">
            {activeYear}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {activeYear <= 1999 ? 'Landsat 4/5 MSS' : activeYear <= 2013 ? 'Landsat 7 ETM+' : 'Landsat 8/9 & Sentinel-2'}
          </span>
        </div>

        {/* Water Area */}
        <div className="rounded-xl border border-blue-500/30 bg-slate-950/80 p-3 text-center shadow-inner">
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
            {isRtl ? 'مساحت پهنه آبی' : 'Surface Water Area'}
          </span>
          <span className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-blue-300 mt-1 block">
            {currentDataPoint.waterAreaKm2 ? `${currentDataPoint.waterAreaKm2} km²` : 'N/A'}
          </span>
          <span className="text-[10px] font-mono text-red-400">
            {currentDataPoint.waterAreaKm2
              ? `-${Math.round((1 - currentDataPoint.waterAreaKm2 / 5600) * 100)}% vs 1995 peak`
              : 'Geological dome'}
          </span>
        </div>

        {/* Salinity Index */}
        <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-3 text-center shadow-inner">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
            {isRtl ? 'میزان شوری آب' : 'Water Salinity'}
          </span>
          <span className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1 block">
            {currentDataPoint.salinityGPerL ? `${currentDataPoint.salinityGPerL} g/L` : 'Inland Bed'}
          </span>
          <span className="text-[10px] font-mono text-amber-500">
            {currentDataPoint.salinityGPerL > 300 ? 'Hyper-saturated Crimson' : 'Normal Saline'}
          </span>
        </div>

        {/* NDVI Vegetation Anomaly */}
        <div className="rounded-xl border border-emerald-500/30 bg-slate-950/80 p-3 text-center shadow-inner">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
            {isRtl ? 'شاخص پوشش گیاهی NDVI' : 'NDVI Anomaly'}
          </span>
          <span className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-1 block">
            {currentDataPoint.ndviAnomaly > 0 ? `+${currentDataPoint.ndviAnomaly}` : currentDataPoint.ndviAnomaly}
          </span>
          <span className="text-[10px] font-mono text-emerald-500">
            Multispectral Vegetative Health
          </span>
        </div>
      </div>

      {/* Main Scrubber Track */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/90 p-4">
        {/* Scrubber Slider */}
        <div className="relative mb-2">
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step="1"
            value={activeYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg shadow-inner"
          />
        </div>

        {/* Year Ticks */}
        <div className="flex justify-between text-[11px] font-mono text-slate-500 px-1">
          <span>{minYear}</span>
          <span>1995</span>
          <span>2005</span>
          <span>2015</span>
          <span>{maxYear}</span>
        </div>

        {/* Historical Milestones Badges Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {trends.map((t) => {
            const isActive = Math.abs(t.year - activeYear) <= 2;
            return (
              <div
                key={t.year}
                onClick={() => onYearChange(t.year)}
                className={`cursor-pointer rounded-lg border p-2.5 transition text-xs ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] text-cyan-400 font-bold mb-1">
                  <span>{t.year}</span>
                  {t.waterAreaKm2 > 0 && <span>{t.waterAreaKm2} km²</span>}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {t.event}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
