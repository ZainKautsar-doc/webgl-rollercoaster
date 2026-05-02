import { useEffect } from 'react';
import { gsap } from 'gsap';
import Canvas from './components/Canvas';
import Controls from './components/UI/Controls';
import InfoPanel from './components/UI/InfoPanel';
import Stats from './components/UI/Stats';

function App() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.title-block, .hud-card, .canvas-panel',
        {
          opacity: 0,
          y: 28,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out'
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="app-shell">
      <section className="canvas-panel">
        <Canvas />
      </section>

      <div className="hud-overlays">
        <div className="hud-left">
          <header className="title-block">
            <div className="title-row">
              <div className="title-copy">
                <span className="eyebrow">WebGL Graphics Project</span>
                <h1>Roller Coaster Camera Lab</h1>
                <p>
                  Simulate a ride-mounted camera moving across custom 3D coaster
                  tracks with spline-based motion, stronger uphill physics, realistic
                  dual rails, terrain-safe clearance, and a fully independent free
                  camera for exploration.
                </p>
              </div>

            <div className="title-meta">
              <article className="title-badge">
                <strong>Three Camera Modes</strong>
                <span>First person, third person, and a true free camera with WASD control.</span>
              </article>
              <article className="title-badge">
                <strong>Track Upgrade</strong>
                <span>Dual rails, sleepers, and side guards replace the old tube-like track look.</span>
              </article>
            </div>
          </div>
        </header>

        <div className="dashboard-controls">
          <Controls />
        </div>
      </div>

      <div className="hud-right">
        <div className="dashboard-stats">
          <Stats />
        </div>

        <div className="dashboard-info">
          <InfoPanel />
        </div>
      </div>
    </div>
    </main>
  );
}

export default App;
