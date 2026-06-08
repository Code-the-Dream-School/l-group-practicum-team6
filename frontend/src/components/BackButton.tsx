import { useLocation, useNavigate } from 'react-router-dom';

import { LABELS, ROUTES } from '@sonix/shared';

type BackButtonProps = {
  /** Where to go when there is no in-app history (e.g. opened via direct link). */
  fallback?: string;
  className?: string;
};

/**
 * Minimal icon-only back control. Goes to the previous page, or `fallback`
 * when there is no in-app history (direct link / new tab).
 */
export default function BackButton({ fallback = ROUTES.HOME, className = '' }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleClick() {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={LABELS.GO_BACK}
      title={LABELS.GO_BACK}
      className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
