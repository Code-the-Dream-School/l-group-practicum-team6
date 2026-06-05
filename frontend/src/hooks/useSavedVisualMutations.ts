import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeVisual, saveVisual } from '../api';
import type { SavedVisual } from '../api/users';
import { useToast } from '../context/useToast';
import { visualizerQueryKeys } from '../queries/visualizerKeys';
import { getToastErrorMessage } from '../utils/toastErrorMessage';
import { TOAST_MESSAGES } from '../constants/messages';

export function useSaveVisualMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: saveVisual,
    onMutate: async (visualizerId: string) => {
      await queryClient.cancelQueries({ queryKey: visualizerQueryKeys.saved() });

      const previousSavedVisuals = queryClient.getQueryData<SavedVisual[]>(
        visualizerQueryKeys.saved()
      );

      if (previousSavedVisuals) {
        queryClient.setQueryData<SavedVisual[]>(visualizerQueryKeys.saved(), [
          ...previousSavedVisuals,
          {
            _id: `optimistic-${visualizerId}`,
            userId: '',
            visualizerId: {
              _id: visualizerId,
              name: '',
              source: '',
              glsl: '',
              isDemo: false,
            },
            createdAt: '',
            updatedAt: '',
          },
        ]);
      }

      return { previousSavedVisuals };
    },
    onError: (error, _visualizerId, context) => {
      if (context?.previousSavedVisuals) {
        queryClient.setQueryData(visualizerQueryKeys.saved(), context.previousSavedVisuals);
      }

      toast.error(getToastErrorMessage(error, TOAST_MESSAGES.VISUALIZER.SAVE_FAILED));
    },
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.VISUALIZER.SAVED_TO_FAVORITES);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: visualizerQueryKeys.saved() });
    },
  });
}

export function useRemoveVisualMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: removeVisual,
    onMutate: async (visualizerId: string) => {
      await queryClient.cancelQueries({ queryKey: visualizerQueryKeys.saved() });

      const previousSavedVisuals = queryClient.getQueryData<SavedVisual[]>(
        visualizerQueryKeys.saved()
      );

      if (previousSavedVisuals) {
        queryClient.setQueryData<SavedVisual[]>(
          visualizerQueryKeys.saved(),
          previousSavedVisuals.filter((saved) => saved.visualizerId._id !== visualizerId)
        );
      }

      return { previousSavedVisuals };
    },
    onError: (error, _visualizerId, context) => {
      if (context?.previousSavedVisuals) {
        queryClient.setQueryData(visualizerQueryKeys.saved(), context.previousSavedVisuals);
      }

      toast.error(getToastErrorMessage(error, TOAST_MESSAGES.VISUALIZER.REMOVE_FAILED));
    },
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.VISUALIZER.REMOVED_FROM_FAVORITES);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: visualizerQueryKeys.saved() });
    },
  });
}
