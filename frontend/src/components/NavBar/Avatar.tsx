import type { User } from '@sonix/shared';
import type { User } from '@sonix/shared';

import { pickGradient } from '../../utils/avatarGradient';
import { getInitial } from '../../utils/getInitial';

export function Avatar({ user }: { user: User }) {
  const initial = getInitial(user.name);
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
