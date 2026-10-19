import React from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  FileCheck2,
  Briefcase
} from 'lucide-react';
import { JobMatchResult } from '../types';

interface JobMatchCardProps {
  jobMatch: JobMatchResult | null;
  onOpenJdInput: () => void;
}

export const JobMatchCard: React.FC<JobMatchCardProps> = ({ jobMatch, onOpenJdInput }) => {
  if (!jobMatch) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xl transition-colors duration-200">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Target className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Mode 2: Job Description Matching Inactive
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
          Provide a target job description (e.g. from LinkedIn, Indeed, or company careers page) to unlock multi-dimensional matching, semantic TF-IDF cosine alignment, and skill gap priorities.
        </p>
        <button
          onClick={onOpenJdInput}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
        >
          Match Against a Job Description
        </button>
      </div>
    );
  }

  const matchPercent = jobMatch.overallMatchScore;
  let matchBadgeColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30';
  if (matchPercent < 60) matchBadgeColor = 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30';
  else if (matchPercent < 75) matchBadgeColor = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-6 p-6 sm:p-8 transition-colors duration-200">
      {/* Header Match Hero */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-medium">
              Target Role Analysis
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${matchBadgeColor}`}>
              {matchPercent}% Compatibility
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {jobMatch.detectedJobRole}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {jobMatch.experienceRequirementSummary} • {jobMatch.educationRequirementSummary}
          </p>
        </div>

        {/* Multi-Dimensional Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Skills Match</span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{jobMatch.skillMatchScore}%</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Semantic Cosine</span>
            <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">{jobMatch.semanticSimilarityScore}%</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Keywords</span>
            <span className="text-base font-bold font-mono text-sky-600 dark:text-sky-400">{jobMatch.keywordMatchScore}%</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Experience</span>
            <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">{jobMatch.experienceMatchScore}%</span>
          </div>
        </div>
      </div>

      {/* Skills Tri-Grouping: Matching, Partial, Missing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Matching Skills */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matching Skills</span>
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
              {jobMatch.matchingSkills.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {jobMatch.matchingSkills.length > 0 ? (
              jobMatch.matchingSkills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-medium">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">None detected.</p>
            )}
          </div>
        </div>

        {/* Partially Matching */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Partially Matching</span>
            </h4>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded">
              {jobMatch.partialSkills.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {jobMatch.partialSkills.length > 0 ? (
              jobMatch.partialSkills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-medium">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No adjacent/partial skill overlaps.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-red-200 dark:border-red-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>Missing Required Skills</span>
            </h4>
            <span className="text-xs font-mono font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-2 py-0.5 rounded">
              {jobMatch.missingSkills.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {jobMatch.missingSkills.length > 0 ? (
              jobMatch.missingSkills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 font-medium">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">All required skills detected in resume!</p>
            )}
          </div>
        </div>
      </div>

      {/* Keywords Breakdown */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-300 mb-2 flex items-center gap-2">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Top Job Description Keyword Alignment (TF-IDF Vector Space)</span>
        </h4>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {jobMatch.keywordBreakdown.matchedKeywords.map((kw) => (
            <span key={kw} className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono shadow-sm">
              ✓ {kw}
            </span>
          ))}
          {jobMatch.keywordBreakdown.missingKeywords.map((kw) => (
            <span key={kw} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-mono">
              ✗ {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
