import { PREDEFINED_TRACKS } from '../../utils/Constants';
import {
  formatDistance,
  formatElapsedTime,
  formatNumber
} from '../../utils/MathUtils';
import { useSimulationStore } from '../../store/simulationStore';

function MetricTile({ label, value, subtext, tone = 'is-info' }) {
  return (
    <article className={`metric-tile ${tone}`}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-subtext">{subtext}</span>
    </article>
  );
}

function InfoPanel() {
  const metrics = useSimulationStore((state) => state.metrics);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const selectedTrackId = useSimulationStore((state) => state.selectedTrackId);
  const viewMode = useSimulationStore((state) => state.viewMode);

  const selectedTrack =
    PREDEFINED_TRACKS.find((track) => track.id === selectedTrackId) ??
    PREDEFINED_TRACKS[0];

  const speedTone =
    metrics.speedKmh < 80 ? 'is-safe' : metrics.speedKmh < 140 ? 'is-warning' : 'is-danger';
  const gForceTone =
    metrics.gForce < 2.8 ? 'is-safe' : metrics.gForce < 4.2 ? 'is-warning' : 'is-danger';
  const statusClass = viewMode === 'freeCamera'
    ? 'status-pill is-free'
    : `status-pill ${isPlaying ? '' : 'is-paused'}`.trim();
  const statusLabel =
    viewMode === 'freeCamera'
      ? 'Free Camera'
      : isPlaying
        ? 'Running'
        : 'Paused';

  return (
    <section className={`hud-card ${viewMode === 'freeCamera' ? 'panel-active' : ''}`.trim()}>
      <div className="hud-card-inner">
        <div className="card-heading">
          <h2>Live Ride Data</h2>
          <span className={statusClass}>{statusLabel}</span>
        </div>

        <div className="metric-grid">
          <MetricTile
            label="Current Speed"
            value={`${formatNumber(metrics.speedKmh, 1)} km/h`}
            subtext="Physics speed after friction, slope, and momentum assist"
            tone={speedTone}
          />
          <MetricTile
            label="Current Height"
            value={`${formatNumber(metrics.height, 1)} m`}
            subtext={`Peak track height ${formatNumber(metrics.maxHeight, 0)} m`}
            tone="is-info"
          />
          <MetricTile
            label="G-Force"
            value={`${formatNumber(metrics.gForce, 2)} g`}
            subtext={
              metrics.boosterActive
                ? 'Booster assist engaged on a steep climb'
                : 'Magnitude of support force on the rider'
            }
            tone={gForceTone}
          />
          <MetricTile
            label="Distance Travelled"
            value={formatDistance(metrics.distance)}
            subtext="Seamless wrapped distance along the full loop"
            tone="is-info"
          />
          <MetricTile
            label="Elapsed Time"
            value={formatElapsedTime(metrics.elapsedTime)}
            subtext={`${formatNumber(metrics.gradientDeg, 1)} deg current gradient`}
            tone={
              Math.abs(metrics.gradientDeg) < 12
                ? 'is-safe'
                : Math.abs(metrics.gradientDeg) < 28
                  ? 'is-warning'
                  : 'is-danger'
            }
          />
          <MetricTile
            label="Track Preset"
            value={selectedTrack.name}
            subtext={
              viewMode === 'freeCamera'
                ? 'Independent exploration mode is active'
                : selectedTrack.focus
            }
            tone="is-info"
          />
        </div>

        <div className="track-progress-card">
          <div className="progress-label-row">
            <strong>Loop Progress</strong>
            <span>{formatNumber(metrics.loopProgress, 1)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${metrics.loopProgress}%` }}
            />
          </div>
          <p className="progress-copy">
            {metrics.loopReady
              ? `Closed loop validated with ${formatNumber(metrics.tangentAlignment * 100, 0)}% tangent alignment`
              : `Loop seam warning: ${formatNumber(metrics.continuityGap, 2)} m continuity gap detected`}
          </p>
        </div>
      </div>
    </section>
  );
}

export default InfoPanel;
