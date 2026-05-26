import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '../../src/context/ToastProvider';
import { useToast } from '../../src/context/useToast';

function ToastProbe() {
  const toast = useToast();

  return (
    <div>
      <button type="button" onClick={() => toast.error('Something went wrong')}>
        error
      </button>
      <button type="button" onClick={() => toast.success('Saved!')}>
        success
      </button>
      <button type="button" onClick={() => toast.info('Info #1')}>
        info-1
      </button>
      <button type="button" onClick={() => toast.info('Info #2')}>
        info-2
      </button>
      <button type="button" onClick={() => toast.info('Info #3')}>
        info-3
      </button>
      <button type="button" onClick={() => toast.info('Info #4')}>
        info-4
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('shows error toast with assertive aria-live and auto-dismisses after 6 seconds', () => {
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'error' }));

    const toast = screen.getByRole('alert');
    expect(toast).toHaveTextContent('Something went wrong');
    expect(toast).toHaveAttribute('aria-live', 'assertive');

    act(() => {
      vi.advanceTimersByTime(5900);
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('queues toasts when more than 3 are triggered', () => {
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'info-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'info-2' }));
    fireEvent.click(screen.getByRole('button', { name: 'info-3' }));
    fireEvent.click(screen.getByRole('button', { name: 'info-4' }));

    expect(screen.getAllByRole('alert')).toHaveLength(3);
    expect(screen.queryByText('Info #4')).not.toBeInTheDocument();

    const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss notification' });
    fireEvent.click(dismissButtons[0]);

    expect(screen.getAllByRole('alert')).toHaveLength(3);
    expect(screen.getByText('Info #4')).toBeInTheDocument();
  });

  it('uses polite aria-live for success/info toasts', () => {
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'success' }));

    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });
});
