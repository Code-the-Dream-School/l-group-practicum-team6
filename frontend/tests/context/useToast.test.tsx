import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useToast } from '../../src/context/useToast';

function Probe() {
  useToast();
  return <div>ok</div>;
}

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    expect(() => render(<Probe />)).toThrow('useToast must be used within a ToastProvider');
  });
});
