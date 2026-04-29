import * as THREE from 'three';
import { Vec3, World } from 'cannon-es';
import { GRAVITY } from './Constants';
import { clamp, kmhToMs, msToKmh, positiveModulo } from './MathUtils';
import { getTrackSampleAtDistance } from './TrackGenerator';

const gravityVector = new THREE.Vector3(0, -GRAVITY, 0);

class PhysicsEngine {
  constructor({ trackData, initialSpeedKmh = 72, friction = 0.016 }) {
    this.world = new World({
      gravity: new Vec3(0, -GRAVITY, 0)
    });
    this.trackData = trackData;
    this.initialSpeedMs = kmhToMs(initialSpeedKmh);
    this.speedLimitMs = kmhToMs(200);
    this.friction = friction;
    this.reset(initialSpeedKmh);
  }

  reset(initialSpeedKmh = msToKmh(this.initialSpeedMs)) {
    this.distance = 0;
    this.cumulativeDistance = 0;
    this.speedMs = kmhToMs(initialSpeedKmh);
    this.elapsedTime = 0;
    this.previousHeight = this.trackData.points[0].y;
    this.previousSpeedMs = this.speedMs;
    this.latestSample = getTrackSampleAtDistance(this.trackData, 0);
  }

  setTrack(trackData) {
    this.trackData = trackData;
    this.reset();
  }

  setSpeedLimitKmh(speedLimitKmh) {
    this.speedLimitMs = kmhToMs(speedLimitKmh);
  }

  calculateSpeed(currentHeight, previousHeight, speedMs, friction, tangentY, deltaTime) {
    const slopeAcceleration = -this.world.gravity.y * -tangentY;
    const potentialBoost = (previousHeight - currentHeight) * 0.65;
    const frictionAcceleration = this.applyFriction(speedMs, friction);
    const nextSpeed =
      speedMs +
      (slopeAcceleration + potentialBoost - frictionAcceleration) * deltaTime;

    return clamp(nextSpeed, 0, this.speedLimitMs);
  }

  calculateGForce(accelerationVector) {
    return accelerationVector.length() / GRAVITY;
  }

  updateVelocity(distance, gravity) {
    const sample = getTrackSampleAtDistance(this.trackData, distance);
    return clamp(this.speedMs + gravity * -sample.tangent.y, 0, this.speedLimitMs);
  }

  checkCollision() {
    return this.latestSample.point.y < -50;
  }

  applyFriction(velocity, friction = this.friction) {
    return friction * GRAVITY + velocity * velocity * 0.0016;
  }

  update(deltaTime) {
    const currentSample = getTrackSampleAtDistance(this.trackData, this.distance);
    const previousSpeedMs = this.speedMs;
    const nextSpeedMs = this.calculateSpeed(
      currentSample.point.y,
      this.previousHeight,
      previousSpeedMs,
      this.friction,
      currentSample.tangent.y,
      deltaTime
    );

    const distanceStep = ((previousSpeedMs + nextSpeedMs) * 0.5) * deltaTime;
    this.cumulativeDistance += distanceStep;
    this.distance = positiveModulo(this.distance + distanceStep, this.trackData.length);
    this.elapsedTime += deltaTime;

    const updatedSample = getTrackSampleAtDistance(this.trackData, this.distance);
    const tangentialAcceleration =
      (nextSpeedMs - previousSpeedMs) / Math.max(deltaTime, 0.0001);
    const centripetalAcceleration =
      nextSpeedMs * nextSpeedMs * updatedSample.curvature;

    const totalAcceleration = updatedSample.tangent
      .clone()
      .multiplyScalar(tangentialAcceleration)
      .add(updatedSample.normal.clone().multiplyScalar(centripetalAcceleration));

    const supportForce = totalAcceleration.clone().sub(gravityVector);
    const gForce = this.calculateGForce(supportForce);

    this.previousHeight = updatedSample.point.y;
    this.previousSpeedMs = nextSpeedMs;
    this.speedMs = nextSpeedMs;
    this.latestSample = updatedSample;

    return {
      distance: this.distance,
      cumulativeDistance: this.cumulativeDistance,
      elapsedTime: this.elapsedTime,
      speedMs: this.speedMs,
      speedKmh: msToKmh(this.speedMs),
      height: updatedSample.point.y,
      gForce,
      point: updatedSample.point,
      tangent: updatedSample.tangent,
      collision: this.checkCollision()
    };
  }

  getSnapshot() {
    return {
      distance: this.distance,
      cumulativeDistance: this.cumulativeDistance,
      elapsedTime: this.elapsedTime,
      speedMs: this.speedMs,
      speedKmh: msToKmh(this.speedMs),
      height: this.latestSample.point.y,
      gForce: 1,
      point: this.latestSample.point,
      tangent: this.latestSample.tangent,
      collision: false
    };
  }
}

export default PhysicsEngine;
