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
    this.trainCarCount = options.trainCarCount ?? 4;
    this.trainCarSpacing = options.trainCarSpacing ?? 3.1;
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

  setTrainConfig(trainCarCount, trainCarSpacing) {
    this.trainCarCount = trainCarCount;
    this.trainCarSpacing = trainCarSpacing;
  }

  setViewMode(viewMode) {
    if (this.viewMode !== viewMode) {
      this.viewMode = viewMode;
      this.initialized = false;
      return;
    }

    this.viewMode = viewMode;
  }

  interpolatePosition(distanceAlongTrack) {
    return getTrackSampleAtDistance(this.trackData, distanceAlongTrack).point;
  }

  getTrainSamples(distanceAlongTrack) {
    return Array.from({ length: this.trainCarCount }, (_, index) =>
      getTrackSampleAtDistance(
        this.trackData,
        distanceAlongTrack - index * this.trainCarSpacing
      )
    );
  }

  updateTrainPosition(distanceAlongTrack, trainComposition) {
    if (!trainComposition) {
      return [];
    }

    const trainSamples = this.getTrainSamples(distanceAlongTrack);
    trainComposition.updateFromSamples(trainSamples);
    return trainSamples;
  }

  updatePosition(distanceAlongTrack, trainComposition) {
    const sample = getTrackSampleAtDistance(this.trackData, distanceAlongTrack);
    const lookAhead = getTrackSampleAtDistance(
      this.trackData,
      distanceAlongTrack + this.lookAheadDistance
    );
    const trainSamples = this.updateTrainPosition(distanceAlongTrack, trainComposition);

    const pose =
      this.viewMode === 'thirdPerson'
        ? this.getThirdPersonPose(sample, lookAhead)
        : this.getFirstPersonPose(sample, lookAhead);

    if (!this.initialized) {
      this.smoothedPosition.copy(pose.position);
      this.smoothedTarget.copy(pose.target);
      this.smoothedUp.copy(pose.up);
      this.initialized = true;
    } else {
      const positionAlpha = this.viewMode === 'thirdPerson' ? 0.12 : 0.18;
      const targetAlpha = this.viewMode === 'thirdPerson' ? 0.14 : 0.22;
      const upAlpha = this.viewMode === 'thirdPerson' ? 0.14 : 0.18;

      this.smoothedPosition.lerp(pose.position, positionAlpha);
      this.smoothedTarget.lerp(pose.target, targetAlpha);
      this.smoothedUp.lerp(pose.up, upAlpha).normalize();
    }

    this.camera.position.copy(this.smoothedPosition);
    this.camera.up.copy(this.smoothedUp);
    this.camera.lookAt(this.smoothedTarget);

    return {
      sample,
      lookAhead,
      trainSamples
    };
  }

  getFirstPersonPose(sample, lookAhead) {
    const cameraPosition = sample.point
      .clone()
      .addScaledVector(sample.up, 1.42)
      .addScaledVector(sample.tangent, -0.12);
    const target = lookAhead.point
      .clone()
      .addScaledVector(lookAhead.up, 1.16)
      .addScaledVector(lookAhead.tangent, 5.6);
    const up = sample.up.clone().lerp(worldUp, 0.08).normalize();

    return {
      position: cameraPosition,
      target,
      up
    };
  }

  getThirdPersonPose(sample, lookAhead) {
    const focusPoint = sample.point.clone().addScaledVector(sample.up, 1.2);
    const cameraPosition = focusPoint
      .clone()
      .addScaledVector(sample.tangent, -8.4)
      .addScaledVector(sample.up, 3.5)
      .addScaledVector(sample.right, 1.2);
    const target = lookAhead.point.clone().addScaledVector(lookAhead.up, 1.05);
    const up = sample.up.clone().lerp(worldUp, 0.16).normalize();

    return {
      position: cameraPosition,
      target,
      up
    };
  }
}

export default CameraController;
