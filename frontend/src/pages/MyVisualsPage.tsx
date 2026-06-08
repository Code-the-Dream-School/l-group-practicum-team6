import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import VisualizerCard from '../components/VisualizerCard';
import { useToast } from '../context/useToast';
import { buildVisualizerImageEndpoint } from '../api';
import { useRemoveVisualMutation } from '../hooks/useSavedVisualMutations';
import { useSavedVisualsQuery } from '../hooks/useSavedVisualsQuery';
import LoaderSpinner from '../components/LoaderSpinner';
import { getToastErrorMessage } from '../utils/toastErrorMessage';
import { LABELS, TOAST_MESSAGES, ROUTES } from '@sonix/shared';
import { sortSavedVisuals, type FavoritesSortOption } from '../utils/savedVisuals';

export default function MyVisualsPage() {
  const toast = useToast();
  const [sortOption, setSortOption] = useState<FavoritesSortOption>('recent');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const { data: savedVisuals = [], isPending: isLoading, isError, error } = useSavedVisualsQuery();
  const removeMutation = useRemoveVisualMutation();

  useEffect(() => {
    if (!isError || !error) return;

    toast.error(getToastErrorMessage(error, TOAST_MESSAGES.VISUALIZER.LOAD_SAVED_FAILED));
  }, [isError, error, toast]);

  const sortedVisuals = useMemo(
    () => sortSavedVisuals(savedVisuals, sortOption),
    [savedVisuals, sortOption]
  );

  const FavoritesContext = useMemo(
    () => ({
      source: 'favorites' as const,
      sort: sortOption,
    }),
    [sortOption]
  );

  function buildVisualizerPath(id: string): string {
    return ROUTES.VISUALIZER.replace(':id', encodeURIComponent(id));
  }

  async function handleRemoveVisual(visualizerId: string) {
    setConfirmRemoveId(null);

    try {
      await removeMutation.mutateAsync(visualizerId);
    } catch {
      // Toast is handled in the mutation hook.
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-void">
      <NavBar />

      <main className="flex flex-1 justify-center px-6 py-10 text-text-primary">
        <div className="w-full max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[32px] font-semibold leading-[51.2px] text-text-primary">
                {LABELS.MY_VISUALS}
              </h1>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary md:flex-row md:items-center md:gap-3">
              Sort by
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as FavoritesSortOption)}
                className="cursor-pointer rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-text-primary outline-none transition hover:border-cyan-300/40 focus:border-cyan-300"
              >
                <option value="recent">Recently Saved</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="pt-35">
              <LoaderSpinner
                label="Loading your saved visualizers..."
                labelClassName="text-lg text-white/70 pt-4"
              />
            </div>
          ) : sortedVisuals.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-2xl text-text-secondary">&#9825;</div>
              <h2 className="text-sm font-semibold">No favorites yet</h2>
              <p className="mt-2 max-w-xs text-xs leading-5 text-text-secondary">
                Browse visualizers and save your favorites to build your personal collection.
              </p>
              <Link
                to={ROUTES.EXPLORE}
                className="mt-5 inline-flex rounded-md bg-[#8b5cf6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7c3aed]"
              >
                Explore Visuals
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedVisuals.map((savedVisual) => {
                const visualizer = savedVisual.visualizerId;

                return (
                  <div key={savedVisual._id} className="space-y-3">
                    <VisualizerCard
                      id={visualizer && visualizer._id}
                      name={visualizer && visualizer.name}
                      tags={['Saved']}
                      thumbnailUrl={
                        visualizer && visualizer.imageUrl
                          ? buildVisualizerImageEndpoint(visualizer._id)
                          : undefined
                      }
                      playPath={buildVisualizerPath(visualizer._id)}
                      isDemo={visualizer.isDemo}
                      previewGlsl={visualizer.glsl}
                      playbackContext={FavoritesContext}
                    />

                    {confirmRemoveId === (visualizer && visualizer._id) ? (
                      <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-text-secondary">
                        <p>Remove from collection?</p>
                        <div className="mt-3 flex gap-3">
                          <button
                            type="button"
                            onClick={() => void handleRemoveVisual(visualizer._id)}
                            className="cursor-pointer rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-red-100 transition hover:bg-red-500/20"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveId(null)}
                            className="cursor-pointer rounded-full border border-white/10 bg-white/6 px-4 py-2 text-text-primary transition hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(visualizer._id)}
                        className="w-full cursor-pointer rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100"
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
