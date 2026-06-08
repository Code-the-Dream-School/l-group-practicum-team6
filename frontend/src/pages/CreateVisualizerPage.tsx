import { useMemo, useRef, useState } from 'react';
import { DEFAULT_SYSTEM_PROMPT, ROUTES } from '@sonix/shared';

import NavBar from '../components/NavBar';
import BackButton from '../components/BackButton';
import LoaderSpinner from '../components/LoaderSpinner';
import { VisualizerPlayer } from '../components/VisualizerPlayerShell';
import { generateVisualiser, updateAdminVisualizer, uploadVisualizerImage } from '../api';
import type { PlayerVisual } from '../hooks/usePlayerVisualizer';
import { useToast } from '../context/useToast';
import { getToastErrorMessage } from '../utils/toastErrorMessage';
import { welcomeShader } from '../assets/welcomeShader';
import generateIcon from '../assets/icons/generate.svg';
import randomIcon from '../assets/icons/random.svg';
import saveIcon from '../assets/icons/save.svg';

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

const randomPrompts = [
  'Sunny spinning mandala in space',
  'Neon pulsing cat in a cylinder hat',
  'Bass particles',
  'Aurora waves',
  'Neon tunnel',
  'Fireflies',
  'Mercury ripples',
  'Synthwave grid',
  'Warping stars',
  'Smoke rings',
  'Crystal fractals',
  'Glowing jellyfish',
  'Glitch sunset',
  'Nebula clouds',
  'Lightning branches',
] as const;

const WELCOME_VISUAL: PlayerVisual = {
  id: 'welcome-preview',
  name: 'Preview',
  tags: [],
  isDemo: true,
};

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

  const generatedVisual = useMemo<PlayerVisual | null>(() => {
    if (!generatedId) return null;

    return {
      id: generatedId,
      name: form.name.trim() || 'Untitled',
      tags: toTagArray(form.tags),
      isDemo: true,
    };
  }, [form.name, form.tags, generatedId]);

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

  function handleRandomizePrompt() {
    const example = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(example);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-transparent text-text-primary">
      <NavBar />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {generating ? (
            <>
              <BackButton
                fallback={ROUTES.ADMIN_VISUALS}
                className="pointer-events-auto absolute left-3 top-3 z-10"
              />
              <div className="flex h-full items-center justify-center">
                <LoaderSpinner
                  label="Generating your visual..."
                  labelClassName="text-sm text-white/60 pt-3"
                />
              </div>
            </>
          ) : generatedVisual && generatedGlsl ? (
            <VisualizerPlayer
              glsl={generatedGlsl}
              visual={generatedVisual}
              showPlaybackControls={false}
              captureRef={captureRef}
              backFallback={ROUTES.ADMIN_VISUALS}
            />
          ) : (
            <VisualizerPlayer
              glsl={welcomeShader}
              visual={WELCOME_VISUAL}
              showPlaybackControls={false}
              showInfoCard={false}
              backFallback={ROUTES.ADMIN_VISUALS}
            />
          )}
        </div>

        <div
          className={`pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4 ${
            generating ? 'bottom-6' : 'bottom-3'
          }`}
        >
          <div className="pointer-events-auto flex w-full max-w-[600px] items-center gap-2 rounded-2xl border border-white/10 bg-elevated/95 px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <button
              type="button"
              onClick={handleRandomizePrompt}
              disabled={generating}
              aria-label="Randomize prompt"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              <img src={randomIcon} alt="" className="h-7 w-7 brightness-0 invert" />
            </button>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe it... e.g. particles that pulse with the bass"
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              disabled={generating}
            />

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={generating || !prompt.trim()}
              className="btn-primary flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <img src={generateIcon} alt="" className="h-4 w-4" />
              {generating ? 'Generating…' : generatedId ? 'Regenerate' : 'Generate'}
            </button>

            {generatedId && !generating && (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={submitting}
                className="btn-primary flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                <img src={saveIcon} alt="" className="h-4 w-4" />
                {submitting ? 'Saving…' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
