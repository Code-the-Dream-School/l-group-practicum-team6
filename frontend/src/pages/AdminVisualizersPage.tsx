import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { type VisualizerListItem } from '@sonix/shared';

import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import LoaderSpinner from '../components/LoaderSpinner';
import {
  createAdminVisualizer,
  deleteAdminVisualizer,
  getVisualizer,
  listVisualizers,
  updateAdminVisualizer,
} from '../api';
import { useToast } from '../context/useToast';
import { getToastErrorMessage } from '../utils/toastErrorMessage';

type AdminVisualizer = VisualizerListItem & {
  source?: string;
  glsl?: string;
  tags?: string[];
};

type FormState = {
  name: string;
  source: string;
  imageUrl: string;
  glsl: string;
  tags: string;
  isDemo: boolean;
};

const INITIAL_FORM: FormState = {
  name: '',
  source: '',
  imageUrl: '',
  glsl: '',
  tags: '',
  isDemo: false,
};

function toTagArray(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function toTagInput(tags?: string[]): string {
  return (tags ?? []).join(', ');
}

export default function AdminVisualizersPage() {
  const toast = useToast();
  const [visualizers, setVisualizers] = useState<AdminVisualizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const loadVisualizers = useCallback(async () => {
    try {
      const response = await listVisualizers({
        page: 1,
        limit: 100,
      });

      setVisualizers(response.data as AdminVisualizer[]);
    } catch (error) {
      toast.error(getToastErrorMessage(error, 'Unable to load visualizers.'));
      setVisualizers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadVisualizers();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadVisualizers]);

  const filteredVisualizers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) return visualizers;

    return visualizers.filter((visualizer) => {
      return (
        visualizer.name.toLowerCase().includes(normalized) ||
        (visualizer.source ?? '').toLowerCase().includes(normalized) ||
        (visualizer.tags ?? []).some((tag) => tag.toLowerCase().includes(normalized))
      );
    });
  }, [visualizers, search]);

  async function selectForEdit(visualizer: AdminVisualizer) {
    setLoadingEditId(visualizer._id);

    try {
      const response = await getVisualizer(visualizer._id);
      const detail = response.data;

      setSelectedId(visualizer._id);
      setForm({
        name: detail.name,
        source: detail.source ?? visualizer.source ?? '',
        imageUrl: detail.imageUrl ?? visualizer.imageUrl ?? '',
        glsl: detail.glsl ?? '',
        tags: toTagInput(detail.tags ?? visualizer.tags),
        isDemo: detail.isDemo,
      });
    } catch (error) {
      toast.error(getToastErrorMessage(error, 'Unable to load visualizer details.'));
    } finally {
      setLoadingEditId((current) => (current === visualizer._id ? null : current));
    }
  }

  function resetForm() {
    setSelectedId(null);
    setForm(INITIAL_FORM);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    if (!selectedId && !form.glsl.trim()) {
      toast.error('GLSL is required for creation.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      source: form.source.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      glsl: form.glsl.trim() || undefined,
      isDemo: form.isDemo,
      tags: toTagArray(form.tags),
    };

    setSubmitting(true);

    try {
      if (selectedId) {
        await updateAdminVisualizer(selectedId, payload);
        toast.success('Visualizer updated.');
      } else {
        await createAdminVisualizer({
          name: payload.name,
          glsl: payload.glsl ?? '',
          source: payload.source,
          imageUrl: payload.imageUrl,
          isDemo: payload.isDemo,
          tags: payload.tags,
        });
        toast.success('Visualizer created.');
      }

      resetForm();
      setLoading(true);
      await loadVisualizers();
    } catch (error) {
      toast.error(getToastErrorMessage(error, 'Unable to save visualizer.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      'Delete this visualizer? This also removes linked user saves and associated images.'
    );

    if (!confirmDelete) return;

    try {
      await deleteAdminVisualizer(id);
      toast.success('Visualizer deleted.');

      if (selectedId === id) {
        resetForm();
      }

      setLoading(true);
      await loadVisualizers();
    } catch (error) {
      toast.error(getToastErrorMessage(error, 'Unable to delete visualizer.'));
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-text-primary">
      <style>{`
        .admin-glsl-scrollbar {
          color-scheme: dark;
          scrollbar-width: thin;
          scrollbar-color: var(--color-primary-border) var(--color-void);
        }

        .admin-glsl-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .admin-glsl-scrollbar::-webkit-scrollbar-track {
          background-color: var(--color-void);
        }

        .admin-glsl-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 8px;
          border: 2px solid var(--color-void);
          background-color: var(--color-primary-border);
        }

        .admin-glsl-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--color-elevated);
        }
      `}</style>
      <NavBar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="space-y-2">
          <h1 className="text-[32px] font-semibold leading-[51.2px] text-text-primary">
            Admin Visualizer Manager
          </h1>
          <p className="text-sm text-text-secondary">
            Create, edit, and delete visualizers from the protected admin namespace.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/4 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {selectedId ? 'Edit Visualizer' : 'Create Visualizer'}
            </h2>
            {selectedId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-ghost cursor-pointer border-primary-border text-sm font-medium text-text-secondary transition hover:border-primary-light hover:text-text-primary"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm">
              <span className="text-text-secondary">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="input-field"
                required
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-text-secondary">Image URL</span>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                className="input-field"
                placeholder="Image ObjectId or URL"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-text-secondary">GLSL</span>
              <textarea
                value={form.glsl}
                onChange={(event) => setForm((prev) => ({ ...prev, glsl: event.target.value }))}
                className="input-field admin-glsl-scrollbar min-h-36 h-auto py-2 font-mono text-xs"
                placeholder="void main() { gl_FragColor = vec4(1.0); }"
                required={!selectedId}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-text-secondary">Tags (comma separated)</span>
              <input
                type="text"
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                className="input-field"
                placeholder="ambient, chill, bass"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-text-secondary">Source</span>
              <input
                type="text"
                value={form.source}
                onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
                className="input-field"
              />
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={form.isDemo}
                onChange={(event) => setForm((prev) => ({ ...prev, isDemo: event.target.checked }))}
              />
              Mark as demo visualizer
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-2 w-fit cursor-pointer text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : selectedId ? 'Update Visualizer' : 'Create Visualizer'}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Manage Existing Visualizers</h2>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, source, or tag"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-cyan-300 sm:max-w-sm"
            />
          </div>

          {loading ? (
            <div className="pt-16">
              <LoaderSpinner
                label="Loading visualizers..."
                labelClassName="text-base text-white/70 pt-4"
              />
            </div>
          ) : filteredVisualizers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/4 px-5 py-8 text-center text-text-secondary">
              No visualizers found.
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredVisualizers.map((visualizer) => (
                <article
                  key={visualizer._id}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{visualizer.name}</h3>
                      <p className="text-xs text-text-secondary">
                        {visualizer.source || 'Unknown source'}
                        {visualizer.isDemo ? ' • Demo' : ''}
                      </p>
                      {visualizer.tags && visualizer.tags.length > 0 && (
                        <p className="mt-1 text-xs text-text-secondary">
                          Tags: {visualizer.tags.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void selectForEdit(visualizer)}
                        disabled={loadingEditId === visualizer._id}
                        className="btn-ghost cursor-pointer border-primary-border text-sm font-medium text-text-primary transition hover:border-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingEditId === visualizer._id ? 'Loading...' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(visualizer._id)}
                        className="btn-ghost cursor-pointer border-error text-sm font-medium text-error transition hover:bg-error/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
