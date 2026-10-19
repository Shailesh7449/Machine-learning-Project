import { AnalysisResponse, SampleItem } from '../types';

/**
 * Fallback samples if network or backend endpoint is warming up
 */
export const FALLBACK_SAMPLES: { resumes: SampleItem[]; jobs: SampleItem[] } = {
  resumes: [
    {
      id: 'fullstack_senior',
      title: 'Alex Johnson – Senior Full Stack Engineer',
      category: 'Full Stack / Web Engineering',
      summary: '6+ years of full stack software engineering with React, TypeScript, Node.js, and AWS.',
      content: `Alex Johnson\nEmail: alex.johnson.dev@gmail.com | Phone: (415) 890-2341 | Location: San Francisco, CA\nLinkedIn: linkedin.com/in/alexjohnson-tech | GitHub: github.com/alexjohnson-dev\n\nPROFESSIONAL SUMMARY\nResults-driven Senior Full Stack Engineer with 6+ years of experience architecting resilient distributed systems, modern web platforms, and RESTful microservices. Spearheaded cloud-native migrations saving $140,000 annually and optimized API latencies by 42%.\n\nTECHNICAL SKILLS\n• Programming Languages: TypeScript, JavaScript, Python, Go, SQL, HTML/CSS\n• Frameworks: React, Next.js, Node.js, Express.js, Tailwind CSS, Jest\n• Databases: PostgreSQL, MongoDB, Redis, Elasticsearch\n• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Terraform\n\nWORK EXPERIENCE\nSenior Full Stack Engineer | NovaCloud Technologies | 2021 – Present\n• Architected enterprise dashboard using React 18, TypeScript, serving 180,000 monthly active users.\n• Engineered backend microservices with Node.js, Express, PostgreSQL, reducing API response times by 77%.\n• Automated end-to-end CI/CD pipelines via GitHub Actions and Docker, increasing deployments from 1/week to 4/day.\n\nEDUCATION\nBachelor of Science in Computer Science | University of Texas at Austin | 2014 – 2018`,
    },
    {
      id: 'ml_data_scientist',
      title: 'Dr. Priya Sharma – AI & Machine Learning Scientist',
      category: 'Machine Learning / AI',
      summary: 'Ph.D. researcher & ML Engineer specializing in Natural Language Processing, PyTorch, and LLM architectures.',
      content: `Dr. Priya Sharma\nEmail: priya.sharma.ai@stanford.edu | Phone: (650) 412-8890 | Location: Palo Alto, CA\nLinkedIn: linkedin.com/in/priyasharma-ml | GitHub: github.com/priyasharma-nlp\n\nPROFESSIONAL SUMMARY\nSenior Machine Learning Scientist with 5+ years experience designing deep learning models, Transformer architectures, and NLP pipelines. Deployed production ML models serving 2.4 million daily inferences.\n\nTECHNICAL SKILLS\n• Programming: Python, R, C++, SQL, Bash\n• Deep Learning & ML: PyTorch, TensorFlow, Hugging Face, Scikit-Learn, Pandas, NumPy\n• NLP & GenAI: Large Language Models (LLMs), RAG, LangChain, Transformers, BERT\n• Cloud & MLOps: Docker, MLflow, AWS SageMaker, Git, Linux, CI/CD\n\nWORK EXPERIENCE\nLead Machine Learning Scientist | Cognition AI Labs | 2022 – Present\n• Spearheaded LLM fine-tuning pipelines using PyTorch and Hugging Face, achieving an 18.4% improvement in F1-score.\n• Architected enterprise RAG system indexing 8 million unstructured documents with <120ms latency.\n\nEDUCATION\nPh.D. in Computer Science (Specialization: Machine Learning & NLP) | Stanford University | 2019`,
    },
    {
      id: 'devops_cloud',
      title: 'Marcus Vance – Cloud & DevOps Engineer',
      category: 'Cloud / Infrastructure',
      summary: 'DevOps engineer with deep expertise in Kubernetes, Terraform, AWS, and zero-downtime CI/CD pipelines.',
      content: `Marcus Vance\nEmail: marcus.vance.cloud@gmail.com | Phone: (206) 773-1940 | Location: Seattle, WA\nLinkedIn: linkedin.com/in/marcusvance-devops | GitHub: github.com/marcusvance-infra\n\nPROFESSIONAL SUMMARY\nDevOps & Cloud Infrastructure Engineer with 4+ years experience engineering secure, scalable multi-region AWS and Kubernetes architectures. Championed Infrastructure as Code (IaC) with Terraform and automated CI/CD.\n\nTECHNICAL SKILLS\n• Cloud Platforms: AWS, Google Cloud Platform (GCP), Microsoft Azure\n• Containers: Kubernetes, Docker, Helm, Docker Compose\n• Infrastructure as Code: Terraform, Ansible\n• CI/CD: GitHub Actions, Jenkins, ArgoCD\n• OS & Scripting: Linux, Python, Bash\n\nWORK EXPERIENCE\nDevOps Engineer | CloudScale Systems | 2021 – Present\n• Orchestrated migration of 35 production microservices to Amazon EKS, boosting utilization by 40%.\n• Automated multi-account AWS infrastructure using Terraform modules with 100% reproducibility.\n\nEDUCATION\nBachelor of Science in Information Technology | University of Washington | 2019`,
    },
  ],
  jobs: [
    {
      id: 'jd_senior_fullstack',
      title: 'Senior Full Stack Software Engineer (React / Node / AWS)',
      category: 'Full Stack',
      summary: 'Targeting a senior engineer with strong React, Node.js, TypeScript, PostgreSQL, and AWS expertise.',
      content: `Job Title: Senior Full Stack Software Engineer\n\nRequired Qualifications & Skills:\n• 4+ years of professional full stack software development experience.\n• Proficiency in TypeScript, JavaScript, React, and Node.js.\n• Strong experience with relational databases (PostgreSQL or MySQL) and query optimization.\n• Solid understanding of REST APIs, Microservices, and cloud deployments on AWS.\n• Hands-on familiarity with Docker containerization and CI/CD automation pipelines.`,
    },
    {
      id: 'jd_staff_ml_ai',
      title: 'Staff Machine Learning & Generative AI Engineer',
      category: 'AI / Machine Learning',
      summary: 'High-level role seeking expertise in Python, PyTorch, Transformers, LLMs, RAG, and MLOps.',
      content: `Job Title: Staff Machine Learning & Generative AI Engineer\n\nRequired Qualifications:\n• 5+ years of industry experience developing and deploying machine learning models.\n• Expert proficiency in Python, PyTorch, Scikit-Learn, and scientific computing packages.\n• Proven expertise with Natural Language Processing (NLP), Transformers, and modern GenAI architectures.\n• Experience with Docker containerization, MLOps tooling, and cloud platforms (AWS or GCP).`,
    },
  ],
};

/**
 * Robust JSON fetch wrapper that guards against HTML error pages (e.g. Nginx 502/504 warmup pages)
 */
async function safeJsonFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: any) {
    throw new Error('Network connection error. Please ensure the application server is running.');
  }

  const rawText = await res.text();
  const trimmed = rawText.trim();

  // Guard against HTML doctype error pages (e.g. Vercel 504 or Nginx 502)
  if (!res.ok && (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.toLowerCase().includes('<body') || trimmed.toLowerCase().includes('504 gateway timeout'))) {
    throw new Error(
      `Server timeout or initialization error (${res.status}). The analysis took too long. Please try again.`
    );
  }

  if (!res.ok) {
    let errorMessage = `Server responded with status ${res.status}`;
    try {
      const data = JSON.parse(trimmed);
      errorMessage = data.error || data.details || errorMessage;
    } catch {
      errorMessage = trimmed ? `Server Error (${res.status}): ${trimmed.substring(0, 100)}` : errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(
      `Unable to parse server response. Please check your input and retry.`
    );
  }
}

export async function uploadResumeFile(file: File): Promise<{
  filename: string;
  fileSize: number;
  charCount: number;
  extractedText: string;
}> {
  // If plain text file, we can also read it in the browser as an immediate fail-safe
  const isPlainText = file.type === 'text/plain' || file.name.endsWith('.txt');

  try {
    const formData = new FormData();
    formData.append('resume', file);

    return await safeJsonFetch('/api/resume/upload', {
      method: 'POST',
      body: formData,
    });
  } catch (err: any) {
    // If it's a plain text file, read locally as client fallback
    if (isPlainText) {
      const text = await file.text();
      if (text && text.trim().length > 30) {
        return {
          filename: file.name,
          fileSize: file.size,
          charCount: text.length,
          extractedText: text,
        };
      }
    }
    throw err;
  }
}

export async function analyzeResume(
  resumeText: string,
  jobDescription?: string,
  weights?: any
): Promise<AnalysisResponse> {
  return await safeJsonFetch<AnalysisResponse>('/api/resume/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText,
      jobDescription: jobDescription || undefined,
      weights,
    }),
  });
}

export async function editWithAi(
  text: string,
  mode: 'ats' | 'clarity' | 'verbs' | 'concise' | 'grammar' | 'jd_match',
  context?: { jobDescription?: string; sectionName?: string }
): Promise<{ success: boolean; original: string; improved: string }> {
  return await safeJsonFetch('/api/ai/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, mode, context }),
  });
}

export async function fetchSamples(): Promise<{
  resumes: SampleItem[];
  jobs: SampleItem[];
}> {
  try {
    return await safeJsonFetch('/api/samples');
  } catch (err) {
    console.warn('Using built-in sample presets:', err);
    return FALLBACK_SAMPLES;
  }
}

export async function fetchAcademicBenchmarks(): Promise<any> {
  return await safeJsonFetch('/api/academic/benchmarks');
}

export async function searchJobs(params: {
  query?: string;
  location?: string;
  type?: 'all' | 'job' | 'internship';
  limit?: number;
}): Promise<{
  success: boolean;
  totalFound: number;
  listings: any[];
  externalPortals: any[];
  sourceAttribution: string[];
  notice?: string;
}> {
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.set('query', params.query);
  if (params.location) queryParams.set('location', params.location);
  if (params.type) queryParams.set('type', params.type);
  if (params.limit) queryParams.set('limit', String(params.limit));

  return await safeJsonFetch(`/api/jobs/search?${queryParams.toString()}`);
}

export async function fetchHealth(): Promise<any> {
  return await safeJsonFetch('/api/health');
}
