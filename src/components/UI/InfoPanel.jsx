import { PREDEFINED_TRACKS } from '../../utils/Constants';
import { formatDistance, formatElapsedTime, formatNumber } from '../../utils/MathUtils';
import { useSimulationStore } from '../../store/simulationStore';

function MetricTile({ label, value, subtext }) {
  return (
    <article className="metric-tile">
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

  const selectedTrack =
    PREDEFINED_TRACKS.find((track) => track.id === selectedTrackId) ??
    PREDEFINED_TRACKS[0];

  return (
    <section className="hud-card">
      <div className="hud-card-inner">
        <div className="card-heading">
          <h2>Live Ride Data</h2>
          <span
            className={`status-pill ${isPlaying ? '' : 'is-paused'}`.trim()}
          >
            {isPlaying ? 'Running' : 'Paused'}
          </span>
        </div>

        <div className="metric-grid">
          <MetricTile
            label="Current Speed"
            value={`${formatNumber(metrics.speedKmh, 1)} km/h`}
            subtext="Physics speed after friction and slope"
          />
          <MetricTile
            label="Current Height"
            value={`${formatNumber(metrics.height, 1)} m`}
            subtext={`Peak track height ${formatNumber(metrics.maxHeight, 0)} m`}
          />
          <MetricTile
            label="G-Force"
            value={`${formatNumber(metrics.gForce, 2)} g`}
            subtext="Magnitude of support force on the camera"
          />
          <MetricTile
            label="Distance Travelled"
            value={formatDistance(metrics.distance)}
            subtext="Accumulated along-track distance"
          />
          <MetricTile
            label="Elapsed Time"
            value={formatElapsedTime(metrics.elapsedTime)}
            subtext="Continuous simulation timer"
          />
          <MetricTile
            label="Track Preset"
            value={selectedTrack.name}
            subtext={selectedTrack.focus}
          />
        </div>
      </div>
    </section>
  );
}

export default InfoPanel;
