import { useContext } from 'react';

import type { ToastContextValue } from './toast-context';
import { ToastContext } from './toast-context';

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
