import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Award,
  Layers
} from 'lucide-react';
import { ParsedSections, CanonicalSkill, SkillCategoryGroup } from '../types';

interface ExtractedInfoViewProps {
  parsedSections: ParsedSections;
  skills: {
    matchedSkills: CanonicalSkill[];
    categories: SkillCategoryGroup;
    totalCount: number;
  };
  mlInsights?: {
    predictedCategory: string;
    extractedSkillsML: string[];
  } | null;
}

export const ExtractedInfoView: React.FC<ExtractedInfoViewProps> = ({ parsedSections, skills, mlInsights }) => {
  const p = parsedSections.personal;

  const categoryTitles: { key: keyof SkillCategoryGroup; title: string; color: string }[] = [
    { key: 'languages', title: 'Programming Languages', color: 'text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10' },
    { key: 'frameworks', title: 'Frameworks & Web', color: 'text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10' },
    { key: 'cloud_devops', title: 'Cloud & DevOps', color: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' },
    { key: 'databases', title: 'Databases & Storage', color: 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10' },
    { key: 'data_ml', title: 'Data & Machine Learning', color: 'text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10' },
    { key: 'tools', title: 'Developer Tools & CI', color: 'text-pink-700 dark:text-pink-400 border-pink-300 dark:border-pink-500/30 bg-pink-50 dark:bg-pink-500/10' },
    { key: 'concepts', title: 'Architecture & Concepts', color: 'text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10' },
    { key: 'soft_skills', title: 'Leadership & Soft Skills', color: 'text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Personal & Contact Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors duration-200">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Candidate Profile & Contact Entities</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Full Name</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{p.name}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>Email</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-200 break-all">{p.email}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Phone</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{p.phone}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Location</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{p.location}</span>
          </div>
        </div>

        {/* Links row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Linkedin className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
            <span className="truncate">{p.linkedin}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Github className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
            <span className="truncate">{p.github}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Globe className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{p.portfolio}</span>
          </div>
        </div>

        {/* Professional Summary */}
        {parsedSections.summary !== 'Not detected' && (
          <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-950/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Detected Professional Summary:</span>
            {parsedSections.summary}
          </div>
        )}
      </div>

      {/* 2. Categorized Skills Taxonomy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Extracted Normalized Skills ({skills.totalCount} Canonical Entities)</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Mapped via Canonical Alias Ontology
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryTitles.map(({ key, title, color }) => {
            const list = skills.categories[key] || [];
            if (list.length === 0) return null;

            return (
              <div key={key} className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-300 mb-2.5 flex items-center justify-between">
                  <span>{title}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{list.length}</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((skillName) => (
                    <span
                      key={skillName}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium ${color}`}
                    >
                      {skillName}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.5 Machine Learning Insights */}
      {mlInsights && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 shadow-xl transition-colors duration-200">
          <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-indigo-200 dark:border-indigo-800/50">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Machine Learning Insights</span>
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <span className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block mb-1">Predicted Job Category (TF-IDF + Linear SVM)</span>
              <span className="font-semibold text-slate-900 dark:text-white text-lg">{mlInsights.predictedCategory}</span>
            </div>
            
            {mlInsights.extractedSkillsML && mlInsights.extractedSkillsML.length > 0 && (
              <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <span className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block mb-2">ML Skill Extraction (Random Forest)</span>
                <div className="flex flex-wrap gap-1.5">
                  {mlInsights.extractedSkillsML.slice(0, 15).map((skill, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md border font-medium text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10">
                      {skill}
                    </span>
                  ))}
                  {mlInsights.extractedSkillsML.length > 15 && (
                    <span className="text-xs px-2.5 py-1 rounded-md font-medium text-slate-500 dark:text-slate-400">
                      +{mlInsights.extractedSkillsML.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Work Experience & Education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Briefcase className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Work Experience ({parsedSections.experience.length} Roles)</span>
          </h3>

          {parsedSections.experience.length > 0 ? (
            <div className="space-y-4">
              {parsedSections.experience.map((exp, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm">{exp.role}</h4>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 shrink-0">
                      {exp.duration}
                    </span>
                  </div>

                  {exp.highlights.length > 0 && (
                    <ul className="mt-2.5 space-y-1.5 text-slate-700 dark:text-slate-300 pl-3">
                      {exp.highlights.slice(0, 4).map((h, hIdx) => (
                        <li key={hIdx} className="list-disc leading-relaxed">
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">No explicit work experience entries recognized.</p>
          )}
        </div>

        {/* Education & Projects */}
        <div className="space-y-6">
          {/* Education */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors duration-200">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Education Background</span>
            </h3>

            {parsedSections.education.length > 0 ? (
              <div className="space-y-3">
                {parsedSections.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-200">{edu.degree}</h4>
                        <p className="text-slate-600 dark:text-slate-400">{edu.institution}</p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 shrink-0">
                        {edu.year}
                      </span>
                    </div>
                    {edu.grade !== 'Not detected' && (
                      <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Grade/GPA: {edu.grade}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">No education block parsed.</p>
            )}
          </div>

          {/* Projects */}
          {parsedSections.projects.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors duration-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <FolderGit2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Documented Projects ({parsedSections.projects.length})</span>
              </h3>

              <div className="space-y-3">
                {parsedSections.projects.slice(0, 3).map((proj, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-slate-200">{proj.name}</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
