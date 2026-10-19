import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Edit3,
  BarChart3,
  Target,
  Briefcase,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  stats: {
    atsScore?: number;
    jobsFound?: number;
    jobMatches?: number;
    skillGaps?: number;
  };
}

export function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, stats }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor', label: 'Section Workspace', icon: Edit3 },
    { id: 'resume', label: 'My Resume', icon: FileText },
    { id: 'atsScore', label: 'ATS Analysis', icon: BarChart3, badge: stats.atsScore },
    { id: 'jobMatch', label: 'Job Match', icon: Target, badge: stats.jobMatches },
    { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
    { id: 'preview', label: 'Resume Preview & Export', icon: FileCheck },
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shrink-0 sticky top-[64px] h-[calc(100vh-64px)] z-10 hidden md:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              
              {!isCollapsed && (
                <span className="truncate text-xs flex-1 text-left">{item.label}</span>
              )}

              {/* Status Indicator / Badge */}
              {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive 
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Indicator for collapsed state */}
              {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
