import VisualizerCard from "../components/VisualizerCard";
import { useAuth } from "../context/AuthContext";

const visuals = [
  {
    id: "demo",
    name: "Demo Visualizer",
    tags: ["Demo", "Shader", "Audio Reactive"],
    isDemo: true,
  },
  {
    id: "neon-pulse",
    name: "Neon Pulse",
    tags: ["Abstract", "Reactive"],
  },
  {
    id: "cyan-grid",
    name: "Cyan Grid",
    tags: ["Geometric", "Shader"],
  },
];

export default function ExplorePage() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Explore Visuals</h1>
          <p className="mt-2 max-w-2xl text-white/70">
            Browse visualizers and choose one to play.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {visuals.map((visual) => (
            <VisualizerCard
              key={visual.id}
              id={visual.id}
              name={visual.name}
              tags={visual.tags}
              isDemo={visual.isDemo}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
