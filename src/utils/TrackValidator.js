export function validateTrackContinuity(curve) {
  const start = curve.getPointAt(0);
  const end = curve.getPointAt(1);
  const startTangent = curve.getTangentAt(0).normalize();
  const endTangent = curve.getTangentAt(1).normalize();
  const continuityGap = start.distanceTo(end);
  const tangentAlignment = startTangent.dot(endTangent);

  return {
    continuityGap,
    tangentAlignment,
    isContinuous: continuityGap < 0.5 && tangentAlignment > 0.94
  };
}
