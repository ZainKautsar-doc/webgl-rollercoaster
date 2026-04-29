import { create } from 'zustand';
import { PREDEFINED_TRACKS } from '../utils/Constants';

const defaultTrack = PREDEFINED_TRACKS[0];

const createMetrics = (track = defaultTrack) => ({
  speedKmh: track.suggestedSpeedKmh,
  height: track.controlPoints[0].y,
  gForce: 1,
  distance: 0,
  elapsedTime: 0,
  maxHeight: track.controlPoints[0].y
});

export const useSimulationStore = create((set, get) => ({
  isPlaying: true,
  speedLimitKmh: defaultTrack.suggestedSpeedKmh,
  viewMode: 'firstPerson',
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
      isPlaying: true
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
      isPlaying: true
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
