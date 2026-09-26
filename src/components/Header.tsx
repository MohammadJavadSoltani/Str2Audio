import React from 'react';
import {
  Satellite,
  Globe2,
  Volume2,
  VolumeX,
  ShieldCheck,
  Download,
  FolderOpen,
  Sparkles,
  Radio,
  Tv,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { soundscapeEngine } from '../services/soundscape';

interface HeaderProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  reportTitle: string;
  vaultHash: string;
  onOpenVault: () => void;
  onOpenExport: () => void;
  soundscapeActive: boolean;
  onToggleSoundscape: () => void;
  soundscapeVolume: number;
  onSoundscapeVolumeChange: (vol: number) => void;
  isSaving: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  reportTitle,
  vaultHash,
  onOpenVault,
  onOpenExport,
  soundscapeActive,
  onToggleSoundscape,
  soundscapeVolume,
  onSoundscapeVolumeChange,
  isSaving,
}) => {
  const isRtl = language === 'fa';

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Channel Info */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Satellite className="h-5 w-5 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-white">
                WHY HERE
              </span>
              <span className="flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                <Tv className="h-3 w-3" /> YouTube Studio
              </span>
              <span className="hidden rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono uppercase text-cyan-300 sm:inline-block">
                Earth Observation
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 md:block">
              {isRtl
                ? 'استودیوی تولید محتوای مستند ماهواره‌ای و رصدی زمین'
                : 'Satellite & Geospatial Investigative Content Engine'}
            </p>
          </div>
        </div>

        {/* Center / Vault Status Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400">
            {isRtl ? 'صندوق ابری امن:' : 'Cloud Vault:'}
          </span>
          <span className="font-mono text-cyan-400 text-[11px]">
            {vaultHash ? vaultHash.slice(0, 16) + '...' : 'Verified SHA-256'}
          </span>
          {isSaving && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Soundscape Quick Toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 px-2 py-1">
            <button
              onClick={onToggleSoundscape}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition ${
                soundscapeActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isRtl ? 'موسیقی فضایی پس‌زمینه' : 'Ambient Earth Soundscape'}
            >
              {soundscapeActive ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                  <span className="hidden sm:inline font-mono text-[11px]">
                    {isRtl ? 'صداگذاری زنده' : 'Soundscape'}
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline font-mono text-[11px]">
                    {isRtl ? 'صدا خاموش' : 'Muted'}
                  </span>
                </>
              )}
            </button>
            {soundscapeActive && (
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={soundscapeVolume}
                onChange={(e) => onSoundscapeVolumeChange(parseFloat(e.target.value))}
                className="hidden sm:block ml-2 w-16 accent-cyan-400 cursor-pointer h-1 bg-slate-700 rounded"
                title="Soundscape Volume"
              />
            )}
          </div>

          {/* Cloud Vault Modal Trigger */}
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition"
          >
            <FolderOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">
              {isRtl ? 'صندوق پروژه‌ها' : 'Vault'}
            </span>
          </button>

          {/* Full Export Trigger */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/50 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 transition shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isRtl ? 'خروجی گزارش' : 'Export Dossier'}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`rounded px-2 py-1 text-xs font-semibold transition ${
                language === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('fa')}
              className={`rounded px-2 py-1 text-xs font-semibold font-persian transition ${
                language === 'fa'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فارسی
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
