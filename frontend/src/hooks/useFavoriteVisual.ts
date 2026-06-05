import { useCallback } from 'react';

import { useRemoveVisualMutation, useSaveVisualMutation } from './useSavedVisualMutations';
import { useSavedVisualsQuery } from './useSavedVisualsQuery';

type FavoriteVisualOptions = {
  enabled?: boolean;
};

export function useFavoriteVisual(
  visualizerId: string,
  { enabled = true }: FavoriteVisualOptions = {}
) {
  const { data: savedVisuals, isPending } = useSavedVisualsQuery({ enabled });
  const saveMutation = useSaveVisualMutation();
  const removeMutation = useRemoveVisualMutation();

  const isFavorited =
    savedVisuals?.some((saved) => saved.visualizerId._id === visualizerId) ?? false;

  const toggleFavorite = useCallback(async () => {
    if (!enabled) return;

    if (isFavorited) {
      await removeMutation.mutateAsync(visualizerId);
      return;
    }

    await saveMutation.mutateAsync(visualizerId);
  }, [enabled, isFavorited, removeMutation, saveMutation, visualizerId]);

  return {
    isFavorited: enabled ? isFavorited : false,
    isLoading: enabled ? isPending : false,
    toggleFavorite,
  };
}
