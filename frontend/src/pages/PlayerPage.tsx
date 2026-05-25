import { useParams } from 'react-router-dom';

import LoaderSpinner from '../components/LoaderSpinner';
import {
  PlayerMessage,
  VisualizerPlayer,
  VisualizerPlayerLayout,
} from '../components/VisualizerPlayerShell';
import { usePlayerGlsl } from '../hooks/usePlayerGlsl';
import { ApiError } from '../api/client';

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
  const { glsl, error, isLoading } = usePlayerGlsl(id);

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

  if (!glsl) {
    return <PlayerMessage>Unable to load visualizer</PlayerMessage>;
  }

  return <VisualizerPlayer glsl={glsl} />;
}

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <VisualizerPlayerLayout>
      {!id ? (
        <PlayerMessage>Visualizer not found</PlayerMessage>
      ) : (
        <PlayerPageContent key={id} id={id} />
      )}
    </VisualizerPlayerLayout>
  );
}
