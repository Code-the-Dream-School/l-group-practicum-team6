import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAuth } from '../../src/context/useAuth';

function Probe() {
  useAuth();
  return <div>ok</div>;
}

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => render(<Probe />)).toThrow('useAuth must be used within an AuthProvider');
  });
});
