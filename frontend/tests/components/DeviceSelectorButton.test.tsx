import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import DeviceSelectorButton from '../../src/components/player/DeviceSelectorButton';

describe('DeviceSelectorButton', () => {
  it('shows a red mic icon when the microphone is disabled', () => {
    render(<DeviceSelectorButton deviceLabel="Microphone — Built-in" isMicEnabled={false} />);

    expect(screen.getByTestId('mic-icon')).toHaveClass('mic-icon-disabled');
  });

  it('shows the default mic icon when the microphone is enabled', () => {
    render(<DeviceSelectorButton deviceLabel="Microphone — Built-in" isMicEnabled />);

    expect(screen.getByTestId('mic-icon')).not.toHaveClass('mic-icon-disabled');
  });
});
