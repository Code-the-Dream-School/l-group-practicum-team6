import { NavLink } from 'react-router-dom';
import type { User } from '@sonix/shared';

import { Routes } from '../../routes/paths';
import { AuthLinks } from './AuthLinks';
import { Avatar } from './Avatar';

interface MobileMenuProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

export function MobileMenu({ user, onLogout }: MobileMenuProps) {
  return (
    <div className="md:hidden border-t border-primary-border bg-surface px-6 py-4">
      {user ? (
        <>
          <NavLink
            to={Routes.EXPLORE}
            className={({ isActive }) =>
              `block py-3 text-base font-medium text-text-${isActive ? 'primary' : 'secondary'}`
            }
          >
            Explore
          </NavLink>
          <NavLink
            to={Routes.MY_VISUALS}
            className={({ isActive }) =>
              `block py-3 text-base font-medium text-text-${isActive ? 'primary' : 'secondary'}`
            }
          >
            My Visuals
          </NavLink>
          <div className="mt-3 flex items-center gap-3 border-t border-primary-border pt-3">
            <Avatar user={user} />
            <span className="text-sm text-text-primary">{user.name}</span>
          </div>
          <NavLink
            to={Routes.SETTINGS}
            className="block w-full text-left py-3 text-base text-text-primary"
          >
            Settings
          </NavLink>
          <button
            type="button"
            onClick={() => onLogout()}
            className="block w-full text-left py-3 text-base text-text-primary"
          >
            Log Out
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-3 pt-3">
          <AuthLinks stacked />
        </div>
      )}
    </div>
  );
}
