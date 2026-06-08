import { useCallback } from 'react';

import { useRemoveVisualMutation, useSaveVisualMutation } from './useSavedVisualMutations';
import { useSavedVisualsQuery } from './useSavedVisualsQuery';

export function useFavoriteVisual(
  visualizerId: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  const { data: savedVisuals, isPending } = useSavedVisualsQuery({ enabled });
  const saveMutation = useSaveVisualMutation();
  const removeMutation = useRemoveVisualMutation();

  const isFavorited =
    savedVisuals?.some((saved) => saved.visualizerId._id === visualizerId) ?? false;

  const toggleFavorite = useCallback(async () => {
    if (isFavorited) {
      await removeMutation.mutateAsync(visualizerId);
      return;
    }

    await saveMutation.mutateAsync(visualizerId);
  }, [isFavorited, removeMutation, saveMutation, visualizerId]);

  return {
    isFavorited,
    isLoading: isPending,
    toggleFavorite,
  };
}
