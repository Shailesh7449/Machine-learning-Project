import React, { useState, useEffect } from 'react';
import {
  FileText,
  Target,
  Award,
  Sparkles,
  BookOpen,
  BarChart3,
  Layers,
  CheckCircle2,
  TrendingUp,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  Briefcase,
  Construction,
  Edit3,
  FileCheck
} from 'lucide-react';

import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FileUpload } from './components/FileUpload';
import { AtsScoreCard } from './components/AtsScoreCard';
import { ScoreBreakdown } from './components/ScoreBreakdown';
import { ExtractedInfoView } from './components/ExtractedInfoView';
import { JobMatchCard } from './components/JobMatchCard';
import { SkillGapCard } from './components/SkillGapCard';
import { QualityAuditView } from './components/QualityAuditView';
import { MethodologyPage } from './pages/MethodologyPage';
import { SectionEditorWorkspace } from './components/SectionEditorWorkspace';
import { JobsAndInternshipsView } from './components/JobsAndInternshipsView';
import { ResumePreviewExport } from './components/ResumePreviewExport';

import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';

import { fetchSamples, analyzeResume } from './services/api';
import { exportAnalysisPdf } from './services/pdfExport';
import { AnalysisResponse, SampleItem } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [targetJobText, setTargetJobText] = useState<string>('');
  const [samples, setSamples] = useState<{ resumes: SampleItem[]; jobs: SampleItem[] }>({
    resumes: [],
    jobs: [],
  });

  useEffect(() => {
    fetchSamples()
      .then((data) => setSamples(data))
      .catch((err) => console.warn('Failed to load sample data:', err));
  }, []);

  const handleAnalysisComplete = (result: AnalysisResponse) => {
    setAnalysisResult(result);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecalculate = async () => {
    if (!analysisResult) return;
    try {
      const recalculated = await analyzeResume(
        analysisResult.parsedSections.rawText,
        targetJobText || undefined
      );

      // Merge while retaining user-edited section current texts
      const mergedSectionsList = (analysisResult.parsedSections.sectionsList || []).map(item => {
        const fresh = recalculated.parsedSections.sectionsList?.find(s => s.id === item.id);
        return fresh
          ? { ...fresh, currentText: item.currentText, isReviewed: item.isReviewed }
          : item;
      });

      setAnalysisResult({
        ...recalculated,
        parsedSections: {
          ...recalculated.parsedSections,
          sectionsList: mergedSectionsList,
        },
      });
    } catch (err) {
      console.warn('Recalculation error:', err);
    }
  };

  const handleSelectJobForMatch = async (jobText: string, jobTitle: string) => {
    setTargetJobText(jobText);

    if (!analysisResult) {
      setActiveTab('dashboard');
      alert(`Job selected: "${jobTitle}". Please upload your resume to see your real-time compatibility score!`);
      return;
    }

    try {
      const matchRes = await analyzeResume(analysisResult.parsedSections.rawText, jobText);
      // Retain current section edits
      setAnalysisResult({
        ...matchRes,
        parsedSections: {
          ...matchRes.parsedSections,
          sectionsList: analysisResult.parsedSections.sectionsList,
        },
      });
      setActiveTab('jobMatch');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn('Job matching error:', err);
      setActiveTab('jobMatch');
    }
  };

  // Derive stats for sidebar
  const stats = {
    atsScore: analysisResult?.atsScore?.overallScore,
    jobMatches: analysisResult?.jobMatch ? 1 : 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-200">
      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewAnalysis={() => {
          setAnalysisResult(null);
          setActiveTab('dashboard');
        }}
      />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {analysisResult && activeTab !== 'methodology' && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            stats={stats}
          />
        )}
        
        <main className={`flex-1 ${analysisResult && activeTab !== 'methodology' ? 'p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full overflow-x-hidden' : 'w-full'}`}>
          {/* VIEW 1: Methodology Page */}
          {activeTab === 'methodology' && <MethodologyPage />}

          {/* VIEW 2: Independent Jobs & Internships View (accessible with or without uploaded resume) */}
          {activeTab === 'jobs' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <JobsAndInternshipsView
                analysis={analysisResult}
                onSelectJobForMatch={handleSelectJobForMatch}
              />
            </div>
          )}

          {/* VIEW 3: Landing / Upload OR Dashboard Views */}
          {activeTab !== 'methodology' && activeTab !== 'jobs' && (
            <div className="mx-auto w-full">
              {!analysisResult ? (
                /* Landing & Upload View */
                <div className="space-y-12 py-8 sm:py-12 px-4 max-w-7xl mx-auto">
                  <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      <span>Free Open-Source ATS Scoring & Section Verification Workspace</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      Know How Strong Your Resume Really Is
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                      Inspect and edit every section independently, check explainable ATS compatibility, discover skill gaps, and explore real Indian jobs and internships.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          const el = document.getElementById('upload-section');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                      >
                        <span>Check My ATS Score</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveTab('jobs')}
                        className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 font-semibold text-xs tracking-wide transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Discover Indian Jobs & Internships</span>
                      </button>
                    </div>
                  </div>

                  <div id="upload-section" className="max-w-4xl mx-auto">
                    <FileUpload
                      onAnalysisComplete={handleAnalysisComplete}
                      samples={samples}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-5xl mx-auto">
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Section Verification Workspace</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        15 canonical section extractors with independent editing, diff comparisons, and approval-guarded AI bullet enhancements.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Transparent ATS Scoring</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Explainable 8-component mathematical scoring: keywords, structure, readability, experience metrics, and formatting integrity.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Indian Jobs & Internships</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Verified live feeds and parameterized portal deep-links across Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, and Remote.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Application Views (with Sidebar Active) */
                <div className="space-y-6">
                  {/* Top utility bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Current Profile: <span className="font-bold text-slate-900 dark:text-slate-100">{analysisResult.parsedSections.personal.name !== 'Not detected' ? analysisResult.parsedSections.personal.name : 'Unknown Candidate'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportAnalysisPdf(analysisResult, analysisResult.parsedSections.personal.name)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Export Audit Report</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('preview')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Preview Resume</span>
                      </button>
                    </div>
                  </div>

                  {/* Routing based on activeTab */}
                  {activeTab === 'dashboard' && (
                    <DashboardOverview analysis={analysisResult} setActiveTab={setActiveTab} />
                  )}

                  {activeTab === 'editor' && (
                    <SectionEditorWorkspace
                      analysis={analysisResult}
                      onUpdateAnalysis={setAnalysisResult}
                      onRecalculate={handleRecalculate}
                      targetJobDescription={targetJobText}
                    />
                  )}

                  {activeTab === 'resume' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Resume Entities</h2>
                        <button
                          onClick={() => setActiveTab('editor')}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Open Section Editor</span>
                        </button>
                      </div>
                      <ExtractedInfoView
                        parsedSections={analysisResult.parsedSections}
                        skills={analysisResult.skills}
                        mlInsights={analysisResult.mlInsights}
                      />
                    </div>
                  )}

                  {activeTab === 'atsScore' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ATS Score Details</h2>
                      <AtsScoreCard
                        atsScore={analysisResult.atsScore}
                        fullAnalysis={analysisResult}
                      />
                      <ScoreBreakdown atsScore={analysisResult.atsScore} />
                      <QualityAuditView qualityAudit={analysisResult.qualityAudit} />
                    </div>
                  )}

                  {activeTab === 'jobMatch' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Job Match Analysis</h2>
                      <JobMatchCard
                        jobMatch={analysisResult.jobMatch}
                        onOpenJdInput={() => {
                          setAnalysisResult(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                      {analysisResult.jobMatch && (
                        <SkillGapCard skillGapList={analysisResult.jobMatch.skillGapList} />
                      )}
                    </div>
                  )}

                  {activeTab === 'preview' && (
                    <ResumePreviewExport
                      analysis={analysisResult}
                      onNavigateToEditor={() => setActiveTab('editor')}
                    />
                  )}

                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Global Footer */}
      {!analysisResult && <Footer onSelectTab={setActiveTab} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
