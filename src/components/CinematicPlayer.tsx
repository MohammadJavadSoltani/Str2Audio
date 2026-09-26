import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Crosshair,
  Satellite,
  Compass,
  Radio,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { EarthReport, SupportedLanguage, StoryboardFrame } from '../types';
import { audioStudio, StudioPlaybackState } from '../services/audioStudio';

interface CinematicPlayerProps {
  language: SupportedLanguage;
  currentReport: EarthReport;
  activeYear?: number;
}

export const CinematicPlayer: React.FC<CinematicPlayerProps> = ({
  language,
  currentReport,
  activeYear = 2026,
}) => {
  const isRtl = language === 'fa';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  const [activeLayer, setActiveLayer] = useState<'multispectral' | 'infrared' | 'radar' | 'contour'>('infrared');
  const [playbackState, setPlaybackState] = useState<StudioPlaybackState>(audioStudio.getState());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHud, setShowHud] = useState<boolean>(true);

  // Subscribe to narration playback
  useEffect(() => {
    const unsub = audioStudio.subscribe((s) => {
      setPlaybackState(s);
    });
    return unsub;
  }, []);

  // Determine current storyboard frame based on playback progress
  const duration = playbackState.duration || currentReport.targetDurationSec || 90;
  const progressRatio = Math.min(1, playbackState.currentTime / duration);
  const frames = currentReport.storyboardFrames || [];
  const currentFrameIndex = Math.min(
    frames.length - 1,
    Math.floor(progressRatio * (frames.length || 1))
  );
  const currentFrame: StoryboardFrame | undefined = frames[currentFrameIndex];

  // Canvas visual rendering for satellite/earth observation data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanY = 0;
    let radarAngle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Deep space / terrestrial base
      ctx.fillStyle = '#06080F';
      ctx.fillRect(0, 0, w, h);

      // Draw stylized geographic body (Lake / Desert Eye / Strait)
      const cx = w * 0.5;
      const cy = h * 0.52;

      // Color scheme based on active layer
      let waterColor = 'rgba(6, 182, 212, 0.7)';
      let terrainColor = 'rgba(30, 41, 59, 0.9)';
      let anomalyColor = 'rgba(239, 68, 68, 0.85)'; // Crimson Dunaliella algae or thermal anomaly

      if (activeLayer === 'infrared') {
        waterColor = 'rgba(220, 38, 38, 0.75)'; // High saline crimson
        terrainColor = 'rgba(15, 23, 42, 0.95)';
        anomalyColor = 'rgba(245, 158, 11, 0.9)';
      } else if (activeLayer === 'radar') {
        waterColor = 'rgba(16, 185, 129, 0.7)';
        terrainColor = 'rgba(6, 78, 59, 0.8)';
        anomalyColor = 'rgba(52, 211, 153, 0.95)';
      } else if (activeLayer === 'contour') {
        waterColor = 'rgba(59, 130, 246, 0.6)';
        terrainColor = 'rgba(17, 24, 39, 0.95)';
      }

      // Draw topographic terrain rings
      for (let r = 260; r > 40; r -= 30) {
        ctx.strokeStyle = activeLayer === 'contour' ? 'rgba(6, 182, 212, 0.35)' : 'rgba(51, 65, 85, 0.25)';
        ctx.lineWidth = activeLayer === 'contour' ? 1.5 : 1;
        ctx.beginPath();
        // Morph contour with subtle sinusoidal distortion
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const noise = Math.sin(a * 4 + r * 0.1) * 12 + Math.cos(a * 2) * 8;
          const px = cx + (r + noise) * Math.cos(a) * 1.3;
          const py = cy + (r + noise) * Math.sin(a) * 0.85;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Central Water / Geological Anomaly Body (scaled by active historical year if available)
      const yearScale = activeYear ? Math.max(0.2, (activeYear - 1984) / 42) : 0.8;
      const desiccationFactor = 1 - (activeYear ? (activeYear - 1984) / 50 * 0.65 : 0.4);

      ctx.save();
      ctx.beginPath();
      const bodyRadiusX = 140 * desiccationFactor;
      const bodyRadiusY = 85 * desiccationFactor;
      ctx.ellipse(cx, cy, bodyRadiusX, bodyRadiusY, -0.2, 0, Math.PI * 2);

      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, bodyRadiusX);
      grad.addColorStop(0, anomalyColor);
      grad.addColorStop(0.6, waterColor);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.2)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = activeLayer === 'radar' ? '#34D399' : '#06B6D4';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Salt crust / shoreline recession rings
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, bodyRadiusX + i * 22, bodyRadiusY + i * 15, -0.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Satellite Radar Sweep Beam
      if (activeLayer === 'radar' || showHud) {
        radarAngle += 0.025;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(radarAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 280, 0, 0.4);
        ctx.closePath();
        const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 280);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
        sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = sweepGrad;
        ctx.fill();
        ctx.restore();
      }

      // Multispectral Scanning Line
      scanY = (scanY + 1.2) % h;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      // Scanline grid
      ctx.fillStyle = 'rgba(6, 182, 212, 0.02)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }

      // Telemetry Crosshair at center
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 1;
      const crossSize = 14;
      ctx.beginPath();
      ctx.moveTo(cx - crossSize, cy);
      ctx.lineTo(cx + crossSize, cy);
      ctx.moveTo(cx, cy - crossSize);
      ctx.lineTo(cx, cy + crossSize);
      ctx.stroke();

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeLayer, activeYear, showHud]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top HUD Telemetry Banner */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between border-b border-cyan-500/20 bg-slate-950/85 px-4 py-2.5 backdrop-blur-md text-[11px] font-mono text-cyan-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-white tracking-wider">
            <Satellite className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            LANDSAT-9 / SENTINEL-2 SAR HUD
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300">
            LOC: {currentReport.location.name}
          </span>
          <span className="hidden md:inline text-emerald-400">
            [{currentReport.location.coordinates}]
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900/90 p-0.5 text-[10px]">
          <button
            onClick={() => setActiveLayer('infrared')}
            className={`rounded px-2 py-0.5 transition ${
              activeLayer === 'infrared'
                ? 'bg-red-500/30 text-red-300 font-bold border border-red-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Infrared NDVI
          </button>
          <button
            onClick={() => setActiveLayer('radar')}
            className={`rounded px-2 py-0.5 transition ${
              activeLayer === 'radar'
                ? 'bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SAR Radar
          </button>
          <button
            onClick={() => setActiveLayer('contour')}
            className={`rounded px-2 py-0.5 transition ${
              activeLayer === 'contour'
                ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Topographic
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHud(!showHud)}
            className="text-slate-400 hover:text-cyan-300"
            title="Toggle Telemetry HUD"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-slate-400 hover:text-cyan-300"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div className="relative aspect-video w-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="h-full w-full object-cover"
        />

        {/* HUD Coordinate Overlays */}
        {showHud && (
          <>
            {/* Top Left Compass & Altitude */}
            <div className="absolute top-12 left-4 z-10 font-mono text-[10px] text-cyan-400/80 space-y-1 pointer-events-none drop-shadow">
              <div className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-cyan-300" />
                <span>ORBIT: AZ 142.6° | ELEV: 64.2°</span>
              </div>
              <div>ALT: 705 KM LEO | SENSOR: OLI-2 / TIRS-2</div>
              <div>SPECTRAL BAND: SWIR-2 / NIR RATIO</div>
              <div className="text-emerald-400">STATUS: RECONNAISSANCE ACTIVE</div>
            </div>

            {/* Top Right Storyboard Cut Callout */}
            {currentFrame && (
              <div className="absolute top-12 right-4 z-10 max-w-xs font-mono text-[11px] bg-slate-950/80 border border-cyan-500/30 p-2.5 rounded-lg backdrop-blur-md text-right pointer-events-none shadow-lg">
                <div className="text-[10px] text-cyan-400 uppercase tracking-wider mb-0.5">
                  SCENE: {currentFrame.timecode} | {currentFrame.type}
                </div>
                <div className="font-bold text-white text-xs">{currentFrame.title}</div>
                <div className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                  {currentFrame.prompt}
                </div>
              </div>
            )}

            {/* Bottom Left Anomaly Telemetry */}
            <div className="absolute bottom-16 left-4 z-10 font-mono text-[10px] text-slate-400 pointer-events-none bg-slate-950/60 p-2 rounded border border-slate-800/80">
              <div className="text-cyan-300 font-bold">TEMPORAL OBSERVATION: {activeYear}</div>
              <div>WATER EXTENT: -78.4% vs BASELINE</div>
              <div>SURFACE SALINITY: SATURATED</div>
            </div>
          </>
        )}

        {/* Synchronized Teleprompter & Subtitle Bar */}
        <div className="absolute bottom-3 inset-x-4 z-20 flex flex-col items-center">
          <div className="w-full max-w-2xl rounded-xl border border-cyan-500/30 bg-slate-950/90 px-4 py-2.5 shadow-2xl backdrop-blur-md">
            {/* Bilingual Subtitle line */}
            <div className="flex flex-col gap-1 text-center">
              <p className="text-xs sm:text-sm font-semibold text-cyan-200 font-['Plus_Jakarta_Sans'] leading-relaxed drop-shadow">
                {currentReport.paraphrasedScriptEn.slice(0, 140)}...
              </p>
              <p
                dir="rtl"
                className="text-xs sm:text-sm text-slate-300 font-persian leading-relaxed"
              >
                {currentReport.paraphrasedScriptFa.slice(0, 130)}...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Playback HUD Bar */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/95 px-4 py-3 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => audioStudio.togglePlay()}
            disabled={!currentReport.voiceConfig?.audioUrl}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition"
          >
            {playbackState.isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => audioStudio.seek(0)}
            disabled={!currentReport.voiceConfig?.audioUrl}
            className="rounded p-1.5 text-slate-400 hover:text-white disabled:opacity-40"
            title="Restart"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <span className="text-cyan-400">
            {Math.floor(playbackState.currentTime)}s / {Math.floor(duration)}s
          </span>
        </div>

        {/* Video Scrubber */}
        <input
          type="range"
          min="0"
          max={duration}
          value={playbackState.currentTime}
          onChange={(e) => audioStudio.seek(parseFloat(e.target.value))}
          disabled={!currentReport.voiceConfig?.audioUrl}
          className="flex-1 mx-4 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
        />

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <Radio className="h-3 w-3 animate-pulse" />
            24kHz Master
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300">{currentReport.voiceConfig?.voiceName || 'Fenrir'}</span>
        </div>
      </div>
    </div>
  );
};
