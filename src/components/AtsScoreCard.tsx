import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Download,
  Info,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { AtsScoreResult, AnalysisResponse } from '../types';
import { exportAnalysisPdf } from '../services/pdfExport';

interface AtsScoreCardProps {
  atsScore: AtsScoreResult;
  fullAnalysis: AnalysisResponse;
}

export const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ atsScore, fullAnalysis }) => {
  const score = atsScore.overallScore;

  // Rating descriptor
  let scoreColor = 'from-emerald-500 to-teal-500';
  let badgeColor = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  let assessmentText = 'High ATS Compatibility';
  let verdictDescription = 'Your resume possesses strong structural clarity, measurable accomplishments, and technical keyword density.';

  if (score < 60) {
    scoreColor = 'from-red-500 to-amber-500';
    badgeColor = 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30';
    assessmentText = 'Requires ATS Optimization';
    verdictDescription = 'Key structural sections, quantifiable metrics, or essential skills require immediate attention.';
  } else if (score < 75) {
    scoreColor = 'from-amber-500 to-yellow-500';
    badgeColor = 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
    assessmentText = 'Moderate ATS Alignment';
    verdictDescription = 'Solid foundation, but expanding metrics, action verbs, and skill catalog will boost recruiter screening callbacks.';
  }

  const handleDownloadReport = () => {
    const candidateName = fullAnalysis.parsedSections.personal.name !== 'Not detected'
      ? fullAnalysis.parsedSections.personal.name
      : 'Candidate';
    exportAnalysisPdf(fullAnalysis, candidateName);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
      {/* Top Banner */}
      <div className="bg-slate-50 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Score Circular / Big Display */}
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
              <div className="text-center">
                <span className={`text-4xl font-extrabold bg-gradient-to-tr ${scoreColor} bg-clip-text text-transparent tracking-tight font-mono`}>
                  {score}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badgeColor}`}>
                  {assessmentText}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-medium">
                  100% Free Engine
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                ResumeAI ATS Compatibility Score
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                {verdictDescription}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadReport}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* Academic Transparency Note */}
        <div className="mt-5 p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <p>
            <strong>Scoring Transparency:</strong> This estimated score is calculated strictly from measurable criteria: Document Structure (15), Keyword Optimization (20), Skills Breadth (20), Experience Depth (15), Quantifiable Achievements (10), Formatting & Readability (10), Contact Info (5), and Job Alignment (5). No LLM hallucinations are used for numerical scores.
          </p>
        </div>
      </div>

      {/* Strengths & Actionable Recommendations */}
      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Detected Resume Strengths</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            {atsScore.strengths.length > 0 ? (
              atsScore.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400">No major standout strengths detected.</li>
            )}
          </ul>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4" />
            <span>High-Priority Recommendations</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            {atsScore.recommendations.length > 0 ? (
              atsScore.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 dark:text-slate-400">All key structural and keyword recommendations are satisfied!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
