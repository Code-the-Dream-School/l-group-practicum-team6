import { NavLink } from 'react-router-dom';
import type { User } from '@sonix/shared';

import { LABELS } from '@sonix/shared';
import { ROUTES } from '@sonix/shared';
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
            to={ROUTES.EXPLORE}
            className={({ isActive }) =>
              `block py-3 text-base font-medium text-text-${isActive ? 'primary' : 'secondary'}`
            }
          >
            {LABELS.EXPLORE}
          </NavLink>
          <NavLink
            to={ROUTES.MY_VISUALS}
            className={({ isActive }) =>
              `block py-3 text-base font-medium text-text-${isActive ? 'primary' : 'secondary'}`
            }
          >
            {LABELS.MY_VISUALS}
          </NavLink>
          {user.isAdmin && (
            <NavLink
              to={ROUTES.ADMIN_VISUALS_CREATE}
              className={({ isActive }) =>
                `block py-3 text-base font-medium text-text-${isActive ? 'primary' : 'secondary'}`
              }
            >
              Create
            </NavLink>
          )}

          <div className="mt-3 flex items-center gap-3 border-t border-primary-border pt-3">
            <Avatar user={user} />
            <span className="text-sm text-text-primary">{user.name}</span>
          </div>
          {user.isAdmin && (
            <NavLink
              to={ROUTES.ADMIN_VISUALS}
              end
              className={({ isActive }) =>
                `block py-3 text-base font-medium text-text-${isActive ? 'primary' : 'secondary'}`
              }
            >
              Admin
            </NavLink>
          )}
          <NavLink
            to={ROUTES.SETTINGS}
            className={({ isActive }) =>
              `block py-3 text-base font-medium text-text-${isActive ? 'primary' : 'secondary'}`
            }
          >
            {LABELS.SETTINGS}
          </NavLink>
          <button
            type="button"
            onClick={() => onLogout()}
            className="block w-full cursor-pointer text-left py-3 text-base text-text-primary"
          >
            {LABELS.LOG_OUT}
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
