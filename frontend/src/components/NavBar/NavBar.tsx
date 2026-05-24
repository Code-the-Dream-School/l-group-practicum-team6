import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import logoFull from '../../assets/logo-full.svg';
import { useAuth } from '../../context/useAuth';
import { Routes } from '../../routes/paths';

import { AuthLinks } from './AuthLinks';
import { HamburgerIcon } from './HamburgerIcon';
import { MobileMenu } from './MobileMenu';
import { UserMenu } from './UserMenu';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isMinimal = location.pathname === Routes.LOGIN || location.pathname === Routes.SIGNUP;
  const isDemoPlayer = location.pathname === Routes.VISUALIZER_DEMO;

  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // close mobile menu when route changes
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMenuOpen(false);
  }

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  }

  if (isMinimal) {
    return (
      <div className="flex h-16 items-center bg-surface px-6 md:px-20">
        <Link to={Routes.HOME}>
          <img src={logoFull} alt="Sonix" />
        </Link>
      </div>
    );
  }

  return (
    <header className="bg-surface">
      <div className="flex h-16 items-center justify-between px-6 md:px-20">
        <div className="flex items-center gap-10">
          <Link to={Routes.HOME} aria-label="Sonix home">
            <img src={logoFull} alt="Sonix" />
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <NavLink
                to={Routes.EXPLORE}
                className={({ isActive }) =>
                  isActive
                    ? 'text-sm font-medium text-text-primary border-b-2 border-primary pb-1'
                    : 'text-sm font-medium text-text-secondary hover:text-text-primary'
                }
              >
                Explore
              </NavLink>
              <NavLink
                to={Routes.MY_VISUALS}
                className={({ isActive }) =>
                  isActive
                    ? 'text-sm font-medium text-text-primary border-b-2 border-primary pb-1'
                    : 'text-sm font-medium text-text-secondary hover:text-text-primary'
                }
              >
                My Visuals
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          ) : isDemoPlayer ? (
            <AuthLinks variant="demo-player" />
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <AuthLinks />
            </div>
          )}
        </div>

        {(user || !isDemoPlayer) && (
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-text-primary"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        )}
      </div>

      {menuOpen && (user || !isDemoPlayer) && <MobileMenu user={user} onLogout={handleLogout} />}
    </header>
  );
};

export default NavBar;
