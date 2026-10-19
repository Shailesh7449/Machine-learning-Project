import { CanonicalSkill, extractAllTaxonomySkills, SKILL_TAXONOMY } from './taxonomy.js';
import { ParsedSections } from './parser.js';
import {
  tokenize,
  computeTF,
  computeCosineSimilarity,
  computeJaccardSimilarity,
} from './nlp.js';

export interface ParsedJobDescription {
  rawText: string;
  detectedRole: string;
  requiredSkills: CanonicalSkill[];
  experienceRequiredYears: number;
  educationRequired: string;
  keyResponsibilities: string[];
  importantKeywords: string[];
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

/**
 * Parses and extracts structured features from raw Job Description text
 */
export function parseJobDescription(jdText: string): ParsedJobDescription {
  const { matchedSkills } = extractAllTaxonomySkills(jdText);

  // Detect experience requirement (e.g., "3+ years", "5-7 years of experience")
  const expMatch = jdText.match(/(\d+)\+?\s*(?:-\s*(\d+))?\s*(?:years|yrs)\b(?:[^\n.]*experience)?/i);
  let expYears = 0;
  if (expMatch) {
    expYears = parseInt(expMatch[1], 10);
  }

  // Detect education requirement
  let educationRequired = 'Bachelor\'s Degree in Computer Science, Engineering, or related field';
  if (/ph\.?d/i.test(jdText)) {
    educationRequired = 'Ph.D. in Computer Science or quantitative field preferred';
  } else if (/master|m\.?s/i.test(jdText)) {
    educationRequired = 'Master\'s or Bachelor\'s Degree in STEM or relevant field';
  }

  // Detect job role title from initial lines
  const lines = jdText.split('\n').map(l => l.trim()).filter(Boolean);
  let detectedRole = 'Target Software / Data Role';
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const l = lines[i];
    if (/(engineer|developer|scientist|analyst|architect|manager|specialist|designer)/i.test(l) && l.length < 60) {
      detectedRole = l.replace(/^(Job Title|Position|Role|About the role):\s*/i, '');
      break;
    }
  }

  // Extract key responsibilities lines
  const responsibilityLines = lines.filter(l =>
    (l.startsWith('•') || l.startsWith('-') || l.startsWith('*')) &&
    l.length > 25 &&
    !/(apply|salary|benefits|equal opportunity)/i.test(l)
  ).slice(0, 6);

  // Important non-stopword tokens
  const jdTokens = tokenize(jdText, true);
  const tf = computeTF(jdTokens);
  const importantKeywords = Object.entries(tf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w]) => w);

  return {
    rawText: jdText,
    detectedRole,
    requiredSkills: matchedSkills,
    experienceRequiredYears: expYears,
    educationRequired,
    keyResponsibilities: responsibilityLines,
    importantKeywords,
  };
}

/**
 * Computes Multi-Dimensional Match between Resume and Job Description
 */
export function matchResumeWithJob(
  resumeParsed: ParsedSections,
  resumeSkills: CanonicalSkill[],
  jdText: string
): JobMatchResult {
  const jdParsed = parseJobDescription(jdText);

  // 1. Skill Matching
  const resumeSkillSet = new Set(resumeSkills.map(s => s.id));
  const resumeCategories = new Set(resumeSkills.map(s => s.category));

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];
  const partialSkills: string[] = [];
  const skillGapList: SkillGapItem[] = [];

  for (const jdSkill of jdParsed.requiredSkills) {
    if (resumeSkillSet.has(jdSkill.id)) {
      matchingSkills.push(jdSkill.name);
      skillGapList.push({
        skillName: jdSkill.name,
        category: jdSkill.category,
        priority: 'Low',
        reason: 'Skill is already present and matches the job requirements.',
        status: 'matched',
      });
    } else if (resumeCategories.has(jdSkill.category)) {
      // User has skills in the same category (e.g. knows React but JD asks for Vue)
      partialSkills.push(jdSkill.name);
      skillGapList.push({
        skillName: jdSkill.name,
        category: jdSkill.category,
        priority: jdSkill.weight >= 1.0 ? 'High' : 'Medium',
        reason: `Related experience in ${jdSkill.category.replace('_', ' ')} detected; proficiency in ${jdSkill.name} will bridge the candidate gap.`,
        status: 'partial',
      });
    } else {
      missingSkills.push(jdSkill.name);
      skillGapList.push({
        skillName: jdSkill.name,
        category: jdSkill.category,
        priority: jdSkill.weight >= 1.0 ? 'High' : 'Medium',
        reason: `Essential requirement for this role. Adding projects or practical experience with ${jdSkill.name} will significantly improve interview callbacks.`,
        status: 'missing',
      });
    }
  }

  // Calculate skill match percentage
  const totalJdSkills = jdParsed.requiredSkills.length || 1;
  const rawSkillScore = Math.round(((matchingSkills.length + partialSkills.length * 0.5) / totalJdSkills) * 100);
  const skillMatchScore = Math.min(100, Math.max(0, rawSkillScore));

  // 2. Semantic Cosine Similarity (TF-IDF Vector Space Model)
  const resumeTokens = tokenize(resumeParsed.rawText, true);
  const jdTokens = tokenize(jdText, true);
  const resumeTF = computeTF(resumeTokens);
  const jdTF = computeTF(jdTokens);
  const cosineSim = computeCosineSimilarity(resumeTF, jdTF);
  const semanticSimilarityScore = Math.round(cosineSim * 100);

  // 3. Keyword Match
  const resumeTokenSet = new Set(resumeTokens);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jdParsed.importantKeywords) {
    if (resumeTokenSet.has(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }
  const keywordMatchScore = Math.round((matchedKeywords.length / (jdParsed.importantKeywords.length || 1)) * 100);

  // 4. Experience & Education Match
  let expScore = 80;
  if (jdParsed.experienceRequiredYears > 0) {
    const resumeYearsEst = Math.min(10, Math.max(1, resumeParsed.experience.length * 1.8));
    if (resumeYearsEst >= jdParsed.experienceRequiredYears) {
      expScore = 95;
    } else {
      expScore = Math.round((resumeYearsEst / jdParsed.experienceRequiredYears) * 80);
    }
  }

  let eduScore = 85;
  if (resumeParsed.education.length > 0) {
    eduScore = 95;
  }

  // Weighted Overall Compatibility
  // 35% Skills + 25% Semantic Cosine + 20% Keywords + 10% Experience + 10% Education
  const overall = Math.round(
    (skillMatchScore * 0.35) +
    (semanticSimilarityScore * 0.25) +
    (keywordMatchScore * 0.20) +
    (expScore * 0.10) +
    (eduScore * 0.10)
  );

  return {
    overallMatchScore: Math.min(99, Math.max(20, overall)),
    semanticSimilarityScore,
    keywordMatchScore,
    skillMatchScore,
    experienceMatchScore: expScore,
    educationMatchScore: eduScore,
    matchingSkills,
    missingSkills,
    partialSkills,
    skillGapList,
    detectedJobRole: jdParsed.detectedRole,
    experienceRequirementSummary: jdParsed.experienceRequiredYears > 0
      ? `${jdParsed.experienceRequiredYears}+ years professional experience required`
      : 'Open experience level / not strictly specified',
    educationRequirementSummary: jdParsed.educationRequired,
    keywordBreakdown: {
      matchedKeywords: matchedKeywords.slice(0, 10),
      missingKeywords: missingKeywords.slice(0, 10),
    },
  };
}
