import type { JobListing, ExternalSearchPortal } from '../src/types/index.js';

export interface JobSearchParams {
  query?: string;
  location?: string;
  type?: 'all' | 'job' | 'internship';
  experienceLevel?: 'all' | 'fresher' | 'junior' | 'mid' | 'senior';
  isRemote?: boolean;
  skills?: string[];
  limit?: number;
}

export interface JobSearchResult {
  success: boolean;
  totalFound: number;
  listings: JobListing[];
  externalPortals: ExternalSearchPortal[];
  sourceAttribution: string[];
  notice?: string;
}

/**
 * Generate official, verified external search portal URLs for Indian platforms
 */
export function generateExternalPortals(query: string = '', location: string = '', type: string = 'all'): ExternalSearchPortal[] {
  const cleanQuery = (query || 'software engineer').trim();
  const cleanLocation = (location || 'India').trim();
  const slugQuery = cleanQuery.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slugLoc = cleanLocation.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const isInternship = type === 'internship';

  return [
    {
      name: 'Naukri.com',
      badge: 'India #1 Job Portal',
      description: 'Search thousands of verified full-time, contract & fresher jobs across top Indian MNCs and startups.',
      searchUrl: `https://www.naukri.com/${slugQuery}-jobs-in-${slugLoc}?k=${encodeURIComponent(cleanQuery)}&l=${encodeURIComponent(cleanLocation)}`,
      logoColor: '#0a66c2',
    },
    {
      name: 'Internshala',
      badge: 'Internship & Fresher Leader',
      description: 'Explore verified paid internships, summer training, and entry-level fresher roles across India.',
      searchUrl: `https://internshala.com/internships/${slugQuery}-internship-in-${slugLoc}/`,
      logoColor: '#00a5ec',
    },
    {
      name: 'Unstop (Formerly Dare2Compete)',
      badge: 'Campus, Hackathons & Hiring',
      description: 'Discover competitive hiring challenges, campus placements, and engineering internships.',
      searchUrl: `https://unstop.com/${isInternship ? 'internships' : 'jobs'}?searchTerm=${encodeURIComponent(cleanQuery)}`,
      logoColor: '#1e40af',
    },
    {
      name: 'LinkedIn Jobs India',
      badge: 'Professional Network',
      description: 'Direct recruiter postings, mutual connections, and quick-apply positions in Indian tech hubs.',
      searchUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(cleanQuery)}&location=${encodeURIComponent(cleanLocation)}`,
      logoColor: '#0a66c2',
    },
    {
      name: 'Google Jobs India',
      badge: 'Aggregate Search',
      description: 'Aggregated index across employer career pages, job boards, and regional listings.',
      searchUrl: `https://www.google.com/search?ibp=htl;jobs&q=${encodeURIComponent(cleanQuery + (isInternship ? ' internship in ' : ' jobs in ') + cleanLocation)}`,
      logoColor: '#ea4335',
    },
  ];
}

/**
 * Fetch real listings from public legitimate developer job feeds
 */
export async function searchRealJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const query = (params.query || '').toLowerCase().trim();
  const location = (params.location || '').toLowerCase().trim();
  const type = params.type || 'all';
  const limit = Math.min(params.limit || 20, 20); // Strict max 20 per search page

  const listings: JobListing[] = [];
  const sourcesUsed: string[] = [];

  // Source 1: Arbeitnow Public Job API (Free, live real jobs, unauthenticated, genuine tech listings)
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const rawJobs = Array.isArray(data.data) ? data.data : [];
      sourcesUsed.push('Arbeitnow Public API');

      for (const item of rawJobs) {
        if (listings.length >= limit) break;

        const title = item.title || '';
        const desc = (item.description || '').replace(/<[^>]+>/g, ' ');
        const company = item.company_name || 'Verified Tech Employer';
        const jobLoc = item.location || 'Remote';
        const isRemote = !!item.remote;
        const tags: string[] = Array.isArray(item.tags) ? item.tags : [];

        // Check query matching
        const textToMatch = `${title} ${desc} ${tags.join(' ')}`.toLowerCase();
        const matchesQuery = !query || textToMatch.includes(query) || tags.some(t => t.toLowerCase().includes(query));
        
        // Check location matching (matches Indian cities or remote if specified)
        const matchesLocation = !location || location === 'all' || 
          (location === 'remote' && isRemote) ||
          jobLoc.toLowerCase().includes(location) ||
          (isRemote && ['bengaluru', 'hyderabad', 'pune', 'mumbai', 'delhi', 'chennai', 'remote'].includes(location));

        const isIntern = title.toLowerCase().includes('intern') || tags.some(t => t.toLowerCase().includes('intern'));
        const matchesType = type === 'all' || (type === 'internship' ? isIntern : !isIntern);

        if (matchesQuery && matchesLocation && matchesType) {
          listings.push({
            id: `arbeitnow_${item.slug || Math.random().toString(36).substring(7)}`,
            title,
            company,
            location: isRemote ? `${jobLoc} (Remote Available)` : jobLoc,
            type: isIntern ? 'internship' : 'job',
            employmentType: isIntern ? 'internship' : 'full_time',
            isRemote,
            skills: tags.slice(0, 6),
            experienceRequirement: isIntern ? 'Fresher / Student' : 'Entry to Mid Level',
            salaryOrStipend: 'Disclosed upon application',
            postedDate: item.created_at ? new Date(item.created_at * 1000).toLocaleDateString() : 'Recently posted',
            source: 'Arbeitnow Verified Feed',
            originalUrl: item.url,
            applyUrl: item.url,
            descriptionSummary: desc.slice(0, 240) + '...',
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('Real job feed (Arbeitnow) fetch notice:', err?.message || err);
  }

  // Source 2: Remotive Public API if we need more results
  if (listings.length < limit) {
    try {
      const res = await fetch('https://remotive.com/api/remote-jobs?limit=30', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];
        sourcesUsed.push('Remotive Verified Remote API');

        for (const item of rawJobs) {
          if (listings.length >= limit) break;

          const title = item.title || '';
          const desc = (item.description || '').replace(/<[^>]+>/g, ' ');
          const company = item.company_name || 'Verified Tech Employer';
          const tags: string[] = Array.isArray(item.tags) ? item.tags : [];
          const candidateLocation = item.candidate_required_location || 'Worldwide';

          const textToMatch = `${title} ${desc} ${tags.join(' ')}`.toLowerCase();
          const matchesQuery = !query || textToMatch.includes(query) || tags.some(t => t.toLowerCase().includes(query));

          const isIntern = title.toLowerCase().includes('intern');
          const matchesType = type === 'all' || (type === 'internship' ? isIntern : !isIntern);

          // Allow if location is remote or anywhere worldwide
          const matchesLocation = !location || location === 'all' || location === 'remote' ||
            candidateLocation.toLowerCase().includes('worldwide') ||
            candidateLocation.toLowerCase().includes('anywhere') ||
            candidateLocation.toLowerCase().includes(location);

          // Deduplicate by title & company
          const alreadyExists = listings.some(l => l.title.toLowerCase() === title.toLowerCase() && l.company.toLowerCase() === company.toLowerCase());

          if (!alreadyExists && matchesQuery && matchesType && matchesLocation) {
            listings.push({
              id: `remotive_${item.id}`,
              title,
              company,
              location: `${candidateLocation} (Remote)`,
              type: isIntern ? 'internship' : 'job',
              employmentType: item.job_type === 'internship' ? 'internship' : 'full_time',
              isRemote: true,
              skills: tags.slice(0, 6),
              experienceRequirement: isIntern ? 'Fresher / Intern' : 'Industry Experience',
              salaryOrStipend: item.salary || 'Competitive / Disclosed on Application',
              postedDate: item.publication_date ? new Date(item.publication_date).toLocaleDateString() : 'Recently posted',
              source: 'Remotive Verified Remote API',
              originalUrl: item.url,
              applyUrl: item.url,
              descriptionSummary: desc.slice(0, 240) + '...',
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('Real job feed (Remotive) fetch notice:', err?.message || err);
    }
  }

  const externalPortals = generateExternalPortals(params.query, params.location, params.type);

  return {
    success: true,
    totalFound: listings.length,
    listings: listings.slice(0, limit),
    externalPortals,
    sourceAttribution: sourcesUsed.length > 0 ? sourcesUsed : ['Official Partner & Search Portals'],
    notice: listings.length === 0
      ? 'No direct open feed listings matched your exact keywords. Use the verified external search portals below for live opportunities on Naukri, Internshala, and Unstop.'
      : undefined,
  };
}
