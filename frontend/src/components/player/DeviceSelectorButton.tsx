import chevronIcon from '../../assets/icons/chevron.svg';

type DeviceSelectorButtonProps = {
  deviceLabel: string;
  isMicEnabled?: boolean;
  onClick?: () => void;
};

export default function DeviceSelectorButton({
  deviceLabel,
  isMicEnabled = true,
  onClick = () => {},
}: DeviceSelectorButtonProps) {
  return (
    <button
      type="button"
      aria-label={isMicEnabled ? 'Turn off microphone' : 'Turn on microphone'}
      onClick={onClick}
      className="inline-flex h-10 max-w-[220px] cursor-pointer items-center gap-2 rounded-lg border border-[#2a2a3d] bg-[#1c1c28] px-3 text-sm text-white/90 transition hover:border-[#7c5cfc]/40 hover:bg-[#252535] outline-none"
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
  );
}
