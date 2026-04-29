import { useSimulationStore } from '../../store/simulationStore';
import { formatNumber } from '../../utils/MathUtils';

function Stats() {
  const fps = useSimulationStore((state) => state.fps);
  const trackLength = useSimulationStore((state) => state.trackLength);
  const sampleCount = useSimulationStore((state) => state.sampleCount);
  const status = useSimulationStore((state) => state.status);
  const viewMode = useSimulationStore((state) => state.viewMode);
  const metrics = useSimulationStore((state) => state.metrics);

  const performanceClass =
    fps >= 55
      ? 'stats-chip performance-good'
      : fps >= 40
        ? 'stats-chip performance-warning'
        : 'stats-chip performance-danger';

  return (
    <section className="hud-card">
      <div className="hud-card-inner">
        <div className="card-heading">
          <h2>Renderer Stats</h2>
          <span>{status}</span>
        </div>

        <div className="stats-grid">
          <article className={performanceClass}>
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
          <article className="stats-chip">
            <strong>
              {viewMode === 'freeCamera'
                ? 'Free'
                : viewMode === 'thirdPerson'
                  ? 'Follow'
                  : 'Seat'}
            </strong>
            <span>Camera Mode</span>
          </article>
        </div>

        <div className="track-summary">
          <strong>Performance Notes</strong>
          <span>
            Realistic dual rails, carved terrain clearance, and the detached
            free camera all share the same scene loop while the train continues
            to ride the closed spline.
          </span>
          <span>
            {metrics.loopReady
              ? 'Loop continuity validated for seamless cycling.'
              : 'Loop continuity needs attention at the seam.'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default Stats;
