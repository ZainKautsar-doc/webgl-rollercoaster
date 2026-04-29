const point = (x, y, z) => ({ x, y, z });

const createSpiralSegment = ({
  startX,
  centerY,
  centerZ,
  radius,
  turns,
  segments,
  pitch,
  phase = 0
}) => {
  const points = [];

  for (let index = 0; index < segments; index += 1) {
    const t = index / (segments - 1);
    const angle = phase + t * turns * Math.PI * 2;

    points.push(
      point(
        startX + t * pitch,
        centerY + Math.sin(angle) * radius,
        centerZ + Math.cos(angle) * radius
      )
    );
  }

  return points;
};

const createHyperHills = ({
  startX,
  length,
  steps,
  baseHeight,
  amplitude,
  width
}) => {
  const points = [];

  for (let index = 0; index < steps; index += 1) {
    const t = index / (steps - 1);
    const x = startX + t * length;
    const y =
      baseHeight +
      Math.sin(t * Math.PI * 4.7) * amplitude * (1 - t * 0.16) +
      Math.cos(t * Math.PI * 9.3) * amplitude * 0.18;
    const z = Math.sin(t * Math.PI * 3.2) * width;

    points.push(point(x, y, z));
  }

  return points;
};

const beginnerLoop = [
  point(0, 36, 0),
  point(28, 44, -12),
  point(64, 58, -26),
  point(96, 34, -36),
  point(126, 14, -18),
  ...createSpiralSegment({
    startX: 150,
    centerY: 26,
    centerZ: 2,
    radius: 18,
    turns: 1.1,
    segments: 10,
    pitch: 65,
    phase: -Math.PI / 2
  }),
  point(232, 18, 42),
  point(280, 34, 68),
  point(332, 16, 36),
  point(380, 25, -6),
  point(430, 18, -22),
  point(482, 12, 8)
];

const corkscrewExtreme = [
  point(0, 52, 0),
  point(34, 66, -14),
  point(78, 78, -32),
  point(120, 38, -54),
  point(162, 4, -20),
  ...createSpiralSegment({
    startX: 188,
    centerY: 20,
    centerZ: 18,
    radius: 22,
    turns: 2.15,
    segments: 16,
    pitch: 118,
    phase: -Math.PI / 2
  }),
  point(332, 12, 36),
  point(382, 42, 78),
  point(442, 14, 44),
  point(508, 6, -6),
  point(566, 24, -56),
  point(624, 16, -4)
];

const hypercoaster = [
  point(0, 70, 0),
  point(28, 82, -10),
  ...createHyperHills({
    startX: 62,
    length: 680,
    steps: 20,
    baseHeight: 34,
    amplitude: 24,
    width: 80
  }),
  point(786, 24, 34),
  point(850, 18, -16)
];

export const GRAVITY = 9.82;
export const CAMERA_FOV = 75;
export const TRACK_RADIUS = 0.55;
export const TRACK_SAMPLE_COUNT = 900;
export const SUPPORT_SPACING = 8;
export const TRACK_TIE_SPACING = 8;
export const LOOK_AHEAD_DISTANCE = 16;
export const GROUND_LEVEL = -10;
export const HUD_REFRESH_MS = 70;
export const PERFORMANCE_REFRESH_MS = 350;
export const FPS_SMOOTHING = 0.1;

export const PREDEFINED_TRACKS = [
  {
    id: 'beginner-loop',
    name: 'Beginner Loop',
    description:
      'A balanced starter layout with one sculpted inversion, wide turns, and moderate speed changes.',
    focus: 'Smooth banking with a single loop-like spiral segment.',
    color: '#eb5f49',
    friction: 0.018,
    rollingResistance: 0.0009,
    suggestedSpeedKmh: 86,
    minimumSpeedKmh: 34,
    boosterStrength: 2.1,
    controlPoints: beginnerLoop
  },
  {
    id: 'corkscrew-extreme',
    name: 'Corkscrew Extreme',
    description:
      'A steeper drop sequence that feeds into a double corkscrew and higher-force transitions.',
    focus: 'Double inversion segment with sharper curvature and faster drops.',
    color: '#4ec4ff',
    friction: 0.015,
    rollingResistance: 0.00072,
    suggestedSpeedKmh: 132,
    minimumSpeedKmh: 42,
    boosterStrength: 2.6,
    controlPoints: corkscrewExtreme
  },
  {
    id: 'hypercoaster',
    name: 'Hypercoaster',
    description:
      'A long-form out-and-back style track with large camelbacks, airtime hills, and sweeping terrain.',
    focus: 'Extended pacing with multiple height-driven energy changes.',
    color: '#5edb8f',
    friction: 0.013,
    rollingResistance: 0.00055,
    suggestedSpeedKmh: 154,
    minimumSpeedKmh: 48,
    boosterStrength: 3,
    controlPoints: hypercoaster
  }
];
