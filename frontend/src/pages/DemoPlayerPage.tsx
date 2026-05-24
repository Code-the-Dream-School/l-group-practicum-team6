import { useEffect, useState } from 'react';

import {
  PlayerMessage,
  VisualizerPlayer,
  VisualizerPlayerLayout,
} from '../components/VisualizerPlayerShell';
import { getDemoVisualizer } from '../api';
import { ApiError } from '../api/client';

function getDemoLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return 'Demo visualizer not found.';
  }

  return 'Unable to load demo visualizer.';
}

function DemoPlayerContent() {
  const [glsl, setGlsl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDemoVisualizer() {
      try {
        const response = await getDemoVisualizer();

        if (cancelled) return;

        setGlsl(response.data.glsl);
        setErrorMessage('');
      } catch (error) {
        if (cancelled) return;

        setGlsl(null);
        setErrorMessage(getDemoLoadErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDemoVisualizer();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <PlayerMessage>Loading visualizer…</PlayerMessage>;
  }

  if (errorMessage) {
    return <PlayerMessage>{errorMessage}</PlayerMessage>;
  }

  if (!glsl) {
    return <PlayerMessage>Unable to load demo visualizer.</PlayerMessage>;
  }

  return <VisualizerPlayer glsl={glsl} />;
}

export default function DemoPlayerPage() {
  return (
    <VisualizerPlayerLayout>
      <DemoPlayerContent />
    </VisualizerPlayerLayout>
  );
}
