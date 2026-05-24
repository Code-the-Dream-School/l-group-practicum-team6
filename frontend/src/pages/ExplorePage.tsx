import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Pagination from '../components/Pagination';
import VisualizerCard from '../components/VisualizerCard';
import { buildVisualizerImageEndpoint, listVisualizers, saveVisual } from '../api';
import { useAuth } from '../context/useAuth';
import { getPreviewShaderById } from '../utils/previewShaders';
import type { VisualizerListItem } from '@sonix/shared';

const PAGE_SIZE = 8;

type ExploreVisualizer = VisualizerListItem & { tags?: string[] };

function getVisualTags(visual: ExploreVisualizer): string[] {
  const tags = visual.tags ?? [];

  if (visual.isDemo) {
    return ['Demo', ...tags];
  }

  return tags.length > 0 ? tags : ['Visualizer'];
}

export default function ExplorePage() {
  const { user } = useAuth();
  const canSave = Boolean(user);
  const [visuals, setVisuals] = useState<ExploreVisualizer[]>([]);
  const [savedVisualIds, setSavedVisualIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadVisualizers() {
      setIsLoading(true);

      try {
        const response = await listVisualizers({ page, limit: PAGE_SIZE });
        setVisuals(response.data as ExploreVisualizer[]);
        setTotalPages(Math.max(response.pages, 1));
        setErrorMessage('');
      } catch {
        setVisuals([]);
        setErrorMessage('Unable to load visualizers.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadVisualizers();
  }, [page]);

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

  function handlePageChange(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  const showEmptyState = !isLoading && visuals.length === 0;
  const showPagination = !isLoading && visuals.length > 0 && totalPages > 1;

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <NavBar />

      <main className="flex-1 px-6 py-10 text-white">
        <section className="mx-auto max-w-7xl space-y-8">
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
            <div className="rounded-3xl border border-white/10 bg-white/4 px-6 py-12 text-center text-text-secondary">
              Loading visualizers...
            </div>
          ) : showEmptyState ? (
            <div className="rounded-3xl border border-white/10 bg-white/4 px-6 py-12 text-center text-text-secondary">
              No visualizers available yet.
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
                    previewGlsl={getPreviewShaderById(visual._id)}
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
