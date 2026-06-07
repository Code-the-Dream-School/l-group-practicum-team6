import { useEffect, useRef, useState } from 'react';
import { DEFAULT_SYSTEM_PROMPT, ROUTES } from '@sonix/shared';

import NavBar from '../components/NavBar';
import LoaderSpinner from '../components/LoaderSpinner';
import VisualizerCard from '../components/VisualizerCard';
import { generateVisualiser, updateAdminVisualizer, uploadVisualizerImage } from '../api';
import { useToast } from '../context/useToast';
import { getToastErrorMessage } from '../utils/toastErrorMessage';
import { activateVisualPreview } from '../utils/visualPreview';

type FormState = {
  name: string;
  tags: string;
  isDemo: boolean;
  source?: string;
};

function toTagArray(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export default function CreateVisualizerPage() {
  const toast = useToast();

  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [generatedGlsl, setGeneratedGlsl] = useState<string>('');
  const [form, setForm] = useState<FormState>({
    name: '',
    tags: '',
    isDemo: false,
    source: 'Gemini',
  });
  const captureRef = useRef<((blob: Blob) => void) | null>(null);

  useEffect(() => {
    if (generatedId) activateVisualPreview(generatedId);
  }, [generatedId]);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const response = await generateVisualiser(prompt.trim(), DEFAULT_SYSTEM_PROMPT);
      const visualizer = response.data;
      setGeneratedId(visualizer._id);
      setGeneratedGlsl(visualizer.glsl ?? '');
      setForm({
        name: visualizer.name,
        source: visualizer.source,
        tags: (visualizer.tags ?? []).join(', '),
        isDemo: false,
      });
      toast.success('Shader generated — review and save.');
    } catch (error) {
      toast.error(getToastErrorMessage(error, 'Failed to generate visualizer.'));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!generatedId) return;

    if (!form.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    const id = generatedId;
    const name = form.name.trim();
    const tags = toTagArray(form.tags);
    const isDemo = form.isDemo;
    const source = form.source;

    setSubmitting(true);

    captureRef.current = async (blob) => {
      const file = new File([blob], 'preview.png', { type: 'image/png' });
      try {
        await uploadVisualizerImage(id, file);
        await updateAdminVisualizer(id, { name, tags, isDemo, source });
        toast.success('Visualizer saved.');
      } catch (error) {
        toast.error(getToastErrorMessage(error, 'Failed to save visualizer.'));
      } finally {
        setSubmitting(false);
      }
    };
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-void text-text-primary">
      <NavBar />

      <div className="pointer-events-none flex-1 overflow-hidden">
        {generatedId && !generating ? (
          <VisualizerCard
            id={generatedId}
            name={form.name}
            tags={toTagArray(form.tags)}
            previewGlsl={generatedGlsl}
            isDemo={form.isDemo}
            playPath="#"
            captureRef={captureRef}
            previewOnly
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/30">
            {generating ? (
              <LoaderSpinner
                label="Calling Gemini AI..."
                labelClassName="text-sm text-white/60 pt-3"
              />
            ) : (
              'Generate a shader to see a preview'
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-4 py-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your visualizer, e.g. particles that pulse with the bass"
            className="h-9 flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            disabled={generating}
          />

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating || !prompt.trim()}
            className="btn-primary flex shrink-0 items-center gap-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
            </svg>
            {generating ? 'Generating…' : generatedId ? 'Regenerate' : 'Generate'}
          </button>

          {generatedId && !generating && (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={submitting}
              className="btn-primary flex shrink-0 items-center gap-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
