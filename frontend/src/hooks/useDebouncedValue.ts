import { useEffect, useRef, useState } from 'react';

export function useDebouncedValue<T>(
  value: T,
  delayMs: number,
  onDebounced?: (value: T) => void
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const onDebouncedRef = useRef(onDebounced);

  useEffect(() => {
    onDebouncedRef.current = onDebounced;
  }, [onDebounced]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
      onDebouncedRef.current?.(value);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
