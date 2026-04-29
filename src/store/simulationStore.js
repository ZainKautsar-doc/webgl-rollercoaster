import { create } from 'zustand';
import { PREDEFINED_TRACKS } from '../utils/Constants';

const defaultTrack = PREDEFINED_TRACKS[0];

const createMetrics = (track = defaultTrack) => ({
  speedKmh: track.suggestedSpeedKmh,
  height: track.controlPoints[0].y,
  gForce: 1,
  distance: 0,
  elapsedTime: 0,
  maxHeight: track.controlPoints[0].y,
  gradientDeg: 0,
  boosterActive: false,
  loopProgress: 0,
  loopReady: true,
  continuityGap: 0,
  tangentAlignment: 1
});

export const useSimulationStore = create((set, get) => ({
  isPlaying: true,
  speedLimitKmh: defaultTrack.suggestedSpeedKmh,
  viewMode: 'firstPerson',
  freeCameraSpeed: 40,
  freeCameraMouseSensitivity: 0.003,
  freeCameraSprintEnabled: true,
  selectedTrackId: defaultTrack.id,
  metrics: createMetrics(defaultTrack),
  fps: 60,
  trackLength: 0,
  sampleCount: 0,
  status: 'Preparing scene...',
  simulationKey: 0,
  togglePlay: () =>
    set((state) => ({
      isPlaying: !state.isPlaying
    })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setSpeedLimit: (speedLimitKmh) =>
    set({
      speedLimitKmh
    }),
  setFreeCameraSpeed: (freeCameraSpeed) =>
    set({
      freeCameraSpeed
    }),
  setFreeCameraMouseSensitivity: (freeCameraMouseSensitivity) =>
    set({
      freeCameraMouseSensitivity
    }),
  setFreeCameraSprintEnabled: (freeCameraSprintEnabled) =>
    set({
      freeCameraSprintEnabled
    }),
  setViewMode: (viewMode) => set({ viewMode }),
  setTrack: (selectedTrackId) => {
    const track =
      PREDEFINED_TRACKS.find((candidate) => candidate.id === selectedTrackId) ??
      defaultTrack;

    set((state) => ({
      selectedTrackId,
      speedLimitKmh: track.suggestedSpeedKmh,
      metrics: createMetrics(track),
      status: `Loading ${track.name}...`,
      simulationKey: state.simulationKey + 1,
      isPlaying: true,
      viewMode: state.viewMode
    }));
  },
  resetSimulation: () => {
    const selectedTrack =
      PREDEFINED_TRACKS.find(
        (candidate) => candidate.id === get().selectedTrackId
      ) ?? defaultTrack;

    set((state) => ({
      metrics: createMetrics(selectedTrack),
      status: `Resetting ${selectedTrack.name}...`,
      simulationKey: state.simulationKey + 1,
      isPlaying: true,
      viewMode: state.viewMode
    }));
  },
  updateMetrics: (metrics) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        ...metrics
      }
    })),
  setPerformance: (fps) => set({ fps }),
  setTrackMeta: (trackLength, sampleCount) =>
    set({
      trackLength,
      sampleCount
    }),
  setStatus: (status) => set({ status })
}));
