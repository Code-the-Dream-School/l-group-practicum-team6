import { useEffect } from 'react';

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

function getDemoLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return 'Demo visualizer not found.';
  }

  return 'Unable to load demo visualizer.';
}

function DemoPlayerContent() {
  const { glsl, visual, error, isLoading } = usePlayerVisualizer('demo', { isDemo: true });
  const toast = useToast();

  useEffect(() => {
    if (!error) return;
    toast.error(getToastErrorMessage(error, getDemoLoadErrorMessage(error)));
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <LoaderSpinner label="Loading visualizer…" labelClassName="text-lg text-white/70 pt-2" />
      </div>
    );
  }

  if (error) {
    return <PlayerMessage>{getDemoLoadErrorMessage(error)}</PlayerMessage>;
  }

  if (!glsl || !visual) {
    return <PlayerMessage>Unable to load demo visualizer.</PlayerMessage>;
  }

  return <VisualizerPlayer glsl={glsl} visual={visual} />;
}

export default function DemoPlayerPage() {
  return (
    <VisualizerPlayerLayout>
      <DemoPlayerContent />
    </VisualizerPlayerLayout>
  );
}
