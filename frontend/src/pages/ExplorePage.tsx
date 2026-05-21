import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import VisualizerCard from '../components/VisualizerCard';
import { useAuth } from '../context/useAuth';
import { decodeGlsl, getAllShaders } from '../utils/mockShaders';

const visuals = getAllShaders();

export default function ExplorePage() {
  const { user } = useAuth();
  const canSave = Boolean(user);

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <NavBar />

      <main className="flex-1 px-6 py-10 text-white">
        <section className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Explore Visuals</h1>
            <p className="mt-2 max-w-2xl text-white/70">
              Browse visualizers and choose one to play.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {visuals.map((visual) => (
              <VisualizerCard
                key={visual.id}
                id={visual.id}
                name={visual.title}
                tags={visual.categories}
                playPath={`/visualizer/${visual.id}`}
                previewGlsl={decodeGlsl(visual.shader)}
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
