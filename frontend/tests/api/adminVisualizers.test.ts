import { API_ROUTES } from '@sonix/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAdminVisualizer,
  deleteAdminVisualizer,
  generateVisualiser,
  updateAdminVisualizer,
} from '../../src/api/adminVisualizers';
import { apiFetch } from '../../src/api/client';

vi.mock('../../src/api/client', () => ({
  apiFetch: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);

describe('admin visualizers api', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it('generateVisualiser posts generation payload to admin generate endpoint', () => {
    generateVisualiser('make a wave visualizer', 'system prompt');

    expect(mockedApiFetch).toHaveBeenCalledWith(API_ROUTES.ADMIN_VISUALIZERS_GENERATE, {
      method: 'POST',
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: 'system prompt' }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: 'make a wave visualizer' }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 15000,
        },
      }),
    });
  });

  it('createAdminVisualizer posts payload to admin visualizers endpoint', () => {
    const payload = {
      name: 'New Visualizer',
      glsl: 'void main() {}',
      source: 'manual',
      imageUrl: '/image.png',
      isDemo: false,
      tags: ['wave', 'audio'],
    };

    createAdminVisualizer(payload);

    expect(mockedApiFetch).toHaveBeenCalledWith(API_ROUTES.ADMIN_VISUALIZERS, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('updateAdminVisualizer patches payload to visualizer by id endpoint', () => {
    const payload = {
      name: 'Updated Visualizer',
      tags: ['updated'],
    };

    updateAdminVisualizer('visualizer-123', payload);

    expect(mockedApiFetch).toHaveBeenCalledWith(`${API_ROUTES.ADMIN_VISUALIZERS}/visualizer-123`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  });

  it('deleteAdminVisualizer sends delete request to visualizer by id endpoint', () => {
    deleteAdminVisualizer('visualizer-123');

    expect(mockedApiFetch).toHaveBeenCalledWith(`${API_ROUTES.ADMIN_VISUALIZERS}/visualizer-123`, {
      method: 'DELETE',
    });
  });
});
