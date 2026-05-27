import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DeviceSelectorButton from '../../src/components/player/DeviceSelectorButton';

const devices = [
  { deviceId: 'builtin', label: 'Built-in Microphone' },
  { deviceId: 'usb', label: 'USB Microphone' },
];

describe('DeviceSelectorButton', () => {
  it('shows a red mic icon when the microphone is disabled', () => {
    render(
      <DeviceSelectorButton
        devices={devices}
        selectedDeviceId="builtin"
        isMicEnabled={false}
        onSelectDevice={() => {}}
      />
    );

    expect(screen.getByTestId('mic-icon')).toHaveClass('mic-icon-disabled');
  });

  it('shows the default mic icon when the microphone is enabled', () => {
    render(
      <DeviceSelectorButton
        devices={devices}
        selectedDeviceId="builtin"
        isMicEnabled
        onSelectDevice={() => {}}
      />
    );

    expect(screen.getByTestId('mic-icon')).not.toHaveClass('mic-icon-disabled');
  });

  it('opens a device list and calls onSelectDevice', () => {
    const onSelectDevice = vi.fn();

    render(
      <DeviceSelectorButton
        devices={devices}
        selectedDeviceId="builtin"
        onSelectDevice={onSelectDevice}
      />
    );

    fireEvent.click(screen.getByLabelText('Select microphone'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'USB Microphone' }));

    expect(onSelectDevice).toHaveBeenCalledWith('usb');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
