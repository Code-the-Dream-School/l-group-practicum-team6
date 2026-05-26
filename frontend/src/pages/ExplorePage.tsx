import { useCallback, useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import LoaderSpinner from '../components/LoaderSpinner';
import Pagination from '../components/Pagination';
import VisualizerCard from '../components/VisualizerCard';
import {
  buildVisualizerImageEndpoint,
  getVisualizerTags,
  listVisualizers,
  saveVisual,
} from '../api';
import searchIcon from '../assets/icons/search.svg';
import { useAuth } from '../context/useAuth';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { VisualizerListItem } from '@sonix/shared';

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 400;

type ExploreVisualizer = VisualizerListItem & { tags?: string[] };

function formatTagLabel(tag: string): string {
  if (!tag) return tag;

  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
}

function getVisualTags(visual: ExploreVisualizer): string[] {
  const tags = (visual.tags ?? []).map(formatTagLabel);

  if (visual.isDemo) {
    return ['Demo', ...tags];
  }

  return tags.length > 0 ? tags : ['Visualizer'];
}

export default function ExplorePage() {
  const { user } = useAuth();
  const canSave = Boolean(user);
  const [visuals, setVisuals] = useState<ExploreVisualizer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [savedVisualIds, setSavedVisualIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const handleSearchDebounced = useCallback(() => {
    setPage(1);
  }, []);
  const debouncedSearch = useDebouncedValue(
    searchInput.trim(),
    SEARCH_DEBOUNCE_MS,
    handleSearchDebounced
  );
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await getVisualizerTags();
        setCategories(response.data.map((tag) => tag.toLowerCase()));
      } catch {
        setCategories([]);
      }
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadVisualizers() {
      setIsLoading(true);

      try {
        const response = await listVisualizers({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          tag: selectedTag || undefined,
        });

        if (cancelled) return;

        setVisuals(response.data as ExploreVisualizer[]);
        setTotalPages(Math.max(response.pages, 1));
        setErrorMessage('');
      } catch {
        if (cancelled) return;

        setVisuals([]);
        setErrorMessage('Unable to load visualizers');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadVisualizers();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, selectedTag]);

  async function handleToggleSave(id: string) {
    if (savedVisualIds.includes(id)) return;

    setSavedVisualIds((currentIds) => [...currentIds, id]);
    setErrorMessage('');

    try {
      await saveVisual(id);
    } catch {
      setSavedVisualIds((currentIds) => currentIds.filter((savedId) => savedId !== id));
      setErrorMessage('Unable to save visualizer');
    }
  }

  function handlePageChange(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  function handleCategorySelect(tag: string) {
    setSelectedTag(tag.toLowerCase());
    setPage(1);
  }

  const showEmptyState = !isLoading && visuals.length === 0;
  const showPagination = !isLoading && visuals.length > 0 && totalPages > 1;

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <NavBar />

      <main className="flex-1 px-6 py-10 text-white">
        <section className="mx-auto max-w-7xl space-y-8">
          <h1 className="text-3xl font-bold text-text-primary">Explore Visuals</h1>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative w-full shrink-0 sm:w-auto sm:min-w-[220px]">
              <span className="sr-only">Search visuals</span>
              <img
                src={searchIcon}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-40"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search visuals..."
                className="rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#8b5cf6]/60"
              />
            </label>

            <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => handleCategorySelect('')}
                className={`shrink-0 ${
                  selectedTag === ''
                    ? 'rounded-full bg-[#8b5cf6] px-4 py-2 text-xs font-semibold text-white'
                    : 'rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs font-medium text-white/55 transition hover:text-white/80 cursor-pointer'
                }`}
              >
                All
              </button>

              {categories.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleCategorySelect(tag)}
                  className={`shrink-0 ${
                    selectedTag === tag
                      ? 'rounded-full bg-[#8b5cf6] px-4 py-2 text-xs font-semibold text-white'
                      : 'rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs font-medium text-white/55 transition hover:text-white/80 cursor-pointer'
                  }`}
                >
                  {formatTagLabel(tag)}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="pt-35">
              <LoaderSpinner
                label="Loading visuals..."
                labelClassName="text-lg text-white/70 pt-4"
              />
            </div>
          ) : showEmptyState ? (
            <div className="rounded-3xl border border-white/10 bg-white/4 px-6 py-12 text-center text-text-secondary">
              No visualizers match your search
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {visuals.map((visual) => (
                  <VisualizerCard
                    key={visual._id}
                    id={visual._id}
                    name={visual.name}
                    tags={getVisualTags(visual)}
                    thumbnailUrl={
                      visual.imageUrl ? buildVisualizerImageEndpoint(visual._id) : undefined
                    }
                    playPath={visual.isDemo ? '/visualizer/demo' : `/visualizer/${visual._id}`}
                    isDemo={visual.isDemo}
                    canSave={canSave && !visual.isDemo}
                    isSaved={savedVisualIds.includes(visual._id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>

              {showPagination && (
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
