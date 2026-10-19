export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  grade: string;
  specialization?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  location?: string;
  highlights: string[];
}

export interface InternshipEntry {
  company: string;
  role: string;
  duration: string;
  location?: string;
  highlights: string[];
}

export interface ProjectEntry {
  name: string;
  technologies: string[];
  description: string;
  link?: string;
}

export interface FormattingFlags {
  hasTabularFormatting: boolean;
  hasExcessiveSpecialChars: boolean;
  hasVeryLongLines: boolean;
  hasPossibleTwoColumns: boolean;
  pageCountEstimate: number;
  wordCount: number;
}

export type SectionKey =
  | 'contact_info'
  | 'summary'
  | 'education'
  | 'technical_skills'
  | 'soft_skills'
  | 'work_experience'
  | 'internships'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'publications'
  | 'extracurricular'
  | 'languages'
  | 'courses'
  | 'unclassified';

export interface ResumeSectionItem {
  id: string;
  key: SectionKey;
  title: string;
  originalText: string;
  currentText: string;
  confidence: number; // 0 - 100
  isReviewed: boolean;
  warnings?: string[];
  structuredData?: any;
}

export interface ParsedSections {
  rawText: string;
  personal: PersonalInfo;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  internships: InternshipEntry[];
  projects: ProjectEntry[];
  technicalSkills: string[];
  softSkills: string[];
  skillsText: string;
  certifications: string[];
  achievements: string[];
  publications: string[];
  extracurricular: string[];
  languages: string[];
  courses: string[];
  unclassified: string[];
  sectionsList: ResumeSectionItem[];
  formattingFlags: FormattingFlags;
}

export interface CanonicalSkill {
  id: string;
  name: string;
  category: 'languages' | 'frameworks' | 'databases' | 'cloud_devops' | 'data_ml' | 'tools' | 'soft_skills' | 'concepts';
  aliases: string[];
  weight: number;
}

export interface SkillCategoryGroup {
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloud_devops: string[];
  data_ml: string[];
  tools: string[];
  soft_skills: string[];
  concepts: string[];
}

export interface ScoreCategory {
  category: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  percentage: number;
  feedback: string;
}

export interface AtsScoreResult {
  overallScore: number;
  categoryScores: {
    structure: ScoreCategory;
    keywords: ScoreCategory;
    skillsMatch: ScoreCategory;
    experience: ScoreCategory;
    achievements: ScoreCategory;
    formatting: ScoreCategory;
    essentialInfo: ScoreCategory;
    jobAlignment: ScoreCategory;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  readability: {
    readingEase: number;
    gradeLevel: number;
    wordCount: number;
    interpretation: string;
  };
}

export interface SkillGapItem {
  skillName: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  status: 'missing' | 'partial' | 'matched';
}

export interface JobMatchResult {
  overallMatchScore: number;
  semanticSimilarityScore: number;
  keywordMatchScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  skillGapList: SkillGapItem[];
  detectedJobRole: string;
  experienceRequirementSummary: string;
  educationRequirementSummary: string;
  keywordBreakdown: {
    matchedKeywords: string[];
    missingKeywords: string[];
  };
}

export interface RecommendedJobRole {
  roleId: string;
  roleTitle: string;
  matchPercentage: number;
  whyFits: string;
  matchedSkills: string[];
  missingSkills: string[];
  growthOutlook: string;
  salaryRange: string;
}

export interface SectionAuditInfo {
  score: number;
  status: string;
  feedback: string;
}

export interface QualityAudit {
  readability: {
    readingEase: number;
    gradeLevel: number;
    wordCount: number;
    sentenceCount: number;
    avgSentenceLength: number;
    interpretation: string;
  };
  metrics: {
    count: number;
    examples: string[];
    densityPercentage: number;
  };
  actionVerbs: {
    detectedVerbs: string[];
    count: number;
    varietyScore: number;
  };
  stuffing: {
    isStuffingDetected: boolean;
    topRepeated: { word: string; count: number; frequency: number }[];
  };
  formattingFlags: FormattingFlags;
  sectionAnalysis: Record<string, SectionAuditInfo>;
}

export interface AnalysisResponse {
  success: boolean;
  parsedSections: ParsedSections;
  skills: {
    matchedSkills: CanonicalSkill[];
    categories: SkillCategoryGroup;
    totalCount: number;
  };
  atsScore: AtsScoreResult;
  jobMatch: JobMatchResult | null;
  jobRecommendations: RecommendedJobRole[];
  qualityAudit: QualityAudit;
  keywords: {
    topKeywords: { word: string; frequency: number }[];
    isStuffingDetected: boolean;
    repeatedTerms: { word: string; count: number; frequency: number }[];
  };
  aiEnhancement?: {
    executiveSummaryAnalysis: string;
    bulletPointRewrites: {
      original: string;
      improved: string;
      rationale: string;
    }[];
    tailoringAdvice: string[];
  } | null;
  mlInsights?: {
    predictedCategory: string;
    extractedSkillsML: string[];
  } | null;
}

export interface SampleItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'job' | 'internship';
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'internship';
  isRemote: boolean;
  skills: string[];
  experienceRequirement: string;
  salaryOrStipend?: string;
  postedDate?: string;
  source: string;
  originalUrl: string;
  applyUrl: string;
  descriptionSummary: string;
  matchScore?: number;
}

export interface ExternalSearchPortal {
  name: string;
  badge: string;
  description: string;
  searchUrl: string;
  logoColor: string;
}
