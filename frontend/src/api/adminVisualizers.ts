import {
  API_ROUTES,
  type ApiResponse,
  type GenerateVisualizerRequest,
  type Visualizer,
} from '@sonix/shared';
import { buildAdminVisualizerEndpoint } from './endpoints';
import { apiFetch } from './client';
import { TOKEN_LIMIT } from '@sonix/shared';

export type AdminVisualizerPayload = {
  name?: string;
  source?: string;
  imageUrl?: string;
  glsl?: string;
  isDemo?: boolean;
  tags?: string[];
};

export function generateVisualiser(
  userPrompt: string,
  systemPrompt: string
): Promise<ApiResponse<Pick<Visualizer, 'glsl' | 'name' | 'tags' | 'source'>>> {
  const payload: GenerateVisualizerRequest = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: TOKEN_LIMIT,
    },
  };
  return apiFetch<ApiResponse<Visualizer>>(API_ROUTES.ADMIN_VISUALIZERS_GENERATE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createAdminVisualizer(
  payload: Required<Pick<AdminVisualizerPayload, 'name' | 'glsl'>> & AdminVisualizerPayload
): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(API_ROUTES.ADMIN_VISUALIZERS, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminVisualizer(
  id: string,
  payload: AdminVisualizerPayload
): Promise<ApiResponse<Visualizer>> {
  return apiFetch<ApiResponse<Visualizer>>(buildAdminVisualizerEndpoint(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminVisualizer(id: string): Promise<void> {
  return apiFetch<void>(buildAdminVisualizerEndpoint(id), {
    method: 'DELETE',
  });
}
