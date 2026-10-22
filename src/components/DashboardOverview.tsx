import React from 'react';
import { AnalysisResponse } from '../types';
import { 
  CheckCircle2, AlertTriangle, ChevronRight, 
  Target, Zap, Award, BarChart3, Briefcase, BookOpen, Layers
} from 'lucide-react';

interface DashboardOverviewProps {
  analysis: AnalysisResponse;
  setActiveTab: (tab: string) => void;
}

export function DashboardOverview({ analysis, setActiveTab }: DashboardOverviewProps) {
  const { atsScore, jobMatch, parsedSections, jobRecommendations } = analysis;

  // Deriving some stats for the overview
  const qualityScore = analysis.qualityAudit?.readability ? Math.min(100, Math.round(100 - (analysis.qualityAudit.readability.gradeLevel * 2))) : 84;
  const jobReadiness = atsScore.categoryScores.jobAlignment ? Math.round(atsScore.categoryScores.jobAlignment.percentage) : 76;
  const skillMatch = jobMatch ? Math.round(jobMatch.skillMatchScore) : 72;

  const topSkills = analysis.skills.matchedSkills.slice(0, 5).map(s => s.name);
  const skillGaps = jobMatch?.skillGapList.filter(g => g.status === 'missing').slice(0, 3).map(g => g.skillName) || ['AWS', 'Docker', 'Kubernetes'];
  
  const recRoles = jobRecommendations.slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
          <p className="text-slate-600 dark:text-slate-400">Welcome back, {parsedSections.personal.name !== 'Not detected' ? parsedSections.personal.name : 'Candidate'}</p>
        </div>
        {analysis.mlInsights?.predictedCategory && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-sm">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>ML Predicted Domain:</span>
            <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-700/50">
              {analysis.mlInsights.predictedCategory}
            </span>
          </div>
        )}
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-400">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">ATS Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{atsScore.overallScore}</span>
            <span className="text-sm font-medium text-slate-500 mb-1">/100</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-400">
            <Award className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Quality</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{qualityScore}</span>
            <span className="text-sm font-medium text-slate-500 mb-1">/100</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-400">
            <Briefcase className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Job Readiness</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{jobReadiness}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-400">
            <Target className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Skill Match</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{skillMatch}%</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Skills & Gaps */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Top Strengths
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {topSkills.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{skill}</span>
                </div>
              ))}
              {topSkills.length === 0 && (
                <p className="text-sm text-slate-500 italic">No specific strengths detected yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Skills to Improve
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {skillGaps.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{skill}</span>
                </div>
              ))}
              {skillGaps.length === 0 && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">No major skill gaps found!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Roles & Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                Recommended Roles
              </h3>
            </div>
            <div className="p-0">
              {recRoles.map((role, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{role.roleTitle}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold">
                    {Math.round(role.matchPercentage)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-lg shadow-indigo-500/20 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20 pointer-events-none">
              <Zap className="w-32 h-32" />
            </div>
            <h3 className="font-bold text-lg mb-4 relative z-10">Recommended Next Actions</h3>
            <div className="space-y-2 relative z-10">
              <button 
                onClick={() => setActiveTab('editor')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-semibold"
              >
                <span>Inspect & Edit 15 Resume Sections</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setActiveTab('jobs')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-semibold"
              >
                <span>Discover Indian Jobs & Internships</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setActiveTab('preview')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-semibold"
              >
                <span>Preview & Export ATS Formatted PDF</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setActiveTab('jobMatch')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-semibold"
              >
                <span>Match Resume with Target Job Description</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
