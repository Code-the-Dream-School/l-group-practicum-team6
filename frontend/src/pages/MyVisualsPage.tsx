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
import chevronIcon from '../assets/icons/chevron.svg';

export default function MyVisualsPage() {
  const toast = useToast();
  const [sortOption, setSortOption] = useState<FavoritesSortOption>('recent');
  const [sortOpen, setSortOpen] = useState(false);
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

  function handleSortSelect(value: FavoritesSortOption) {
    setSortOption(value);
    setSortOpen(false);
  }

  const selectedSortLabel =
    sortOption === 'recent' ? 'Recently Saved' : sortOption === 'az' ? 'A-Z' : 'Z-A';

  return (
    <div className="flex min-h-screen flex-col justify-between bg-void">
      <NavBar />

      <main className="flex flex-1 justify-center px-6 py-10 text-text-primary">
        <div className="w-full max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{LABELS.MY_VISUALS}</h1>
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium text-text-secondary">
              <span id="sort-by-label">Sort by</span>
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  aria-labelledby="sort-by-label"
                  onClick={() => setSortOpen((open) => !open)}
                  className="relative inline-flex min-w-40 cursor-pointer items-center rounded-full border border-white/10 bg-white/6 px-4 py-2 pr-9 text-sm text-text-primary outline-none"
                >
                  <span className="w-full text-center">{selectedSortLabel}</span>
                  <img
                    src={chevronIcon}
                    alt=""
                    className="absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 shrink-0"
                  />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <ul
                      role="listbox"
                      aria-labelledby="sort-by-label"
                      className="absolute right-0 top-full z-20 mt-2 min-w-full overflow-hidden rounded-lg border border-primary-border bg-elevated py-1 shadow-lg"
                    >
                      {(['recent', 'az', 'za'] as const).map((option) => (
                        <li key={option} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={sortOption === option}
                            onClick={() => handleSortSelect(option)}
                            className={`block w-full cursor-pointer px-4 py-2 text-left text-sm outline-none transition hover:bg-surface ${
                              sortOption === option ? 'text-primary' : 'text-text-primary'
                            }`}
                          >
                            {option === 'recent'
                              ? 'Recently Saved'
                              : option === 'az'
                                ? 'A-Z'
                                : 'Z-A'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
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
