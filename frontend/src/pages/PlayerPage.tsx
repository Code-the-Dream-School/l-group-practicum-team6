import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Visualizer } from '@sonix/shared';

import NavBar from '../components/NavBar';
import { getVisualizer } from '../api/visualizers';
import { useAudioAnalyzer, type AudioAnalyzerStatus } from '../hooks/useAudioAnalyzer';
import { useVisualizer } from '../hooks/useVisualizer';

function audioStatusMessage(status: AudioAnalyzerStatus): string | null {
  switch (status) {
    case 'connecting':
      return 'Connecting microphone…';
    case 'denied':
      return 'Microphone access was blocked. Enable it in browser settings to sync visuals to audio.';
    case 'error':
      return 'Audio input is not available in this browser.';
    default:
      return null;
  }
}

function VisualizerPlayer({ visualizer }: { visualizer: Visualizer }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getAudioData, status } = useAudioAnalyzer();

  useVisualizer(canvasRef, visualizer, getAudioData);

  const statusMessage = audioStatusMessage(status);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {statusMessage && (
        <p className="pointer-events-none absolute bottom-6 left-1/2 max-w-md -translate-x-1/2 rounded-lg border border-white/10 bg-black/60 px-4 py-2 text-center text-sm text-white/80 backdrop-blur">
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [visualizer, setVisualizer] = useState<Visualizer | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setFetchError(null);

      try {
        const response = await getVisualizer(id as string);
        if (!cancelled) {
          setVisualizer(response.data);
        }
      } catch {
        if (!cancelled) {
          setFetchError('Failed to load visualizer');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const error = !id ? 'Visualizer not found.' : fetchError;

  return (
    <div className="flex h-screen flex-col bg-void">
      <NavBar />

      <div className="relative min-h-0 flex-1">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-text-secondary">Loading visualizer…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex h-full items-center justify-center px-6">
            <p className="text-center text-text-secondary">{error}</p>
          </div>
        )}

        {visualizer && !loading && !error && <VisualizerPlayer visualizer={visualizer} />}
      </div>
    </div>
  );
}
