import { useCallback, useEffect, useRef, useState } from 'react';

export function useFullscreen<T extends HTMLElement = HTMLElement>() {
  const targetRef = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === targetRef.current);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async (): Promise<boolean> => {
    const element = targetRef.current;

    if (!element || !element.requestFullscreen) {
      return false;
    }

    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }

      return true;
    } catch {
      return false;
    }
  }, []);

  return { targetRef, isFullscreen, toggleFullscreen };
}
