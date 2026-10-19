import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Eye,
  Layers,
  Award,
  Sparkles,
  FileCheck,
  RotateCcw,
  ShieldCheck,
  Split,
} from 'lucide-react';
import { AnalysisResponse, ParsedSections } from '../types';
import { exportCleanResumePdf } from '../services/resumeDocExport';
import { exportAnalysisPdf } from '../services/pdfExport';

interface ResumePreviewExportProps {
  analysis: AnalysisResponse;
  onNavigateToEditor: () => void;
}

export function ResumePreviewExport({
  analysis,
  onNavigateToEditor,
}: ResumePreviewExportProps) {
  const [template, setTemplate] = useState<'ats_classic' | 'modern'>('ats_classic');
  const [viewVersion, setViewVersion] = useState<'edited' | 'original'>('edited');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const parsed = analysis.parsedSections;
  const candidateName = parsed.personal.name !== 'Not detected' ? parsed.personal.name : 'Candidate';

  const handleDownloadResume = () => {
    setIsExporting(true);
    const success = exportCleanResumePdf(parsed, candidateName, template);
    setIsExporting(false);
    if (success) {
      setExportNotice('Resume PDF generated and downloaded successfully!');
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      setExportNotice('Failed to generate PDF. Please ensure all section fields have valid text.');
    }
  };

  const handleDownloadReport = () => {
    exportAnalysisPdf(analysis, candidateName);
    setExportNotice('Comprehensive ATS Audit Report PDF downloaded!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Control bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Resume Document Preview & PDF Export</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Preview your resume reflecting all verified edits and download an ATS-compliant PDF ready for employer submission.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNavigateToEditor}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Edit Sections</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export ATS Audit Report</span>
          </button>

          <button
            disabled={isExporting}
            onClick={handleDownloadResume}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Formatted Resume (PDF)</span>
          </button>
        </div>
      </div>

      {/* Format & View Options */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Template Style:</span>
          <button
            onClick={() => setTemplate('ats_classic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              template === 'ats_classic'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            ATS Classic (Recommended)
          </button>
          <button
            onClick={() => setTemplate('modern')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              template === 'modern'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            Modern Executive
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewVersion('edited')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewVersion === 'edited'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Latest Edited Version
          </button>
          <button
            onClick={() => setViewVersion('original')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewVersion === 'original'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Original Extracted
          </button>
        </div>
      </div>

      {/* Sheet Simulation Preview (8.5x11 aspect ratio preview) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl border border-slate-300 p-8 sm:p-12 font-sans space-y-6 min-h-[900px]">
        {/* Candidate Header */}
        <div className="text-center space-y-1.5 pb-4 border-b border-slate-200">
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${template === 'modern' ? 'text-indigo-900' : 'text-slate-950'}`}>
            {candidateName}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600">
            {parsed.personal.email !== 'Not detected' && <span>{parsed.personal.email}</span>}
            {parsed.personal.phone !== 'Not detected' && <span>• {parsed.personal.phone}</span>}
            {parsed.personal.location !== 'Not detected' && <span>• {parsed.personal.location}</span>}
            {parsed.personal.linkedin !== 'Not detected' && <span>• {parsed.personal.linkedin}</span>}
            {parsed.personal.github !== 'Not detected' && <span>• {parsed.personal.github}</span>}
            {parsed.personal.portfolio !== 'Not detected' && <span>• {parsed.personal.portfolio}</span>}
          </div>
        </div>

        {/* Dynamic Sections from Workspace */}
        {viewVersion === 'edited' ? (
          (parsed.sectionsList || [])
            .filter(sec => sec.key !== 'contact_info' && sec.currentText.trim().length > 0)
            .map(sec => (
              <div key={sec.id} className="space-y-2">
                <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 border-b ${
                  template === 'modern'
                    ? 'text-indigo-800 border-indigo-200'
                    : 'text-slate-900 border-slate-300'
                }`}>
                  {sec.title}
                </h2>
                <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {sec.currentText}
                </div>
              </div>
            ))
        ) : (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Original Extracted Document Text:
            </span>
            <div className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {parsed.rawText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
