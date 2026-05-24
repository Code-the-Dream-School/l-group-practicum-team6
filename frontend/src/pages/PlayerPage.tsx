import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  PlayerMessage,
  VisualizerPlayer,
  VisualizerPlayerLayout,
} from '../components/VisualizerPlayerShell';
import { getVisualizer } from '../api';
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
  const [glsl, setGlsl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadVisualizer() {
      try {
        const response = await getVisualizer(id);

        if (cancelled) return;

        setGlsl(response.data.glsl);
        setErrorMessage('');
      } catch (error) {
        if (cancelled) return;

        setGlsl(null);
        setErrorMessage(getLoadErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadVisualizer();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return <PlayerMessage>Loading visualizer…</PlayerMessage>;
  }

  if (errorMessage) {
    return <PlayerMessage>{errorMessage}</PlayerMessage>;
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
