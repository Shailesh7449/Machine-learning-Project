import React from 'react';
import { SkillGapItem } from '../types';
import { AlertCircle, CheckCircle2, ArrowUpRight, ShieldAlert, Sparkles } from 'lucide-react';

interface SkillGapCardProps {
  skillGapList: SkillGapItem[];
}

export const SkillGapCard: React.FC<SkillGapCardProps> = ({ skillGapList }) => {
  if (!skillGapList || skillGapList.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        No skill gap items generated. Provide a job description to perform priority skill gap analysis.
      </div>
    );
  }

  // Filter missing or partial items that need bridging
  const gaps = skillGapList.filter((item) => item.status !== 'matched');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl transition-colors duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span>Target Role Skill-Gap & Prioritized Recommendations</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prioritized by importance weight in candidate screening algorithms.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 font-medium">
          {gaps.length} Target Gaps Identified
        </span>
      </div>

      <div className="space-y-3">
        {gaps.map((item, idx) => {
          let priorityBadge = 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30';
          if (item.priority === 'Medium') {
            priorityBadge = 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
          } else if (item.priority === 'Low') {
            priorityBadge = 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
          }

          return (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.skillName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${priorityBadge}`}>
                    {item.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    Category: {item.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {item.reason}
                </p>
              </div>

              <div className="shrink-0">
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span>Bridge Gap</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
