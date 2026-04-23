import PlayerCanvas from "../components/PlayerCanvas";

function LandingPage() {
  const getSilentAudioData = () => new Uint8Array(128);

  return (
    <div className="landing-page">
      <section className="hero-section">
        <PlayerCanvas
          getAudioData={getSilentAudioData}
          className="hero-canvas"
        />

        <div className="hero-overlay">
          <nav className="hero-nav">
            <div className="hero-logo">SONIX</div>

            <div className="hero-links">
              <a href="/explore">Explore</a>
              <a href="/login">Log In</a>
              <a href="/signup" className="hero-signup">
                Sign Up
              </a>
            </div>
          </nav>

          <div className="hero-content">
            <p className="hero-eyebrow">Audio-reactive visuals in seconds</p>

            <h1>See your sound come alive</h1>

            <p className="hero-subtitle">
              Launch immersive shaders, react to live audio, and explore a
              growing visual library with no complicated setup.
            </p>

            <div className="hero-actions">
              <a href="/visualizer/demo" className="hero-primary">
                Try the Demo
              </a>

              <a href="/signup" className="hero-secondary">
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="feature-card">
          <h2>Audio-reactive shaders</h2>
          <p>
            Turn sound into motion with immersive visuals designed to respond to
            rhythm, energy, and texture.
          </p>
        </div>

        <div className="feature-card">
          <h2>No-setup mic access</h2>
          <p>
            Start quickly with a lightweight experience that is easy to try
            without complicated setup.
          </p>
        </div>

        <div className="feature-card">
          <h2>Growing visualizer library</h2>
          <p>
            Explore a curated collection of visual styles and discover looks you
            can launch, save, and revisit.
          </p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
