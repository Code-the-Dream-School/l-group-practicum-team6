import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@sonix/shared';

import { Routes } from '../../routes/paths';
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
        className="inline-flex items-center gap-2 rounded-full"
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
            <Link
              to={Routes.SETTINGS}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface"
            >
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => handleLogout()}
              className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface"
            >
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
