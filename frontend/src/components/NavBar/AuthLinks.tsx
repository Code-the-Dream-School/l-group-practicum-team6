import { Link } from 'react-router-dom';

import { Routes } from '../../routes/paths';

type AuthLinksProps = {
  variant?: 'default' | 'demo-player';
  stacked?: boolean;
};

export function AuthLinks({ variant = 'default', stacked = false }: AuthLinksProps) {
  if (variant === 'demo-player') {
    return (
      <Link
        to={Routes.SIGNUP}
        className={stacked ? 'btn-primary justify-center text-center' : 'btn-primary'}
      >
        Sign Up to unlock all visualizers
      </Link>
    );
  }

  if (stacked) {
    return (
      <>
        <Link to={Routes.LOGIN} className="btn-ghost justify-center">
          Log In
        </Link>
        <Link to={Routes.SIGNUP} className="btn-primary justify-center">
          Sign Up
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to={Routes.LOGIN} className="btn-ghost">
        Log In
      </Link>
      <Link to={Routes.SIGNUP} className="btn-primary">
        Sign Up
      </Link>
    </>
  );
}
