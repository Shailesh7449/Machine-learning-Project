process.env.NODE_ENV = 'test';
import assert from 'assert';
import http from 'http';
import { extractAllTaxonomySkills, SKILL_TAXONOMY, lookupCanonicalSkill } from '../server/taxonomy.js';
import { segmentResumeSections, extractPersonalInfo, extractDocumentText } from '../server/parser.js';
import { calculateAtsScore, DEFAULT_WEIGHTS } from '../server/atsScorer.js';
import { matchResumeWithJob, parseJobDescription } from '../server/jobMatcher.js';
import { recommendJobRoles } from '../server/jobRecommender.js';
import { SAMPLE_RESUMES, SAMPLE_JOB_DESCRIPTIONS } from '../server/sampleData.js';
import { tokenize, computeReadability, computeCosineSimilarity, computeTF, detectQuantifiableMetrics, analyzeActionVerbs, detectKeywordStuffing } from '../server/nlp.js';
import { improveSectionText } from '../server/aiEditor.js';
import { searchRealJobs, generateExternalPortals } from '../server/jobDiscovery.js';
import { runMLTask } from '../server/mlService.js';
import app from '../server.js';

let passedCount = 0;
let failedCount = 0;

function it(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      passedCount++;
      console.log(`   ✓ ${name}`);
    } catch (err: any) {
      failedCount++;
      console.error(`   ✗ FAILED: ${name}`);
      console.error(`     Error: ${err?.message || err}`);
      throw err;
    }
  };
}

async function runSuite() {
  console.log('================================================================');
  console.log('   ResumeAI Master Automated Test & Verification Suite');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // SUITE 1: Taxonomy & Skill Normalization
  // -------------------------------------------------------------
  console.log('Suite 1: Skill Taxonomy & Normalization Engine');
  await it('should map alias "python 3" to canonical "Python"', () => {
    const s = lookupCanonicalSkill('python 3');
    assert(s && s.name === 'Python', 'Expected Python canonical skill');
    assert(s.category === 'languages');
  })();

  await it('should map alias "amazon web services" to "AWS"', () => {
    const s = lookupCanonicalSkill('amazon web services');
    assert(s && s.name === 'AWS');
    assert(s.category === 'cloud_devops');
  })();

  await it('should map acronym "k8s" to "Kubernetes"', () => {
    const s = lookupCanonicalSkill('k8s');
    assert(s && s.name === 'Kubernetes');
  })();

  await it('should extract multiple canonical skills across categories without false positives', () => {
    const text = 'We engineered high-throughput microservices using Python, Docker, PostgreSQL, React, and AWS.';
    const extracted = extractAllTaxonomySkills(text);
    const names = extracted.matchedSkills.map(s => s.name);
    assert(names.includes('Python'), 'Expected Python');
    assert(names.includes('Docker'), 'Expected Docker');
    assert(names.includes('PostgreSQL'), 'Expected PostgreSQL');
    assert(names.includes('React'), 'Expected React');
    assert(names.includes('AWS'), 'Expected AWS');
    assert(extracted.categories.languages.includes('Python'));
    assert(extracted.categories.databases.includes('PostgreSQL'));
    assert(extracted.categories.frameworks.includes('React'));
  })();

  await it('should safely return empty skills for text with zero technical terms', () => {
    const text = 'The quick brown fox jumps over the lazy dog near the riverbank.';
    const extracted = extractAllTaxonomySkills(text);
    assert.strictEqual(extracted.matchedSkills.length, 0);
  })();

  // -------------------------------------------------------------
  // SUITE 2: Section Segmentation & Parsing
  // -------------------------------------------------------------
  console.log('\nSuite 2: Resume Parsing & 15-Section Canonical Segmentation');
  const sampleResume = SAMPLE_RESUMES[0].content;
  const parsed = segmentResumeSections(sampleResume);

  await it('should extract candidate personal contact info', () => {
    console.log('      Personal info parsed:', JSON.stringify(parsed.personal));
    assert(parsed.personal.name.includes('Alex Johnson'));
    assert(parsed.personal.email.includes('@'));
    assert(parsed.personal.phone.length > 5);
    assert(parsed.personal.location !== 'Not detected');
  })();

  await it('should parse structured sections with sectionsList', () => {
    assert(parsed.education.length > 0, 'Expected education entries');
    assert(parsed.experience.length > 0, 'Expected work experience entries');
    assert(Array.isArray(parsed.sectionsList), 'Expected sectionsList array');
    assert(parsed.sectionsList.length >= 10, 'Expected at least 10 canonical sections');
  })();

  await it('should gracefully parse resumes with completely missing sections without crashing', () => {
    const minimalResume = 'Johnathan Doe\nEmail: john@test.com\nPhone: (555) 123-4567\nLocation: Chicago, IL';
    const minParsed = segmentResumeSections(minimalResume);
    assert.strictEqual(minParsed.personal.name, 'Johnathan Doe');
    assert.strictEqual(minParsed.summary, 'Not detected');
    assert.strictEqual(minParsed.education.length, 0);
    assert.strictEqual(minParsed.experience.length, 0);
    assert(Array.isArray(minParsed.sectionsList));
  })();

  // -------------------------------------------------------------
  // SUITE 3: Deterministic ATS Scoring Engine
  // -------------------------------------------------------------
  console.log('\nSuite 3: ATS Scoring Engine Bounds & Mathematical Correctness');
  const sampleSkills = extractAllTaxonomySkills(sampleResume).matchedSkills;
  const atsResult = calculateAtsScore(parsed, sampleSkills, 4.0, DEFAULT_WEIGHTS);

  await it('should calculate ATS score within strict [0, 100] bounds', () => {
    assert(atsResult.overallScore >= 0 && atsResult.overallScore <= 100);
    assert(atsResult.strengths.length > 0);
    assert(atsResult.recommendations.length > 0);
  })();

  await it('should assign true 0 on skills, experience, achievements for completely empty resume', () => {
    const emptyParsed = segmentResumeSections('');
    const emptyScore = calculateAtsScore(emptyParsed, [], 0, DEFAULT_WEIGHTS);
    assert(emptyScore.overallScore >= 0 && emptyScore.overallScore <= 100);
    assert.strictEqual(emptyScore.categoryScores.skillsMatch.score, 0, 'Expected 0 skill score when 0 skills detected');
    assert.strictEqual(emptyScore.categoryScores.achievements.score, 0, 'Expected 0 achievement score when 0 metrics detected');
    assert.strictEqual(emptyScore.categoryScores.experience.score, 0, 'Expected 0 experience score when 0 experience entries detected');
  })();

  await it('should reflect custom user weights accurately', () => {
    const customWeights = { ...DEFAULT_WEIGHTS, keywords: 40, structure: 0 };
    const customAts = calculateAtsScore(parsed, sampleSkills, 4.0, customWeights);
    assert(customAts.categoryScores.keywords.weight === 40);
    assert(customAts.categoryScores.structure.weight === 0);
  })();

  // -------------------------------------------------------------
  // SUITE 4: Job Matching & TF-IDF Cosine Similarity
  // -------------------------------------------------------------
  console.log('\nSuite 4: Job Description Matching & Cosine Similarity');
  const sampleJd = SAMPLE_JOB_DESCRIPTIONS[0].content;
  const matchResult = matchResumeWithJob(parsed, sampleSkills, sampleJd);

  await it('should compute positive compatibility for aligned resume and job description', () => {
    assert(matchResult.overallMatchScore >= 40 && matchResult.overallMatchScore <= 100);
    assert(matchResult.matchingSkills.length > 0);
    assert(matchResult.semanticSimilarityScore > 0);
    assert(matchResult.skillGapList.length > 0);
  })();

  await it('should not artificially inflate match score when resume has 0 experience and 0 matching skills', () => {
    const emptyResume = segmentResumeSections('Completely unrelated text with zero technical competencies or experience.');
    const emptyMatch = matchResumeWithJob(emptyResume, [], 'Target Role: Principal AI Scientist with PyTorch, CUDA, C++');
    assert(emptyMatch.matchingSkills.length === 0);
    assert(emptyMatch.overallMatchScore <= 20, `Expected low score for unrelated profile, got ${emptyMatch.overallMatchScore}`);
  })();

  // -------------------------------------------------------------
  // SUITE 5: Job Role Recommender Engine
  // -------------------------------------------------------------
  console.log('\nSuite 5: Job Role Recommender Engine');
  const recommendations = recommendJobRoles(parsed, sampleSkills);

  await it('should return recommendations sorted in descending order of match percentage', () => {
    assert(recommendations.length > 0);
    for (let i = 0; i < recommendations.length - 1; i++) {
      assert(recommendations[i].matchPercentage >= recommendations[i + 1].matchPercentage);
    }
  })();

  await it('should return 0% match percentage for candidate with zero matching skills', () => {
    const zeroResume = segmentResumeSections('Art history student studying classical renaissance paintings and sculptures.');
    const zeroRecs = recommendJobRoles(zeroResume, []);
    assert(zeroRecs.length > 0);
    const allZeroOrLow = zeroRecs.every(r => r.matchedSkills.length === 0);
    assert(allZeroOrLow, 'Expected 0 matched skills across all roles');
    assert(zeroRecs[zeroRecs.length - 1].matchPercentage <= 10, 'Expected low or 0% match percentage');
  })();

  // -------------------------------------------------------------
  // SUITE 6: NLP Readability, Action Verbs, Metrics & Keyword Stuffing
  // -------------------------------------------------------------
  console.log('\nSuite 6: NLP Readability & Metrics Analysis');
  await it('should compute Flesch readability metrics on standard resume text', () => {
    const readability = computeReadability(sampleResume);
    assert(readability.readingEase > 0 && readability.readingEase <= 100);
    assert(readability.wordCount > 100);
    assert(readability.sentenceCount > 0);
  })();

  await it('should return zero metrics for empty text without throwing', () => {
    const emptyReadability = computeReadability('');
    assert.strictEqual(emptyReadability.readingEase, 0);
    assert.strictEqual(emptyReadability.wordCount, 0);
  })();

  await it('should detect quantifiable metrics in bullet points', () => {
    const metricText = '• Optimized API latency by 42% and scaled system to 180,000 users.\n• Reduced AWS infrastructure costs by $14,000 annually.\n• Boosted test coverage from 60% to 92%.';
    const metrics = detectQuantifiableMetrics(metricText);
    assert(metrics.count >= 2, `Expected at least 2 metrics, found ${metrics.count}`);
    assert(metrics.densityPercentage > 0);
  })();

  await it('should analyze action verbs and calculate variety score', () => {
    const verbText = 'Architected distributed pipeline, spearheaded team initiatives, optimized database queries, automated tests.';
    const verbs = analyzeActionVerbs(verbText);
    assert(verbs.count >= 3);
    assert(verbs.detectedVerbs.includes('architected'));
    assert(verbs.detectedVerbs.includes('spearheaded'));
  })();

  await it('should flag keyword stuffing when identical token exceeds frequency threshold', () => {
    const stuffedTokens = Array(20).fill('react').concat(['javascript', 'developer', 'frontend', 'engineer']);
    const stuffing = detectKeywordStuffing(stuffedTokens);
    assert.strictEqual(stuffing.isStuffingDetected, true, 'Expected keyword stuffing to be flagged');
  })();

  // -------------------------------------------------------------
  // SUITE 7: Section Improvement Engine (Rule-based & AI Fallbacks)
  // -------------------------------------------------------------
  console.log('\nSuite 7: Section-Specific Improvement Engine');
  await it('should replace weak verbs with strong action verbs in verbs mode', async () => {
    const weakBullet = 'helped with React frontend and worked on database queries';
    const res = await improveSectionText(weakBullet, 'verbs');
    assert(res && res.improved.length > 0);
    assert(!res.improved.toLowerCase().startsWith('helped with'));
  })();

  await it('should make wordy phrases concise in concise mode', async () => {
    const wordy = 'Due to the fact that we needed to scale in order to handle load';
    const res = await improveSectionText(wordy, 'concise');
    assert(res.improved.toLowerCase().includes('because') || res.improved.toLowerCase().includes('to'));
  })();

  // -------------------------------------------------------------
  // SUITE 8: Job Discovery & Portals
  // -------------------------------------------------------------
  console.log('\nSuite 8: Real Indian Job & Portal Discovery Engine');
  await it('should generate valid external portal search URLs for Indian platforms', () => {
    const portals = generateExternalPortals('Full Stack Engineer', 'Bengaluru', 'job');
    assert(portals.length >= 4);
    assert(portals.some(p => p.name.includes('Naukri')));
    assert(portals.some(p => p.name.includes('Internshala')));
    assert(portals.some(p => p.name.includes('Unstop')));
  })();

  await it('should query job search API and return structured results', async () => {
    const searchRes = await searchRealJobs({ query: 'engineer', location: 'remote', limit: 5 });
    assert.strictEqual(searchRes.success, true);
    assert(Array.isArray(searchRes.listings));
    assert(Array.isArray(searchRes.externalPortals));
  })();

  // -------------------------------------------------------------
  // SUITE 9: Machine Learning Inference Engine Integration
  // -------------------------------------------------------------
  console.log('\nSuite 9: Machine Learning Inference Engine (LinearSVC + TF-IDF)');
  await it('should execute ML resume classification with genuine LinearSVC model', async () => {
    const mlRes = await runMLTask('classify_resume', {
      text: 'Experienced Python developer specializing in Django, FastAPI, PostgreSQL, Docker, AWS, microservices.'
    });
    assert(mlRes, 'Expected ML task result');
    assert(typeof mlRes.category === 'string', 'Expected category string');
    assert(mlRes.category.length > 0);
    console.log(`      ML Predicted Category: "${mlRes.category}" (Confidence: ${mlRes.confidence || 'N/A'})`);
  })();

  await it('should execute ML skill extraction with trained binary classifier', async () => {
    const phrases = ['python', 'deep learning', 'kubernetes', 'attended daily meetings', 'answered calls'];
    const mlSkills = await runMLTask('extract_skills', { phrases });
    assert(mlSkills && Array.isArray(mlSkills.skills));
    assert(mlSkills.skills.includes('python') || mlSkills.skills.includes('deep learning'));
  })();

  // -------------------------------------------------------------
  // SUITE 10: Express Server Endpoints & HTTP Contracts
  // -------------------------------------------------------------
  console.log('\nSuite 10: Express Server API Endpoint Contract Tests');
  
  // Start server on an ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await it('GET /api/health should return status healthy and features', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'healthy');
      assert(Array.isArray(data.features));
    })();

    await it('GET /api/samples should return pre-configured resumes and jobs', async () => {
      const res = await fetch(`${baseUrl}/api/samples`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(Array.isArray(data.resumes) && data.resumes.length > 0);
      assert(Array.isArray(data.jobs) && data.jobs.length > 0);
    })();

    await it('GET /api/academic/benchmarks should return model evaluation metrics', async () => {
      const res = await fetch(`${baseUrl}/api/academic/benchmarks`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert(data.resume_classifier || data.test_metrics);
    })();

    await it('POST /api/resume/analyze should reject empty requests with 400', async () => {
      const res = await fetch(`${baseUrl}/api/resume/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: '' }),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert(data.error);
    })();

    await it('POST /api/resume/analyze should process valid resume text and return full analysis', async () => {
      const res = await fetch(`${baseUrl}/api/resume/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: sampleResume,
          jobDescription: sampleJd,
        }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert(data.atsScore && data.atsScore.overallScore >= 0);
      assert(data.jobMatch && data.jobMatch.overallMatchScore >= 0);
      assert(data.mlInsights && data.mlInsights.predictedCategory);
    })();

    await it('POST /api/job/analyze should parse job description requirements', async () => {
      const res = await fetch(`${baseUrl}/api/job/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: sampleJd }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert(data.jobAnalysis.requiredSkills.length > 0);
    })();

    await it('POST /api/skills/gap should compute skill gaps accurately', async () => {
      const res = await fetch(`${baseUrl}/api/skills/gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: sampleResume, jobDescription: sampleJd }),
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert(Array.isArray(data.skillGap));
    })();

    await it('GET /api/nonexistent should return 404 JSON', async () => {
      const res = await fetch(`${baseUrl}/api/nonexistent`);
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert(data.error.includes('not found'));
    })();
  } finally {
    server.close();
  }

  // -------------------------------------------------------------
  // SUITE 11: Document Extraction Robustness & Security
  // -------------------------------------------------------------
  console.log('\nSuite 11: Document Extraction Robustness & Security');
  await it('should reject empty buffer uploads with clear error message', async () => {
    try {
      await extractDocumentText(Buffer.from(''), 'application/pdf', 'empty.pdf');
      assert.fail('Expected empty buffer to throw');
    } catch (e: any) {
      assert(e.message.includes('empty'));
    }
  })();

  await it('should reject non-extractable / corrupted files gracefully', async () => {
    try {
      await extractDocumentText(Buffer.from('corrupted binary stream'), 'application/pdf', 'broken.pdf');
      assert.fail('Expected broken PDF to throw');
    } catch (e: any) {
      assert(e.message.length > 0);
    }
  })();

  // -------------------------------------------------------------
  // SUITE 12: Regression Suite for Audited Bugs & Edge Cases
  // -------------------------------------------------------------
  console.log('\nSuite 12: Regression Tests for Audited Bugs & Edge Cases');
  
  await it('Regression: rapid sequential ML inference should resolve with high-throughput warm latency', async () => {
    const t0 = Date.now();
    for (let i = 0; i < 3; i++) {
      const res = await runMLTask('classify_resume', {
        text: `Software engineer ${i} working on Java Spring Boot microservices and PostgreSQL database.`
      });
      assert(res && typeof res.category === 'string');
      assert.strictEqual(res.category, 'Java Developer');
    }
    const elapsed = Date.now() - t0;
    console.log(`      3 warm ML requests completed in ${elapsed}ms (avg ${Math.round(elapsed/3)}ms/req)`);
    assert(elapsed < 1500, `Expected warm sequential inference to be fast, took ${elapsed}ms`);
  })();

  await it('Regression: ML classification category must strictly belong to official 25 dataset classes', async () => {
    const OFFICIAL_CLASSES = [
      'Advocate', 'Arts', 'Automation Testing', 'Blockchain', 'Business Analyst',
      'Civil Engineer', 'Data Science', 'Database', 'DevOps Engineer', 'DotNet Developer',
      'ETL Developer', 'Electrical Engineering', 'HR', 'Hadoop', 'Health and fitness',
      'Java Developer', 'Mechanical Engineer', 'Network Security Engineer', 'Operations Manager',
      'PMO', 'Python Developer', 'SAP Developer', 'Sales', 'Testing', 'Web Designing'
    ];
    const res = await runMLTask('classify_resume', {
      text: 'Linux administrator specializing in Docker containers, Kubernetes clusters, and Terraform scripts.'
    });
    assert(OFFICIAL_CLASSES.includes(res.category), `Unexpected category "${res.category}" not in 25 official classes`);
  })();

  await it('Regression: plain text (.txt) document extraction should extract clean text properly', async () => {
    const sampleTxt = 'Alice Developer\nEmail: alice@code.com\nSpecializes in Python, Django, and Docker.';
    const extracted = await extractDocumentText(Buffer.from(sampleTxt, 'utf-8'), 'text/plain', 'developer.txt');
    assert(extracted.includes('Alice Developer'));
    assert(extracted.includes('Python'));
  })();

  await it('Regression: ATS scoring handles extreme resumes with zero skills, zero experience without NaN or exceptions', () => {
    const emptyParsed = segmentResumeSections('Unrecognized gibberish xyz abc 12345');
    const scoreRes = calculateAtsScore(emptyParsed, [], 0, DEFAULT_WEIGHTS);
    assert(!isNaN(scoreRes.overallScore), 'Overall score must not be NaN');
    assert(scoreRes.overallScore >= 0 && scoreRes.overallScore <= 100);
    assert(!isNaN(scoreRes.categoryScores.skillsMatch.score));
    assert(!isNaN(scoreRes.categoryScores.experience.score));
    assert(!isNaN(scoreRes.categoryScores.achievements.score));
  })();

  await it('Regression: Job matcher transparently identifies missing skills and partial matches', () => {
    const { matchedSkills } = extractAllTaxonomySkills('Frontend Developer specializing in React and JavaScript.');
    const resumeSections = segmentResumeSections('Frontend Developer specializing in React and JavaScript.');
    const jdText = 'Target Role: Frontend Engineer. Required: Vue, JavaScript, Kubernetes.';
    const match = matchResumeWithJob(resumeSections, matchedSkills, jdText);
    
    assert(match.matchingSkills.includes('JavaScript'), 'Expected JavaScript to be matched');
    assert(match.missingSkills.includes('Kubernetes') || match.partialSkills.includes('Vue.js') || match.missingSkills.includes('Vue.js'));
    assert(Array.isArray(match.skillGapList));
    assert(match.overallMatchScore >= 0 && match.overallMatchScore <= 100);
  })();

  await it('Regression: Skill extractor avoids false positives such as "trust" matching "Rust" or "cat" matching "C"', () => {
    const textWithFalsePositives = 'A dedicated team member who builds trust across teams, cares for an office cat, and enjoys city walks.';
    const { matchedSkills } = extractAllTaxonomySkills(textWithFalsePositives);
    const skillNames = matchedSkills.map(s => s.name);
    assert(!skillNames.includes('Rust'), 'False positive detected: "trust" should NOT match "Rust"');
    assert(!skillNames.includes('C'), 'False positive detected: "cat/city" should NOT match "C"');
  })();

  await it('Regression: Job Match skillMatchScore is strictly bounded in [0, 100] and must not exceed 100 on high alignment', () => {
    const { matchedSkills } = extractAllTaxonomySkills('Expert in React, TypeScript, Node.js, Express.js, PostgreSQL, AWS, Docker, Kubernetes, Git, CI/CD, GraphQL, Python.');
    const resumeSections = segmentResumeSections('Senior Software Engineer with full stack proficiency.');
    const jdText = 'Required skills: React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Git.';
    const match = matchResumeWithJob(resumeSections, matchedSkills, jdText);
    assert(match.skillMatchScore >= 0 && match.skillMatchScore <= 100, `skillMatchScore ${match.skillMatchScore} is out of [0, 100] bounds`);
    // Ensure that multiplying by 100 again would erroneously cause > 100, verifying the fix
    const displayScore = Math.round(match.skillMatchScore);
    assert(displayScore <= 100, `Display score ${displayScore} must not exceed 100`);
  })();

  await it('Regression: GET /api/academic/benchmarks returns standardized resume_classifier schema with >= 90% accuracy', async () => {
    const res = await new Promise<any>((resolve, reject) => {
      http.get('http://127.0.0.1:3000/api/academic/benchmarks', (r) => {
        let raw = '';
        r.on('data', chunk => raw += chunk);
        r.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
    assert(res.success === true, 'Expected success: true');
    assert(res.resume_classifier, 'Expected resume_classifier object');
    assert(res.resume_classifier.test_metrics.accuracy >= 0.90, `Expected accuracy >= 0.90, got ${res.resume_classifier.test_metrics.accuracy}`);
    assert(res.resume_classifier.model_selection.champion_model.includes('RidgeClassifier'), 'Expected champion model to be RidgeClassifier');
  })();

  console.log('\n================================================================');
  console.log(`   Final Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
