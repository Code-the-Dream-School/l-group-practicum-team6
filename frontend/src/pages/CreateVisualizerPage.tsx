import { useEffect, useRef, useState } from 'react';
import { DEFAULT_SYSTEM_PROMPT, ROUTES } from '@sonix/shared';

import NavBar from '../components/NavBar';
import BackButton from '../components/BackButton';
import LoaderSpinner from '../components/LoaderSpinner';
import VisualizerCard from '../components/VisualizerCard';
import { generateVisualiser, updateAdminVisualizer, uploadVisualizerImage } from '../api';
import { useToast } from '../context/useToast';
import { getToastErrorMessage } from '../utils/toastErrorMessage';
import { activateVisualPreview, startVisualPreview } from '../utils/visualPreview';
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
  'Particles that pulse with the bass',
  'Aurora waves drifting across a dark sky',
  'Geometric tunnel with a neon glow',
  'Fireflies swirling around a moonlit forest',
  'Liquid mercury ripples in zero gravity',
  'Retro synthwave grid stretching to the horizon',
  'Starfield warping with the beat',
  'Rainbow smoke rings expanding outward',
  'Crystalline fractals blooming with treble hits',
  'Underwater bioluminescent jellyfish pulse',
  'Glitching VHS sunset over the ocean',
  'Cosmic nebula clouds breathing with the music',
  'Electric lightning branching on every snare',
] as const;

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
  const welcomePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (generatedId) activateVisualPreview(generatedId);
  }, [generatedId]);

  useEffect(() => {
    if (generatedId || generating) return;

    const container = welcomePreviewRef.current;
    if (!container) return;

    return startVisualPreview(container, welcomeShader, undefined, true);
  }, [generatedId, generating]);

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
    <div className="flex h-screen flex-col overflow-hidden bg-void text-text-primary">
      <NavBar />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none relative flex-1 overflow-hidden">
          <BackButton
            fallback={ROUTES.ADMIN_VISUALS}
            className="pointer-events-auto absolute left-3 top-3 z-10"
          />
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
          ) : generating ? (
            <div className="flex h-full items-center justify-center">
              <LoaderSpinner
                label="Calling Gemini AI..."
                labelClassName="text-sm text-white/60 pt-3"
              />
            </div>
          ) : (
            <div className="relative h-full w-full">
              <div
                ref={welcomePreviewRef}
                className="absolute inset-0 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
              />
              <p className="absolute inset-x-0 bottom-22 z-10 flex items-center justify-center text-sm text-white/30">
                Generate a visual to see a preview
              </p>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
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
