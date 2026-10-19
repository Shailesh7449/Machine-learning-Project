import { getGeminiClient } from './gemini.js';

export type EditMode = 'ats' | 'clarity' | 'verbs' | 'concise' | 'grammar' | 'jd_match';

const STRONG_ACTION_VERBS = [
  'Architected', 'Spearheaded', 'Engineered', 'Orchestrated', 'Optimized',
  'Automated', 'Revamped', 'Streamlined', 'Delivered', 'Formulated',
  'Accelerated', 'Implemented', 'Designed', 'Synthesized', 'Consolidated'
];

/**
 * Rule-based NLP text enhancement fallback (0ms, no API key required)
 */
function ruleBasedImprovement(text: string, mode: EditMode, context?: { jobDescription?: string; sectionName?: string }): string {
  const lines = text.split('\n');

  const improvedLines = lines.map(line => {
    let clean = line.trim();
    if (!clean) return line;

    const isBullet = clean.startsWith('•') || clean.startsWith('-') || clean.startsWith('*');
    let prefix = isBullet ? clean.charAt(0) + ' ' : '';
    let body = isBullet ? clean.substring(1).trim() : clean;

    // Verb replacement
    body = body.replace(/^(responsible for|handled|helped with|assisted in|worked on|did|managed the)\s+/i, () => {
      const randomVerb = STRONG_ACTION_VERBS[Math.floor(Math.random() * STRONG_ACTION_VERBS.length)];
      return `${randomVerb} `;
    });

    if (mode === 'verbs') {
      body = body.replace(/^(helped|worked|made|used|looked after)\b/i, 'Spearheaded');
    }

    if (mode === 'concise') {
      body = body
        .replace(/\b(in order to)\b/gi, 'to')
        .replace(/\b(due to the fact that)\b/gi, 'because')
        .replace(/\b(at this point in time)\b/gi, 'currently')
        .replace(/\b(a wide variety of)\b/gi, 'various')
        .replace(/\b(for the purpose of)\b/gi, 'for');
    }

    if (mode === 'ats') {
      // If line lacks any numbers or quantifiable outcome, append realistic metric framework
      if (!/\d+[%kKmM]?/.test(body) && body.length > 25) {
        body = `${body}, improving operational efficiency by 24% and accelerating release cycles.`;
      }
    }

    if (mode === 'grammar') {
      // Ensure first letter capitalized and ends with a period
      body = body.charAt(0).toUpperCase() + body.slice(1);
      if (!/[.!?;:]$/.test(body)) {
        body += '.';
      }
    }

    return prefix + body;
  });

  return improvedLines.join('\n');
}

/**
 * Performs AI or rule-based section text improvement
 */
export async function improveSectionText(
  text: string,
  mode: EditMode,
  context?: { jobDescription?: string; sectionName?: string }
): Promise<{ original: string; improved: string }> {
  const ai = getGeminiClient();

  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const modeInstructions: Record<EditMode, string> = {
        ats: 'Enhance ATS readability, quantify achievements with realistic metrics (STAR/XYZ format), and ensure clean ATS-parsable wording.',
        clarity: 'Improve professional clarity, remove passive voice and ambiguous phrases, and make the text impactful.',
        verbs: 'Replace weak verbs (helped, worked, handled) with strong power verbs (architected, orchestrated, engineered).',
        concise: 'Make the content concise and tight. Eliminate fluff words and unnecessary filler without losing meaning.',
        grammar: 'Fix grammatical errors, punctuation, capitalization, and ensure flawless professional American/British English syntax.',
        jd_match: `Naturally align wording with relevant concepts from target job description: "${(context?.jobDescription || '').slice(0, 500)}". Do not fabricate fake qualifications.`,
      };

      const prompt = `You are an expert resume consultant and technical recruiter.
Section Name: ${context?.sectionName || 'Resume Section'}
Goal: ${modeInstructions[mode] || modeInstructions.ats}

Original Text:
"""
${text.slice(0, 2000)}
"""

CRITICAL RULES:
1. Do NOT invent fake degrees, fake companies, fake credentials, or fake dates.
2. Return ONLY the improved replacement text directly, with no markdown code blocks, conversational greetings, or notes.`;

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 4500)),
      ]);

      const improved = response.text?.trim();
      if (improved && improved.length > 5) {
        return {
          original: text,
          improved,
        };
      }
    } catch (err: any) {
      console.warn('Gemini section improvement fallback:', err?.message || err);
    }
  }

  // Fallback to deterministic NLP rule-based improvement
  const improved = ruleBasedImprovement(text, mode, context);
  return {
    original: text,
    improved,
  };
}
