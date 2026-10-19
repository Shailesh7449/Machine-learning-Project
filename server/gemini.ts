import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface AiEnhancementResult {
  executiveSummaryAnalysis: string;
  bulletPointRewrites: {
    original: string;
    improved: string;
    rationale: string;
  }[];
  tailoringAdvice: string[];
}

/**
 * Uses Gemini 3.8 Flash strictly for semantic explanation and bullet point rewriting,
 * never for fabricating scores or entities.
 */
export async function generateAiEnhancement(
  resumeText: string,
  targetJobDescription?: string
): Promise<AiEnhancementResult | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const prompt = `You are a principal technical recruiter and resume strategist. Analyze the provided resume text ${
      targetJobDescription ? 'and target job description' : ''
    }.
Provide:
1. A concise, realistic executive summary analysis (2-3 sentences assessing market readiness).
2. Exactly 3 high-impact bullet point rewrites of the weakest or least quantified bullets in the resume. Each rewrite must follow the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]" using strong action verbs.
3. 3 specific tailoring recommendations.

Resume text:
${resumeText.slice(0, 3000)}

${targetJobDescription ? `Target Job Description:\n${targetJobDescription.slice(0, 2000)}` : ''}

Respond in strictly valid JSON format with keys:
{
  "executiveSummaryAnalysis": "...",
  "bulletPointRewrites": [
    { "original": "...", "improved": "...", "rationale": "..." }
  ],
  "tailoringAdvice": ["...", "...", "..."]
}`;

    const apiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    // 5-second timeout safeguard so analysis never delays
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), 5000)
    );

    const response = await Promise.race([apiPromise, timeoutPromise]);
    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    return {
      executiveSummaryAnalysis: parsed.executiveSummaryAnalysis || '',
      bulletPointRewrites: Array.isArray(parsed.bulletPointRewrites) ? parsed.bulletPointRewrites : [],
      tailoringAdvice: Array.isArray(parsed.tailoringAdvice) ? parsed.tailoringAdvice : [],
    };
  } catch (err: any) {
    console.warn('Gemini enhancement warning (using local NLP rewrite fallback):', err?.message || err);
    return null;
  }
}
