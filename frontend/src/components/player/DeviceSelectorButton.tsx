import { useState } from 'react';

import chevronIcon from '../../assets/icons/chevron.svg';
import { formatDeviceLabel, type AudioInputDevice } from '../../utils/audioDevices';

type DeviceSelectorButtonProps = {
  devices: AudioInputDevice[];
  selectedDeviceId: string;
  isMicEnabled?: boolean;
  onSelectDevice: (deviceId: string) => void;
};

export default function DeviceSelectorButton({
  devices,
  selectedDeviceId,
  isMicEnabled = true,
  onSelectDevice,
}: DeviceSelectorButtonProps) {
  const [open, setOpen] = useState(false);

  const selectedDevice =
    devices.find((device) => device.deviceId === selectedDeviceId) ?? devices[0];
  const deviceLabel = formatDeviceLabel(selectedDevice?.label ?? 'Microphone');

  function handleSelect(deviceId: string) {
    setOpen(false);
    onSelectDevice(deviceId);
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="relative min-w-0">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select microphone"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 max-w-[150px] sm:max-w-[220px] cursor-pointer items-center gap-2 rounded-lg border border-[#2a2a3d] bg-[#1c1c28] px-3 text-sm text-white/90 transition hover:border-[#7c5cfc]/40 hover:bg-[#252535] outline-none"
        >
          <img
            src="/icons/mic.svg"
            alt=""
            data-testid="mic-icon"
            className={`h-4 w-4 shrink-0 ${isMicEnabled ? '' : 'mic-icon-disabled'}`}
          />
          <span className="truncate">{deviceLabel}</span>
          <img src={chevronIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <ul
              role="listbox"
              aria-label="Microphone sources"
              className="absolute bottom-full left-0 z-20 mb-2 max-h-48 min-w-[220px] overflow-y-auto rounded-lg border border-[#2a2a3d] bg-[#1c1c28] py-1 shadow-lg"
            >
              {devices.length === 0 ? (
                <li className="px-3 py-2 text-sm text-white/50">No microphones found</li>
              ) : (
                devices.map((device) => {
                  const isSelected = device.deviceId === selectedDeviceId;

                  return (
                    <li key={device.deviceId} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(device.deviceId)}
                        className={`block w-full cursor-pointer truncate px-3 py-2 text-left text-sm outline-none transition hover:bg-[#252535] ${
                          isSelected ? 'text-[#7c5cfc]' : 'text-white/90'
                        }`}
                      >
                        {formatDeviceLabel(device.label)}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
