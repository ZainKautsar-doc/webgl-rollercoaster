import * as THREE from 'three';
import { TRACK_RADIUS, TRACK_SAMPLE_COUNT } from './Constants';
import { clamp, lerp, lerpVectors, positiveModulo } from './MathUtils';

const worldUp = new THREE.Vector3(0, 1, 0);

const pointFromVector = (vector) => ({
  x: vector.x,
  y: vector.y,
  z: vector.z
});

const vectorFromPoint = ({ x, y, z }) => new THREE.Vector3(x, y, z);

function createLoopedControlPoints(controlPoints, loopProfile = {}) {
  if (controlPoints.length < 4) {
    return controlPoints;
  }

  const vectors = controlPoints.map(vectorFromPoint);
  const start = vectors[0];
  const second = vectors[1];
  const last = vectors[vectors.length - 1];
  const previous = vectors[vectors.length - 2];

  if (start.distanceTo(last) < 6) {
    return controlPoints;
  }

  const flatGap = start.clone().sub(last).setY(0);
  const gapLength = Math.max(flatGap.length(), 80);

  const lateral = new THREE.Vector3(-flatGap.z, 0, flatGap.x);
  if (lateral.lengthSq() < 0.001) {
    lateral.set(0, 0, 1);
  } else {
    lateral.normalize();
  }

  const outbound = last.clone().sub(previous).setY(0);
  if (outbound.lengthSq() < 0.001) {
    outbound.copy(flatGap).multiplyScalar(-1);
  } else {
    outbound.normalize();
  }

  const inbound = second.clone().sub(start).setY(0);
  if (inbound.lengthSq() < 0.001) {
    inbound.copy(flatGap);
  } else {
    inbound.normalize();
  }

  const rise = loopProfile.rise ?? Math.max(Math.abs(start.y - last.y) + 18, 22);
  const arc = loopProfile.arc ?? gapLength * 0.24;

  const bridgeA = last
    .clone()
    .addScaledVector(outbound, gapLength * 0.12)
    .addScaledVector(lateral, arc * 0.85);
  bridgeA.y = lerp(last.y, start.y, 0.22) + rise * 0.45;

  const bridgeB = last.clone().lerp(start, 0.38).addScaledVector(lateral, arc);
  bridgeB.y = Math.max(start.y, last.y) + rise;

  const bridgeC = last
    .clone()
    .lerp(start, 0.68)
    .addScaledVector(lateral, -arc * 0.55);
  bridgeC.y = Math.max(start.y, last.y) + rise * 0.72;

  const bridgeD = start
    .clone()
    .addScaledVector(inbound, -gapLength * 0.18)
    .addScaledVector(lateral, -arc * 0.18);
  bridgeD.y = lerp(last.y, start.y, 0.88) + rise * 0.22;

  return [
    ...controlPoints,
    pointFromVector(bridgeA),
    pointFromVector(bridgeB),
    pointFromVector(bridgeC),
    pointFromVector(bridgeD)
  ];
}

function buildRailFrame(tangent, normal, binormal) {
  let up = worldUp.clone().addScaledVector(tangent, -tangent.dot(worldUp));

  if (up.lengthSq() < 0.001) {
    up = normal.clone();

    if (Math.abs(up.dot(tangent)) > 0.95) {
      up = binormal.clone();
    }
  }

  up.normalize();

  let right = new THREE.Vector3().crossVectors(up, tangent);
  if (right.lengthSq() < 0.001) {
    right.copy(binormal);
  }

  right.normalize();
  up = new THREE.Vector3().crossVectors(tangent, right).normalize();

  return {
    up,
    right
  };
}

export function createCatmullRomCurve(controlPoints, closed = true) {
  const vectors = controlPoints.map(vectorFromPoint);
  return new THREE.CatmullRomCurve3(vectors, closed, 'centripetal', 0.35);
}

export function createTrackGeometry(curve, options = {}) {
  const {
    radius = TRACK_RADIUS,
    tubularSegments = TRACK_SAMPLE_COUNT,
    radialSegments = 20,
    closed = true
  } = options;

  return new THREE.TubeGeometry(
    curve,
    tubularSegments,
    radius,
    radialSegments,
    closed
  );
}

export function calculateTrackLength(curve) {
  return curve.getLength();
}

export function buildTrackData(trackConfig) {
  const controlPoints = createLoopedControlPoints(
    trackConfig.controlPoints,
    trackConfig.loopProfile
  );
  const curve = createCatmullRomCurve(controlPoints, true);
  const sampleCount = TRACK_SAMPLE_COUNT;
  const points = curve.getSpacedPoints(sampleCount);
  const frames = curve.computeFrenetFrames(sampleCount, true);
  const length = calculateTrackLength(curve);
  const curvatures = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const previousIndex = index === 0 ? sampleCount - 1 : index - 1;
    const nextIndex = index === sampleCount ? 1 : index + 1;
    const tangentDelta = frames.tangents[nextIndex]
      .clone()
      .sub(frames.tangents[previousIndex]);
    const distanceDelta = Math.max(
      points[nextIndex].distanceTo(points[previousIndex]),
      0.001
    );

    curvatures.push(tangentDelta.length() / distanceDelta);
  }

  const samples = points.map((point, index) => {
    const tangent = frames.tangents[index];
    const normal = frames.normals[index];
    const binormal = frames.binormals[index];
    const railFrame = buildRailFrame(tangent, normal, binormal);

    return {
      point,
      tangent,
      normal,
      binormal,
      up: railFrame.up,
      right: railFrame.right,
      curvature: curvatures[index]
    };
  });

  return {
    curve,
    points,
    samples,
    sampleCount,
    length,
    maxHeight: Math.max(...points.map((point) => point.y)),
    closed: true,
    controlPoints
  };
}

export function getPointAtDistance(trackData, distance) {
  const u = positiveModulo(distance, trackData.length) / trackData.length;
  return trackData.curve.getPointAt(u);
}

export function getTangent(trackData, t) {
  return trackData.curve.getTangentAt(positiveModulo(t, 1)).normalize();
}

export function getNormal(trackData, t) {
  const sampleIndex = positiveModulo(t, 1) * trackData.sampleCount;
  const lowerIndex = Math.floor(sampleIndex);
  const upperIndex = Math.min(lowerIndex + 1, trackData.sampleCount);
  const alpha = sampleIndex - lowerIndex;

  return trackData.samples[lowerIndex].normal
    .clone()
    .lerp(trackData.samples[upperIndex].normal, alpha)
    .normalize();
}

export function getTrackSampleAtDistance(trackData, distance) {
  const wrappedDistance = positiveModulo(distance, trackData.length);
  const u = wrappedDistance / trackData.length;
  const sampleIndex = u * trackData.sampleCount;
  const lowerIndex = Math.floor(sampleIndex);
  const upperIndex = Math.min(lowerIndex + 1, trackData.sampleCount);
  const alpha = sampleIndex - lowerIndex;
  const lowerSample = trackData.samples[lowerIndex];
  const upperSample = trackData.samples[upperIndex];

  return {
    point: lerpVectors(lowerSample.point, upperSample.point, alpha),
    tangent: lowerSample.tangent.clone().lerp(upperSample.tangent, alpha).normalize(),
    normal: lowerSample.normal.clone().lerp(upperSample.normal, alpha).normalize(),
    binormal: lowerSample.binormal
      .clone()
      .lerp(upperSample.binormal, alpha)
      .normalize(),
    up: lowerSample.up.clone().lerp(upperSample.up, alpha).normalize(),
    right: lowerSample.right.clone().lerp(upperSample.right, alpha).normalize(),
    curvature: lerp(lowerSample.curvature, upperSample.curvature, alpha),
    distance: wrappedDistance,
    u
  };
}
