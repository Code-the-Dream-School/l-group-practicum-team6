import { Link } from 'react-router-dom';

import { LABELS } from '@sonix/shared';
import { ROUTES } from '@sonix/shared';

type AuthLinksProps = {
  variant?: 'default' | 'demo-player';
  stacked?: boolean;
};

export function AuthLinks({ variant = 'default', stacked = false }: AuthLinksProps) {
  if (variant === 'demo-player') {
    return (
      <Link
        to={ROUTES.SIGNUP}
        className={
          stacked ? 'btn-primary justify-center text-center px-5 py-2.5' : 'btn-primary px-5 py-2.5'
        }
      >
        {LABELS.SIGN_UP_CTA}
      </Link>
    );
  }

  if (stacked) {
    return (
      <>
        <Link to={ROUTES.LOGIN} className="btn-ghost justify-center px-5 py-2.5">
          {LABELS.LOG_IN}
        </Link>
        <Link to={ROUTES.SIGNUP} className="btn-primary justify-center px-5 py-2.5">
          {LABELS.SIGN_UP}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to={ROUTES.LOGIN} className="btn-ghost px-5 py-2.5">
        {LABELS.LOG_IN}
      </Link>
      <Link to={ROUTES.SIGNUP} className="btn-primary px-5 py-2.5">
        {LABELS.SIGN_UP}
      </Link>
    </>
  );
}
