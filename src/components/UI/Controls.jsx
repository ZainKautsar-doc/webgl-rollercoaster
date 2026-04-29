import { PREDEFINED_TRACKS } from '../../utils/Constants';
import { useSimulationStore } from '../../store/simulationStore';

function Controls() {
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const speedLimitKmh = useSimulationStore((state) => state.speedLimitKmh);
  const viewMode = useSimulationStore((state) => state.viewMode);
  const selectedTrackId = useSimulationStore((state) => state.selectedTrackId);
  const togglePlay = useSimulationStore((state) => state.togglePlay);
  const setSpeedLimit = useSimulationStore((state) => state.setSpeedLimit);
  const setViewMode = useSimulationStore((state) => state.setViewMode);
  const setTrack = useSimulationStore((state) => state.setTrack);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);

  const selectedTrack =
    PREDEFINED_TRACKS.find((track) => track.id === selectedTrackId) ??
    PREDEFINED_TRACKS[0];

  return (
    <section className="hud-card">
      <div className="hud-card-inner">
        <div className="card-heading">
          <h2>Simulation Controls</h2>
          <span>{selectedTrack.name}</span>
        </div>

        <div className="field-stack">
          <div className="field">
            <label htmlFor="track-selector">Track Preset</label>
            <select
              id="track-selector"
              className="track-select"
              value={selectedTrackId}
              onChange={(event) => setTrack(event.target.value)}
            >
              {PREDEFINED_TRACKS.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
            <p className="track-note">{selectedTrack.description}</p>
          </div>

          <div className="field">
            <label htmlFor="speed-limit">
              Speed Cap
            </label>
            <div className="slider-row">
              <input
                id="speed-limit"
                type="range"
                min="0"
                max="200"
                step="1"
                value={speedLimitKmh}
                onChange={(event) => setSpeedLimit(Number(event.target.value))}
              />
              <output htmlFor="speed-limit">{speedLimitKmh.toFixed(0)} km/h</output>
            </div>
          </div>

          <div className="field">
            <label>Camera View</label>
            <div className="segmented-group">
              <button
                type="button"
                className={viewMode === 'firstPerson' ? 'is-active' : ''}
                onClick={() => setViewMode('firstPerson')}
              >
                First Person
              </button>
              <button
                type="button"
                className={viewMode === 'thirdPerson' ? 'is-active' : ''}
                onClick={() => setViewMode('thirdPerson')}
              >
                Third Person
              </button>
            </div>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="primary-action"
              onClick={togglePlay}
            >
              {isPlaying ? 'Pause Ride' : 'Play Ride'}
            </button>
            <button type="button" onClick={resetSimulation}>
              Reset Camera
            </button>
          </div>

          <p className="card-copy">
            Track motion uses Catmull-Rom splines with gravity, friction, and
            curvature-based force estimates driving the camera motion.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Controls;
