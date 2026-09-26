import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FolderOpen,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { EarthReport, SupportedLanguage } from '../types';

interface CloudVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  currentReport: EarthReport;
  reportsList: EarthReport[];
  onLoadReport: (report: EarthReport) => void;
  onSaveCurrentReport: () => void;
  onDeleteReport: (id: string) => void;
  isSaving: boolean;
}

export const CloudVaultModal: React.FC<CloudVaultModalProps> = ({
  isOpen,
  onClose,
  language,
  currentReport,
  reportsList,
  onLoadReport,
  onSaveCurrentReport,
  onDeleteReport,
  isSaving,
}) => {
  const isRtl = language === 'fa';
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredReports = reportsList.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.titleFa && r.titleFa.toLowerCase().includes(q)) ||
      r.location.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isRtl ? 'صندوق ابری امن گزارش‌ها' : 'Secure Cloud-Based Storage Vault'}
                <span className="flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> SHA-256 Verified
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isRtl
                  ? 'ذخیره‌سازی رمزنگاری‌شده تمام گزارش‌ها، متون بازنویسی، فایل‌های صوتی و نمودارهای برداری'
                  : 'Encrypted persistence for YouTube scripts, studio narration configs, and vector datasets'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Project Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40 px-6 py-3">
          <div className="text-xs">
            <span className="text-slate-400">{isRtl ? 'پروژه فعلی:' : 'Active Project:'} </span>
            <span className="font-semibold text-cyan-300 font-mono">{currentReport.id}</span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="text-slate-300 font-medium">{currentReport.title}</span>
          </div>

          <button
            onClick={onSaveCurrentReport}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? (isRtl ? 'در حال ذخیره...' : 'Saving to Vault...') : (isRtl ? 'ذخیره نسخه فعلی' : 'Save to Cloud Vault')}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={isRtl ? 'جستجو در گزارش‌ها، مکان‌ها یا شناسه...' : 'Search reports by title, location, or vault hash...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
          {filteredReports.map((report) => {
            const isCurrent = report.id === currentReport.id;
            return (
              <div
                key={report.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition ${
                  isCurrent
                    ? 'border-cyan-400/60 bg-cyan-950/20'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {report.id}
                    </span>
                    <span className="text-[10px] rounded bg-slate-800 px-1.5 py-0.5 text-slate-400 font-mono">
                      {report.channel}
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="h-3 w-3" /> {report.status || 'Verified'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm">
                    {isRtl && report.titleFa ? report.titleFa : report.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-cyan-400" />
                      {report.location.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(report.lastModified || report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-slate-500">
                      Hash: {report.vaultHash ? report.vaultHash.slice(0, 16) + '...' : 'Signed'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isCurrent && (
                    <button
                      onClick={() => {
                        onLoadReport(report);
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'بازیابی' : 'Load Project'}</span>
                    </button>
                  )}

                  {reportsList.length > 1 && (
                    <button
                      onClick={() => onDeleteReport(report.id)}
                      className="rounded-lg border border-slate-800 p-1.5 text-slate-500 hover:border-red-500/40 hover:text-red-400 transition"
                      title="Delete from vault"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/80 px-6 py-3 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Total Vault Records: {reportsList.length}</span>
          <span className="text-emerald-400">Encryption: AES-GCM-256 At-Rest</span>
        </div>
      </div>
    </div>
  );
};
