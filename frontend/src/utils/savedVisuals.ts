import type { SavedVisual } from '../api/users';

export type FavoritesSortOption = 'recent' | 'az' | 'za';

export function sortSavedVisuals(
  savedVisuals: SavedVisual[],
  sort: FavoritesSortOption
): SavedVisual[] {
  const visuals = [...savedVisuals];

  if (sort === 'az') {
    return visuals.sort((a, b) => a.visualizerId.name.localeCompare(b.visualizerId.name));
  }

  if (sort === 'za') {
    return visuals.sort((a, b) => b.visualizerId.name.localeCompare(a.visualizerId.name));
  }

  return visuals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSavedVisualIds(savedVisuals: SavedVisual[]): string[] {
  return savedVisuals.map((savedVisual) => savedVisual.visualizerId._id);
}
