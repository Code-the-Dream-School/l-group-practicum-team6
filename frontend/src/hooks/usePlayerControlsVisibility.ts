import { useEffect, useState, type RefObject } from 'react';

import type { AudioAnalyzerStatus } from './useAudioAnalyzer';

export const PLAYER_CONTROLS_HIDE_MS = 3000;

function micStateForcesVisibleControls(micState: AudioAnalyzerStatus): boolean {
  return micState === 'idle' || micState === 'denied';
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function usePlayerControlsVisibility(
  rootRef: RefObject<HTMLElement | null>,
  micState: AudioAnalyzerStatus,
  enabled = true
): boolean {
  const [inactiveHidden, setInactiveHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);
  const forceVisible = micStateForcesVisibleControls(micState);
  const autoHideActive = enabled && !prefersReducedMotion && !forceVisible;
  const [prevAutoHideActive, setPrevAutoHideActive] = useState(autoHideActive);

  if (autoHideActive !== prevAutoHideActive) {
    setPrevAutoHideActive(autoHideActive);
    if (autoHideActive) {
      setInactiveHidden(false);
    }
  }

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function handleChange() {
      setPrefersReducedMotion(mediaQuery.matches);
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (!autoHideActive) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout>;

    function scheduleHide() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setInactiveHidden(true), PLAYER_CONTROLS_HIDE_MS);
    }

    function onPointerActivity() {
      setInactiveHidden(false);
      scheduleHide();
    }

    scheduleHide();

    root.addEventListener('mousemove', onPointerActivity);
    root.addEventListener('mousedown', onPointerActivity);
    root.addEventListener('touchstart', onPointerActivity);

    return () => {
      clearTimeout(hideTimer);
      root.removeEventListener('mousemove', onPointerActivity);
      root.removeEventListener('mousedown', onPointerActivity);
      root.removeEventListener('touchstart', onPointerActivity);
    };
  }, [autoHideActive, rootRef]);

  if (!autoHideActive) {
    return true;
  }

  return !inactiveHidden;
}
