import { useEffect, useState } from 'react';

const hotkeys = [
  ['▶', 'Next Visual'],
  ['◀', 'Previous Visual'],
  ['Space', 'Play / Pause'],
  ['Enter / F', 'Toggle Fullscreen'],
  ['M', 'Toggle microphone/audio input'],
];

export default function HotkeysHelpButton({
  buttonClassName = 'inline-flex h-6 w-6 shrink-0 items-center justify-center border-0 bg-transparent p-0 cursor-pointer outline-none transition hover:opacity-80',
  iconClassName = 'block h-6 w-6',
}: {
  buttonClassName?: string;
  iconClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Show keyboard shortcuts"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={buttonClassName}
      >
        <img src="/icons/hotkeys.svg" alt="" className={iconClassName} />
      </button>

      {open && (
        <>
          <div
            data-testid="hotkeys-backdrop"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full right-0 z-20 mb-2 w-[calc(100vw-4rem)] max-w-105 rounded-lg border border-[#2a2a3d] bg-[#1c1c28] p-4 text-base text-white/90 shadow-lg">
            <button
              type="button"
              aria-label="Close keyboard shortcuts"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 cursor-pointer text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>

            <h3 className="mb-3 font-semibold text-white">Keyboard shortcuts</h3>

            <ul className="space-y-2">
              {hotkeys.map(([key, action]) => (
                <li key={key} className="flex items-center justify-between gap-4">
                  <span className="text-white/70">{action}</span>
                  <kbd className="rounded-md border border-[#2a2a3d] bg-[#12121a] px-3 py-1.5 text-base text-[#22d3ee]">
                    {key}
                  </kbd>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
