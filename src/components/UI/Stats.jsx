import { useSimulationStore } from '../../store/simulationStore';
import { formatNumber } from '../../utils/MathUtils';

function Stats() {
  const fps = useSimulationStore((state) => state.fps);
  const trackLength = useSimulationStore((state) => state.trackLength);
  const sampleCount = useSimulationStore((state) => state.sampleCount);
  const status = useSimulationStore((state) => state.status);

  return (
    <section className="hud-card">
      <div className="hud-card-inner">
        <div className="card-heading">
          <h2>Renderer Stats</h2>
          <span>{status}</span>
        </div>

        <div className="stats-grid">
          <article className="stats-chip">
            <strong>{formatNumber(fps, 0)}</strong>
            <span>Approx. FPS</span>
          </article>
          <article className="stats-chip">
            <strong>{formatNumber(trackLength, 0)} m</strong>
            <span>Track Length</span>
          </article>
          <article className="stats-chip">
            <strong>{sampleCount}</strong>
            <span>Spline Samples</span>
          </article>
        </div>

        <div className="track-summary">
          <strong>Performance Notes</strong>
          <span>
            BufferGeometry tubes, instanced support pillars, and throttled HUD
            updates help keep the scene responsive at desktop resolutions.
          </span>
        </div>
      </div>
    </section>
  );
}

export default Stats;
