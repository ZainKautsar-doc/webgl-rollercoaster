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
        '.title-block, .hud-card',
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
      <Canvas />

      <header className="title-block">
        <span className="eyebrow">WebGL Graphics Project</span>
        <h1>Roller Coaster Camera Lab</h1>
        <p>
          Simulate a ride-mounted camera moving across custom 3D coaster tracks
          with spline-based motion, live physics, and cinematic view modes.
        </p>
      </header>

      <section className="hud-layout">
        <div className="hud-column">
          <Controls />
        </div>

        <div className="hud-column hud-column-right">
          <InfoPanel />
          <Stats />
        </div>
      </section>
    </main>
  );
}

export default App;
