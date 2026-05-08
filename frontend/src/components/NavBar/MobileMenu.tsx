import { Link, NavLink } from "react-router-dom";
import type { User } from "@sonix/shared";

import { Avatar } from "./Avatar";

interface MobileMenuProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

export function MobileMenu({ user, onLogout }: MobileMenuProps) {
  return (
    <div className="md:hidden border-t border-primary-border bg-surface px-6 py-4">
      <NavLink
        to="/explore"
        className={({ isActive }) =>
          isActive
            ? "block py-3 text-base font-medium text-text-primary"
            : "block py-3 text-base font-medium text-text-secondary"
        }
      >
        Explore
      </NavLink>
      {user ? (
        <>
          <NavLink
            to="/my-visuals"
            className={({ isActive }) =>
              isActive
                ? "block py-3 text-base font-medium text-text-primary"
                : "block py-3 text-base font-medium text-text-secondary"
            }
          >
            My Visuals
          </NavLink>
          <div className="mt-3 flex items-center gap-3 border-t border-primary-border pt-3">
            <Avatar user={user} />
            <span className="text-sm text-text-primary">{user.name}</span>
          </div>
          <button
            type="button"
            disabled
            className="block w-full text-left py-3 text-base text-text-secondary opacity-50 cursor-not-allowed"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => onLogout()}
            className="block w-full text-left py-3 text-base text-text-primary"
          >
            Log Out
          </button>
        </>
      ) : (
        <div className="mt-3 flex flex-col gap-3 border-t border-primary-border pt-3">
          <Link to="/login" className="btn-ghost justify-center">
            Log In
          </Link>
          <Link to="/signup" className="btn-primary justify-center">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
