import { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import VisualizerCard from '../components/VisualizerCard';
import { getSavedVisuals, removeVisual } from '../api';
import type { SavedVisual } from '../api/users';

type SortOption = 'recent' | 'az' | 'za';

export default function MyVisualsPage() {
  const [savedVisuals, setSavedVisuals] = useState<SavedVisual[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedVisuals() {
      try {
        const response = await getSavedVisuals();
        setSavedVisuals(response.data);
      } catch {
        setErrorMessage('Unable to load your saved visualizers.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadSavedVisuals();
  }, []);

  const sortedVisuals = useMemo(() => {
    const visuals = [...savedVisuals];

    if (sortOption === 'az') {
      return visuals.sort((a, b) => a.visualizerId.name.localeCompare(b.visualizerId.name));
    }

    if (sortOption === 'za') {
      return visuals.sort((a, b) => b.visualizerId.name.localeCompare(a.visualizerId.name));
    }

    return visuals.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }, [savedVisuals, sortOption]);

  async function handleRemoveVisual(visualizerId: string) {
    const previousVisuals = savedVisuals;

    setSavedVisuals((currentVisuals) =>
      currentVisuals.filter((savedVisual) => savedVisual.visualizerId._id !== visualizerId)
    );
    setConfirmRemoveId(null);
    setErrorMessage('');

    try {
      await removeVisual(visualizerId);
    } catch {
      setSavedVisuals(previousVisuals);
      setErrorMessage('Could not remove visualizer. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-void">
      <NavBar />

      <main className="flex-1 px-6 py-12 text-text-primary">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                Personal Collection
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight">My Visuals</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                Your saved visualizers are collected here for quick playback and easy removal.
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary">
              Sort by
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-text-primary outline-none transition hover:border-cyan-300/40 focus:border-cyan-300"
              >
                <option value="recent">Recently Saved</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </label>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-text-secondary">
              Loading your saved visualizers...
            </div>
          ) : sortedVisuals.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center shadow-[0_0_40px_rgba(124,92,252,0.12)]">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-4xl">
                *
              </div>
              <h2 className="text-2xl font-semibold">You haven't saved any visualizers yet.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
                Explore the visual library and save your favorite audio-reactive effects.
              </p>
              <a
                href="/explore"
                className="mt-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
              >
                Explore Visualizers
              </a>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedVisuals.map((savedVisual) => {
                const visualizer = savedVisual.visualizerId;

                return (
                  <div key={savedVisual._id} className="space-y-3">
                    <VisualizerCard
                      id={visualizer._id}
                      name={visualizer.name}
                      tags={['Saved']}
                      thumbnailUrl={visualizer.image}
                      playPath={`/visualizer/${visualizer._id}`}
                      previewGlsl={visualizer.glsl}
                    />

                    {confirmRemoveId === visualizer._id ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-text-secondary">
                        <p>Remove from collection?</p>
                        <div className="mt-3 flex gap-3">
                          <button
                            type="button"
                            onClick={() => void handleRemoveVisual(visualizer._id)}
                            className="rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-red-100 transition hover:bg-red-500/20"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveId(null)}
                            className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-text-primary transition hover:bg-white/[0.10]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(visualizer._id)}
                        className="w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
