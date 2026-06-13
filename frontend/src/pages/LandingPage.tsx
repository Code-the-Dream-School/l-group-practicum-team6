import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { AestheticFluidBg } from 'react-color4bg';

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <NavBar />
      <main className="flex-1 text-white">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <AestheticFluidBg
              style={{ width: '100%', height: '100%' }}
              colors={['#000000', '#1B1B1B', '#2A1E36', '#3A2152', '#49236D', '#582688']}
              loop
            />
          </div>

          <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 pt-6">
            <div className="flex justify-center py-25 text-center">
              <div className="max-w-5xl pt-5 pb-10">
                <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                  Music Made Visible
                </p>

                <h1 className="text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
                  Transform Music Into Living Art
                </h1>

                <p className="mx-auto mt-12 max-w-3xl text-lg leading-8 text-white/60 md:text-xl">
                  Experience the future of audio visualization with AI-generated, real-time reactive
                  visuals that dance to every beat.
                </p>

                <div className="mt-10 flex flex-col justify-center gap-8 sm:flex-row">
                  <Link
                    to="/visualizer/demo"
                    className="rounded-xl bg-cyan-300 px-8 py-3 text-center font-semibold text-black transition hover:bg-5yan-250"
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
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto grid max-w-5xl gap-6 px-6 py-20 md:grid-cols-3">
          <div className="card-feature">
            <div className="flex items-center gap-3">
              <img src="/icons/wave.svg" alt="" className="h-6 w-6 shrink-0" />
              <h2 className="text-xl font-semibold">Real-time Visuals</h2>
            </div>

            <p className="mt-3 text-slate-300">
              Experience zero-latency frequency mapping that breathes with your music perfectly.
            </p>
          </div>

          <div className="card-feature">
            <div className="flex items-center gap-3">
              <img src="/icons/mic.svg" alt="" className="h-6 w-6 shrink-0" />
              <h2 className="text-xl font-semibold">Microphone Input</h2>
            </div>

            <p className="mt-3 text-slate-300">
              Capture live performances or environmental sound and watch it transform instantly.
            </p>
          </div>

          <div className="card-feature">
            <div className="flex items-center gap-3">
              <img src="/icons/layers.svg" alt="" className="h-6 w-6 shrink-0" />
              <h2 className="text-xl font-semibold">Playlist Collections</h2>
            </div>

            <p className="mt-3 text-slate-300">
              Curate sets of visual presets and audio tracks for seamless transitions during your
              set.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/35">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-semibold">From audio to visuals in three steps</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card text-left">
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-semibold">
                1
              </div>
              <div className="flex items-center justify-center gap-3">
                <img src="/icons/mic.svg" alt="" className="h-5 w-5 shrink-0" />
                <h3 className="font-semibold">Connect your audio</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Plug in a microphone, line-in, or virtual audio source. Sonix.ai picks up the signal
                instantly — no plugins, no setup beyond choosing your input.
              </p>
            </div>

            <div className="card text-left">
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-semibold">
                2
              </div>
              <div className="flex items-center justify-center gap-3">
                <img src="/icons/grid.svg" alt="" className="h-5 w-5 shrink-0" />
                <h3 className="font-semibold">Pick a visual</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Browse the curated library of reactive visuals. Switch between them instantly,
                shuffle for variety, and find the one that fits your sound.
              </p>
            </div>

            <div className="card text-left">
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-semibold">
                3
              </div>
              <div className="flex items-center justify-center gap-3">
                <img src="/icons/play.svg" alt="" className="h-5 w-5 shrink-0" />
                <h3 className="font-semibold">Press play</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Watch your audio render live. Go fullscreen for performances and streams, or save
                the visuals you love to your favorites.
              </p>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-3xl font-semibold">Engineered for Every Stage</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[url('/images/performance.avif')] bg-cover bg-center p-6">
              <div className="flex h-full flex-col justify-end">
                <h3 className="text-2xl font-semibold [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                  Live Performance
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white font-medium [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                  Stage ready
                </p>
              </div>
            </div>

            <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[url('/images/streaming.avif')] bg-cover bg-center p-6">
              <div className="flex h-full flex-col justify-end">
                <h3 className="text-2xl font-semibold [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                  Streaming
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white font-medium [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                  Content creation
                </p>
              </div>
            </div>

            <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[url('/images/focus.avif')] bg-cover bg-center p-6">
              <div className="flex h-full flex-col justify-end">
                <h3 className="text-2xl font-semibold [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                  Meditation & Focus
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white font-medium [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                  Wellness
                </p>
              </div>
            </div>

            <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[url('/images/events.avif')] bg-cover bg-center p-6">
              <div className="flex h-full flex-col justify-end">
                <h3 className="text-2xl font-semibold [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                  Events & Venues
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white font-medium [text-shadow:0_0_4px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
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
                className="rounded-xl border border-white/15 bg-white/3 px-8 py-3 font-semibold text-white transition hover:bg-white/8"
              >
                See a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
