import * as THREE from 'three';
import { LOOK_AHEAD_DISTANCE } from './Constants';
import { getTrackSampleAtDistance } from './TrackGenerator';

const worldUp = new THREE.Vector3(0, 1, 0);

class CameraController {
  constructor(camera, trackData, options = {}) {
    this.camera = camera;
    this.trackData = trackData;
    this.lookAheadDistance = options.lookAheadDistance ?? LOOK_AHEAD_DISTANCE;
    this.viewMode = options.viewMode ?? 'firstPerson';
    this.bankAngle = 0;
    this.smoothedPosition = new THREE.Vector3();
    this.smoothedTarget = new THREE.Vector3();
    this.smoothedUp = new THREE.Vector3(0, 1, 0);
    this.initialized = false;
  }

  setTrackData(trackData) {
    this.trackData = trackData;
    this.initialized = false;
  }

  setLookAhead(distance) {
    this.lookAheadDistance = distance;
  }

  rotateToCameraAngle(angle) {
    this.bankAngle = angle;
  }

  setViewMode(viewMode) {
    this.viewMode = viewMode;
  }

  interpolatePosition(distanceAlongTrack) {
    return getTrackSampleAtDistance(this.trackData, distanceAlongTrack).point;
  }

  updatePosition(distanceAlongTrack, cartMesh) {
    const sample = getTrackSampleAtDistance(this.trackData, distanceAlongTrack);
    const lookAhead = getTrackSampleAtDistance(
      this.trackData,
      distanceAlongTrack + this.lookAheadDistance
    );

    const liftedUp = sample.normal.clone().lerp(worldUp, 0.18).normalize();
    const cartPosition = sample.point.clone().addScaledVector(liftedUp, 0.9);

    if (cartMesh) {
      cartMesh.visible = this.viewMode === 'thirdPerson';
      cartMesh.position.copy(cartPosition);
      cartMesh.up.copy(liftedUp);
      cartMesh.lookAt(lookAhead.point);
    }

    const desiredPosition =
      this.viewMode === 'thirdPerson'
        ? cartPosition
            .clone()
            .addScaledVector(sample.tangent, -12)
            .addScaledVector(liftedUp, 4.2)
            .addScaledVector(sample.binormal, 1.5)
        : cartPosition.clone().addScaledVector(sample.binormal, 0.2);

    const desiredTarget =
      this.viewMode === 'thirdPerson'
        ? sample.point.clone().addScaledVector(lookAhead.tangent, 3)
        : lookAhead.point.clone().addScaledVector(lookAhead.normal, 0.8);

    if (!this.initialized) {
      this.smoothedPosition.copy(desiredPosition);
      this.smoothedTarget.copy(desiredTarget);
      this.smoothedUp.copy(liftedUp);
      this.initialized = true;
    } else {
      const positionAlpha = this.viewMode === 'thirdPerson' ? 0.1 : 0.18;
      this.smoothedPosition.lerp(desiredPosition, positionAlpha);
      this.smoothedTarget.lerp(desiredTarget, 0.16);
      this.smoothedUp.lerp(liftedUp, 0.14).normalize();
    }

    if (this.bankAngle !== 0) {
      this.smoothedUp
        .applyAxisAngle(sample.tangent, this.bankAngle)
        .normalize();
    }

    this.camera.position.copy(this.smoothedPosition);
    this.camera.up.copy(this.smoothedUp);
    this.camera.lookAt(this.smoothedTarget);

    return {
      sample,
      lookAhead
    };
  }
}

export default CameraController;
