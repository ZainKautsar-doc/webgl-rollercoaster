import { PREDEFINED_TRACKS } from '../../utils/Constants';
import { useSimulationStore } from '../../store/simulationStore';

function Controls() {
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const speedLimitKmh = useSimulationStore((state) => state.speedLimitKmh);
  const viewMode = useSimulationStore((state) => state.viewMode);
  const freeCameraSpeed = useSimulationStore((state) => state.freeCameraSpeed);
  const freeCameraMouseSensitivity = useSimulationStore(
    (state) => state.freeCameraMouseSensitivity
  );
  const selectedTrackId = useSimulationStore((state) => state.selectedTrackId);
  const togglePlay = useSimulationStore((state) => state.togglePlay);
  const setSpeedLimit = useSimulationStore((state) => state.setSpeedLimit);
  const setFreeCameraSpeed = useSimulationStore((state) => state.setFreeCameraSpeed);
  const setFreeCameraMouseSensitivity = useSimulationStore(
    (state) => state.setFreeCameraMouseSensitivity
  );
  const setViewMode = useSimulationStore((state) => state.setViewMode);
  const setTrack = useSimulationStore((state) => state.setTrack);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);

  const selectedTrack =
    PREDEFINED_TRACKS.find((track) => track.id === selectedTrackId) ??
    PREDEFINED_TRACKS[0];

  return (
    <section className={`hud-card ${viewMode === 'freeCamera' ? 'panel-active' : ''}`.trim()}>
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

          <div className="field-divider">
            <p className="divider-copy">
              Mode kamera kini dipisah jelas: first person untuk ride,
              third person untuk follow sinematik, dan free camera untuk
              eksplorasi bebas tanpa mengikuti kereta.
            </p>
          </div>

          <div className="field">
            <label htmlFor="speed-limit">Speed Cap</label>
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
              <button
                type="button"
                className={viewMode === 'freeCamera' ? 'is-active' : ''}
                onClick={() => setViewMode('freeCamera')}
              >
                Free Camera
              </button>
            </div>
          </div>

          {viewMode === 'freeCamera' ? (
            <div className="free-camera-settings">
              <div className="field">
                <label htmlFor="free-camera-speed">Movement Speed</label>
                <div className="slider-row">
                  <input
                    id="free-camera-speed"
                    className="slider"
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={freeCameraSpeed}
                    onChange={(event) =>
                      setFreeCameraSpeed(Number(event.target.value))
                    }
                  />
                  <output htmlFor="free-camera-speed">
                    {freeCameraSpeed.toFixed(0)} u/s
                  </output>
                </div>
              </div>

              <div className="field">
                <label htmlFor="free-camera-sensitivity">Mouse Sensitivity</label>
                <div className="slider-row">
                  <input
                    id="free-camera-sensitivity"
                    className="slider"
                    type="range"
                    min="0.0005"
                    max="0.01"
                    step="0.0001"
                    value={freeCameraMouseSensitivity}
                    onChange={(event) =>
                      setFreeCameraMouseSensitivity(Number(event.target.value))
                    }
                  />
                  <output htmlFor="free-camera-sensitivity">
                    {(freeCameraMouseSensitivity * 1000).toFixed(2)}
                  </output>
                </div>
              </div>

              <div className="free-camera-help">
                <p className="help-title">Free Camera Controls</p>
                <ul className="control-help-list">
                  <li><kbd>W A S D</kbd><span>Move forward, left, back, and right</span></li>
                  <li><kbd>Q / E</kbd><span>Move down and up</span></li>
                  <li><kbd>Shift</kbd><span>Sprint at 2x movement speed</span></li>
                  <li><kbd>Right Drag</kbd><span>Look around freely</span></li>
                  <li><kbd>Wheel</kbd><span>Adjust movement speed on the fly</span></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="field">
              <label>Ride Camera Notes</label>
              <p className="camera-help">
                First person tetap berada di eye level di atas kereta, sedangkan
                third person menjaga framing kereta dari belakang tanpa melepas
                tracking ke jalur.
              </p>
            </div>
          )}

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
            Rel sekarang dibangun sebagai dual rails dengan sleepers dan side
            guards, lalu terrain dikoreksi agar track tidak lagi menembus tanah.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Controls;
