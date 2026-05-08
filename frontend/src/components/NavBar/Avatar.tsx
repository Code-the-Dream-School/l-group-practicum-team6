import type { User } from "@sonix/shared";

import avatarDefault from "../../assets/avatar-default.svg";

export function Avatar({ user }: { user: User }) {
  return (
    <img
      src={user.image ?? avatarDefault}
      alt={user.name}
      className="h-9 w-9 rounded-full object-cover"
    />
  );
}
