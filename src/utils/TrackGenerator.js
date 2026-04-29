import * as THREE from 'three';
import { TRACK_RADIUS, TRACK_SAMPLE_COUNT } from './Constants';
import { clamp, lerp, lerpVectors, positiveModulo } from './MathUtils';

const vectorFromPoint = ({ x, y, z }) => new THREE.Vector3(x, y, z);

export function createCatmullRomCurve(controlPoints, closed = false) {
  const vectors = controlPoints.map(vectorFromPoint);
  return new THREE.CatmullRomCurve3(vectors, closed, 'centripetal', 0.35);
}

export function createTrackGeometry(curve, options = {}) {
  const {
    radius = TRACK_RADIUS,
    tubularSegments = TRACK_SAMPLE_COUNT,
    radialSegments = 20,
    closed = false
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
  const curve = createCatmullRomCurve(trackConfig.controlPoints, false);
  const sampleCount = TRACK_SAMPLE_COUNT;
  const points = curve.getSpacedPoints(sampleCount);
  const frames = curve.computeFrenetFrames(sampleCount, false);
  const length = calculateTrackLength(curve);
  const curvatures = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const previousIndex = Math.max(index - 1, 0);
    const nextIndex = Math.min(index + 1, sampleCount);
    const tangentDelta = frames.tangents[nextIndex]
      .clone()
      .sub(frames.tangents[previousIndex]);
    const distanceDelta = Math.max(
      points[nextIndex].distanceTo(points[previousIndex]),
      0.001
    );

    curvatures.push(tangentDelta.length() / distanceDelta);
  }

  const samples = points.map((point, index) => ({
    point,
    tangent: frames.tangents[index],
    normal: frames.normals[index],
    binormal: frames.binormals[index],
    curvature: curvatures[index]
  }));

  return {
    curve,
    points,
    samples,
    sampleCount,
    length,
    maxHeight: Math.max(...points.map((point) => point.y))
  };
}

export function getPointAtDistance(trackData, distance) {
  const u = positiveModulo(distance, trackData.length) / trackData.length;
  return trackData.curve.getPointAt(u);
}

export function getTangent(trackData, t) {
  return trackData.curve.getTangentAt(clamp(t, 0, 1)).normalize();
}

export function getNormal(trackData, t) {
  const sampleIndex = clamp(t, 0, 1) * trackData.sampleCount;
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
    curvature: lerp(lowerSample.curvature, upperSample.curvature, alpha),
    distance: wrappedDistance,
    u
  };
}
