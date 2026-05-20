import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import VisualizerCard from '../components/VisualizerCard';
import { listVisualizers, saveVisual } from '../api';
import { useAuth } from '../context/useAuth';
import { getPreviewShaderById } from '../utils/previewShaders';
import type { Visualizer } from '@sonix/shared';

export default function ExplorePage() {
  const { user } = useAuth();
  const canSave = Boolean(user);
  const [visuals, setVisuals] = useState<Visualizer[]>([]);
  const [savedVisualIds, setSavedVisualIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVisualizers() {
      try {
        const response = await listVisualizers();
        setVisuals(response.data.visualizers);
      } catch {
        setErrorMessage('Unable to load visualizers.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadVisualizers();
  }, []);

  async function handleToggleSave(id: string) {
    if (savedVisualIds.includes(id)) return;

    setSavedVisualIds((currentIds) => [...currentIds, id]);
    setErrorMessage('');

    try {
      await saveVisual(id);
    } catch {
      setSavedVisualIds((currentIds) => currentIds.filter((savedId) => savedId !== id));
      setErrorMessage('Unable to save visualizer.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <NavBar />

      <main className="flex-1 px-6 py-10 text-white">
        <section className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Explore Visuals</h1>
            <p className="mt-2 max-w-2xl text-white/70">
              Browse visualizers and choose one to play.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-text-secondary">
              Loading visualizers...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {visuals.map((visual) => (
                <VisualizerCard
                  key={visual._id}
                  id={visual._id}
                  name={visual.name}
                  tags={[visual.isDemo ? 'Demo' : 'Visualizer']}
                  thumbnailUrl={visual.image}
                  playPath={visual.isDemo ? '/visualizer/demo' : `/visualizer/${visual._id}`}
                  previewGlsl={visual.glsl || getPreviewShaderById(visual._id)}
                  canSave={canSave && !visual.isDemo}
                  isSaved={savedVisualIds.includes(visual._id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
