import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  activateVisualPreview,
  deactivateVisualPreview,
  listenToActiveVisualPreview,
  startVisualPreview,
} from '../utils/visualPreview';

interface VisualizerCardProps {
  id: string;
  name: string;
  tags: string[];
  thumbnailUrl?: string;
  playPath: string;
  previewGlsl?: string;
  isSaved?: boolean;
  canSave?: boolean;
  onToggleSave?: (id: string) => void;
}

export default function VisualizerCard({
  id,
  name,
  tags,
  thumbnailUrl,
  playPath,
  previewGlsl,
  isSaved = false,
  canSave = false,
  onToggleSave,
}: VisualizerCardProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    return listenToActiveVisualPreview(id, setIsPreviewActive);
  }, [id]);

  useEffect(() => {
    if (!isPreviewActive || !previewRef.current) return;

    return startVisualPreview(previewRef.current, previewGlsl);
  }, [isPreviewActive, previewGlsl]);

  function activatePreview() {
    activateVisualPreview(id);
  }

  function deactivatePreview() {
    deactivateVisualPreview(id);
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/8 bg-[#070711] shadow-[0_0_22px_rgba(124,92,252,0.10)] transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-[#00D4FF]/80 hover:shadow-[0_0_26px_rgba(0,212,255,0.45),0_0_70px_rgba(124,92,252,0.35)]">
      <Link
        to={playPath}
        aria-label={`Open ${name}`}
        className="relative block aspect-[1.35] cursor-pointer overflow-hidden bg-linear-to-br from-[#7C5CFC]/30 via-[#00D4FF]/12 to-[#050509]"
        onMouseEnter={activatePreview}
        onMouseLeave={deactivatePreview}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-medium tracking-wide text-white/45">
            Live Preview
          </div>
        )}

        <div
          ref={previewRef}
          aria-hidden="true"
          className={`absolute inset-0 mix-blend-screen transition-opacity duration-300 ${
            isPreviewActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {tags[0] && (
          <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur">
            {tags[0]}
          </span>
        )}
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold tracking-tight text-white">{name}</h2>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Procedural {'\u2022'} 60 FPS
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canSave && (
              <button
                type="button"
                aria-label={isSaved ? `Unsave ${name}` : `Save ${name}`}
                onClick={() => onToggleSave?.(id)}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-white transition hover:border-[#00D4FF]/40 hover:bg-white/[0.10] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              >
                {isSaved ? '\u2665' : '\u2661'}
              </button>
            )}

            <Link
              to={playPath}
              className="inline-flex items-center justify-center rounded-full border border-[#7C5CFC]/45 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/85 transition hover:border-[#00D4FF]/50 hover:bg-[#7C5CFC]/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              Play
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium text-white/55"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
