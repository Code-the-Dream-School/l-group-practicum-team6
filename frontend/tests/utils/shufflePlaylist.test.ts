import { describe, expect, it } from 'vitest';

import { shuffleIds } from '../../src/utils/shufflePlaylist';

describe('shuffleIds', () => {
  it('returns a permutation of the input ids', () => {
    const ids = ['a', 'b', 'c', 'd'];

    const shuffled = shuffleIds(ids, () => 0);

    expect(shuffled).toHaveLength(ids.length);
    expect([...shuffled].sort()).toEqual(ids);
    expect(shuffled).not.toEqual(ids);
  });

  it('returns an empty array for an empty input', () => {
    expect(shuffleIds([])).toEqual([]);
  });
});
