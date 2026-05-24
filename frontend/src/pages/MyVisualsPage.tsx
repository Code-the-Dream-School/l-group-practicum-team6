import { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import VisualizerCard from '../components/VisualizerCard';
import { buildVisualizerImageEndpoint, getSavedVisuals, removeVisual } from '../api';
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
        setErrorMessage('');
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

    return visuals.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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

      <main className="flex flex-1 justify-center px-6 py-10 text-text-primary">
        <div className="w-full max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">My Favorites</h1>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary">
              Sort by
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-text-primary outline-none transition hover:border-cyan-300/40 focus:border-cyan-300"
              >
                <option value="recent">Recently Saved</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-white/10 bg-white/4 px-6 py-12 text-center text-text-secondary">
              Loading your saved visualizers...
            </div>
          ) : errorMessage ? (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 px-6 py-12 text-center text-red-100">
              <h2 className="text-sm font-semibold">Could not load favorites</h2>
              <p className="mt-2 text-xs text-red-100/80">{errorMessage}</p>
            </div>
          ) : sortedVisuals.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-2xl text-text-secondary">&#9825;</div>
              <h2 className="text-sm font-semibold">No favorites yet</h2>
              <p className="mt-2 max-w-xs text-xs leading-5 text-text-secondary">
                Browse visualizers and save your favorites to build your personal collection.
              </p>
              <a
                href="/explore"
                className="mt-5 inline-flex rounded-md bg-[#8b5cf6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7c3aed]"
              >
                Explore Visuals
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
                      thumbnailUrl={
                        visualizer.imageUrl
                          ? buildVisualizerImageEndpoint(visualizer._id)
                          : undefined
                      }
                      playPath={
                        visualizer.isDemo ? '/visualizer/demo' : `/visualizer/${visualizer._id}`
                      }
                      isDemo={visualizer.isDemo}
                      previewGlsl={visualizer.glsl}
                    />

                    {confirmRemoveId === visualizer._id ? (
                      <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-text-secondary">
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
                            className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-text-primary transition hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(visualizer._id)}
                        className="w-full rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
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
