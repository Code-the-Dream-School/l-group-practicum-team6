import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import HotkeysHelpButton from '../../../src/components/player/HotkeysHelpButton';

describe('HotkeysHelpButton', () => {
  it('renders the keyboard shortcuts button', () => {
    render(<HotkeysHelpButton />);

    expect(screen.getByRole('button', { name: /show keyboard shortcuts/i })).toBeInTheDocument();
  });

  it('opens and displays all hotkey hints when clicked', async () => {
    const user = userEvent.setup();

    render(<HotkeysHelpButton />);

    await user.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));

    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
    expect(screen.getByText(/next visual/i)).toBeInTheDocument();
    expect(screen.getByText(/previous visual/i)).toBeInTheDocument();
    expect(screen.getByText(/play \/ pause/i)).toBeInTheDocument();
    expect(screen.getByText(/toggle fullscreen/i)).toBeInTheDocument();
    expect(screen.getByText(/toggle microphone\/audio input/i)).toBeInTheDocument();

    expect(screen.getByText('▶')).toBeInTheDocument();
    expect(screen.getByText('◀')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
    expect(screen.getByText('Enter / F')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup();

    render(<HotkeysHelpButton />);

    await user.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close keyboard shortcuts/i }));

    expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
  });

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup();

    render(<HotkeysHelpButton />);

    await user.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
  });

  it('closes when clicking outside the modal', async () => {
    const user = userEvent.setup();

    render(<HotkeysHelpButton />);

    await user.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();

    await user.click(screen.getByTestId('hotkeys-backdrop'));

    expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
  });

  it('toggles aria-expanded when opened and closed', async () => {
    const user = userEvent.setup();

    render(<HotkeysHelpButton />);

    const button = screen.getByRole('button', { name: /show keyboard shortcuts/i });

    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
