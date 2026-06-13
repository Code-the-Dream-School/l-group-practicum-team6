import { useCallback, useMemo, useReducer } from 'react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { ToastContextValue } from './toast-context';
import { ToastContext } from './toast-context';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  durationMs: number;
}

interface ToastState {
  visible: ToastItem[];
  queue: ToastItem[];
}

type ToastAction =
  | { type: 'ENQUEUE'; payload: ToastItem }
  | { type: 'DISMISS'; payload: { id: string } };

const MAX_VISIBLE_TOASTS = 3;
const SUCCESS_INFO_DURATION_MS = 4000;
const ERROR_DURATION_MS = 6000;

const INITIAL_STATE: ToastState = {
  visible: [],
  queue: [],
};

function createToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  if (action.type === 'ENQUEUE') {
    const all = [...state.visible, ...state.queue];

    const isDupe =
      all.some((t) => t.type === action.payload.type) &&
      all.some((t) => t.message === action.payload.message);
    if (isDupe) return state;

    if (state.visible.length < MAX_VISIBLE_TOASTS) {
      return { ...state, visible: [...state.visible, action.payload] };
    }
    return { ...state, queue: [...state.queue, action.payload] };
  }

  const { id } = action.payload;
  const isVisible = state.visible.some((toast) => toast.id === id);

  if (isVisible) {
    const visible = state.visible.filter((toast) => toast.id !== id);
    if (state.queue.length === 0) {
      return { ...state, visible };
    }

    const [nextToast, ...remainingQueue] = state.queue;
    return {
      visible: [...visible, nextToast],
      queue: remainingQueue,
    };
  }

  return {
    ...state,
    queue: state.queue.filter((toast) => toast.id !== id),
  };
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [remainingMs, setRemainingMs] = useState(toast.durationMs);

  useEffect(() => {
    const startedAt = performance.now();
    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs);

    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setRemainingMs(Math.max(0, toast.durationMs - elapsed));
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [onDismiss, toast.durationMs, toast.id]);

  const barWidthPercent = Math.max(0, (remainingMs / toast.durationMs) * 100);
  const isError = toast.type === 'error';
  const liveMode = isError ? 'assertive' : 'polite';
  const typeClassName = isError
    ? 'border-red-400/60 bg-red-50 text-red-900'
    : toast.type === 'success'
      ? 'border-emerald-400/60 bg-emerald-50 text-emerald-900'
      : 'border-sky-400/60 bg-sky-50 text-sky-900';

  const progressClassName = isError
    ? 'bg-red-500'
    : toast.type === 'success'
      ? 'bg-emerald-500'
      : 'bg-sky-500';

  return (
    <div
      role="alert"
      aria-live={liveMode}
      aria-atomic="true"
      className={`pointer-events-auto w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border bg-surface text-text-primary shadow-lg ${typeClassName}`}
    >
      <div className="flex items-start gap-3 p-3">
        <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
          className="btn-ghost cursor-pointer !rounded-md !border-transparent !px-2 !py-1 !text-xs !leading-none"
        >
          x
        </button>
      </div>
      <div className="h-1 w-full bg-black/10">
        <div
          className={`h-full transition-[width] duration-100 ease-linear ${progressClassName}`}
          style={{ width: `${barWidthPercent}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, INITIAL_STATE);

  const addToast = useCallback((type: ToastType, message: string) => {
    dispatch({
      type: 'ENQUEUE',
      payload: {
        id: createToastId(),
        message,
        type,
        durationMs: type === 'error' ? ERROR_DURATION_MS : SUCCESS_INFO_DURATION_MS,
      },
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'DISMISS', payload: { id } });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message: string) => addToast('success', message),
      error: (message: string) => addToast('error', message),
      info: (message: string) => addToast('info', message),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[1000] flex -translate-x-1/2 flex-col gap-3">
        {state.visible.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
