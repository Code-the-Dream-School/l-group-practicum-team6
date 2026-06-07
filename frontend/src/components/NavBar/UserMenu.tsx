import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { User } from '@sonix/shared';

import { LABELS } from '@sonix/shared';
import { ROUTES } from '@sonix/shared';
import { Avatar } from './Avatar';

interface UserMenuProps {
  user: User;
  onLogout: () => Promise<void>;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    setOpen(false);
    await onLogout();
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full p-2 cursor-pointer"
      >
        <Avatar user={user} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 rounded-lg border border-primary-border bg-elevated py-1 shadow-lg z-20"
          >
            {user.isAdmin && (
              <NavLink
                to={ROUTES.ADMIN_VISUALS}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface cursor-pointer"
              >
                Admin
              </NavLink>
            )}
            <NavLink
              to={ROUTES.SETTINGS}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface cursor-pointer"
            >
              {LABELS.SETTINGS}
            </NavLink>
            <button
              type="button"
              role="menuitem"
              onClick={() => handleLogout()}
              className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface cursor-pointer"
            >
              {LABELS.LOG_OUT}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
