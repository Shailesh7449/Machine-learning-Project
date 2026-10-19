import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  Clipboard,
  FileCheck,
  Briefcase
} from 'lucide-react';
import { uploadResumeFile, analyzeResume } from '../services/api';
import { AnalysisResponse, SampleItem } from '../types';

interface FileUploadProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
  samples: { resumes: SampleItem[]; jobs: SampleItem[] };
}

export const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisComplete, samples }) => {
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste'>('upload');
  const [includeJobDescription, setIncludeJobDescription] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Resume state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');

  // Status state
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<{ name: string; size: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    setErrorMessage(null);

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    // Validate extension
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      setErrorMessage(`Unsupported format .${ext}. Please upload a standard PDF or DOCX file.`);
      return;
    }

    setSelectedFile(file);
    setLoadingStep('Uploading & parsing document structure (PDF/DOCX)...');

    try {
      const uploadRes = await uploadResumeFile(file);
      setResumeText(uploadRes.extractedText);
      setUploadSuccessInfo({
        name: uploadRes.filename,
        size: uploadRes.fileSize,
      });
      setLoadingStep(null);
    } catch (err: any) {
      // If it's a plain text file, fallback to browser FileReader
      if (ext === 'txt') {
        try {
          const text = await file.text();
          if (text.trim().length > 30) {
            setResumeText(text);
            setUploadSuccessInfo({
              name: file.name,
              size: file.size,
            });
            setLoadingStep(null);
            return;
          }
        } catch {
          // ignore
        }
      }

      setSelectedFile(null);
      setLoadingStep(null);
      setErrorMessage(
        err.message || 'Failed to extract text from document. Please ensure the file is not a scanned image.'
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleTriggerAnalysis = async () => {
    setErrorMessage(null);
    const textToAnalyze = resumeText.trim();

    if (!textToAnalyze || textToAnalyze.length < 40) {
      setErrorMessage('Please upload a resume or paste at least 40 characters of resume content to evaluate.');
      return;
    }

    try {
      setLoadingStep('Running NLP pipeline: Section segmentation, skill ontology mapping & ATS scoring...');
      const result = await analyzeResume(textToAnalyze, includeJobDescription ? jobDescriptionText : undefined);
      setLoadingStep(null);
      onAnalysisComplete(result);
    } catch (err: any) {
      setLoadingStep(null);
      setErrorMessage(err.message || 'Analysis failed. Please check the resume text format.');
    }
  };

  const loadSampleResume = (sample: SampleItem) => {
    setResumeText(sample.content);
    setUploadSuccessInfo({
      name: `${sample.title} (Demo)`,
      size: sample.content.length,
    });
    setActiveInputMode('paste');
    setErrorMessage(null);
  };

  const loadSampleJob = (sample: SampleItem) => {
    setJobDescriptionText(sample.content);
    setIncludeJobDescription(true);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 sm:p-8 transition-colors duration-200">
      {/* Header & Modes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Resume Ingestion & Analysis</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-medium">
              100% Free Engine
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Accepts PDF or DOCX up to 10MB. Text is parsed securely in-memory.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveInputMode('upload')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeInputMode === 'upload'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            onClick={() => setActiveInputMode('paste')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeInputMode === 'paste'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>
        </div>
      </div>

      {/* Instant Demo Data Presets */}
      <div className="my-5 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Instant Demo Resumes (Zero-upload testing):</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Click to auto-populate and run</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {samples.resumes.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSampleResume(s)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
            >
              <FileCheck className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              <span>{s.title.split('–')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Resume Input Area */}
      {activeInputMode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
              : selectedFile || uploadSuccessInfo
              ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-500/5'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-slate-600 bg-slate-50/60 dark:bg-slate-950/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              {uploadSuccessInfo ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div>
              {uploadSuccessInfo ? (
                <>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    File Ready: {uploadSuccessInfo.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Parsed {(uploadSuccessInfo.size / 1024).toFixed(1)} KB cleanly. Click to change file.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Drag and drop your resume file here, or{' '}
                    <span className="text-indigo-600 dark:text-indigo-400 underline font-semibold">browse computer</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Supports PDF and DOCX (Max 10 MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
            <span>Resume Text Content</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono">{resumeText.length} characters</span>
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="Paste your raw resume text here (Work experience, education, technical skills, etc.)..."
            rows={8}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
          />
        </div>
      )}

      {/* Target Job Description Section (Mode 1 vs Mode 2) */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeJobDescription}
              onChange={(e) => setIncludeJobDescription(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Target Job Description (Mode 2: Match & Skill Gap Analysis)</span>
            </span>
          </label>
          {includeJobDescription && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Calculates keyword overlap, missing skills & semantic compatibility
            </span>
          )}
        </div>

        {includeJobDescription && (
          <div className="mt-3 space-y-2 animate-in fade-in duration-200">
            {/* Quick sample JD loader */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Load sample target role:</span>
              {samples.jobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => loadSampleJob(j)}
                  className="px-2 py-0.5 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                >
                  {j.title.split('(')[0]}
                </button>
              ))}
            </div>

            <textarea
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="Paste the job description (roles, responsibilities, required qualifications)..."
              rows={5}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Error / Loading Indicators */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-700 dark:text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loadingStep && (
        <div className="mt-4 p-3.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-xs">
          <Loader2 className="w-4 h-4 shrink-0 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="font-medium">{loadingStep}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Strictly local in-memory analysis • No permanent storage • 100% Free
        </p>
        <button
          onClick={handleTriggerAnalysis}
          disabled={!!loadingStep || (!resumeText.trim() && !selectedFile)}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 ${
            loadingStep || (!resumeText.trim() && !selectedFile)
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40'
          }`}
        >
          {loadingStep ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Resume...</span>
            </>
          ) : (
            <>
              <span>Calculate ATS Score & Extract Skills</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
