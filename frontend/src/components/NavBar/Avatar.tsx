import type { User } from "@sonix/shared";

export function Avatar({ user }: { user: User }) {
  const initial = user.name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-text-primary">
      {initial}
    </span>
  );
}
