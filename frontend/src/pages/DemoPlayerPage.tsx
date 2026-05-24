import {
  PlayerMessage,
  VisualizerPlayer,
  VisualizerPlayerLayout,
} from '../components/VisualizerPlayerShell';
import { usePlayerGlsl } from '../hooks/usePlayerGlsl';
import { ApiError } from '../api/client';

function getDemoLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return 'Demo visualizer not found.';
  }

  return 'Unable to load demo visualizer.';
}

function DemoPlayerContent() {
  const { glsl, error, isLoading } = usePlayerGlsl('demo', { isDemo: true });

  if (isLoading) {
    return <PlayerMessage>Loading visualizer…</PlayerMessage>;
  }

  if (error) {
    return <PlayerMessage>{getDemoLoadErrorMessage(error)}</PlayerMessage>;
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
