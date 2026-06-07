export const TAB_CAPTURE_DEVICE_ID = '__tab_capture__';
export const TAB_CAPTURE_LABEL = 'Tab or screen audio';

export type AudioInputDevice = {
  deviceId: string;
  label: string;
};

export function isTabCaptureDevice(deviceId: string): boolean {
  return deviceId === TAB_CAPTURE_DEVICE_ID;
}

export function formatDeviceLabel(label: string, maxLength = 28): string {
  const trimmed = label.trim() || 'Microphone';
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function mapAudioInputs(devices: MediaDeviceInfo[]): AudioInputDevice[] {
  return devices
    .filter((device) => device.kind === 'audioinput')
    .map((device) => ({
      deviceId: device.deviceId,
      label: device.label || 'Microphone',
    }));
}
