import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Trash2,
  Plus,
  Save,
  ArrowRight,
  Split,
  Eye,
  Edit3,
  Check,
  X,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  ParsedSections,
  ResumeSectionItem,
  SectionKey,
  AnalysisResponse,
} from '../types';
import { editWithAi } from '../services/api';

interface SectionEditorWorkspaceProps {
  analysis: AnalysisResponse;
  onUpdateAnalysis: (updated: AnalysisResponse) => void;
  onRecalculate: () => void;
  targetJobDescription?: string;
}

export function SectionEditorWorkspace({
  analysis,
  onUpdateAnalysis,
  onRecalculate,
  targetJobDescription,
}: SectionEditorWorkspaceProps) {
  const [sections, setSections] = useState<ResumeSectionItem[]>(() => {
    return analysis.parsedSections.sectionsList || [];
  });
  const [activeSectionId, setActiveSectionId] = useState<string>(() => {
    return sections[0]?.id || 'sec_contact_info';
  });

  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    original: string;
    improved: string;
    mode: string;
  } | null>(null);

  const [newSectionModalOpen, setNewSectionModalOpen] = useState<boolean>(false);
  const [newSectionTitle, setNewSectionTitle] = useState<string>('');
  const [newSectionKey, setNewSectionKey] = useState<SectionKey>('unclassified');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const updateSectionText = (id: string, newText: string) => {
    const updated = sections.map(s => (s.id === id ? { ...s, currentText: newText } : s));
    setSections(updated);
    syncBackToAnalysis(updated);
  };

  const toggleReviewed = (id: string) => {
    const updated = sections.map(s => (s.id === id ? { ...s, isReviewed: !s.isReviewed } : s));
    setSections(updated);
    syncBackToAnalysis(updated);
    showNotification('Review status updated');
  };

  const resetToOriginal = (id: string) => {
    if (!window.confirm('Reset this section back to its original extracted text? Your edits in this section will be replaced.')) {
      return;
    }
    const updated = sections.map(s =>
      s.id === id ? { ...s, currentText: s.originalText } : s
    );
    setSections(updated);
    syncBackToAnalysis(updated);
    setAiSuggestion(null);
    showNotification('Restored original extracted text');
  };

  const deleteSection = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section from your resume workspace?')) {
      return;
    }
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    if (activeSectionId === id && updated.length > 0) {
      setActiveSectionId(updated[0].id);
    }
    syncBackToAnalysis(updated);
    showNotification('Section removed');
  };

  const reclassifySection = (id: string, newKey: SectionKey) => {
    const updated = sections.map(s => {
      if (s.id === id) {
        return {
          ...s,
          key: newKey,
          title: newKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        };
      }
      return s;
    });
    setSections(updated);
    syncBackToAnalysis(updated);
    showNotification(`Reclassified as ${newKey}`);
  };

  const addNewSection = () => {
    if (!newSectionTitle.trim()) return;
    const newId = `sec_custom_${Date.now()}`;
    const newSec: ResumeSectionItem = {
      id: newId,
      key: newSectionKey,
      title: newSectionTitle.trim(),
      originalText: '',
      currentText: '',
      confidence: 100,
      isReviewed: true,
    };
    const updated = [...sections, newSec];
    setSections(updated);
    setActiveSectionId(newId);
    setNewSectionModalOpen(false);
    setNewSectionTitle('');
    syncBackToAnalysis(updated);
    showNotification('New section added');
  };

  const syncBackToAnalysis = (updatedSections: ResumeSectionItem[]) => {
    // Reconstruct parsedSections texts
    const newParsed: ParsedSections = {
      ...analysis.parsedSections,
      sectionsList: updatedSections,
    };

    // Update individual section text mirrors
    for (const sec of updatedSections) {
      if (sec.key === 'summary') newParsed.summary = sec.currentText;
      if (sec.key === 'technical_skills') {
        newParsed.technicalSkills = sec.currentText.split(/[,\n•]/).map(t => t.trim()).filter(Boolean);
        newParsed.skillsText = sec.currentText;
      }
      if (sec.key === 'soft_skills') {
        newParsed.softSkills = sec.currentText.split(/[,\n•]/).map(t => t.trim()).filter(Boolean);
      }
      if (sec.key === 'certifications') {
        newParsed.certifications = sec.currentText.split('\n').map(t => t.trim()).filter(Boolean);
      }
      if (sec.key === 'achievements') {
        newParsed.achievements = sec.currentText.split('\n').map(t => t.trim()).filter(Boolean);
      }
      if (sec.key === 'publications') {
        newParsed.publications = sec.currentText.split('\n').map(t => t.trim()).filter(Boolean);
      }
      if (sec.key === 'extracurricular') {
        newParsed.extracurricular = sec.currentText.split('\n').map(t => t.trim()).filter(Boolean);
      }
      if (sec.key === 'languages') {
        newParsed.languages = sec.currentText.split(/[,\n]/).map(t => t.trim()).filter(Boolean);
      }
      if (sec.key === 'courses') {
        newParsed.courses = sec.currentText.split('\n').map(t => t.trim()).filter(Boolean);
      }
    }

    // Combine rawText
    newParsed.rawText = updatedSections.map(s => `## ${s.title}\n${s.currentText}`).join('\n\n');

    onUpdateAnalysis({
      ...analysis,
      parsedSections: newParsed,
    });
  };

  const handleAiImprove = async (mode: 'ats' | 'clarity' | 'verbs' | 'concise' | 'grammar' | 'jd_match') => {
    if (!activeSection || !activeSection.currentText.trim()) {
      alert('Section has no text to improve.');
      return;
    }
    setIsAiLoading(true);
    setAiSuggestion(null);

    try {
      const res = await editWithAi(activeSection.currentText, mode, {
        jobDescription: targetJobDescription,
        sectionName: activeSection.title,
      });

      if (res.success && res.improved) {
        setAiSuggestion({
          original: activeSection.currentText,
          improved: res.improved,
          mode,
        });
      }
    } catch (err: any) {
      alert(`AI improvement error: ${err?.message || 'Failed to generate improvement'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const acceptAiSuggestion = () => {
    if (!aiSuggestion || !activeSection) return;
    updateSectionText(activeSection.id, aiSuggestion.improved);
    setAiSuggestion(null);
    showNotification('AI improvements applied to section');
  };

  const rejectAiSuggestion = () => {
    setAiSuggestion(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Section-by-Section Verification & Editor
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Independently inspect, correct, and optimize every extracted resume section. All edits update ATS scores and match reports in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setNewSectionModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>

          <button
            onClick={onRecalculate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate Scores</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sections Navigation */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Detected Sections ({sections.length})</span>
              <span>Reviewed: {sections.filter(s => s.isReviewed).length}/{sections.length}</span>
            </div>

            <div className="space-y-1 mt-1 max-h-[600px] overflow-y-auto pr-1">
              {sections.map(sec => {
                const isActive = sec.id === activeSectionId;
                const hasContent = sec.currentText.trim().length > 0;
                const hasWarning = !!sec.warnings && sec.warnings.length > 0;

                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      setAiSuggestion(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-2 border ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${hasContent ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <span className="text-xs font-semibold truncate">{sec.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasWarning && (
                        <span title={sec.warnings?.[0]}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                      )}
                      {sec.isReviewed ? (
                        <span title="Reviewed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono">
                          {sec.confidence}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Section Editor */}
        <div className="lg:col-span-8 space-y-4">
          {activeSection ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              {/* Section Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeSection.title}
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Confidence: {activeSection.confidence}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Classification:</span>
                    <select
                      value={activeSection.key}
                      onChange={e => reclassifySection(activeSection.id, e.target.value as SectionKey)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="contact_info">Contact Information</option>
                      <option value="summary">Professional Summary</option>
                      <option value="education">Education</option>
                      <option value="technical_skills">Technical Skills</option>
                      <option value="soft_skills">Soft Skills</option>
                      <option value="work_experience">Work Experience</option>
                      <option value="internships">Internships</option>
                      <option value="projects">Projects</option>
                      <option value="certifications">Certifications</option>
                      <option value="achievements">Achievements</option>
                      <option value="publications">Publications</option>
                      <option value="extracurricular">Extracurricular</option>
                      <option value="languages">Languages</option>
                      <option value="courses">Courses</option>
                      <option value="unclassified">Unclassified</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => toggleReviewed(activeSection.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                      activeSection.isReviewed
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeSection.isReviewed ? 'Marked Reviewed' : 'Mark Reviewed'}</span>
                  </button>

                  <button
                    onClick={() => resetToOriginal(activeSection.id)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors"
                    title="Reset to original extracted text"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteSection(activeSection.id)}
                    className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Extraction Warnings */}
              {activeSection.warnings && activeSection.warnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-bold">Extraction Warning: </span>
                    {activeSection.warnings.join(' ')}
                  </div>
                </div>
              )}

              {/* View Mode Toggle: Edit vs Diff */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCompareMode(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      !compareMode
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Direct Editor
                  </button>
                  <button
                    onClick={() => setCompareMode(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      compareMode
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Compare with Original</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {activeSection.currentText.length} chars | {activeSection.currentText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              {/* Editor Workspace Area */}
              {!compareMode ? (
                <div className="space-y-3">
                  <textarea
                    rows={12}
                    value={activeSection.currentText}
                    onChange={e => updateSectionText(activeSection.id, e.target.value)}
                    placeholder="Enter or edit section text..."
                    className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              ) : (
                /* Side-by-Side Diff Compare */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Original Extracted Text
                    </span>
                    <div className="p-3.5 bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                      {activeSection.originalText || '(Section was empty in original upload)'}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      Current Edited Version
                    </span>
                    <textarea
                      rows={12}
                      value={activeSection.currentText}
                      onChange={e => updateSectionText(activeSection.id, e.target.value)}
                      className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-3.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* AI & Rule-Based Enhancement Toolbar */}
              <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Improve Section Content</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Suggestions require your approval</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={isAiLoading}
                    onClick={() => handleAiImprove('ats')}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    ATS Metrics (XYZ)
                  </button>
                  <button
                    disabled={isAiLoading}
                    onClick={() => handleAiImprove('verbs')}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Strong Action Verbs
                  </button>
                  <button
                    disabled={isAiLoading}
                    onClick={() => handleAiImprove('concise')}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Make Concise
                  </button>
                  <button
                    disabled={isAiLoading}
                    onClick={() => handleAiImprove('clarity')}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Professional Clarity
                  </button>
                  <button
                    disabled={isAiLoading}
                    onClick={() => handleAiImprove('grammar')}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Fix Grammar
                  </button>
                  {targetJobDescription && (
                    <button
                      disabled={isAiLoading}
                      onClick={() => handleAiImprove('jd_match')}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium transition-colors"
                    >
                      Align with Target JD
                    </button>
                  )}
                </div>

                {isAiLoading && (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-2 pt-1 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing section and optimizing phrasing...</span>
                  </div>
                )}

                {/* AI Suggestion Approval Box */}
                {aiSuggestion && (
                  <div className="mt-3 p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Proposed Improvement ({aiSuggestion.mode.toUpperCase()})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={acceptAiSuggestion}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Apply</span>
                        </button>
                        <button
                          onClick={rejectAiSuggestion}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {aiSuggestion.improved}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select a section on the left to edit.
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Section Modal */}
      {newSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Resume Section
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Open Source Contributions, Patents, Volunteering"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Section Classification Type
                </label>
                <select
                  value={newSectionKey}
                  onChange={e => setNewSectionKey(e.target.value as SectionKey)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="projects">Projects / Portfolio</option>
                  <option value="certifications">Certifications & Licenses</option>
                  <option value="achievements">Achievements & Awards</option>
                  <option value="publications">Publications & Research</option>
                  <option value="extracurricular">Extracurricular & Leadership</option>
                  <option value="languages">Languages</option>
                  <option value="courses">Courses & Training</option>
                  <option value="unclassified">Other / Miscellaneous</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNewSectionModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={addNewSection}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
