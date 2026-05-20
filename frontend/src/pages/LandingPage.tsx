import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_55%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(124,58,237,0.30),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.10),transparent_26%)]" />
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 pt-6">
          <nav className="flex items-center justify-between border-b border-white/5 pb-5">
            <Link to="/" className="text-xl font-bold tracking-widest text-cyan-300">
              SONIX
            </Link>

            <div className="flex items-center gap-6 text-sm text-white/80">
              <a href="#features" className="hover:text-cyan-300">
                Features
              </a>

              <Link to="/pricing" className="hover:text-cyan-300">
                Pricing
              </Link>

              <Link to="/about" className="hover:text-cyan-300">
                About
              </Link>

              <Link to="/login" className="text-slate-300 hover:text-white">
                Log In
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-cyan-300 px-5 py-2 font-semibold text-black transition hover:bg-cyan-200"
              >
                Sign Up
              </Link>
            </div>
          </nav>

          <div className="flex justify-center pt-10 pb-6 text-center">
            <div className="max-w-5xl py-10">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                Music Made Visible
              </p>

              <h1 className="text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
                Transform Music Into Living Art
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/60 md:text-xl">
                Experience the future of audio visualization with AI-generated, real-time reactive
                visuals that dance to every beat.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/visualizer/demo"
                  className="rounded-xl bg-cyan-300 px-8 py-3 text-center font-semibold text-black transition hover:bg-cyan-200"
                >
                  Try the Demo
                </Link>

                <Link
                  to="/signup"
                  className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  Get Started Free
                </Link>
              </div>

              <div className="mx-auto mt-10 w-full max-w-44 rounded-3xl border border-purple-400/30 bg-black/25 p-4 shadow-[0_0_70px_rgba(124,58,237,0.28)] backdrop-blur">
                <div className="mb-4 flex items-center justify-between text-xs text-white/50">
                  <span>Live audio signal</span>
                  <span className="text-cyan-300">Demo ready</span>
                </div>

                <div className="relative flex h-56 items-end justify-center gap-2 overflow-hidden rounded-2xl bg-black/50 p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),transparent_60%)]" />

                  <svg
                    className="absolute top-7 left-1/2 h-16 w-40 -translate-x-1/2"
                    viewBox="0 0 160 64"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 16 C20 4, 36 4, 56 16 S92 28, 112 16 S144 4, 160 16"
                      stroke="#22d3ee"
                      strokeOpacity="0.55"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 32 C20 20, 36 20, 56 32 S92 44, 112 32 S144 20, 160 32"
                      stroke="#22d3ee"
                      strokeOpacity="0.28"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M0 48 C20 36, 36 36, 56 48 S92 60, 112 48 S144 36, 160 48"
                      stroke="#22d3ee"
                      strokeOpacity="0.14"
                      strokeWidth="1"
                    />

                    <circle cx="34" cy="10" r="1.5" fill="#a855f7" opacity="0.7" />
                    <circle cx="68" cy="6" r="1.5" fill="#22d3ee" opacity="0.7" />
                    <circle cx="120" cy="22" r="1.5" fill="#a855f7" opacity="0.6" />
                  </svg>

                  <div className="relative h-10 w-3 rounded-full bg-cyan-300" />
                  <div className="relative h-16 w-3 rounded-full bg-purple-400" />
                  <div className="relative h-24 w-3 rounded-full bg-cyan-300" />
                  <div className="relative h-14 w-3 rounded-full bg-purple-400" />
                  <div className="relative h-20 w-3 rounded-full bg-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-5xl gap-6 px-6 py-20 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_0_50px_rgba(34,211,238,0.12)]">
          <img src="/icons/wave.svg" alt="" className="mb-5 h-6 w-6" />

          <h2 className="text-xl font-semibold">Real-time Visuals</h2>

          <p className="mt-3 text-slate-300">
            Experience zero-latency frequency mapping that breathes with your music perfectly.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_0_50px_rgba(34,211,238,0.12)]">
          <img src="/icons/mic.svg" alt="" className="mb-5 h-6 w-6" />

          <h2 className="text-xl font-semibold">Microphone Input</h2>

          <p className="mt-3 text-slate-300">
            Capture live performances or environmental sound and watch it transform instantly.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_0_50px_rgba(34,211,238,0.12)]">
          <img src="/icons/layers.svg" alt="" className="mb-5 h-6 w-6" />

          <h2 className="text-xl font-semibold">Playlist Collections</h2>

          <p className="mt-3 text-slate-300">
            Curate sets of visual presets and audio tracks for seamless transitions during your set.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/35">
          How it works
        </p>

        <h2 className="mt-3 text-3xl font-semibold">From audio to visuals in three steps</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-semibold">
              1
            </div>
            <img src="/icons/mic.svg" alt="" className="h-5 w-5" />
            <h3 className="mt-3 font-semibold">Connect your audio</h3>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Plug in a microphone, line-in, or virtual audio source. Sonix picks up the signal
              instantly — no plugins, no setup beyond choosing your input.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-semibold">
              2
            </div>
            <img src="/icons/grid.svg" alt="" className="h-5 w-5" />
            <h3 className="mt-3 font-semibold">Pick a visual</h3>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Browse the curated library of reactive visuals. Switch between them instantly, shuffle
              for variety, and find the one that fits your sound.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-semibold">
              3
            </div>
            <img src="/icons/play.svg" alt="" className="h-5 w-5" />
            <h3 className="mt-3 font-semibold">Press play</h3>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Watch your audio render live. Go fullscreen for performances and streams, or save the
              visuals you love to your favorites.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-3xl font-semibold">Engineered for Every Stage</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center p-6">
            <div className="flex h-full flex-col justify-end">
              <h3 className="text-2xl font-semibold">Live Performance</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">Stage ready</p>
            </div>
          </div>

          <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center p-6">
            <div className="flex h-full flex-col justify-end">
              <h3 className="text-2xl font-semibold">Streaming</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">
                Content creation
              </p>
            </div>
          </div>

          <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center p-6">
            <div className="flex h-full flex-col justify-end">
              <h3 className="text-2xl font-semibold">Meditation & Focus</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">Wellness</p>
            </div>
          </div>

          <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center p-6">
            <div className="flex h-full flex-col justify-end">
              <h3 className="text-2xl font-semibold">Events & Venues</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">
                Immersive tech
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-white/5 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),transparent_40%)] px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold">Ready to see your sound?</h2>

          <p className="mx-auto mt-4 max-w-2xl text-white/50">
            Sign up free and start visualizing in minutes - pick an audio source, choose a visual,
            and press play.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="rounded-xl bg-purple-500 px-8 py-3 font-semibold text-white transition hover:bg-purple-400"
            >
              Get Started
            </Link>

            <Link
              to="/visualizer/demo"
              className="rounded-xl border border-white/15 bg-white/[0.03] px-8 py-3 font-semibold text-white transition hover:bg-white/[0.08]"
            >
              See a Demo
            </Link>
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-white/5 px-6 py-6 text-sm text-white/30">
        <p>© 2025 Sonix</p>

        <Link to="/about" className="hover:text-white/60">
          About
        </Link>
      </footer>
    </main>
  );
}

export default LandingPage;
