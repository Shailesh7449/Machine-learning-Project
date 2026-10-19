export interface CanonicalSkill {
  id: string;
  name: string;
  category: 'languages' | 'frameworks' | 'databases' | 'cloud_devops' | 'data_ml' | 'tools' | 'soft_skills' | 'concepts';
  aliases: string[];
  weight: number; // importance weight in technical roles
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

export const SKILL_TAXONOMY: CanonicalSkill[] = [
  // Programming Languages
  { id: 'python', name: 'Python', category: 'languages', aliases: ['python', 'py', 'python3', 'python 3', 'python programming'], weight: 1.0 },
  { id: 'javascript', name: 'JavaScript', category: 'languages', aliases: ['javascript', 'js', 'es6', 'es2015+', 'ecmascript'], weight: 1.0 },
  { id: 'typescript', name: 'TypeScript', category: 'languages', aliases: ['typescript', 'ts'], weight: 1.0 },
  { id: 'java', name: 'Java', category: 'languages', aliases: ['java', 'core java', 'j2ee', 'java 8', 'java 17'], weight: 1.0 },
  { id: 'cpp', name: 'C++', category: 'languages', aliases: ['c++', 'cpp'], weight: 1.0 },
  { id: 'csharp', name: 'C#', category: 'languages', aliases: ['c#', 'csharp', '.net c#'], weight: 1.0 },
  { id: 'c', name: 'C', category: 'languages', aliases: ['c language', 'ansi c'], weight: 0.8 },
  { id: 'golang', name: 'Go', category: 'languages', aliases: ['go', 'golang'], weight: 1.0 },
  { id: 'rust', name: 'Rust', category: 'languages', aliases: ['rust', 'rustlang'], weight: 1.0 },
  { id: 'php', name: 'PHP', category: 'languages', aliases: ['php', 'php7', 'php8'], weight: 0.8 },
  { id: 'ruby', name: 'Ruby', category: 'languages', aliases: ['ruby'], weight: 0.8 },
  { id: 'r', name: 'R', category: 'languages', aliases: ['r programming', 'r language', 'r-project'], weight: 0.9 },
  { id: 'scala', name: 'Scala', category: 'languages', aliases: ['scala'], weight: 0.9 },
  { id: 'swift', name: 'Swift', category: 'languages', aliases: ['swift', 'swiftui'], weight: 0.9 },
  { id: 'kotlin', name: 'Kotlin', category: 'languages', aliases: ['kotlin'], weight: 0.9 },
  { id: 'sql', name: 'SQL', category: 'languages', aliases: ['sql', 'structured query language', 't-sql', 'pl/sql', 'ansi sql'], weight: 1.0 },
  { id: 'bash', name: 'Bash / Shell', category: 'languages', aliases: ['bash', 'shell script', 'shell scripting', 'zsh', 'sh'], weight: 0.8 },
  { id: 'html_css', name: 'HTML & CSS', category: 'languages', aliases: ['html', 'html5', 'css', 'css3', 'html/css'], weight: 0.8 },

  // Frameworks & Libraries
  { id: 'react', name: 'React', category: 'frameworks', aliases: ['react', 'react.js', 'reactjs', 'react 18', 'react 19'], weight: 1.0 },
  { id: 'nextjs', name: 'Next.js', category: 'frameworks', aliases: ['next.js', 'nextjs', 'next js'], weight: 0.9 },
  { id: 'vue', name: 'Vue.js', category: 'frameworks', aliases: ['vue', 'vue.js', 'vuejs', 'vue 3'], weight: 0.9 },
  { id: 'angular', name: 'Angular', category: 'frameworks', aliases: ['angular', 'angularjs', 'angular 2+'], weight: 0.9 },
  { id: 'nodejs', name: 'Node.js', category: 'frameworks', aliases: ['node.js', 'nodejs', 'node'], weight: 1.0 },
  { id: 'express', name: 'Express.js', category: 'frameworks', aliases: ['express', 'express.js', 'expressjs'], weight: 0.9 },
  { id: 'nestjs', name: 'NestJS', category: 'frameworks', aliases: ['nestjs', 'nest.js'], weight: 0.9 },
  { id: 'django', name: 'Django', category: 'frameworks', aliases: ['django', 'django rest framework', 'drf'], weight: 1.0 },
  { id: 'fastapi', name: 'FastAPI', category: 'frameworks', aliases: ['fastapi', 'fast api'], weight: 1.0 },
  { id: 'flask', name: 'Flask', category: 'frameworks', aliases: ['flask'], weight: 0.8 },
  { id: 'spring_boot', name: 'Spring Boot', category: 'frameworks', aliases: ['spring boot', 'spring framework', 'spring-boot', 'spring'], weight: 1.0 },
  { id: 'aspnet', name: 'ASP.NET Core', category: 'frameworks', aliases: ['asp.net', 'asp.net core', '.net core', 'dotnet'], weight: 0.9 },
  { id: 'ruby_on_rails', name: 'Ruby on Rails', category: 'frameworks', aliases: ['ruby on rails', 'rails'], weight: 0.8 },
  { id: 'laravel', name: 'Laravel', category: 'frameworks', aliases: ['laravel'], weight: 0.8 },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'frameworks', aliases: ['tailwind', 'tailwindcss', 'tailwind css'], weight: 0.8 },

  // Databases
  { id: 'postgresql', name: 'PostgreSQL', category: 'databases', aliases: ['postgresql', 'postgres', 'psql', 'pg'], weight: 1.0 },
  { id: 'mysql', name: 'MySQL', category: 'databases', aliases: ['mysql', 'mariadb'], weight: 1.0 },
  { id: 'mongodb', name: 'MongoDB', category: 'databases', aliases: ['mongodb', 'mongo'], weight: 1.0 },
  { id: 'redis', name: 'Redis', category: 'databases', aliases: ['redis', 'redis cache'], weight: 0.9 },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'databases', aliases: ['elasticsearch', 'elastic search', 'elk stack'], weight: 0.9 },
  { id: 'cassandra', name: 'Cassandra', category: 'databases', aliases: ['cassandra', 'apache cassandra'], weight: 0.8 },
  { id: 'dynamodb', name: 'DynamoDB', category: 'databases', aliases: ['dynamodb', 'amazon dynamodb', 'aws dynamodb'], weight: 0.9 },
  { id: 'sqlite', name: 'SQLite', category: 'databases', aliases: ['sqlite', 'sqlite3'], weight: 0.7 },
  { id: 'oracle', name: 'Oracle DB', category: 'databases', aliases: ['oracle database', 'oracle db', 'pl/sql'], weight: 0.8 },

  // Cloud & DevOps
  { id: 'aws', name: 'AWS', category: 'cloud_devops', aliases: ['aws', 'amazon web services', 'amazon aws'], weight: 1.0 },
  { id: 'azure', name: 'Microsoft Azure', category: 'cloud_devops', aliases: ['azure', 'microsoft azure', 'azure devops'], weight: 1.0 },
  { id: 'gcp', name: 'Google Cloud Platform (GCP)', category: 'cloud_devops', aliases: ['gcp', 'google cloud', 'google cloud platform'], weight: 1.0 },
  { id: 'docker', name: 'Docker', category: 'cloud_devops', aliases: ['docker', 'containerization', 'docker compose'], weight: 1.0 },
  { id: 'kubernetes', name: 'Kubernetes', category: 'cloud_devops', aliases: ['kubernetes', 'k8s'], weight: 1.0 },
  { id: 'terraform', name: 'Terraform', category: 'cloud_devops', aliases: ['terraform', 'iac', 'infrastructure as code'], weight: 0.9 },
  { id: 'ci_cd', name: 'CI/CD Pipelines', category: 'cloud_devops', aliases: ['ci/cd', 'cicd', 'continuous integration', 'github actions', 'jenkins', 'gitlab ci'], weight: 1.0 },
  { id: 'ansible', name: 'Ansible', category: 'cloud_devops', aliases: ['ansible'], weight: 0.8 },
  { id: 'linux', name: 'Linux System Admin', category: 'cloud_devops', aliases: ['linux', 'ubuntu', 'centos', 'redhat', 'unix'], weight: 0.9 },

  // Data / ML / AI
  { id: 'machine_learning', name: 'Machine Learning', category: 'data_ml', aliases: ['machine learning', 'ml', 'statistical learning'], weight: 1.0 },
  { id: 'deep_learning', name: 'Deep Learning', category: 'data_ml', aliases: ['deep learning', 'dl', 'neural networks', 'ann', 'cnn', 'rnn'], weight: 1.0 },
  { id: 'nlp', name: 'Natural Language Processing (NLP)', category: 'data_ml', aliases: ['nlp', 'natural language processing', 'text analytics', 'nlu', 'computational linguistics'], weight: 1.0 },
  { id: 'computer_vision', name: 'Computer Vision', category: 'data_ml', aliases: ['computer vision', 'cv', 'opencv', 'object detection'], weight: 1.0 },
  { id: 'pytorch', name: 'PyTorch', category: 'data_ml', aliases: ['pytorch', 'torch'], weight: 1.0 },
  { id: 'tensorflow', name: 'TensorFlow', category: 'data_ml', aliases: ['tensorflow', 'tf', 'keras'], weight: 1.0 },
  { id: 'scikit_learn', name: 'Scikit-Learn', category: 'data_ml', aliases: ['scikit-learn', 'sklearn', 'scikit learn'], weight: 1.0 },
  { id: 'pandas', name: 'Pandas', category: 'data_ml', aliases: ['pandas'], weight: 0.9 },
  { id: 'numpy', name: 'NumPy', category: 'data_ml', aliases: ['numpy'], weight: 0.8 },
  { id: 'spark', name: 'Apache Spark', category: 'data_ml', aliases: ['spark', 'apache spark', 'pyspark'], weight: 1.0 },
  { id: 'hadoop', name: 'Hadoop', category: 'data_ml', aliases: ['hadoop', 'hdfs', 'mapreduce'], weight: 0.8 },
  { id: 'power_bi', name: 'Power BI', category: 'data_ml', aliases: ['power bi', 'powerbi', 'dax'], weight: 0.9 },
  { id: 'tableau', name: 'Tableau', category: 'data_ml', aliases: ['tableau'], weight: 0.9 },
  { id: 'data_modeling', name: 'Data Modeling / ETL', category: 'data_ml', aliases: ['etl', 'data modeling', 'data warehousing', 'data pipelines', 'dbt', 'airflow'], weight: 1.0 },
  { id: 'llm', name: 'Large Language Models (LLMs)', category: 'data_ml', aliases: ['llm', 'llms', 'large language models', 'rag', 'langchain', 'llama-index', 'hugging face', 'transformers'], weight: 1.0 },

  // Tools & Methodologies
  { id: 'git', name: 'Git & Version Control', category: 'tools', aliases: ['git', 'github', 'gitlab', 'version control', 'bitbucket'], weight: 0.9 },
  { id: 'jira', name: 'Jira & Agile', category: 'tools', aliases: ['jira', 'agile', 'scrum', 'kanban', 'sprint planning'], weight: 0.8 },
  { id: 'rest_api', name: 'REST APIs & GraphQL', category: 'concepts', aliases: ['rest api', 'restful apis', 'rest apis', 'graphql', 'grpc', 'web api'], weight: 1.0 },
  { id: 'microservices', name: 'Microservices Architecture', category: 'concepts', aliases: ['microservices', 'distributed systems', 'system design', 'soa'], weight: 1.0 },
  { id: 'unit_testing', name: 'Testing & TDD', category: 'tools', aliases: ['unit testing', 'tdd', 'jest', 'pytest', 'junit', 'cypress', 'selenium', 'integration testing'], weight: 0.9 },
  { id: 'postman', name: 'Postman / API Testing', category: 'tools', aliases: ['postman', 'swagger', 'openapi'], weight: 0.7 },

  // Soft Skills
  { id: 'communication', name: 'Cross-functional Communication', category: 'soft_skills', aliases: ['communication', 'verbal communication', 'written communication', 'stakeholder management'], weight: 0.8 },
  { id: 'leadership', name: 'Leadership & Mentorship', category: 'soft_skills', aliases: ['leadership', 'mentoring', 'team lead', 'cross-functional leadership', 'people management'], weight: 0.8 },
  { id: 'problem_solving', name: 'Problem Solving & Critical Thinking', category: 'soft_skills', aliases: ['problem solving', 'analytical skills', 'critical thinking', 'troubleshooting'], weight: 0.8 },
  { id: 'collaboration', name: 'Collaboration & Teamwork', category: 'soft_skills', aliases: ['teamwork', 'collaboration', 'cross-functional collaboration', 'pair programming'], weight: 0.8 },
  { id: 'time_management', name: 'Project & Time Management', category: 'soft_skills', aliases: ['time management', 'project management', 'prioritization'], weight: 0.7 },
];

/**
 * Normalized Lookup Maps
 */
const aliasMap = new Map<string, CanonicalSkill>();
for (const skill of SKILL_TAXONOMY) {
  for (const alias of skill.aliases) {
    aliasMap.set(alias.toLowerCase().trim(), skill);
  }
}

export function lookupCanonicalSkill(skillString: string): CanonicalSkill | undefined {
  const normalized = skillString.toLowerCase().trim();
  return aliasMap.get(normalized);
}

export function extractAllTaxonomySkills(text: string): { matchedSkills: CanonicalSkill[]; categories: SkillCategoryGroup } {
  // Clean trailing punctuation while preserving internal dots like node.js and vue.js
  const cleanedText = text
    .replace(/[.,;:!?(){}[\]"'\/\\](?=\s|$)|(?<=\s|^)[.,;:!?(){}[\]"'\/\\]/g, ' ')
    .replace(/[,;!?]/g, ' ');
  const normalizedText = ` ${cleanedText.toLowerCase()} `;
  const matchedSet = new Map<string, CanonicalSkill>();

  for (const skill of SKILL_TAXONOMY) {
    for (const alias of skill.aliases) {
      const escaped = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // match as distinct word/token
      const regex = new RegExp(`(?:^|[^a-z0-9#+.])${escaped}(?:$|[^a-z0-9#+.]|\\s)`, 'i');
      if (regex.test(normalizedText)) {
        matchedSet.set(skill.id, skill);
        break;
      }
    }
  }

  const matchedSkills = Array.from(matchedSet.values());

  const categories: SkillCategoryGroup = {
    languages: [],
    frameworks: [],
    databases: [],
    cloud_devops: [],
    data_ml: [],
    tools: [],
    soft_skills: [],
    concepts: [],
  };

  for (const s of matchedSkills) {
    categories[s.category].push(s.name);
  }

  return { matchedSkills, categories };
}
