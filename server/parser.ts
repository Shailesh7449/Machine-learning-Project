import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { cleanText } from './nlp.js';
import type {
  PersonalInfo,
  EducationEntry,
  ExperienceEntry,
  InternshipEntry,
  ProjectEntry,
  FormattingFlags,
  ParsedSections,
  ResumeSectionItem,
  SectionKey,
} from '../src/types/index.js';

export type { PersonalInfo, EducationEntry, ExperienceEntry, InternshipEntry, ProjectEntry, FormattingFlags, ParsedSections };

/**
 * Robust document text extraction for PDF & DOCX
 */
export async function extractDocumentText(buffer: Buffer, mimetype: string, originalname: string): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Uploaded file is empty. Please attach a valid PDF or DOCX file.');
  }

  const ext = (originalname || '').toLowerCase().split('.').pop() || '';

  if (mimetype.includes('pdf') || ext === 'pdf') {
    try {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      await parser.destroy();
      if (textResult && textResult.text && textResult.text.trim().length > 30) {
        return cleanText(textResult.text);
      }
      throw new Error('This PDF appears to be a scanned image or contains non-extractable text. Please upload a standard text-based PDF or DOCX file.');
    } catch (err: any) {
      // Fallback: Attempt simple ASCII string extraction if binary stream permits
      const asciiMatch = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
      const candidateLines = asciiMatch.split('\n').filter(l => l.trim().length > 10 && /[a-zA-Z]{3,}/.test(l));
      if (candidateLines.length > 5) {
        return cleanText(candidateLines.join('\n'));
      }
      throw new Error(err?.message || 'Failed to extract text from PDF file. Ensure the PDF contains searchable text.');
    }
  }

  if (mimetype.includes('word') || mimetype.includes('officedocument') || ext === 'docx') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return cleanText(result.value);
      }
      throw new Error('The DOCX file has no readable text content.');
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to parse DOCX file format.');
    }
  }

  // Plain text fallback
  const text = buffer.toString('utf-8');
  if (text.trim().length > 0) {
    return cleanText(text);
  }

  throw new Error('Unsupported or empty file type. Please upload a PDF or DOCX file.');
}

/**
 * Regex-based Information Extraction for Personal Details
 */
export function extractPersonalInfo(text: string): PersonalInfo {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : 'Not detected';

  // Phone (supporting international and Indian +91 formats)
  const phoneMatch = text.match(/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  const phone = phoneMatch ? phoneMatch[0] : 'Not detected';

  // LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i) ||
                        text.match(/linkedin:\s*(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/)?([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : (text.toLowerCase().includes('linkedin') ? 'LinkedIn profile detected' : 'Not detected');

  // GitHub
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i) ||
                      text.match(/github:\s*(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? `github.com/${githubMatch[1]}` : (text.toLowerCase().includes('github') ? 'GitHub profile detected' : 'Not detected');

  // Portfolio
  const portfolioMatch = text.match(/https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|me|io|com|org|app|in|tech)[^\s]*)/i);
  let portfolio = 'Not detected';
  if (portfolioMatch && !portfolioMatch[0].includes('linkedin') && !portfolioMatch[0].includes('github')) {
    portfolio = portfolioMatch[0];
  }

  // Location (e.g., "Bengaluru, Karnataka", "Hyderabad, India", "Pune, MH", "San Francisco, CA")
  const locationMatch = text.match(/\b([A-Z][a-zA-Z\s]+,\s*(?:India|Karnataka|Maharashtra|Telangana|Tamil Nadu|Delhi|[A-Z]{2}|[A-Z][a-zA-Z]+))\b/i);
  const location = locationMatch ? locationMatch[1].trim() : 'Not detected';

  // Candidate Name: first 1-4 lines usually contain candidate's name
  let name = 'Not detected';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (!line.includes('@') && !line.includes('http') && !line.match(/\d{3}/) && line.length < 40 && line.length > 2) {
      if (/^[A-Za-z][a-zA-Z.'-]+(\s+[A-Za-z][a-zA-Z.'-]+){1,3}$/.test(line)) {
        name = line;
        break;
      }
    }
  }
  if (name === 'Not detected' && lines.length > 0) {
    const firstLine = lines[0].replace(/[^a-zA-Z\s]/g, '').trim();
    if (firstLine.split(/\s+/).length >= 2 && firstLine.length < 35) {
      name = firstLine;
    }
  }

  return { name, email, phone, location, linkedin, github, portfolio };
}

/**
 * Segmentation into standard ATS Resume Sections (15 Canonical Sections)
 */
export function segmentResumeSections(text: string): ParsedSections {
  const lines = text.split('\n');
  const personal = extractPersonalInfo(text);

  const sectionDefinitions: {
    key: SectionKey;
    title: string;
    regex: RegExp;
  }[] = [
    {
      key: 'summary',
      title: 'Professional Summary',
      regex: /^(summary|professional summary|executive summary|about me|career objective|profile summary|profile|objective)\b/i,
    },
    {
      key: 'education',
      title: 'Education',
      regex: /^(education|academic background|academics|qualifications|academic history|educational qualifications)\b/i,
    },
    {
      key: 'technical_skills',
      title: 'Technical Skills',
      regex: /^(technical skills|technologies|core competencies|programming skills|skills & tools|technical proficiencies|tech stack|key skills|skills)\b/i,
    },
    {
      key: 'soft_skills',
      title: 'Soft Skills & Competencies',
      regex: /^(soft skills|interpersonal skills|key attributes|behavioral competencies|core strengths)\b/i,
    },
    {
      key: 'internships',
      title: 'Internships',
      regex: /^(internships|internship experience|summer internships|industrial training|trainee experience)\b/i,
    },
    {
      key: 'work_experience',
      title: 'Work Experience',
      regex: /^(experience|work experience|employment history|professional experience|work history|industry experience)\b/i,
    },
    {
      key: 'projects',
      title: 'Academic & Personal Projects',
      regex: /^(projects|academic projects|technical projects|key projects|personal projects|notable projects)\b/i,
    },
    {
      key: 'certifications',
      title: 'Certifications',
      regex: /^(certifications|licenses|certifications & licenses|credentials|professional certifications)\b/i,
    },
    {
      key: 'achievements',
      title: 'Achievements & Awards',
      regex: /^(achievements|honors|awards|accomplishments|accolades|honors & awards|achievements & awards)\b/i,
    },
    {
      key: 'publications',
      title: 'Publications & Research',
      regex: /^(publications|research papers|patents|published works|conference papers|research)\b/i,
    },
    {
      key: 'extracurricular',
      title: 'Leadership & Extracurricular',
      regex: /^(leadership|extracurricular activities|volunteering|positions of responsibility|co-curricular activities|community involvement)\b/i,
    },
    {
      key: 'languages',
      title: 'Languages',
      regex: /^(languages|languages known|language proficiency)\b/i,
    },
    {
      key: 'courses',
      title: 'Courses & Training',
      regex: /^(courses|training|workshops|online courses|coursework|relevant coursework)\b/i,
    },
  ];

  const sections: Record<string, string[]> = {
    contact_info: [],
    summary: [],
    education: [],
    technical_skills: [],
    soft_skills: [],
    internships: [],
    work_experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    publications: [],
    extracurricular: [],
    languages: [],
    courses: [],
    unclassified: [],
  };

  let currentSection = 'contact_info';
  let hasFoundFirstHeader = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let matchedHeaderKey: SectionKey | null = null;
    if (line.length < 50) {
      for (const def of sectionDefinitions) {
        if (def.regex.test(line)) {
          matchedHeaderKey = def.key;
          break;
        }
      }
    }

    if (matchedHeaderKey) {
      currentSection = matchedHeaderKey;
      hasFoundFirstHeader = true;
    } else {
      if (!hasFoundFirstHeader && line.length > 80) {
        // High likelihood of an early summary paragraph before any header
        currentSection = 'summary';
      }
      sections[currentSection].push(line);
    }
  }

  // Parse Education Entries
  const educationEntries: EducationEntry[] = [];
  const eduLines = sections.education;
  for (let i = 0; i < eduLines.length; i++) {
    const l = eduLines[i];
    const degreeMatch = l.match(/\b(B\.?S\.?|B\.?Tech|B\.?E\.?|M\.?S\.?|M\.?Tech|BCA|MCA|B\.?Sc|M\.?Sc|Bachelor|Master|Ph\.?D\.?|Associate|Diploma)\b[^\n,.]*/i);
    const yearMatch = l.match(/\b(19\d{2}|20\d{2})(?:\s*[-–]\s*(?:19\d{2}|20\d{2}|Present))?\b/i);
    const gpaMatch = l.match(/\b(GPA|CGPA|Percentage|Score)?\s*:?\s*(\d+(\.\d+)?(\/\d+(\.\d+)?)?%?)\b/i);

    if (degreeMatch || yearMatch || l.toLowerCase().includes('university') || l.toLowerCase().includes('college') || l.toLowerCase().includes('institute')) {
      const parts = l.split(/[-|–]/).map(p => p.trim());
      educationEntries.push({
        degree: degreeMatch ? degreeMatch[0] : parts[0] || 'Degree / Program',
        institution: l.replace(/\b(19\d{2}|20\d{2}).*$/i, '').replace(/GPA.*$/i, '').replace(/CGPA.*$/i, '').trim() || 'University / Institution',
        year: yearMatch ? yearMatch[0] : 'Not detected',
        grade: gpaMatch ? gpaMatch[0] : 'Not detected',
      });
    }
  }

  // Helper parser for Experience and Internships
  const parseExperienceLines = (expLines: string[]): ExperienceEntry[] => {
    const entries: ExperienceEntry[] = [];
    let curExp: ExperienceEntry | null = null;

    for (const l of expLines) {
      const isHeaderLine = l.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|\d{4}\s*[-–]\s*(?:\d{4}|Present))\b/i) ||
        l.includes('|') ||
        (l.length < 65 && !l.startsWith('-') && !l.startsWith('•') && !l.startsWith('*'));

      if (isHeaderLine && (l.includes('-') || l.includes('|') || l.includes('–') || l.match(/\d{4}/))) {
        if (curExp) entries.push(curExp);
        const parts = l.split(/[-|–]/).map(p => p.trim());
        curExp = {
          role: parts[0] || 'Software Professional',
          company: parts[1] || 'Company / Organization',
          duration: parts.slice(2).join(' ') || 'Not detected',
          highlights: [],
        };
      } else if (curExp) {
        if (l.startsWith('-') || l.startsWith('•') || l.startsWith('*') || l.length > 20) {
          curExp.highlights.push(l.replace(/^[-•*]\s*/, ''));
        }
      }
    }
    if (curExp) entries.push(curExp);
    return entries;
  };

  const experienceEntries: ExperienceEntry[] = parseExperienceLines(sections.work_experience);
  const internshipEntries: InternshipEntry[] = parseExperienceLines(sections.internships).map(e => ({
    company: e.company,
    role: e.role,
    duration: e.duration,
    highlights: e.highlights,
  }));

  // Parse Projects
  const projectEntries: ProjectEntry[] = [];
  const projLines = sections.projects;
  let curProj: ProjectEntry | null = null;

  for (const l of projLines) {
    if ((l.startsWith('-') || l.startsWith('•')) && curProj) {
      curProj.description += (curProj.description ? ' ' : '') + l.replace(/^[-•*]\s*/, '');
    } else if (l.length < 65 && !l.startsWith('-') && !l.startsWith('•')) {
      if (curProj) projectEntries.push(curProj);
      // Look for technologies enclosed in parentheses or brackets e.g. (React, Node.js)
      const techMatch = l.match(/\(([^)]+)\)|\[([^\]]+)\]/);
      const technologies = techMatch ? (techMatch[1] || techMatch[2]).split(',').map(t => t.trim()) : [];
      curProj = {
        name: l.replace(/\([^)]+\)|\[[^\]]+\]/g, '').trim(),
        technologies,
        description: '',
      };
    } else if (curProj) {
      curProj.description += (curProj.description ? ' ' : '') + l;
    }
  }
  if (curProj) projectEntries.push(curProj);

  // Formatting Flags
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const formattingFlags: FormattingFlags = {
    hasTabularFormatting: text.includes('\t\t') || (text.match(/\|\s*\|/g) || []).length > 3,
    hasExcessiveSpecialChars: (text.match(/[■▲►▪◆●]/g) || []).length > 8,
    hasVeryLongLines: lines.some(l => l.length > 180),
    hasPossibleTwoColumns: lines.some(l => l.split(/\s{4,}/).length >= 3),
    pageCountEstimate: Math.max(1, Math.ceil(wordCount / 450)),
    wordCount,
  };

  // Compile the 15 ResumeSectionItem array for independent section editing
  const sectionMeta: { key: SectionKey; title: string; defaultConfidence: number }[] = [
    { key: 'contact_info', title: 'Contact Information', defaultConfidence: personal.name !== 'Not detected' ? 95 : 60 },
    { key: 'summary', title: 'Professional Summary / Objective', defaultConfidence: sections.summary.length > 0 ? 90 : 40 },
    { key: 'education', title: 'Education', defaultConfidence: educationEntries.length > 0 ? 95 : 30 },
    { key: 'technical_skills', title: 'Technical Skills', defaultConfidence: sections.technical_skills.length > 0 ? 95 : 40 },
    { key: 'soft_skills', title: 'Soft Skills & Competencies', defaultConfidence: sections.soft_skills.length > 0 ? 85 : 50 },
    { key: 'work_experience', title: 'Work Experience', defaultConfidence: experienceEntries.length > 0 ? 95 : 40 },
    { key: 'internships', title: 'Internships', defaultConfidence: internshipEntries.length > 0 ? 90 : 50 },
    { key: 'projects', title: 'Academic & Personal Projects', defaultConfidence: projectEntries.length > 0 ? 92 : 40 },
    { key: 'certifications', title: 'Certifications & Licenses', defaultConfidence: sections.certifications.length > 0 ? 90 : 50 },
    { key: 'achievements', title: 'Achievements & Awards', defaultConfidence: sections.achievements.length > 0 ? 88 : 50 },
    { key: 'publications', title: 'Publications & Research', defaultConfidence: sections.publications.length > 0 ? 88 : 50 },
    { key: 'extracurricular', title: 'Leadership & Extracurricular Activities', defaultConfidence: sections.extracurricular.length > 0 ? 85 : 50 },
    { key: 'languages', title: 'Languages', defaultConfidence: sections.languages.length > 0 ? 90 : 50 },
    { key: 'courses', title: 'Courses & Training', defaultConfidence: sections.courses.length > 0 ? 85 : 50 },
    { key: 'unclassified', title: 'Other & Unclassified Content', defaultConfidence: sections.unclassified.length > 0 ? 60 : 100 },
  ];

  const sectionsList: ResumeSectionItem[] = sectionMeta.map(meta => {
    let contentLines: string[] = sections[meta.key] || [];
    if (meta.key === 'contact_info') {
      contentLines = [
        `Name: ${personal.name}`,
        `Email: ${personal.email}`,
        `Phone: ${personal.phone}`,
        `Location: ${personal.location}`,
        `LinkedIn: ${personal.linkedin}`,
        `GitHub: ${personal.github}`,
        `Portfolio: ${personal.portfolio}`,
      ];
    }

    const rawSectionText = contentLines.join('\n');
    const warnings: string[] = [];

    if (rawSectionText.trim().length === 0 && ['summary', 'education', 'technical_skills', 'work_experience'].includes(meta.key)) {
      warnings.push(`Section not detected in uploaded resume. Highly recommended for ATS screening.`);
    }
    if (meta.key === 'work_experience' && experienceEntries.some(e => e.highlights.length === 0)) {
      warnings.push(`Some work experience entries lack bullet points or quantifiable impact.`);
    }
    if (meta.key === 'education' && educationEntries.some(e => e.year === 'Not detected')) {
      warnings.push(`Graduation year not detected for one or more academic entries.`);
    }

    return {
      id: `sec_${meta.key}`,
      key: meta.key,
      title: meta.title,
      originalText: rawSectionText,
      currentText: rawSectionText,
      confidence: rawSectionText.trim().length > 0 ? meta.defaultConfidence : 30,
      isReviewed: false,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  });

  return {
    rawText: text,
    personal,
    summary: sections.summary.join(' ').trim() || 'Not detected',
    education: educationEntries,
    experience: experienceEntries,
    internships: internshipEntries,
    projects: projectEntries,
    technicalSkills: sections.technical_skills,
    softSkills: sections.soft_skills,
    skillsText: [...sections.technical_skills, ...sections.soft_skills].join(', '),
    certifications: sections.certifications,
    achievements: sections.achievements,
    publications: sections.publications,
    extracurricular: sections.extracurricular,
    languages: sections.languages,
    courses: sections.courses,
    unclassified: sections.unclassified,
    sectionsList,
    formattingFlags,
  };
}
