import VisualizerCard from "../components/VisualizerCard";
import { useAuth } from "../context/AuthContext";

const savedVisuals = [
  {
    id: "neon-pulse",
    name: "Neon Pulse",
    tags: ["Abstract", "Reactive"],
    isSaved: true,
  },
  {
    id: "cyan-grid",
    name: "Cyan Grid",
    tags: ["Geometric", "Shader"],
    isSaved: true,
  },
];

export default function MyVisualsPage() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">My Visuals</h1>
          <p className="mt-2 max-w-2xl text-white/70">
            View your saved visualizers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {savedVisuals.map((visual) => (
            <VisualizerCard
              key={visual.id}
              id={visual.id}
              name={visual.name}
              tags={visual.tags}
              isSaved={visual.isSaved}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
