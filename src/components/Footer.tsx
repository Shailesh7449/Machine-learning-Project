import React from 'react';
import { ShieldCheck, Lock, BookOpen, Database, Sparkles, Terminal } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Purpose */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-900 dark:text-white">ResumeAI</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Academic ML/NLP
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
            An open academic NLP system implementing tokenization, TF-IDF vectorization, semantic Cosine matching, canonical skill normalization, and deterministic ATS scoring.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Free Open ATS Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Lock className="w-4 h-4" />
              <span>In-Memory Privacy Safe</span>
            </div>
          </div>
        </div>

        {/* Academic Modules */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
            Academic Modules
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onSelectTab('methodology')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>NLP Methodology Pipeline</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('benchmarks')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                <span>Model Evaluation Suite</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('methodology')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>ESCO / O*NET Skill Ontology</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Transparency Notice */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
            Scoring Transparency
          </h4>
          <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <p>
              <strong>Estimated Score:</strong> ResumeAI derives an estimated ATS compatibility metric based on measurable components (Structure, Keywords, Skills, Readability). Real corporate systems vary by organization.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 gap-4">
        <p>© 2026 ResumeAI Project. Open academic ML research architecture.</p>
        <p>Built for Machine Learning & Natural Language Processing Evaluation.</p>
      </div>
    </footer>
  );
};
