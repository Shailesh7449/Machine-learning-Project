import { extractAllTaxonomySkills } from './taxonomy.js';

interface CategoryProfile {
  name: string;
  keywords: string[];
}

const CATEGORY_PROFILES: CategoryProfile[] = [
  {
    name: 'Data Science & Machine Learning',
    keywords: [
      'machine learning', 'deep learning', 'data science', 'pytorch', 'tensorflow',
      'scikit-learn', 'pandas', 'numpy', 'nlp', 'computer vision', 'neural networks',
      'statistics', 'tableau', 'power bi', 'llm', 'transformers', 'data analysis', 'regression',
      'clustering', 'scipy', 'keras', 'data engineering', 'spark', 'hadoop'
    ],
  },
  {
    name: 'DevOps & Cloud Architecture',
    keywords: [
      'devops', 'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'terraform', 'ci/cd',
      'jenkins', 'ansible', 'helm', 'cloudformation', 'linux', 'bash', 'prometheus',
      'grafana', 'infrastructure', 'sysadmin', 'sre', 'site reliability'
    ],
  },
  {
    name: 'Full Stack & Web Development',
    keywords: [
      'react', 'next.js', 'vue', 'angular', 'typescript', 'javascript', 'html', 'css',
      'node.js', 'nodejs', 'express', 'tailwind', 'frontend', 'backend', 'full stack',
      'rest api', 'graphql', 'web', 'redux', 'svelte', 'responsive'
    ],
  },
  {
    name: 'Backend Software Engineering',
    keywords: [
      'java', 'golang', 'c++', 'c#', '.net', 'spring boot', 'microservices', 'distributed',
      'sql', 'postgresql', 'mysql', 'redis', 'kafka', 'grpc', 'multithreading', 'concurrency',
      'system design', 'architecture', 'api design'
    ],
  },
  {
    name: 'Mobile Application Development',
    keywords: [
      'android', 'ios', 'swift', 'kotlin', 'react native', 'flutter', 'xcode',
      'mobile app', 'jetpack compose', 'swiftui', 'objective-c'
    ],
  },
  {
    name: 'Information Security & Cybersecurity',
    keywords: [
      'cybersecurity', 'security', 'penetration testing', 'vulnerability', 'owasp',
      'siem', 'firewall', 'encryption', 'pki', 'soc', 'network security', 'threat', 'compliance'
    ],
  },
];

export const runMLTask = async (task: string, payload: any): Promise<any> => {
  try {
    if (task === 'classify_resume') {
      const text = (payload?.text || '').toLowerCase();
      if (!text) {
        return { category: 'Software Engineering' };
      }

      let bestCategory = 'Software Engineering';
      let maxScore = -1;

      for (const cat of CATEGORY_PROFILES) {
        let score = 0;
        for (const kw of cat.keywords) {
          if (text.includes(kw)) {
            // Count occurrences (capped)
            const count = (text.match(new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')) || []).length;
            score += Math.min(count, 5);
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestCategory = cat.name;
        }
      }

      return { category: bestCategory };
    }

    if (task === 'extract_skills') {
      const phrases: string[] = Array.isArray(payload?.phrases) ? payload.phrases : [];
      if (!phrases.length) {
        return { skills: [] };
      }

      const text = phrases.join(' ');
      const extracted = extractAllTaxonomySkills(text);
      const skills = Array.from(new Set(extracted.matchedSkills.map(s => s.name)));
      return { skills };
    }

    return null;
  } catch (e) {
    console.warn('ML Task processing warning:', e);
    return null;
  }
};
