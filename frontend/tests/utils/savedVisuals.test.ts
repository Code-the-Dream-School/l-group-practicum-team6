import { describe, expect, it } from 'vitest';

import type { SavedVisual } from '../../src/api/users';
import { getSavedVisualIds, sortSavedVisuals } from '../../src/utils/savedVisuals';

function createSavedVisual(id: string, name: string, createdAt: string): SavedVisual {
  return {
    _id: `saved-${id}`,
    userId: 'user-1',
    visualizerId: {
      _id: id,
      name,
      source: '',
      glsl: '',
      isDemo: false,
    },
    createdAt,
    updatedAt: createdAt,
  };
}

describe('savedVisuals utils', () => {
  const savedVisuals = [
    createSavedVisual('c', 'Charlie', '2026-01-03T00:00:00.000Z'),
    createSavedVisual('a', 'Alpha', '2026-01-01T00:00:00.000Z'),
    createSavedVisual('b', 'Bravo', '2026-01-02T00:00:00.000Z'),
  ];

  it('sorts favorites by recent save date by default', () => {
    expect(getSavedVisualIds(sortSavedVisuals(savedVisuals, 'recent'))).toEqual(['c', 'b', 'a']);
  });

  it('sorts favorites alphabetically', () => {
    expect(getSavedVisualIds(sortSavedVisuals(savedVisuals, 'az'))).toEqual(['a', 'b', 'c']);
    expect(getSavedVisualIds(sortSavedVisuals(savedVisuals, 'za'))).toEqual(['c', 'b', 'a']);
  });
});
