import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DeviceSelectorButton from '../../src/components/player/DeviceSelectorButton';
import { TAB_CAPTURE_DEVICE_ID } from '../../src/utils/audioDevices';

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

  it('shows the wave icon when tab capture is selected', () => {
    render(
      <DeviceSelectorButton
        devices={devices}
        selectedDeviceId={TAB_CAPTURE_DEVICE_ID}
        onSelectDevice={() => {}}
      />
    );

    expect(screen.getByTestId('wave-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('mic-icon')).not.toBeInTheDocument();
    expect(screen.getByText('Tab or screen audio')).toBeInTheDocument();
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

    fireEvent.click(screen.getByLabelText('Select audio source'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'USB Microphone' }));

    expect(onSelectDevice).toHaveBeenCalledWith('usb');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('selects tab capture from the dropdown', () => {
    const onSelectDevice = vi.fn();

    render(
      <DeviceSelectorButton
        devices={devices}
        selectedDeviceId="builtin"
        onSelectDevice={onSelectDevice}
      />
    );

    fireEvent.click(screen.getByLabelText('Select audio source'));
    fireEvent.click(screen.getByRole('option', { name: 'Tab or screen audio' }));

    expect(onSelectDevice).toHaveBeenCalledWith(TAB_CAPTURE_DEVICE_ID);
  });
});
