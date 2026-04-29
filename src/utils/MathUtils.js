import * as THREE from 'three';

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (start, end, alpha) => start + (end - start) * alpha;

export const kmhToMs = (value) => value / 3.6;

export const msToKmh = (value) => value * 3.6;

export const positiveModulo = (value, divisor) =>
  ((value % divisor) + divisor) % divisor;

export const damp = (current, target, smoothing, deltaTime) =>
  lerp(current, target, 1 - Math.exp(-smoothing * deltaTime));

export const lerpVectors = (from, to, alpha) =>
  new THREE.Vector3().copy(from).lerp(to, alpha);

export const formatNumber = (value, digits = 0) =>
  Number.isFinite(value) ? value.toFixed(digits) : '0';

export const formatDistance = (value) => `${formatNumber(value, 0)} m`;

export const formatElapsedTime = (seconds) => {
  const wholeSeconds = Math.max(Math.floor(seconds), 0);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};
