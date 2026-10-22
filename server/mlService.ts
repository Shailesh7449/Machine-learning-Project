import { spawn, execFile, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { extractAllTaxonomySkills } from './taxonomy.js';

interface CategoryProfile {
  name: string;
  keywords: string[];
}

/**
 * 25 Canonical Dataset Category Profiles for deterministic rule fallback
 */
const DATASET_CATEGORY_PROFILES: CategoryProfile[] = [
  {
    name: 'Python Developer',
    keywords: ['python', 'django', 'fastapi', 'flask', 'pandas', 'numpy', 'pytest', 'celery', 'sqlalchemy', 'pydantic'],
  },
  {
    name: 'Data Science',
    keywords: ['data science', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'statistics', 'nlp', 'computer vision', 'analytics'],
  },
  {
    name: 'Java Developer',
    keywords: ['java', 'spring boot', 'hibernate', 'j2ee', 'maven', 'gradle', 'junit', 'microservices', 'jpa', 'jvm'],
  },
  {
    name: 'DevOps Engineer',
    keywords: ['devops', 'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'terraform', 'ci/cd', 'jenkins', 'ansible', 'helm', 'linux', 'bash'],
  },
  {
    name: 'Database',
    keywords: ['oracle', 'database administrator', 'dba', 'sql server', 'postgresql', 'mysql', 'pl/sql', 'rdbms', 'performance tuning', 'rman'],
  },
  {
    name: 'DotNet Developer',
    keywords: ['.net', 'c#', 'asp.net', 'csharp', '.net core', 'entity framework', 'wcf', 'wpf', 'linq', 'iis'],
  },
  {
    name: 'Web Designing',
    keywords: ['web designing', 'ui designer', 'ux designer', 'figma', 'photoshop', 'illustrator', 'html5', 'css3', 'bootstrap', 'responsive design'],
  },
  {
    name: 'Testing',
    keywords: ['manual testing', 'black box testing', 'regression testing', 'test cases', 'defect tracking', 'jira', 'quality assurance', 'test plan'],
  },
  {
    name: 'Automation Testing',
    keywords: ['automation testing', 'selenium', 'testng', 'cucumber', 'appium', 'cypress', 'playwright', 'automation framework', 'bdd'],
  },
  {
    name: 'Network Security Engineer',
    keywords: ['network security', 'cybersecurity', 'cisco', 'firewall', 'ccna', 'vpn', 'pki', 'siem', 'ids/ips', 'tcp/ip', 'penetration testing'],
  },
  {
    name: 'Hadoop',
    keywords: ['hadoop', 'hdfs', 'mapreduce', 'hive', 'pig', 'sqoop', 'flume', 'oozie', 'spark', 'big data', 'hbase'],
  },
  {
    name: 'Blockchain',
    keywords: ['blockchain', 'solidity', 'smart contracts', 'ethereum', 'web3', 'cryptography', 'hyperledger', 'defi', 'truffle', 'hardhat'],
  },
  {
    name: 'Business Analyst',
    keywords: ['business analyst', 'brd', 'frd', 'gap analysis', 'user stories', 'stakeholder management', 'sdlc', 'agile', 'scrum', 'data analysis'],
  },
  {
    name: 'SAP Developer',
    keywords: ['sap', 'abap', 'sap hana', 'fiori', 'sap erp', 'ecc', 'bapi', 'idoc', 'sapui5'],
  },
  {
    name: 'Civil Engineer',
    keywords: ['civil engineer', 'autocad', 'staad pro', 'structural engineering', 'construction', 'surveying', 'concrete', 'site engineer'],
  },
  {
    name: 'Mechanical Engineer',
    keywords: ['mechanical engineer', 'solidworks', 'catia', 'ansys', 'cad/cam', 'thermodynamics', 'manufacturing', 'machining', 'autocad mechanical'],
  },
  {
    name: 'Electrical Engineering',
    keywords: ['electrical engineering', 'matlab', 'simulink', 'plc', 'scada', 'power systems', 'pcb design', 'circuit design', 'switchgear'],
  },
  {
    name: 'Operations Manager',
    keywords: ['operations manager', 'supply chain', 'vendor management', 'procurement', 'logistics', 'inventory management', 'cost optimization', 'p&l'],
  },
  {
    name: 'HR',
    keywords: ['human resources', 'recruitment', 'talent acquisition', 'onboarding', 'payroll', 'employee engagement', 'performance appraisal', 'hris'],
  },
  {
    name: 'Sales',
    keywords: ['sales', 'business development', 'b2b sales', 'lead generation', 'revenue growth', 'client acquisition', 'negotiation', 'crm'],
  },
  {
    name: 'Advocate',
    keywords: ['advocate', 'legal', 'lawyer', 'litigation', 'corporate law', 'contracts', 'court', 'compliance', 'legal drafting', 'arbitration'],
  },
  {
    name: 'Arts',
    keywords: ['arts', 'fine arts', 'interior design', 'creative direction', 'visual arts', 'painting', 'sculpture', 'illustration'],
  },
  {
    name: 'Health and fitness',
    keywords: ['fitness', 'nutrition', 'personal trainer', 'wellness', 'dietetics', 'strength conditioning', 'gym', 'health coach'],
  },
  {
    name: 'PMO',
    keywords: ['pmo', 'project management office', 'portfolio management', 'project governance', 'milestone tracking', 'risk mitigation', 'pmp'],
  },
  {
    name: 'ETL Developer',
    keywords: ['etl', 'informatica', 'data warehouse', 'ssis', 'talend', 'datastage', 'data pipeline', 'star schema', 'dimension modeling'],
  },
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INFERENCE_SCRIPT = path.resolve(__dirname, '..', 'inference.py');

interface QueueItem {
  payload: any;
  resolve: (res: any) => void;
  reject: (err: any) => void;
  timer: NodeJS.Timeout;
}

/**
 * High-Throughput Persistent Daemon Worker for Scikit-Learn Inference
 */
class MLWorkerDaemon {
  private process: ChildProcess | null = null;
  private rl: readline.Interface | null = null;
  private queue: QueueItem[] = [];
  private pending: QueueItem[] = [];
  private isReady: boolean = false;
  private isStarting: boolean = false;

  private start() {
    if (this.process || this.isStarting) return;
    this.isStarting = true;

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    try {
      this.process = spawn(pythonCmd, ['-u', INFERENCE_SCRIPT, '--daemon'], {
        stdio: ['pipe', 'pipe', 'inherit'],
      });

      this.rl = readline.createInterface({
        input: this.process.stdout!,
        terminal: false,
      });

      this.rl.on('line', (line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.status === 'ready') {
            this.isReady = true;
            this.isStarting = false;
            this.flushQueue();
            return;
          }

          const req = this.pending.shift();
          if (req) {
            clearTimeout(req.timer);
            if (parsed.error) {
              req.reject(new Error(parsed.error));
            } else {
              req.resolve(parsed);
            }
          }
        } catch (e: any) {
          const req = this.pending.shift();
          if (req) {
            clearTimeout(req.timer);
            req.reject(new Error(`Failed to parse daemon output: ${trimmed}`));
          }
        }
      });

      this.process.on('error', () => {
        this.cleanup();
      });

      this.process.on('exit', () => {
        this.cleanup();
      });
    } catch (err) {
      this.cleanup();
    }
  }

  private flushQueue() {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        this.pending.push(item);
        if (this.process && this.process.stdin && this.process.stdin.writable) {
          this.process.stdin.write(JSON.stringify(item.payload) + '\n');
        }
      }
    }
  }

  private cleanup() {
    this.isReady = false;
    this.isStarting = false;
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    this.process = null;

    const allItems = [...this.queue, ...this.pending];
    this.queue = [];
    this.pending = [];

    for (const item of allItems) {
      clearTimeout(item.timer);
      item.reject(new Error('ML Daemon process terminated'));
    }
  }

  public send(payload: any, timeoutMs: number = 10000): Promise<any> {
    if (!this.process) {
      this.start();
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const qIdx = this.queue.findIndex((r) => r.timer === timer);
        if (qIdx !== -1) {
          this.queue.splice(qIdx, 1);
        }
        const pIdx = this.pending.findIndex((r) => r.timer === timer);
        if (pIdx !== -1) {
          this.pending.splice(pIdx, 1);
        }
        reject(new Error('ML Daemon request timed out'));
      }, timeoutMs);

      const item: QueueItem = { payload, resolve, reject, timer };

      if (!this.isReady) {
        this.queue.push(item);
      } else {
        this.pending.push(item);
        if (this.process && this.process.stdin && this.process.stdin.writable) {
          this.process.stdin.write(JSON.stringify(payload) + '\n');
        } else {
          clearTimeout(timer);
          this.pending.pop();
          reject(new Error('ML Daemon stdin is not writable'));
        }
      }
    });
  }
}

const daemonWorker = new MLWorkerDaemon();

/**
 * Fallback one-shot Python runner via child_process.execFile with 15000ms timeout
 */
function callPythonInferenceFallback(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const child = execFile(
      pythonCmd,
      [INFERENCE_SCRIPT, '--json'],
      { timeout: 15000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.error) {
            return reject(new Error(parsed.error));
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse ML output: ${stdout || stderr}`));
        }
      }
    );

    if (child.stdin) {
      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    }
  });
}

/**
 * Executes a machine learning task:
 * 1. Attempts persistent daemon worker (<10ms latency).
 * 2. Falls back to one-shot Python execFile (15s timeout).
 * 3. Falls back gracefully to audited deterministic heuristic if Python is absent.
 */
export const runMLTask = async (task: string, payload: any): Promise<any> => {
  // 1. Attempt daemon worker first
  try {
    const daemonResult = await daemonWorker.send({ task, ...payload }, 8000);
    if (daemonResult && !daemonResult.error) {
      return daemonResult;
    }
  } catch (err: any) {
    // Daemon worker failed or restarting, proceed to fallback
  }

  // 2. Attempt one-shot child_process fallback
  try {
    const fallbackResult = await callPythonInferenceFallback({ task, ...payload });
    if (fallbackResult && !fallbackResult.error) {
      return fallbackResult;
    }
  } catch (err: any) {
    // Python environment unavailable, proceed to deterministic heuristic
  }

  // 3. Deterministic Heuristic Fallback (matching official 25 dataset classes)
  if (task === 'classify_resume') {
    const text = (payload?.text || '').toLowerCase();
    if (!text) {
      return { category: 'Java Developer', confidence: 0.5, topAlternatives: [] };
    }

    let bestCategory = 'Java Developer';
    let maxScore = -1;

    for (const cat of DATASET_CATEGORY_PROFILES) {
      let score = 0;
      for (const kw of cat.keywords) {
        if (text.includes(kw)) {
          const count = (text.match(new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')) || []).length;
          score += Math.min(count, 5);
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestCategory = cat.name;
      }
    }

    return {
      category: bestCategory,
      confidence: 0.75,
      topAlternatives: [{ category: bestCategory, score: 0.75 }],
    };
  }

  if (task === 'extract_skills') {
    const phrases: string[] = Array.isArray(payload?.phrases) ? payload.phrases : [];
    if (!phrases.length) {
      return { skills: [], detailedSkills: [] };
    }

    const text = phrases.join(' ');
    const extracted = extractAllTaxonomySkills(text);
    const matchedNames = extracted.matchedSkills.map((s) => s.name);
    // Include lowercase variants to match phrase queries
    const phraseLowerSet = new Set(phrases.map((p) => p.toLowerCase()));
    const skills = Array.from(new Set([
      ...matchedNames.filter((n) => phraseLowerSet.has(n.toLowerCase())),
      ...matchedNames,
    ])).map((s) => s.toLowerCase());

    return {
      skills,
      detailedSkills: skills.map((s) => ({ name: s, confidence: 0.8 })),
    };
  }

  return null;
};
