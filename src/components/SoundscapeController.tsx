import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  Waves,
  ShieldAlert,
  ArrowDownUp,
} from 'lucide-react';
import { SupportedLanguage, SoundscapeConfig } from '../types';
import { soundscapeEngine } from '../services/soundscape';

interface SoundscapeControllerProps {
  language: SupportedLanguage;
  config: SoundscapeConfig;
  onChangeConfig: (newConfig: SoundscapeConfig) => void;
  timelineIntensity?: number; // 0 to 1
}

export const SoundscapeController: React.FC<SoundscapeControllerProps> = ({
  language,
  config,
  onChangeConfig,
  timelineIntensity = 0.5,
}) => {
  const isRtl = language === 'fa';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const presets = [
    {
      id: 'Orbital Drift',
      nameEn: 'Orbital Drift',
      nameFa: 'شناوری مداری',
      descEn: 'Deep 55Hz sub drone with cosmic stereophonic sweep',
      descFa: 'طنین بم ۵۵ هرتزی با نوسان استریوی کیهانی',
    },
    {
      id: 'Geospatial Radar Sweep',
      nameEn: 'Geospatial Radar',
      nameFa: 'رادار ژئواسپشیال',
      descEn: 'Pulsing radar ping with deep satellite acoustic resonance',
      descFa: 'پالس‌های راداری ماهواره‌ای با اکوی فضایی عمیق',
    },
    {
      id: 'Desolate Expanse',
      nameEn: 'Desolate Wind',
      nameFa: 'باد کویر و دشت',
      descEn: 'Modulated atmospheric wind over arid desert dunes',
      descFa: 'وزش باد فیلتر شده روی ریگ‌زارها و بیابان‌های خشک',
    },
    {
      id: 'Cyber Reconnaissance',
      nameEn: 'Cyber Recon',
      nameFa: 'ردیابی سایبری',
      descEn: 'Rhythmic telemetry telemetry pulse and micro-clicks',
      descFa: 'پالس‌های ریتمیک داده‌سنجی و فرکانس‌های هوشمند',
    },
  ] as const;

  // Sync engine when preset or active state changes
  useEffect(() => {
    if (config.active) {
      soundscapeEngine.start(config.preset, config.volume);
    } else {
      soundscapeEngine.stop();
    }
  }, [config.active, config.preset]);

  // Sync volume
  useEffect(() => {
    soundscapeEngine.setVolume(config.volume);
  }, [config.volume]);

  // Sync timeline intensity
  useEffect(() => {
    if (config.active) {
      soundscapeEngine.evolveWithTimeline(timelineIntensity);
    }
  }, [timelineIntensity, config.active]);

  // Real-time canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataBuffer = new Uint8Array(32);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (config.active) {
        soundscapeEngine.getVisualizerData(dataBuffer);

        const barWidth = canvas.width / dataBuffer.length;
        for (let i = 0; i < dataBuffer.length; i++) {
          const val = dataBuffer[i] / 255.0;
          const barHeight = Math.max(2, val * canvas.height * 0.9);
          const x = i * barWidth;
          const y = canvas.height - barHeight;

          // Gradient color: Cyan to Emerald
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.8)');

          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        }
      } else {
        // Idle line
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [config.active]);

  const handleToggleActive = () => {
    onChangeConfig({
      ...config,
      active: !config.active,
    });
  };

  const handleSelectPreset = (presetName: any) => {
    onChangeConfig({
      ...config,
      preset: presetName,
      active: true, // auto start when clicked
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-bold text-cyan-400">
            4
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
            <Waves className="h-4 w-4 text-cyan-400" />
            {isRtl ? 'فضاسازی صوتی و موسیقی رصدی پویا' : 'Evolving Procedural Soundscape'}
          </h3>
        </div>

        {/* Master Active Toggle & Auto-Ducking badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <ArrowDownUp className="h-3 w-3" />
            <span>{isRtl ? 'کاهش خودکار با صدای راوی (-12dB)' : 'Auto-Ducking: Active'}</span>
          </div>

          <button
            onClick={handleToggleActive}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              config.active
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {config.active ? (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                <span>{isRtl ? 'صدا روشن' : 'Soundscape ON'}</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span>{isRtl ? 'صدا خاموش' : 'Soundscape OFF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Buttons & Waveform Grid */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Presets */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p) => {
            const isSelected = config.active && config.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold text-slate-200">
                  {isRtl ? p.nameFa : p.nameEn}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {isRtl ? p.descFa : p.descEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Real-time Visualizer Canvas & Volume */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/90 p-2.5">
          <canvas
            ref={canvasRef}
            width={240}
            height={36}
            className="w-full h-9 rounded bg-slate-950"
          />

          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <span>{isRtl ? 'حجم صدا:' : 'Volume:'}</span>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={config.volume}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  volume: parseFloat(e.target.value),
                })
              }
              className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-cyan-300 w-8 text-right">
              {Math.round(config.volume * 200)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
