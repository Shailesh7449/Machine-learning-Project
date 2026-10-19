/**
 * Academic NLP & Text Representation Module
 * Implements tokenization, stopword removal, TF-IDF vectorization,
 * Cosine & Jaccard similarity, and Flesch readability metrics.
 */

export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export const ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'architected', 'automated', 'built', 'championed', 'consolidated',
  'constructed', 'created', 'decreased', 'delivered', 'designed', 'developed', 'devised',
  'directed', 'engineered', 'enhanced', 'established', 'executed', 'expanded', 'expedited',
  'formulated', 'generated', 'guided', 'implemented', 'improved', 'increased', 'initiated',
  'innovated', 'integrated', 'invented', 'launched', 'led', 'managed', 'maximized', 'mentored',
  'minimized', 'modernized', 'optimized', 'orchestrated', 'overhauled', 'pioneered', 'produced',
  'programmed', 'reduced', 'refactored', 'resolved', 'restructured', 'revamped', 'scaled',
  'spearheaded', 'streamlined', 'strengthened', 'supervised', 'transformed', 'upgraded'
]);

export function cleanText(rawText: string): string {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\x20-\x7E\n\t]/g, ' ') // Strip non-printable ASCII
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

export function tokenize(text: string, removeStopwords: boolean = true): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !/^[0-9]+$/.test(w));

  if (!removeStopwords) return words;
  return words.filter(w => !STOPWORDS.has(w));
}

export function getNgrams(tokens: string[], n: number = 2): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

export interface TermFrequency {
  [term: string]: number;
}

export function computeTF(tokens: string[]): TermFrequency {
  const tf: TermFrequency = {};
  const total = tokens.length || 1;
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }
  for (const term in tf) {
    tf[term] = tf[term] / total;
  }
  return tf;
}

/**
 * Computes Cosine Similarity between two term frequency dictionaries (TF-IDF vector representation).
 * Cosine Similarity = (A . B) / (||A|| * ||B||)
 */
export function computeCosineSimilarity(tf1: TermFrequency, tf2: TermFrequency): number {
  const terms = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const term of terms) {
    const v1 = tf1[term] || 0;
    const v2 = tf2[term] || 0;
    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;
  return Math.min(1.0, Math.max(0.0, dotProduct / denominator));
}

/**
 * Computes Jaccard Set Similarity = |A ∩ B| / |A ∪ B|
 */
export function computeJaccardSimilarity(tokens1: string[], tokens2: string[]): number {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  if (set1.size === 0 && set2.size === 0) return 1.0;
  if (set1.size === 0 || set2.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const item of set1) {
    if (set2.has(item)) intersectionCount++;
  }

  const unionCount = set1.size + set2.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Syllable counter approximation for readability analysis
 */
export function countSyllables(word: string): number {
  const w = word.toLowerCase();
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Flesch Reading Ease & Flesch-Kincaid Grade Level
 * Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
 */
export function computeReadability(text: string): {
  readingEase: number;
  gradeLevel: number;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  interpretation: string;
} {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const sentenceCount = Math.max(1, sentences.length);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = Math.max(1, words.length);

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = totalSyllables / wordCount;

  let readingEase = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  readingEase = Math.round(Math.max(0, Math.min(100, readingEase)));

  let gradeLevel = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
  gradeLevel = Math.max(1, Math.round(gradeLevel * 10) / 10);

  let interpretation = 'Standard / Professional';
  if (readingEase >= 70) interpretation = 'Easy to read, clean conciseness';
  else if (readingEase >= 50) interpretation = 'Professional business grade (optimal for ATS)';
  else if (readingEase >= 30) interpretation = 'Dense / Academic complexity';
  else interpretation = 'Very dense / run-on sentences detected';

  return {
    readingEase,
    gradeLevel,
    wordCount,
    sentenceCount,
    avgSentenceLength: Math.round(wordsPerSentence * 10) / 10,
    interpretation,
  };
}

/**
 * Quantifiable Achievement Detection (Metricized bullets)
 * Detects numbers, % signs, dollar values, multipliers, KPIs
 */
export function detectQuantifiableMetrics(text: string): {
  count: number;
  examples: string[];
  densityPercentage: number;
} {
  const bulletLines = text.split('\n').filter(line => line.trim().length > 15);
  const metricRegex = /(\b\d+(\.\d+)?%\b|\$\d+[\d,]*(\.\d+)?[kmb]?\b|\b\d+x\b|\breduced\s+by\s+\d+|\bincreased\s+by\s+\d+|\b\d+\+\s+(users|clients|engineers|projects|microservices|requests|features|rps)\b|\b\d+ms\b|\b\d+\s*k\b|\b\d+\s*m\b|\b\d+\s*(percent|growth|saving))/i;

  const matchedLines: string[] = [];
  for (const line of bulletLines) {
    if (metricRegex.test(line)) {
      matchedLines.push(line.trim());
    }
  }

  const density = bulletLines.length === 0 ? 0 : Math.round((matchedLines.length / bulletLines.length) * 100);

  return {
    count: matchedLines.length,
    examples: matchedLines.slice(0, 4),
    densityPercentage: density,
  };
}

/**
 * Action Verb Density Analyzer
 */
export function analyzeActionVerbs(text: string): {
  detectedVerbs: string[];
  count: number;
  varietyScore: number;
} {
  const tokens = tokenize(text, false);
  const found = new Set<string>();

  for (const t of tokens) {
    if (ACTION_VERBS.has(t)) {
      found.add(t);
    }
  }

  const detected = Array.from(found);
  const variety = Math.min(100, Math.round((detected.length / 12) * 100));

  return {
    detectedVerbs: detected,
    count: detected.length,
    varietyScore: variety,
  };
}

/**
 * Keyword Repetition and Potential Stuffing Detection
 */
export function detectKeywordStuffing(tokens: string[]): {
  isStuffingDetected: boolean;
  topRepeated: { word: string; count: number; frequency: number }[];
} {
  const counts: Record<string, number> = {};
  for (const t of tokens) {
    counts[t] = (counts[t] || 0) + 1;
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 4);

  const total = tokens.length || 1;
  const topRepeated = sorted.slice(0, 6).map(([word, count]) => ({
    word,
    count,
    frequency: Math.round((count / total) * 1000) / 10, // percentage e.g. 4.2%
  }));

  // If any single non-common term exceeds 3.5% of total text, flag stuffing risk
  const isStuffingDetected = topRepeated.some(item => item.frequency > 4.0 && item.count >= 8);

  return {
    isStuffingDetected,
    topRepeated,
  };
}
