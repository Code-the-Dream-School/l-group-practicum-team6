import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import LoaderSpinner from '../components/LoaderSpinner';
import {
  PlayerMessage,
  VisualizerPlayer,
  VisualizerPlayerLayout,
} from '../components/VisualizerPlayerShell';
import { usePlayerVisualizer } from '../hooks/usePlayerVisualizer';
import { ApiError } from '../api/client';
import { useToast } from '../context/useToast';
import { getToastErrorMessage } from '../utils/toastErrorMessage';

function getLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return 'Sign in to play this visualizer';
  }

  if (error instanceof ApiError && error.status === 404) {
    return 'Visualizer not found';
  }

  return 'Unable to load visualizer';
}

function PlayerPageContent({ id }: { id: string }) {
  const { glsl, visual, error, isLoading } = usePlayerVisualizer(id);
  const toast = useToast();

  useEffect(() => {
    if (!error) return;
    toast.error(getToastErrorMessage(error, getLoadErrorMessage(error)));
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <LoaderSpinner label="Loading visualizer…" labelClassName="text-sm text-white/70 pt-2" />
      </div>
    );
  }

  if (error) {
    return <PlayerMessage>{getLoadErrorMessage(error)}</PlayerMessage>;
  }

  if (!glsl || !visual) {
    return <PlayerMessage>Unable to load visualizer</PlayerMessage>;
  }

  return <VisualizerPlayer glsl={glsl} visual={visual} showPlaybackControls />;
}

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  useEffect(() => {
    if (!id) {
      toast.error('Visualizer not found.');
    }
  }, [id, toast]);

  return (
    <VisualizerPlayerLayout>
      {!id ? <PlayerMessage>Visualizer not found</PlayerMessage> : <PlayerPageContent id={id} />}
    </VisualizerPlayerLayout>
  );
}
