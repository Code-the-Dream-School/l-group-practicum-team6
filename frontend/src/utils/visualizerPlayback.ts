import type { VisualizerListItem } from '@sonix/shared';

export function getVisualIds(visuals: VisualizerListItem[]): string[] {
  return visuals.map((visual) => visual._id);
}

export function getLoopedIdOnPage(
  ids: string[],
  currentIndex: number,
  direction: 'next' | 'previous'
): string | null {
  if (ids.length === 0) {
    return null;
  }

  if (currentIndex < 0) {
    return direction === 'next' ? (ids[0] ?? null) : (ids[ids.length - 1] ?? null);
  }

  const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

  if (nextIndex >= 0 && nextIndex < ids.length) {
    return ids[nextIndex] ?? null;
  }

  return null;
}

export function getWrappedPage(
  currentPage: number,
  direction: 'next' | 'previous',
  totalPages: number
): number {
  if (totalPages <= 0) {
    return 1;
  }

  if (direction === 'next') {
    return currentPage >= totalPages ? 1 : currentPage + 1;
  }

  return currentPage <= 1 ? totalPages : currentPage - 1;
}

export function getBoundaryPageTargetId(
  ids: string[],
  direction: 'next' | 'previous'
): string | null {
  if (ids.length === 0) {
    return null;
  }

  return direction === 'next' ? (ids[0] ?? null) : (ids[ids.length - 1] ?? null);
}
