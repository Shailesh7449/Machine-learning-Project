import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  ExternalLink,
  Target,
  Sparkles,
  Building2,
  Calendar,
  DollarSign,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Globe,
  Award,
  Layers,
  GraduationCap
} from 'lucide-react';
import { JobListing, ExternalSearchPortal, AnalysisResponse } from '../types';
import { searchJobs } from '../services/api';

interface JobsAndInternshipsViewProps {
  analysis?: AnalysisResponse | null;
  onSelectJobForMatch?: (jobText: string, jobTitle: string) => void;
}

const INDIAN_CITIES = [
  'All India',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Delhi NCR (Gurgaon / Noida)',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Remote',
];

export function JobsAndInternshipsView({
  analysis,
  onSelectJobForMatch,
}: JobsAndInternshipsViewProps) {
  // Infer initial role from resume if available
  const initialQuery = analysis?.jobRecommendations?.[0]?.roleTitle || 'Software Engineer';
  const [query, setQuery] = useState<string>(initialQuery);
  const [location, setLocation] = useState<string>('All India');
  const [jobType, setJobType] = useState<'all' | 'job' | 'internship'>('all');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listings, setListings] = useState<JobListing[]>([]);
  const [externalPortals, setExternalPortals] = useState<ExternalSearchPortal[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const performSearch = async () => {
    setIsLoading(true);
    setNotice(null);

    const locParam = location === 'All India' ? '' : location;

    try {
      const res = await searchJobs({
        query: query.trim(),
        location: locParam,
        type: jobType,
        limit: 20,
      });

      if (res && res.success) {
        setListings(res.listings || []);
        setExternalPortals(res.externalPortals || []);
        setSources(res.sourceAttribution || []);
        setNotice(res.notice || null);
      }
    } catch (err: any) {
      console.warn('Jobs search error:', err);
      setNotice('Unable to reach job data providers. You can still use the verified portal search links below.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [jobType]);

  const handleMatchJob = (job: JobListing) => {
    if (!onSelectJobForMatch) return;
    const jdText = `Job Title: ${job.title} at ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nExperience: ${job.experienceRequirement}\nSkills Required: ${job.skills.join(', ')}\n\nJob Description:\n${job.descriptionSummary}`;
    onSelectJobForMatch(jdText, job.title);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>India Tech Ecosystem & Internship Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Discover Real Indian Jobs & Internships
          </h1>

          <p className="text-sm text-indigo-100/80 leading-relaxed max-w-2xl">
            Explore live, verified engineering opportunities across Bengaluru, Hyderabad, Pune, Delhi NCR, and remote. Direct links to official employer listings and 1-click ATS resume compatibility matching.
          </p>
        </div>

        <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10 pointer-events-none">
          <Briefcase className="w-80 h-80" />
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Query input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && performSearch()}
              placeholder="Role, skill, or keyword (e.g. React, Python, ML, Full Stack)"
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Location Select */}
          <div className="sm:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {INDIAN_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-3">
            <button
              onClick={performSearch}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Opportunities</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Opportunity Type:</span>
            <button
              onClick={() => setJobType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                jobType === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setJobType('job')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                jobType === 'job'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Full-Time Jobs
            </button>
            <button
              onClick={() => setJobType('internship')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                jobType === 'internship'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Internships & Freshers</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing max 20 genuine results per query
          </div>
        </div>
      </div>

      {/* Notice Message if any */}
      {notice && (
        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Real Job Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Live Verified Listings ({listings.length})</span>
          </h2>
          {sources.length > 0 && (
            <span className="text-[11px] text-slate-400">
              Data Sources: {sources.join(', ')}
            </span>
          )}
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map(job => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{job.company}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        job.type === 'internship'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                      }`}
                    >
                      {job.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.postedDate}</span>
                    </span>

                    {job.salaryOrStipend && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{job.salaryOrStipend}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {job.descriptionSummary}
                  </p>

                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.skills.map(skill => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleMatchJob(job)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-200 dark:border-indigo-500/20"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Match with Resume</span>
                  </button>

                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Apply / View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No open developer feed listings found for "{query}".
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Use the verified Indian search portals below to immediately access live openings on Naukri, Internshala, and Unstop with your filters prefilled.
              </p>
            </div>
          )
        )}
      </div>

      {/* Verified External Search Portals */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Launch Verified Searches on Indian Job Portals</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Directly browse live opportunities matching your role and location on India's primary hiring networks:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {externalPortals.map(portal => (
            <a
              key={portal.name}
              href={portal.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl shadow-sm transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {portal.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    {portal.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span>Search "{query || 'Software'}"</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
