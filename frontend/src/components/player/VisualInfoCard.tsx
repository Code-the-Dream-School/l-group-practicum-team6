import { formatTagLabel, getVisualSubtitle } from './formatTagLabel';

type VisualInfoCardProps = {
  name: string;
  tags: string[];
  visible?: boolean;
};

export default function VisualInfoCard({ name, tags, visible = true }: VisualInfoCardProps) {
  const categoryLabel = tags[0] ? formatTagLabel(tags[0]) : 'Visualizer';

  return (
    <div
      className={`pointer-events-none absolute bottom-[88px] left-4 z-5 w-[200px] rounded-xl border border-[#2a2a3d]/80 bg-[#1c1c28]/90 p-4 backdrop-blur-sm transition-opacity ease-in-out motion-reduce:transition-none ${
        visible
          ? 'opacity-100 delay-200 duration-300 ease-out'
          : 'opacity-0 delay-0 duration-150 ease-in'
      }`}
      data-testid="visual-info-card"
    >
      <h2 className="text-sm font-semibold text-white">{name}</h2>
      <span className="mt-1.5 inline-block rounded-full border border-[#00d4bf]/40 bg-[#00d4bf]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00d4bf]">
        {categoryLabel}
      </span>
      <p className="mt-1 text-[11px] text-white/50">{getVisualSubtitle(tags)}</p>
    </div>
  );
}
