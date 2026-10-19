import { CanonicalSkill } from './taxonomy.js';
import { ParsedSections } from './parser.js';

export interface JobRoleProfile {
  id: string;
  title: string;
  description: string;
  coreSkillIds: string[];
  optionalSkillIds: string[];
  preferredDegree: string[];
  growthOutlook: string;
  averageSalaryRange: string;
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

export const ROLE_CATALOG: JobRoleProfile[] = [
  {
    id: 'ml_engineer',
    title: 'Machine Learning Engineer',
    description: 'Designs, develops, and deploys scalable machine learning pipelines, deep learning models, and production inference systems.',
    coreSkillIds: ['python', 'machine_learning', 'deep_learning', 'pytorch', 'tensorflow', 'scikit_learn', 'docker'],
    optionalSkillIds: ['pandas', 'numpy', 'nlp', 'computer_vision', 'aws', 'ci_cd', 'spark'],
    preferredDegree: ['computer science', 'data science', 'mathematics', 'statistics', 'engineering'],
    growthOutlook: 'High (32% YoY growth in AI systems engineering)',
    averageSalaryRange: '$135,000 - $185,000',
  },
  {
    id: 'data_scientist',
    title: 'Data Scientist',
    description: 'Uncovers insights from complex datasets using statistical modeling, hypothesis testing, exploratory analysis, and predictive models.',
    coreSkillIds: ['python', 'r', 'sql', 'pandas', 'numpy', 'scikit_learn', 'machine_learning'],
    optionalSkillIds: ['tableau', 'power_bi', 'spark', 'data_modeling', 'deep_learning'],
    preferredDegree: ['data science', 'statistics', 'mathematics', 'computer science'],
    growthOutlook: 'Very High (Analytical decision-making demand)',
    averageSalaryRange: '$125,000 - $170,000',
  },
  {
    id: 'backend_engineer',
    title: 'Backend Software Engineer',
    description: 'Architects robust microservices, server-side business logic, REST/GraphQL APIs, and database persistence layers.',
    coreSkillIds: ['nodejs', 'express', 'python', 'java', 'golang', 'postgresql', 'mysql', 'docker', 'rest_api'],
    optionalSkillIds: ['redis', 'kubernetes', 'aws', 'microservices', 'unit_testing', 'git', 'ci_cd'],
    preferredDegree: ['computer science', 'software engineering', 'information technology'],
    growthOutlook: 'Steady & High (Core infrastructure foundational demand)',
    averageSalaryRange: '$120,000 - $165,000',
  },
  {
    id: 'fullstack_engineer',
    title: 'Full Stack Developer',
    description: 'Builds end-to-end web applications combining responsive frontend experiences with scalable backend APIs and relational databases.',
    coreSkillIds: ['javascript', 'typescript', 'react', 'nodejs', 'html_css', 'sql', 'git'],
    optionalSkillIds: ['nextjs', 'tailwind', 'express', 'postgresql', 'docker', 'rest_api'],
    preferredDegree: ['computer science', 'software engineering', 'web development'],
    growthOutlook: 'High (High agility in startup & enterprise product squads)',
    averageSalaryRange: '$115,000 - $160,000',
  },
  {
    id: 'devops_cloud_engineer',
    title: 'DevOps & Cloud Engineer',
    description: 'Automates deployment pipelines, provisions infrastructure as code (IaC), and manages resilient cloud infrastructure.',
    coreSkillIds: ['aws', 'docker', 'kubernetes', 'terraform', 'ci_cd', 'linux', 'bash'],
    optionalSkillIds: ['azure', 'gcp', 'ansible', 'git', 'python', 'microservices'],
    preferredDegree: ['computer science', 'systems engineering', 'information systems'],
    growthOutlook: 'High (Cloud migration and platform engineering)',
    averageSalaryRange: '$130,000 - $175,000',
  },
  {
    id: 'data_engineer',
    title: 'Data Engineer',
    description: 'Constructs reliable data pipelines, automated ETL/ELT workflows, data warehouses, and distributed big data architectures.',
    coreSkillIds: ['python', 'sql', 'spark', 'data_modeling', 'postgresql', 'aws', 'docker'],
    optionalSkillIds: ['hadoop', 'airflow', 'dbt', 'gcp', 'kafka', 'redis'],
    preferredDegree: ['computer science', 'data engineering', 'information systems'],
    growthOutlook: 'Very High (Foundation for all enterprise AI & analytics)',
    averageSalaryRange: '$130,000 - $175,000',
  },
  {
    id: 'data_analyst',
    title: 'Business & Data Analyst',
    description: 'Transforms enterprise data into actionable visual dashboards, KPI reports, and executive business insights.',
    coreSkillIds: ['sql', 'power_bi', 'tableau', 'pandas', 'communication', 'problem_solving'],
    optionalSkillIds: ['python', 'r', 'data_modeling', 'time_management'],
    preferredDegree: ['business analytics', 'statistics', 'finance', 'computer science'],
    growthOutlook: 'Strong (Business intelligence cross-industry adoption)',
    averageSalaryRange: '$85,000 - $125,000',
  },
  {
    id: 'ai_engineer',
    title: 'Generative AI & LLM Engineer',
    description: 'Develops agentic workflows, Retrieval-Augmented Generation (RAG) pipelines, and integrations with modern Large Language Models.',
    coreSkillIds: ['python', 'llm', 'machine_learning', 'deep_learning', 'nlp', 'rest_api', 'docker'],
    optionalSkillIds: ['pytorch', 'langchain', 'vector_databases', 'fastapi', 'aws'],
    preferredDegree: ['computer science', 'artificial intelligence', 'data science'],
    growthOutlook: 'Explosive (Rapid enterprise GenAI productization)',
    averageSalaryRange: '$145,000 - $195,000',
  },
];

/**
 * Recommends matched job roles based on skills, education, and resume project relevance
 */
export function recommendJobRoles(
  parsed: ParsedSections,
  resumeSkills: CanonicalSkill[]
): RecommendedJobRole[] {
  const resumeSkillIds = new Set(resumeSkills.map(s => s.id));
  const resumeTextLower = parsed.rawText.toLowerCase();

  const recommendations: RecommendedJobRole[] = [];

  for (const role of ROLE_CATALOG) {
    const matchedCore = role.coreSkillIds.filter(id => resumeSkillIds.has(id));
    const matchedOptional = role.optionalSkillIds.filter(id => resumeSkillIds.has(id));

    const missingCore = role.coreSkillIds.filter(id => !resumeSkillIds.has(id));

    // Core skill weight = 70%, optional = 30%
    const coreScore = (matchedCore.length / (role.coreSkillIds.length || 1)) * 70;
    const optionalScore = (matchedOptional.length / (role.optionalSkillIds.length || 1)) * 30;

    // Project relevance boost: checks if role title or core concepts appear in project descriptions
    let projectRelevance = 0;
    if (parsed.projects.some(p => p.description.toLowerCase().includes(role.id.replace('_', ' ')) ||
      role.coreSkillIds.some(sk => p.description.toLowerCase().includes(sk)))) {
      projectRelevance = 10;
    }

    // Education alignment
    let degreeRelevance = 0;
    if (role.preferredDegree.some(deg => resumeTextLower.includes(deg))) {
      degreeRelevance = 5;
    }

    const totalRaw = Math.min(98, Math.round(coreScore + optionalScore + projectRelevance + degreeRelevance));

    // Convert skill IDs to formatted names
    const matchedSkillNames = [...matchedCore, ...matchedOptional].map(id => {
      const match = resumeSkills.find(s => s.id === id);
      return match ? match.name : id.replace('_', ' ');
    });

    const missingSkillNames = missingCore.slice(0, 4).map(id => id.replace('_', ' ').toUpperCase());

    let whyFits = `Matches ${matchedCore.length} of ${role.coreSkillIds.length} foundational skills required for ${role.title}.`;
    if (matchedSkillNames.length > 0) {
      whyFits += ` Your background in ${matchedSkillNames.slice(0, 3).join(', ')} aligns directly with core job expectations.`;
    }

    recommendations.push({
      roleId: role.id,
      roleTitle: role.title,
      matchPercentage: Math.max(25, totalRaw),
      whyFits,
      matchedSkills: matchedSkillNames,
      missingSkills: missingSkillNames,
      growthOutlook: role.growthOutlook,
      salaryRange: role.averageSalaryRange,
    });
  }

  // Sort by highest match percentage descending
  return recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
}
