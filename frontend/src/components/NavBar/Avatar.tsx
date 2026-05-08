import type { User } from "@sonix/shared";

const gradients: [string, string][] = [
  ["#7C5CFC", "#00E5FF"],
  ["#FF4D6D", "#7C5CFC"],
  ["#00D68F", "#00E5FF"],
  ["#947DFF", "#FF4D6D"],
  ["#00E5FF", "#947DFF"],
  ["#7C5CFC", "#00D68F"],
];

function pickGradient(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function Avatar({ user }: { user: User }) {
  const initial = user.name.trim()[0]?.toUpperCase() ?? "?";
  const [from, to] = pickGradient(user._id);
  return (
    <span
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-text-primary"
    >
      {initial}
    </span>
  );
}
