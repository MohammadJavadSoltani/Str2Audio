import React, { useState, useRef } from 'react';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Palette,
  Image,
  Code2,
  Maximize2,
  Tv,
} from 'lucide-react';
import { EarthReport, SupportedLanguage, HistoricalTrendPoint } from '../types';

interface VectorGraphExporterProps {
  language: SupportedLanguage;
  currentReport: EarthReport;
}

export const VectorGraphExporter: React.FC<VectorGraphExporterProps> = ({
  language,
  currentReport,
}) => {
  const isRtl = language === 'fa';
  const trends = currentReport.historicalTrends || [];

  const [metricKey, setMetricKey] = useState<'waterAreaKm2' | 'salinityGPerL' | 'ndviAnomaly'>('waterAreaKm2');
  const [theme, setTheme] = useState<'emerald' | 'infrared' | 'cyan' | 'cyber'>('cyan');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [showPoints, setShowPoints] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = aspectRatio === '16:9' ? 450 : aspectRatio === '4:3' ? 600 : 800;

  // Chart padding
  const padLeft = 80;
  const padRight = 40;
  const padTop = 60;
  const padBottom = 60;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Compute domain & range
  const years = trends.map((t) => t.year);
  const minX = Math.min(...years);
  const maxX = Math.max(...years);

  const values = trends.map((t) => (t as any)[metricKey] as number);
  const minY = Math.min(0, Math.min(...values));
  const maxY = Math.max(...values) * 1.15 || 100;

  // Scale functions
  const scaleX = (year: number) => padLeft + ((year - minX) / (maxX - minX || 1)) * plotWidth;
  const scaleY = (val: number) => padTop + plotHeight - ((val - minY) / (maxY - minY || 1)) * plotHeight;

  // Theme palettes
  const themeColors = {
    cyan: {
      line: '#06B6D4',
      gradientStart: 'rgba(6, 182, 212, 0.45)',
      gradientEnd: 'rgba(6, 182, 212, 0.0)',
      grid: 'rgba(51, 65, 85, 0.3)',
      point: '#22D3EE',
      text: '#94A3B8',
      title: '#F8FAFC',
    },
    emerald: {
      line: '#10B981',
      gradientStart: 'rgba(16, 185, 129, 0.45)',
      gradientEnd: 'rgba(16, 185, 129, 0.0)',
      grid: 'rgba(6, 78, 59, 0.4)',
      point: '#34D399',
      text: '#6EE7B7',
      title: '#F0FDF4',
    },
    infrared: {
      line: '#EF4444',
      gradientStart: 'rgba(239, 68, 68, 0.5)',
      gradientEnd: 'rgba(239, 68, 68, 0.0)',
      grid: 'rgba(127, 29, 29, 0.35)',
      point: '#F87171',
      text: '#FCA5A5',
      title: '#FEF2F2',
    },
    cyber: {
      line: '#F59E0B',
      gradientStart: 'rgba(245, 158, 11, 0.5)',
      gradientEnd: 'rgba(245, 158, 11, 0.0)',
      grid: 'rgba(120, 53, 15, 0.35)',
      point: '#FBBF24',
      text: '#FDE68A',
      title: '#FFFBEB',
    },
  }[theme];

  // Construct SVG path
  const pathData = trends.reduce((acc, point, idx) => {
    const x = scaleX(point.year);
    const y = scaleY((point as any)[metricKey] as number);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Closed area path for gradient fill
  const areaPath = pathData
    ? `${pathData} L ${scaleX(maxX)} ${scaleY(minY)} L ${scaleX(minX)} ${scaleY(minY)} Z`
    : '';

  // Metric Labels
  const metricLabel = {
    waterAreaKm2: isRtl ? 'مساحت پهنه آبی (کیلومتر مربع)' : 'Surface Water Area (km²)',
    salinityGPerL: isRtl ? 'میزان شوری آب (گرم در لیتر)' : 'Water Salinity (g/L)',
    ndviAnomaly: isRtl ? 'شاخص سلامت پوشش گیاهی (NDVI)' : 'Vegetation Index Anomaly (NDVI)',
  }[metricKey];

  // Generate clean SVG markup string for export
  const generateSvgMarkup = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" style="background-color: #06080F; font-family: 'Space Grotesk', system-ui, sans-serif;">
  <defs>
    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${themeColors.gradientStart}" />
      <stop offset="100%" stop-color="${themeColors.gradientEnd}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Grid -->
  ${showGrid ? `
  <g stroke="${themeColors.grid}" stroke-width="1" stroke-dasharray="3,3">
    ${[0, 0.25, 0.5, 0.75, 1].map((p) => {
      const y = padTop + plotHeight * p;
      return `<line x1="${padLeft}" y1="${y}" x2="${svgWidth - padRight}" y2="${y}" />`;
    }).join('\n    ')}
    ${years.map((yr) => {
      const x = scaleX(yr);
      return `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + plotHeight}" />`;
    }).join('\n    ')}
  </g>` : ''}

  <!-- Header Title & Telemetry -->
  <text x="${padLeft}" y="32" fill="${themeColors.title}" font-size="16" font-weight="bold" letter-spacing="0.5">${currentReport.title}</text>
  <text x="${padLeft}" y="48" fill="${themeColors.text}" font-size="11" font-family="monospace">WHY HERE | LOC: ${currentReport.location.name} [${currentReport.location.coordinates}]</text>
  <text x="${svgWidth - padRight}" y="32" text-anchor="end" fill="${themeColors.line}" font-size="12" font-weight="bold">${metricLabel}</text>

  <!-- Area Fill -->
  <path d="${areaPath}" fill="url(#areaGradient)" />

  <!-- Trend Curve Line -->
  <path d="${pathData}" fill="none" stroke="${themeColors.line}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />

  <!-- Data Markers -->
  ${showPoints ? `
  <g>
    ${trends.map((t) => {
      const x = scaleX(t.year);
      const y = scaleY((t as any)[metricKey] as number);
      return `<circle cx="${x}" cy="${y}" r="4.5" fill="${themeColors.point}" stroke="#06080F" stroke-width="2" />
      <text x="${x}" y="${y - 9}" fill="${themeColors.text}" font-size="10" font-family="monospace" text-anchor="middle">${(t as any)[metricKey]}</text>`;
    }).join('\n    ')}
  </g>` : ''}

  <!-- X Axis Labels -->
  <g fill="${themeColors.text}" font-size="10" font-family="monospace" text-anchor="middle">
    ${years.map((yr) => `<text x="${scaleX(yr)}" y="${svgHeight - 20}">${yr}</text>`).join('\n    ')}
  </g>

  <!-- Y Axis Labels -->
  <g fill="${themeColors.text}" font-size="10" font-family="monospace" text-anchor="end">
    ${[0, 0.5, 1].map((p) => {
      const val = Math.round(minY + (maxY - minY) * (1 - p));
      const y = padTop + plotHeight * p + 4;
      return `<text x="${padLeft - 10}" y="${y}">${val}</text>`;
    }).join('\n    ')}
  </g>
</svg>`;
  };

  // Direct SVG Download
  const handleDownloadSvg = () => {
    const markup = generateSvgMarkup();
    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WhyHere_${currentReport.id}_${metricKey}_Vector.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render to 4K Ultra-HD PNG
  const handleDownload4kPng = () => {
    setIsExportingPng(true);
    const markup = generateSvgMarkup();
    const img = new window.Image();
    const svgBlob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // 4K Ultra-HD Resolution: 3840 x 2160
      canvas.width = 3840;
      canvas.height = aspectRatio === '16:9' ? 2160 : aspectRatio === '4:3' ? 2880 : 3840;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#06080F';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `WhyHere_${currentReport.id}_${metricKey}_4K_UltraHD.png`;
        link.click();
      }
      URL.revokeObjectURL(url);
      setIsExportingPng(false);
    };
    img.src = url;
  };

  const handleCopySvgCode = () => {
    const markup = generateSvgMarkup();
    navigator.clipboard.writeText(markup);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-bold text-cyan-400">
              7
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-400" />
              {isRtl
                ? 'خروجی نمودارهای برداری با وضوح فوق‌العاده بالا (Vector SVG & 4K)'
                : 'Customized High-Resolution Vector Graph Exporter'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isRtl
              ? 'تولید فایل‌های برداری SVG بدون افت کیفیت برای ادوبی ایلاستریتور، فیگما و ویدیوهای 4K یوتیوب'
              : 'Export pristine scalable vector graphics (SVG) and 4K UHD charts for YouTube motion graphics'}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 transition shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isRtl ? 'دانلود برداری SVG' : 'Download SVG Vector'}</span>
          </button>

          <button
            onClick={handleDownload4kPng}
            disabled={isExportingPng}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 transition"
          >
            <Image className="h-3.5 w-3.5" />
            <span>{isExportingPng ? 'Rendering 4K...' : isRtl ? 'خروجی 4K PNG' : 'Export 4K UHD PNG'}</span>
          </button>

          <button
            onClick={handleCopySvgCode}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-slate-400 hover:text-white transition"
            title="Copy SVG code"
          >
            {copiedSvg ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Customizer Controls Bar */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs font-mono">
        {/* Metric Selector */}
        <div>
          <label className="text-slate-400 block mb-1">{isRtl ? 'متغیر رصدی:' : 'Metric Variable:'}</label>
          <select
            value={metricKey}
            onChange={(e) => setMetricKey(e.target.value as any)}
            className="w-full rounded bg-slate-900 border border-slate-800 p-1.5 text-cyan-300 focus:outline-none"
          >
            <option value="waterAreaKm2">Water Extent (km²)</option>
            <option value="salinityGPerL">Salinity (g/L)</option>
            <option value="ndviAnomaly">NDVI Vegetation Index</option>
          </select>
        </div>

        {/* Theme Palette */}
        <div>
          <label className="text-slate-400 block mb-1">{isRtl ? 'پالت رنگی:' : 'Color Theme:'}</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-full rounded bg-slate-900 border border-slate-800 p-1.5 text-cyan-300 focus:outline-none"
          >
            <option value="cyan">Cyber Cyan</option>
            <option value="emerald">Satellite Emerald</option>
            <option value="infrared">Thermal Infrared</option>
            <option value="cyber">Tactical Amber</option>
          </select>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="text-slate-400 block mb-1">{isRtl ? 'نسبت ابعاد:' : 'Aspect Ratio:'}</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as any)}
            className="w-full rounded bg-slate-900 border border-slate-800 p-1.5 text-cyan-300 focus:outline-none"
          >
            <option value="16:9">16:9 (YouTube 4K)</option>
            <option value="4:3">4:3 (Documentary)</option>
            <option value="1:1">1:1 (Social Feed)</option>
          </select>
        </div>

        {/* Stroke Width */}
        <div>
          <label className="text-slate-400 block mb-1">
            {isRtl ? 'ضخامت خط:' : 'Line Stroke:'} {strokeWidth}px
          </label>
          <input
            type="range"
            min="1.5"
            max="6"
            step="0.5"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded mt-2"
          />
        </div>

        {/* Toggle Points */}
        <div className="flex flex-col justify-between">
          <label className="text-slate-400">{isRtl ? 'نقاط داده:' : 'Data Points:'}</label>
          <button
            onClick={() => setShowPoints(!showPoints)}
            className={`rounded px-2 py-1 text-xs transition ${
              showPoints ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-500'
            }`}
          >
            {showPoints ? 'Visible' : 'Hidden'}
          </button>
        </div>

        {/* Toggle Grid */}
        <div className="flex flex-col justify-between">
          <label className="text-slate-400">{isRtl ? 'شبکه مختصات:' : 'Grid Lines:'}</label>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`rounded px-2 py-1 text-xs transition ${
              showGrid ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-500'
            }`}
          >
            {showGrid ? 'Visible' : 'Hidden'}
          </button>
        </div>
      </div>

      {/* SVG Live Preview Container */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-[#06080F] shadow-2xl p-2 sm:p-4">
        <div
          className="w-full flex items-center justify-center overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: generateSvgMarkup() }}
        />
      </div>
    </div>
  );
};
