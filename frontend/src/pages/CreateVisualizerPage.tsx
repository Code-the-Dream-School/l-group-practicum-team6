import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@sonix/shared';

import NavBar from '../components/NavBar';
import LoaderSpinner from '../components/LoaderSpinner';
import { VisualizerPlayer } from '../components/VisualizerPlayerShell';
import { generateVisualiser, updateAdminVisualizer } from '../api';
import { useToast } from '../context/useToast';
import { getToastErrorMessage } from '../utils/toastErrorMessage';

type FormState = {
  name: string;
  tags: string;
  isDemo: boolean;
};

function toTagArray(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export default function CreateVisualizerPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [generatedGlsl, setGeneratedGlsl] = useState<string>('');
  const [form, setForm] = useState<FormState>({ name: '', tags: '', isDemo: false });

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const response = await generateVisualiser(prompt.trim());
      const visualizer = response.data;
      setGeneratedId(visualizer._id);
      setGeneratedGlsl(visualizer.glsl ?? '');
      setForm({
        name: visualizer.name,
        tags: (visualizer.tags ?? []).join(', '),
        isDemo: visualizer.isDemo,
      });
      toast.success('Shader generated — review and save.');
    } catch (error) {
      toast.error(getToastErrorMessage(error, 'Failed to generate visualizer.'));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!generatedId) return;

    if (!form.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await updateAdminVisualizer(generatedId, {
        name: form.name.trim(),
        tags: toTagArray(form.tags),
        isDemo: form.isDemo,
      });
      toast.success('Visualizer saved.');
      void navigate(ROUTES.ADMIN_VISUALS);
    } catch (error) {
      toast.error(getToastErrorMessage(error, 'Failed to save visualizer.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-void text-text-primary">
      <NavBar />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-8">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ADMIN_VISUALS}
            className="text-sm text-text-secondary transition hover:text-text-primary"
          >
            ← Admin Visualizers
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/4 p-6">
          <h2 className="mb-4 text-lg font-semibold">Generate with AI</h2>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-text-secondary">Describe your visualizer</span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. fiery red and orange particles that pulse with the bass"
                className="input-field min-h-24 py-2 text-sm"
                disabled={generating}
              />
            </label>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={generating || !prompt.trim()}
              className="btn-primary w-fit text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? 'Generating...' : generatedId ? 'Regenerate' : 'Generate Shader'}
            </button>
          </div>
          {generating && (
            <div className="mt-6">
              <LoaderSpinner
                label="Calling Gemini AI..."
                labelClassName="text-sm text-white/60 pt-3"
              />
            </div>
          )}
        </section>
        {generatedId && !generating && (
          <section className="rounded-2xl border border-white/10 bg-white/4 p-6">
            <h2 className="mb-4 text-lg font-semibold">Review &amp; Save</h2>

            <div className="mb-4 h-56 overflow-hidden rounded-xl">
              <VisualizerPlayer
                glsl={generatedGlsl}
                visual={{ id: generatedId, name: form.name, tags: [], isDemo: false }}
                showPlaybackControls={false}
              />
            </div>

            <form className="grid gap-4" onSubmit={(e) => void handleSave(e)}>
              <label className="grid gap-1 text-sm">
                <span className="text-text-secondary">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-text-secondary">Tags (comma separated)</span>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  className="input-field"
                  placeholder="ambient, chill, bass"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={form.isDemo}
                  onChange={(e) => setForm((prev) => ({ ...prev, isDemo: e.target.checked }))}
                />
                Mark as demo visualizer
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-text-secondary">Generated GLSL (read-only preview)</span>
                <textarea
                  value={generatedGlsl}
                  readOnly
                  className="input-field min-h-48 cursor-default py-2 font-mono text-xs opacity-70"
                  style={{ colorScheme: 'dark' }}
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save Visualizer'}
                </button>
                <Link
                  to={ROUTES.ADMIN_VISUALS}
                  className="btn-ghost border-primary-border text-sm font-medium text-text-secondary transition hover:border-primary-light hover:text-text-primary"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
