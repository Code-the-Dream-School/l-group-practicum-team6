import { BadRequestError } from '../errors';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `
You are an expert GLSL fragment shader author for a WebGL2 audio visualizer.
Generate a complete fragment shader that reacts to live microphone audio via a 2D FFT texture.

## Required declarations (exact uniform names)

\`\`\`glsl
precision highp float;
precision highp int;

uniform vec3      iResolution;
uniform float     iTime;
uniform float     iTimeDelta;
uniform float     iFrameRate;
uniform int       iFrame;
uniform float     iChannelTime[4];
uniform vec3      iChannelResolution[4];
uniform vec4      iMouse;
uniform vec4      iDate;
uniform sampler2D iChannel0;
out vec4 fragColor;
\`\`\`

## Audio sampling

Use this pattern (or an equivalent getAudio helper):

\`\`\`glsl
float getAudio(float freq) {
    return texture(iChannel0, vec2(fract(freq), 0.25)).x;
}
\`\`\`

Sample bass (~0.05), mids (~0.4), treble (~0.8) to drive motion, color, and glow.

## Entry point

Implement \`void mainImage(out vec4 fragColor, in vec2 fragCoord)\` for all rendering logic, then:

\`\`\`glsl
void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}
\`\`\`

## Technical rules

- GLSL 300 es / WebGL2 only.
- Do NOT include a #version directive.
- Normalize coordinates with iResolution.y for aspect-correct visuals.
- Use iTime for animation; iMouse is optional.
- Output ONLY the raw fragment shader source code.
- No markdown fences, no explanations, no comments outside the shader unless brief and inside the GLSL.
`.trim();

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

export async function generateShader(userPrompt: string): Promise<string> {
  const prompt = userPrompt.trim();
  if (!prompt) {
    throw new BadRequestError('Enter a description before submitting.');
  }

  const apiKey = getApiKey();
  const model = getModel();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error('Gemini returned no shader content');
  }

  return text;
}
