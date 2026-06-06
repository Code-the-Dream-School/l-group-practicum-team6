import { describe, expect, it } from 'vitest';

import {
  getTargetId,
  getLoopedIdOnPage,
  getLoopedVisualId,
  getVisualIds,
  getWrappedPage,
} from '../../src/utils/visualizerPlayback';

const visuals = [
  { _id: 'a', name: 'A', isDemo: false },
  { _id: 'b', name: 'B', isDemo: false },
  { _id: 'demo', name: 'Demo', isDemo: true },
  { _id: 'c', name: 'C', isDemo: false },
];

describe('visualizerPlayback utils', () => {
  it('includes demo visuals in playlist ids', () => {
    expect(getVisualIds(visuals)).toEqual(['a', 'b', 'demo', 'c']);
  });

  it('resolves adjacent ids on the same page', () => {
    const ids = ['a', 'b', 'c'];

    expect(getLoopedIdOnPage(ids, 1, 'next')).toBe('c');
    expect(getLoopedIdOnPage(ids, 1, 'previous')).toBe('a');
    expect(getLoopedIdOnPage(ids, 0, 'previous')).toBeNull();
    expect(getLoopedIdOnPage(ids, 2, 'next')).toBeNull();
  });

  it('falls back to page ends when the current visual is outside the page list', () => {
    const ids = ['a', 'b', 'c'];

    expect(getLoopedIdOnPage(ids, -1, 'next')).toBe('a');
    expect(getLoopedIdOnPage(ids, -1, 'previous')).toBe('c');
  });

  it('wraps page numbers at playlist boundaries', () => {
    expect(getWrappedPage(1, 'previous', 3)).toBe(3);
    expect(getWrappedPage(3, 'next', 3)).toBe(1);
    expect(getWrappedPage(2, 'next', 3)).toBe(3);
    expect(getWrappedPage(2, 'previous', 3)).toBe(1);
  });

  it('loops within a flat playlist', () => {
    const ids = ['a', 'b', 'c'];

    expect(getLoopedVisualId(ids, 2, 'next')).toBe('a');
    expect(getLoopedVisualId(ids, 0, 'previous')).toBe('c');
    expect(getLoopedVisualId(ids, 1, 'next')).toBe('c');
  });

  it('picks the first or last id when crossing page boundaries', () => {
    expect(getTargetId(['x', 'y', 'z'], 'next')).toBe('x');
    expect(getTargetId(['x', 'y', 'z'], 'previous')).toBe('z');
    expect(getTargetId([], 'next')).toBeNull();
  });
});
