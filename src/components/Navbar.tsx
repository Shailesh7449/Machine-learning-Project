import React from 'react';
import {
  FileText,
  Target,
  Award,
  BarChart3,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  Briefcase
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAnalysis: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onNewAnalysis }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  ResumeAI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                  FREE ATS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Academic NLP & Job Recommendation System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'jobs'
                  ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-white border border-indigo-200 dark:border-slate-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Jobs & Internships</span>
            </button>

            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'methodology'
                  ? 'bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-white border border-sky-200 dark:border-slate-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Methodology</span>
            </button>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Bright / Dark Theme Switcher */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Bright Theme' : 'Switch to Dark Theme'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium"
              aria-label="Toggle Bright/Dark theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
                  <span className="hidden sm:inline">Bright</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-200" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={onNewAnalysis}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
