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
        className={stacked ? 'btn-primary justify-center text-center' : 'btn-primary'}
      >
        {LABELS.SIGN_UP_CTA}
      </Link>
    );
  }

  if (stacked) {
    return (
      <>
        <Link to={ROUTES.LOGIN} className="btn-ghost justify-center">
          {LABELS.LOG_IN}
        </Link>
        <Link to={ROUTES.SIGNUP} className="btn-primary justify-center">
          {LABELS.SIGN_UP}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to={ROUTES.LOGIN} className="btn-ghost">
        {LABELS.LOG_IN}
      </Link>
      <Link to={ROUTES.SIGNUP} className="btn-primary">
        {LABELS.SIGN_UP}
      </Link>
    </>
  );
}
