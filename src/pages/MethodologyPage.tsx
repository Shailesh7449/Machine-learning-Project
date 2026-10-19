import React from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  Network,
  Calculator,
  Binary,
  Target,
  FileCheck2,
  GitBranch,
  ShieldCheck,
  Code2
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12 transition-colors duration-200">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic NLP Research Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Methodology & ML/NLP Pipeline
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Comprehensive documentation of the mathematical representations, entity extraction heuristics, TF-IDF vectorization, and deterministic scoring models powering ResumeAI.
        </p>
      </div>

      {/* End-to-End Pipeline Diagram */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>1. End-to-End Computational Pipeline</span>
        </h2>

        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed overflow-x-auto shadow-inner">
          <div className="flex flex-col gap-2 min-w-[600px]">
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center text-indigo-700 dark:text-indigo-300 font-bold shadow-sm">
              Raw Input (PDF / DOCX Document Stream)
            </div>
            <div className="text-center text-slate-500 dark:text-slate-400">↓ [1. Binary Stream Parser (pdf-parse / mammoth)]</div>
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center text-sky-700 dark:text-sky-300 shadow-sm">
              Cleaned ASCII Text (RegEx Whitespace Normalization & Encoding Filter)
            </div>
            <div className="text-center text-slate-500 dark:text-slate-400">↓ [2. Structural Section Segmenter & Entity RegEx]</div>
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center text-teal-700 dark:text-teal-300 shadow-sm">
              Structured Resume Segments (Contact, Summary, Experience, Education, Projects)
            </div>
            <div className="text-center text-slate-500 dark:text-slate-400">↓ [3. Canonical Skill Ontology Graph & Tokenizer]</div>
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center text-emerald-700 dark:text-emerald-300 shadow-sm">
              Extracted Normalized Skills + Stopword-Removed Token Stream
            </div>
            <div className="text-center text-slate-500 dark:text-slate-400">↓ [4. TF-IDF Vector Space Representation & N-Gram Extraction]</div>
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center text-amber-700 dark:text-amber-300 shadow-sm">
              Sparse Term Frequency Vectors (TF_resume, TF_job)
            </div>
            <div className="text-center text-slate-500 dark:text-slate-400">↓ [5. Cosine Similarity + Jaccard Index + Metric Density Heuristics]</div>
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center text-purple-700 dark:text-purple-300 shadow-sm">
              Deterministic Multi-Factor ATS Compatibility Engine (0–100 Score)
            </div>
            <div className="text-center text-slate-500 dark:text-slate-400">↓ [6. Role Recommendation Catalog & Skill Gap Prioritization]</div>
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-center text-pink-700 dark:text-pink-300 font-bold shadow-sm">
              Final Actionable Audit Report (PDF / JSON Output)
            </div>
          </div>
        </div>
      </div>

      {/* 10 Core Academic Pillars */}
      <div className="space-y-8">
        {/* Step 1 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex items-center justify-center font-mono font-bold">1</span>
            <span>Resume Preprocessing & Document Parsing</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The parser ingests binary buffers of PDF and DOCX documents in memory up to 10MB without writing unencrypted files to permanent disk storage. The raw stream undergoes text extraction, non-printable control code filtering, Unicode ligature resolution, and consecutive whitespace compression.
          </p>
        </section>

        {/* Step 2 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex items-center justify-center font-mono font-bold">2</span>
            <span>Section Detection & Information Extraction</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            A deterministic finite-state automaton inspects line headings against standard ATS section aliases (e.g., "Work Experience", "Professional Summary", "Education", "Technical Skills"). Named entities are extracted without probabilistic hallucination:
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc">
            <li><strong>Email:</strong> RFC-5322 compliant regular expressions.</li>
            <li><strong>Phone:</strong> E.164 and North American Numbering Plan patterns.</li>
            <li><strong>URLs:</strong> Regular expressions matching LinkedIn vanity URLs, GitHub profiles, and personal domains (.dev, .io, .me, etc.).</li>
          </ul>
        </section>

        {/* Step 3 & 4 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex items-center justify-center font-mono font-bold">3 & 4</span>
            <span>Skill Extraction & Canonical Normalization</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Recruiters and job descriptions use disparate synonyms for identical competencies. ResumeAI uses an extensible taxonomy graph aligned with international classifications (ESCO and O*NET):
          </p>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-300 shadow-inner">
            <code>
              aliasMap("python 3") → CanonicalSkill("Python", category: "languages", weight: 1.0)<br />
              aliasMap("amazon web services") → CanonicalSkill("AWS", category: "cloud_devops", weight: 1.0)<br />
              aliasMap("ml") → CanonicalSkill("Machine Learning", category: "data_ml", weight: 1.0)
            </code>
          </div>
        </section>

        {/* Step 5 & 6 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex items-center justify-center font-mono font-bold">5 & 6</span>
            <span>Vector Space Model & Semantic Cosine Similarity</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Text is tokenized with stopword elimination, computing normalized Term Frequencies:
          </p>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-indigo-700 dark:text-indigo-300 my-2 shadow-inner">
            TF(t, d) = count(t, d) / TotalTokens(d)<br />
            CosineSimilarity(A, B) = (A • B) / (||A|| × ||B||) = ∑ (TF_A(t) × TF_B(t)) / [ √(∑ TF_A(t)²) × √(∑ TF_B(t)²) ]
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Unlike simple word count matching, Cosine Similarity evaluates directional angle in multidimensional keyword space, capturing domain alignment irrespective of resume length.
          </p>
        </section>

        {/* Step 7 & 8 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex items-center justify-center font-mono font-bold">7 & 8</span>
            <span>Deterministic Multi-Factor ATS Scoring Formula</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            The overall ATS score is an exact additive function of 8 transparent features summing to 100 points:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">Structure: 15 pts</div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">Keywords: 20 pts</div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">Skills Match: 20 pts</div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">Experience: 15 pts</div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">Achievements: 10 pts</div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">Formatting: 10 pts</div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">Contact Info: 5 pts</div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">Job Alignment: 5 pts</div>
          </div>
        </section>

        {/* Step 9 & 10 */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex items-center justify-center font-mono font-bold">9 & 10</span>
            <span>Skill Gap Prioritization & Role Recommendation</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Missing competencies are prioritized into High, Medium, and Low based on core vs optional job requirements and taxonomy ontology weights. Job role recommendations calculate weighted overlaps across 8 standardized industry profiles (Machine Learning Engineer, Data Scientist, Full Stack Developer, DevOps Engineer, etc.).
          </p>
        </section>
      </div>
    </div>
  );
};
