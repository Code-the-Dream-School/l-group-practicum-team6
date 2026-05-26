import { render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ToastContext } from '../../src/context/toast-context';
import { useToast } from '../../src/context/useToast';

describe('useToast', () => {
  it('throws when used outside provider', () => {
    function Demo() {
      useToast();
      return null;
    }

    expect(() => render(<Demo />)).toThrow('useToast must be used within ToastProvider');
  });

  it('returns context value when provider exists', () => {
    const value = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    result.current.success('ok');
    expect(value.success).toHaveBeenCalledWith('ok');
  });
});
