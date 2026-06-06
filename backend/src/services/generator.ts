import type { GenerateVisualizerRequest } from '@sonix/shared';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.0-flash';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY environment variable is not set');
  return key;
}

function getModel(): string {
  return process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
}

export async function generateShader(payload: GenerateVisualizerRequest): Promise<string> {
  const apiKey = getApiKey();
  const model = getModel();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Network error when calling Gemini API');
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as GeminiResponse;
    throw new Error(
      `Gemini API error ${response.status}: ${data.error?.message ?? 'unknown error'}`
    );
  }

  const data = (await response.json()) as GeminiResponse;
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!raw) {
    throw new Error('Gemini returned no shader content');
  }

  // Strip markdown code fences Gemini sometimes adds despite instructions
  const text = raw
    .replace(/^```(?:glsl)?\s*\n?/, '')
    .replace(/\n?```\s*$/, '')
    .trim();

  return text;
}
