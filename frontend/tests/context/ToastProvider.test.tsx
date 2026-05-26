import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ToastProvider } from '../../src/context/ToastProvider';
import { useToast } from '../../src/context/useToast';

function DemoActions() {
  const toast = useToast();

  return (
    <div>
      <button type="button" onClick={() => toast.success('Saved successfully')}>
        Success
      </button>
      <button type="button" onClick={() => toast.error('Something went wrong')}>
        Error
      </button>
      <button type="button" onClick={() => toast.info('Heads up')}>
        Info
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('shows toasts when context actions are called', async () => {
    render(
      <ToastProvider>
        <DemoActions />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Success' }));
    fireEvent.click(screen.getByRole('button', { name: 'Error' }));
    fireEvent.click(screen.getByRole('button', { name: 'Info' }));

    expect(await screen.findByText('Saved successfully')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
  });

  it('queues toasts beyond max visible and shows next after dismiss', async () => {
    render(
      <ToastProvider>
        <DemoActions />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Success' }));
    fireEvent.click(screen.getByRole('button', { name: 'Error' }));
    fireEvent.click(screen.getByRole('button', { name: 'Info' }));
    fireEvent.click(screen.getByRole('button', { name: 'Success' }));

    const alerts = await screen.findAllByRole('alert');
    expect(alerts).toHaveLength(3);

    fireEvent.click(screen.getAllByLabelText('Dismiss notification')[0]);

    await waitFor(() => {
      expect(screen.getAllByRole('alert')).toHaveLength(3);
    });
  });
});
