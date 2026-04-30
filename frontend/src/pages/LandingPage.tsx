import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.35),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.24),transparent_30%)]" />
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-widest">
              SONIX
            </Link>

            <div className="flex items-center gap-6 text-sm text-white/80">
              <Link to="/explore" className="hover:text-cyan-300">
                Explore
              </Link>

              <Link to="/login" className="text-slate-300 hover:text-white">
                Log In
              </Link>

              <Link
                to="/signup"
                className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-2 font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)] hover:bg-cyan-300/20"
              >
                Sign Up
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 items-center justify-center text-center">
            <div className="max-w-4xl py-20">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                Audio-reactive visualizer
              </p>

              <h1 className="text-6xl font-semibold tracking-tight md:text-8xl">
                See Your Sound
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65">
                Launch immersive shaders, react to live audio, and explore a
                growing visual library with no complicated setup.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/visualizer/demo"
                  className="rounded-full bg-cyan-300 px-8 py-3 text-center font-semibold text-black shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:bg-cyan-200"
                >
                  Try the Demo
                </Link>

                <Link
                  to="/signup"
                  className="rounded-full border border-purple-400/40 bg-purple-400/10 px-8 py-3 text-center font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:bg-purple-400/20"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3"
      >
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
