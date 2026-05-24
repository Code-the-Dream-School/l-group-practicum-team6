import { useParams } from 'react-router-dom';

import {
  PlayerMessage,
  VisualizerPlayer,
  VisualizerPlayerLayout,
} from '../components/VisualizerPlayerShell';
import { usePlayerGlsl } from '../hooks/usePlayerGlsl';
import { ApiError } from '../api/client';

function getLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return 'Sign in to play this visualizer.';
  }

  if (error instanceof ApiError && error.status === 404) {
    return 'Visualizer not found.';
  }

  return 'Unable to load visualizer.';
}

function PlayerPageContent({ id }: { id: string }) {
  const { glsl, error, isLoading } = usePlayerGlsl(id);

  if (isLoading) {
    return <PlayerMessage>Loading visualizer…</PlayerMessage>;
  }

  if (error) {
    return <PlayerMessage>{getLoadErrorMessage(error)}</PlayerMessage>;
  }

  if (!glsl) {
    return <PlayerMessage>Unable to load visualizer.</PlayerMessage>;
  }

  return <VisualizerPlayer glsl={glsl} />;
}

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <VisualizerPlayerLayout>
      {!id ? (
        <PlayerMessage>Visualizer not found.</PlayerMessage>
      ) : (
        <PlayerPageContent key={id} id={id} />
      )}
    </VisualizerPlayerLayout>
  );
}
