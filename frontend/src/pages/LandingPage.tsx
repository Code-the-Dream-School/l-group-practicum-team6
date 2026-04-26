import { Link } from "react-router-dom";
import PlayerCanvas from "../components/PlayerCanvas";

function LandingPage() {
  const getSilentAudioData = () => new Uint8Array(128);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative min-h-screen overflow-hidden">
        <PlayerCanvas
          getAudioData={getSilentAudioData}
          className="absolute inset-0 h-full w-full opacity-30"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-widest">
              SONIX
            </Link>

            <div className="flex items-center gap-4 text-sm">
              <Link to="/explore" className="text-slate-300 hover:text-white">
                Explore
              </Link>

              <Link to="/login" className="text-slate-300 hover:text-white">
                Log In
              </Link>

              <Link
                to="/signup"
                className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950 hover:bg-slate-200"
              >
                Sign Up
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 items-center">
            <div className="max-w-3xl py-20">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                Audio-reactive visuals in seconds
              </p>

              <h1 className="text-5xl font-bold leading-tight md:text-7xl">
                See your sound come alive
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Launch immersive shaders, react to live audio, and explore a
                growing visual library with no complicated setup.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/visualizer/demo"
                  className="rounded-full bg-cyan-300 px-6 py-3 text-center font-semibold text-slate-950 hover:bg-cyan-200"
                >
                  Try the Demo
                </Link>

                <Link
                  to="/signup"
                  className="rounded-full border border-white/30 px-6 py-3 text-center font-semibold text-white hover:bg-white/10"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Audio-reactive shaders</h2>
          <p className="mt-3 text-slate-300">
            Turn sound into motion with immersive visuals designed to respond to
            rhythm, energy, and texture.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">No-setup mic access</h2>
          <p className="mt-3 text-slate-300">
            Start quickly with a lightweight experience that is easy to try
            without complicated setup.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Growing visualizer library</h2>
          <p className="mt-3 text-slate-300">
            Explore a curated collection of visual styles and discover looks you
            can launch, save, and revisit.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
