import { useState } from 'react';

const hotkeys = [
  ['◀', 'Next Visual'],
  ['▶', 'Previous Visual'],
  ['Space', 'Toggle visual'],
  ['Enter / F', 'Fullscreen'],
  ['M', 'Toggle microphone/audio input'],
];

export default function HotkeysHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Show keyboard shortcuts"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#2a2a3d] bg-[#1c1c28] text-4xl text-white/90 transition hover:border-[#7c5cfc]/40 hover:bg-[#252535] outline-none"
      >
        ⌨
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 z-20 mb-2 w-[calc(100vw-4rem)] max-w-105 rounded-lg border border-[#2a2a3d] bg-[#1c1c28] p-4 text-base text-white/90 shadow-lg">
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
