import { ParsedSections } from './parser.js';
import { CanonicalSkill } from './taxonomy.js';
import {
  tokenize,
  computeReadability,
  detectQuantifiableMetrics,
  analyzeActionVerbs,
  detectKeywordStuffing,
} from './nlp.js';

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

export interface AtsScoringWeights {
  structure: number;        // default 15
  keywords: number;         // default 20
  skillsMatch: number;      // default 20
  experience: number;       // default 15
  achievements: number;     // default 10
  formatting: number;       // default 10
  essentialInfo: number;    // default 5
  jobAlignment: number;     // default 5
}

export const DEFAULT_WEIGHTS: AtsScoringWeights = {
  structure: 15,
  keywords: 20,
  skillsMatch: 20,
  experience: 15,
  achievements: 10,
  formatting: 10,
  essentialInfo: 5,
  jobAlignment: 5,
};

export function calculateAtsScore(
  parsed: ParsedSections,
  matchedSkills: CanonicalSkill[],
  jdAlignmentScore: number = 4.0, // default if no JD provided (scale 0-5)
  weights: AtsScoringWeights = DEFAULT_WEIGHTS
): AtsScoreResult {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  const rawText = parsed.rawText;
  const tokens = tokenize(rawText, true);
  const readability = computeReadability(rawText);
  const metrics = detectQuantifiableMetrics(rawText);
  const verbs = analyzeActionVerbs(rawText);
  const stuffing = detectKeywordStuffing(tokens);

  // 1. Structure (15 pts)
  let rawStructure = 0;
  if (parsed.summary && parsed.summary !== 'Not detected' && parsed.summary.length > 20) rawStructure += 3;
  if (parsed.education && parsed.education.length > 0) rawStructure += 3;
  if (parsed.experience && parsed.experience.length > 0) rawStructure += 3;
  if (matchedSkills.length > 0) rawStructure += 3;
  if ((parsed.projects && parsed.projects.length > 0) || (parsed.certifications && parsed.certifications.length > 0)) rawStructure += 3;
  
  const structureScore = Math.min(weights.structure, Math.round((rawStructure / 15) * weights.structure));
  if (structureScore >= 12) {
    strengths.push('Complete standard ATS resume sections (Experience, Education, Skills, and Projects).');
  } else {
    weaknesses.push('Missing essential ATS section headings (e.g., dedicated Summary, Experience, or Projects).');
    recommendations.push('Organize your resume with explicit standard headings: "Professional Summary", "Work Experience", "Education", "Technical Skills", and "Key Projects".');
  }

  // 2. Keyword Optimization (20 pts)
  let rawKeywords = 0;
  // Action verbs (up to 8 pts)
  rawKeywords += Math.min(8, Math.round((verbs.count / 8) * 8));
  // Tech term richness (up to 8 pts)
  rawKeywords += Math.min(8, Math.round((matchedSkills.length / 10) * 8));
  // Not keyword stuffing (4 pts)
  if (!stuffing.isStuffingDetected) {
    rawKeywords += 4;
  } else {
    rawKeywords += 1;
    weaknesses.push('Repetitive keywords detected, which can trigger ATS keyword-stuffing penalties.');
    recommendations.push('Reduce unnatural repetitions of identical terms; contextualize them within project achievements instead.');
  }

  const keywordScore = Math.min(weights.keywords, Math.round((rawKeywords / 20) * weights.keywords));
  if (verbs.count >= 8) {
    strengths.push(`Rich use of impactful action verbs (${verbs.detectedVerbs.slice(0, 4).join(', ')}, etc.).`);
  } else {
    recommendations.push('Begin each bullet point with strong action verbs (e.g., "Engineered", "Optimized", "Architected", "Automated").');
  }

  // 3. Skills Match (20 pts)
  // Evaluates skill count and diversity across categories
  const skillCount = matchedSkills.length;
  let rawSkills = 0;
  if (skillCount >= 14) rawSkills = 20;
  else if (skillCount >= 10) rawSkills = 17;
  else if (skillCount >= 6) rawSkills = 14;
  else if (skillCount >= 3) rawSkills = 9;
  else rawSkills = 5;

  const skillsMatchScore = Math.min(weights.skillsMatch, Math.round((rawSkills / 20) * weights.skillsMatch));
  if (skillCount >= 10) {
    strengths.push(`Strong technical skill catalog with ${skillCount} recognized domain competencies.`);
  } else {
    weaknesses.push('Limited explicit skill catalog detected.');
    recommendations.push('Add an categorized Technical Skills section grouped by Languages, Frameworks, Cloud, Databases, and Developer Tools.');
  }

  // 4. Experience Relevance (15 pts)
  let rawExp = 0;
  const expCount = parsed.experience.length;
  if (expCount >= 3) rawExp += 7;
  else if (expCount >= 1) rawExp += 5;
  else rawExp += 2;

  // Check bullet point detail
  const allHighlights = parsed.experience.flatMap(e => e.highlights);
  if (allHighlights.length >= 6) rawExp += 8;
  else if (allHighlights.length >= 3) rawExp += 5;
  else rawExp += 2;

  const experienceScore = Math.min(weights.experience, Math.round((rawExp / 15) * weights.experience));
  if (allHighlights.length >= 4) {
    strengths.push('Detailed bullet points illustrating roles and career contributions.');
  } else {
    recommendations.push('Expand each work experience entry with 3-4 bullet points following the "Accomplished [X] as measured by [Y], by doing [Z]" format.');
  }

  // 5. Quantifiable Achievements (10 pts)
  let rawAchievements = 0;
  if (metrics.count >= 5) rawAchievements = 10;
  else if (metrics.count >= 3) rawAchievements = 8;
  else if (metrics.count >= 1) rawAchievements = 5;
  else rawAchievements = 2;

  const achievementsScore = Math.min(weights.achievements, Math.round((rawAchievements / 10) * weights.achievements));
  if (metrics.count >= 3) {
    strengths.push(`High metric density: ${metrics.count} quantifiable business outcomes/KPIs found.`);
  } else {
    weaknesses.push('Few quantifiable metrics (percentages, speedups, cost savings, user counts) detected.');
    recommendations.push('Include measurable outcomes such as "reduced latency by 35%", "scaled API to 10k+ requests/sec", or "improved accuracy by 14%".');
  }

  // 6. Formatting & Readability (10 pts)
  let rawFormatting = 10;
  if (parsed.formattingFlags.hasTabularFormatting) rawFormatting -= 3;
  if (parsed.formattingFlags.hasExcessiveSpecialChars) rawFormatting -= 2;
  if (parsed.formattingFlags.hasPossibleTwoColumns) rawFormatting -= 2;
  if (readability.wordCount < 250 || readability.wordCount > 1200) rawFormatting -= 2;

  const formattingScore = Math.max(2, Math.min(weights.formatting, Math.round((rawFormatting / 10) * weights.formatting)));
  if (rawFormatting >= 8) {
    strengths.push('Clean ATS-friendly plain text flow, free of risky parser-breaking columns or tables.');
  } else {
    if (parsed.formattingFlags.hasPossibleTwoColumns) {
      weaknesses.push('Multi-column layout or excessive tab characters detected; standard ATS engines parse horizontally and may merge columns.');
      recommendations.push('Use a single-column linear layout to guarantee error-free ATS document flow.');
    }
    if (readability.wordCount < 300) {
      recommendations.push(`Resume word count is low (${readability.wordCount} words). Aim for 450-750 words for optimal 1-page density.`);
    }
  }

  // 7. Contact / Essential Info (5 pts)
  let rawContact = 0;
  if (parsed.personal.name !== 'Not detected') rawContact += 1;
  if (parsed.personal.email !== 'Not detected') rawContact += 1.5;
  if (parsed.personal.phone !== 'Not detected') rawContact += 1;
  if (parsed.personal.linkedin !== 'Not detected' || parsed.personal.github !== 'Not detected') rawContact += 1.5;

  const essentialScore = Math.min(weights.essentialInfo, Math.round((rawContact / 5) * weights.essentialInfo));
  if (parsed.personal.email === 'Not detected' || parsed.personal.phone === 'Not detected') {
    weaknesses.push('Missing direct contact details (Email or Phone number not cleanly detected).');
    recommendations.push('Ensure your phone number, email address, and LinkedIn profile are placed prominently at the very top.');
  } else {
    strengths.push('Complete, easily discoverable contact information with professional online profiles.');
  }

  // 8. Job Description Alignment (5 pts)
  const jobAlignmentScore = Math.min(weights.jobAlignment, Math.round(jdAlignmentScore));

  const totalScore = structureScore + keywordScore + skillsMatchScore + experienceScore + achievementsScore + formattingScore + essentialScore + jobAlignmentScore;

  return {
    overallScore: Math.min(100, Math.max(0, totalScore)),
    categoryScores: {
      structure: {
        category: 'structure',
        name: 'Resume Structure',
        score: structureScore,
        maxScore: weights.structure,
        weight: weights.structure,
        percentage: Math.round((structureScore / weights.structure) * 100),
        feedback: structureScore >= 12 ? 'Excellent section organization' : 'Missing standard section blocks',
      },
      keywords: {
        category: 'keywords',
        name: 'Keyword Optimization',
        score: keywordScore,
        maxScore: weights.keywords,
        weight: weights.keywords,
        percentage: Math.round((keywordScore / weights.keywords) * 100),
        feedback: keywordScore >= 15 ? 'Strong action verb & domain density' : 'Needs more domain-specific terminology',
      },
      skillsMatch: {
        category: 'skillsMatch',
        name: 'Skills Catalog & Depth',
        score: skillsMatchScore,
        maxScore: weights.skillsMatch,
        weight: weights.skillsMatch,
        percentage: Math.round((skillsMatchScore / weights.skillsMatch) * 100),
        feedback: skillsMatchScore >= 16 ? 'Broad technical breadth' : 'Skill breadth can be expanded',
      },
      experience: {
        category: 'experience',
        name: 'Experience Relevance',
        score: experienceScore,
        maxScore: weights.experience,
        weight: weights.experience,
        percentage: Math.round((experienceScore / weights.experience) * 100),
        feedback: experienceScore >= 12 ? 'Well articulated career timeline' : 'Bullet points lack elaboration',
      },
      achievements: {
        category: 'achievements',
        name: 'Quantifiable Achievements',
        score: achievementsScore,
        maxScore: weights.achievements,
        weight: weights.achievements,
        percentage: Math.round((achievementsScore / weights.achievements) * 100),
        feedback: achievementsScore >= 7 ? 'Clear metrics and business results' : 'Lacks concrete numbers or KPIs',
      },
      formatting: {
        category: 'formatting',
        name: 'Formatting & Readability',
        score: formattingScore,
        maxScore: weights.formatting,
        weight: weights.formatting,
        percentage: Math.round((formattingScore / weights.formatting) * 100),
        feedback: formattingScore >= 8 ? 'ATS-safe layout & length' : 'Formatting may hinder parsing',
      },
      essentialInfo: {
        category: 'essentialInfo',
        name: 'Essential Contact Info',
        score: essentialScore,
        maxScore: weights.essentialInfo,
        weight: weights.essentialInfo,
        percentage: Math.round((essentialScore / weights.essentialInfo) * 100),
        feedback: essentialScore >= 4 ? 'All key links detected' : 'Check email or phone formatting',
      },
      jobAlignment: {
        category: 'jobAlignment',
        name: 'Job Description Alignment',
        score: jobAlignmentScore,
        maxScore: weights.jobAlignment,
        weight: weights.jobAlignment,
        percentage: Math.round((jobAlignmentScore / weights.jobAlignment) * 100),
        feedback: jobAlignmentScore >= 4 ? 'Solid alignment with target role' : 'Provide a job description to tailor match',
      },
    },
    strengths,
    weaknesses,
    recommendations,
    readability: {
      readingEase: readability.readingEase,
      gradeLevel: readability.gradeLevel,
      wordCount: readability.wordCount,
      interpretation: readability.interpretation,
    },
  };
}
