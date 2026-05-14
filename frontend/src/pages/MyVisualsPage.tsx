import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import VisualizerCard from '../components/VisualizerCard';
import { useAuth } from '../context/useAuth';
import { getPreviewShaderById } from '../utils/previewShaders';

const savedVisuals = [
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    tags: ['Abstract', 'Reactive'],
    isSaved: true,
  },
  {
    id: 'cyan-grid',
    name: 'Cyan Grid',
    tags: ['Geometric', 'Shader'],
    isSaved: true,
  },
];

export default function MyVisualsPage() {
  const { user } = useAuth();
  const canSave = Boolean(user);

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <NavBar />

      <main className="flex-1 px-6 py-10 text-white">
        <section className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">My Visuals</h1>
            <p className="mt-2 max-w-2xl text-white/70">View your saved visualizers.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {savedVisuals.map((visual) => (
              <VisualizerCard
                key={visual.id}
                id={visual.id}
                name={visual.name}
                tags={visual.tags}
                playPath={`/visualizer/${visual.id}`}
                previewGlsl={getPreviewShaderById(visual.id)}
                isSaved={visual.isSaved}
                canSave={canSave}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
