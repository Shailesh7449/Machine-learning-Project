import React from 'react';
import { QualityAudit } from '../types';
import {
  Sparkles,
  BookOpen,
  Zap,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  FileText,
  BarChart2,
  Layers
} from 'lucide-react';

interface QualityAuditViewProps {
  qualityAudit: QualityAudit;
}

export const QualityAuditView: React.FC<QualityAuditViewProps> = ({ qualityAudit }) => {
  const { readability, metrics, actionVerbs, stuffing, formattingFlags, sectionAnalysis } = qualityAudit;

  return (
    <div className="space-y-6">
      {/* Metrics & Readability Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Readability */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Readability Index</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
              {readability.readingEase} / 100
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {readability.interpretation}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Flesch-Kincaid Grade Level: <span className="text-slate-800 dark:text-slate-300 font-mono font-medium">{readability.gradeLevel}</span> (Approx. {readability.avgSentenceLength} words per sentence).
          </p>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Word Count: <strong className="text-slate-800 dark:text-slate-200 font-mono">{readability.wordCount}</strong></span>
            <span>Est. Pages: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formattingFlags.pageCountEstimate}</strong></span>
          </div>
        </div>

        {/* Quantifiable Metrics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4" />
              <span>Quantifiable Metrics</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
              {metrics.count} Detected
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {metrics.densityPercentage}% Metric Density in Bullets
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {metrics.count >= 3
              ? 'Great utilization of percentages, monetary values, and speedup multipliers.'
              : 'Add more quantifiable numbers (e.g. reduced load times by 30%, served 50k users).'}
          </p>

          {metrics.examples.length > 0 && (
            <div className="mt-3 p-2 rounded bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-600 dark:text-slate-400 font-mono truncate border border-slate-200 dark:border-slate-800">
              Sample: {metrics.examples[0]}
            </div>
          )}
        </div>

        {/* Action Verbs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Action Verbs</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
              {actionVerbs.count} Unique
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Variety Score: {actionVerbs.varietyScore}%
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {actionVerbs.detectedVerbs.slice(0, 6).map((verb) => (
              <span key={verb} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-mono">
                {verb}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formatting & Parsing Safeguard Warning */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors duration-200">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>ATS Document Parsing Safeguards</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-300">Tabular Formats / Tables</span>
              {formattingFlags.hasTabularFormatting ? (
                <span className="text-amber-700 dark:text-amber-400 text-[10px] font-bold">Detected Warning</span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">Clean</span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              {formattingFlags.hasTabularFormatting
                ? 'Multiple tabs or table cells can cause horizontal text collision in legacy ATS.'
                : 'Free of complex table grids.'}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-300">Column Layout</span>
              {formattingFlags.hasPossibleTwoColumns ? (
                <span className="text-amber-700 dark:text-amber-400 text-[10px] font-bold">Possible 2-Column</span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">Single Column Flow</span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              {formattingFlags.hasPossibleTwoColumns
                ? 'Multi-column layouts risk out-of-order sentence parsing.'
                : 'Single column sequential reading order.'}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-300">Special Icon Glyphs</span>
              {formattingFlags.hasExcessiveSpecialChars ? (
                <span className="text-amber-700 dark:text-amber-400 text-[10px] font-bold">High Density</span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">Standard Bullets</span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              {formattingFlags.hasExcessiveSpecialChars
                ? 'Heavy special symbols may render as question marks in text extraction.'
                : 'Safe ASCII-compatible bullet points.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section-by-Section Health Audit */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors duration-200">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Section-by-Section Health Audit</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(sectionAnalysis).map(([secKey, sec]) => (
            <div key={secKey} className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize text-sm">{secKey}</span>
                <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
                  {sec.score}/100
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">{sec.status}</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pt-1">
                {sec.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
