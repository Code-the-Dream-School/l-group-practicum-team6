import { useCallback, useEffect, useState } from 'react';

import { getSavedVisuals, removeVisual, saveVisual } from '../api';
import { useToast } from '../context/useToast';
import { getToastErrorMessage } from '../utils/toastErrorMessage';
import { TOAST_MESSAGES } from '../constants/messages';

type UseFavoriteVisualOptions = {
  enabled?: boolean;
};

export function useFavoriteVisual(
  visualizerId: string,
  { enabled = true }: UseFavoriteVisualOptions = {}
) {
  const toast = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function loadFavoriteState() {
      setIsLoading(true);

      try {
        const response = await getSavedVisuals();

        if (cancelled) return;

        const savedIds = response.data.map((saved) => saved.visualizerId._id);
        setIsFavorited(savedIds.includes(visualizerId));
      } catch {
        if (!cancelled) {
          setIsFavorited(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadFavoriteState();

    return () => {
      cancelled = true;
    };
  }, [enabled, visualizerId]);

  const toggleFavorite = useCallback(async () => {
    if (!enabled) return;

    const wasFavorited = isFavorited;

    setIsFavorited(!wasFavorited);

    try {
      if (wasFavorited) {
        await removeVisual(visualizerId);
        toast.success(TOAST_MESSAGES.VISUALIZER.REMOVED_FROM_FAVORITES);
      } else {
        await saveVisual(visualizerId);
        toast.success(TOAST_MESSAGES.VISUALIZER.SAVED_TO_FAVORITES);
      }
    } catch (error) {
      setIsFavorited(wasFavorited);

      toast.error(
        getToastErrorMessage(
          error,
          wasFavorited
            ? TOAST_MESSAGES.VISUALIZER.REMOVE_FAILED
            : TOAST_MESSAGES.VISUALIZER.SAVE_FAILED
        )
      );
    }
  }, [enabled, isFavorited, toast, visualizerId]);

  return {
    isFavorited: enabled ? isFavorited : false,
    isLoading: enabled ? isLoading : false,
    toggleFavorite,
  };
}
