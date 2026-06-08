import { useLocation, useNavigate } from 'react-router-dom';

import { LABELS, ROUTES } from '@sonix/shared';

type BackButtonProps = {
  // Where to go when there's no previous in-app page (opened via direct link / new tab).
  fallback?: string;
  variant?: 'inline' | 'card';
  className?: string;
};

const VARIANT_CLASSES: Record<NonNullable<BackButtonProps['variant']>, string> = {
  inline: 'h-8 w-8 rounded-md text-text-secondary hover:text-text-primary',
  card: 'h-7 w-7 rounded-md text-white/60 hover:bg-white/10 hover:text-white',
};

export default function BackButton({
  fallback = ROUTES.HOME,
  variant = 'inline',
  className = '',
}: BackButtonProps) {
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
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${VARIANT_CLASSES[variant]} ${className}`}
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
