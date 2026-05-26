import { ApiError } from '../api/client';

const GENERIC_API_ERROR_PREFIX = 'Request failed with status:';

export function getToastErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  const message = error.message.trim();
  if (!message || message.startsWith(GENERIC_API_ERROR_PREFIX)) {
    return fallback;
  }

  return message;
}
