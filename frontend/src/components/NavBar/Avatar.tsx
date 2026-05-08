import type { User } from "@sonix/shared";

import { pickGradient } from "../../utils/avatarGradient";

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
