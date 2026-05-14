import * as THREE from 'three';
import { Vec3, World } from 'cannon-es';
import { GRAVITY } from './Constants';
import { clamp, kmhToMs, msToKmh, positiveModulo } from './MathUtils';
import { getTrackSampleAtDistance } from './TrackGenerator';

const gravityVector = new THREE.Vector3(0, -GRAVITY, 0);

class PhysicsEngine {
  constructor({
    trackData,
    initialSpeedKmh = 72,
    friction = 0.016,
    rollingResistance = 0.0008,
    minimumSpeedKmh = 35,
    boosterStrength = 2.4
  }) {
    this.world = new World({
      gravity: new Vec3(0, -GRAVITY, 0)
    });
    this.trackData = trackData;
    this.initialSpeedMs = kmhToMs(initialSpeedKmh);
    this.speedLimitMs = kmhToMs(200);
    this.friction = friction;
    this.rollingResistance = rollingResistance;
    this.minimumSpeedMs = kmhToMs(minimumSpeedKmh);
    this.boosterStrength = boosterStrength;
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

  getTrackGradient(tangent) {
    return Math.asin(clamp(tangent.y, -1, 1));
  }

  calculateSpeed(currentHeight, previousHeight, speedMs, trackGradient, deltaTime) {
    const slopeAcceleration = -this.world.gravity.y * -Math.sin(trackGradient);
    const heightDifference = previousHeight - currentHeight;
    const momentumAssist = clamp(heightDifference * 0.9, -8, 8);
    const frictionAcceleration = this.applyFriction(speedMs, this.friction);

    let boosterAcceleration = 0;

    if (trackGradient > 0.05 && speedMs < this.minimumSpeedMs + 10) {
      boosterAcceleration =
        this.boosterStrength * 2.5 * (1 + trackGradient * 2);
    }

    const totalAcceleration =
      slopeAcceleration + momentumAssist + boosterAcceleration - frictionAcceleration;
    const climbingFloor = trackGradient > 0.02 ? this.minimumSpeedMs : 0;
    const nextSpeed = clamp(
      speedMs + totalAcceleration * deltaTime,
      climbingFloor,
      this.speedLimitMs
    );

    return {
      speedMs: nextSpeed,
      acceleration: totalAcceleration,
      boosterActive: boosterAcceleration > 0,
      gradientDeg: THREE.MathUtils.radToDeg(trackGradient)
    };
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
    return friction * velocity + this.rollingResistance * velocity * velocity;
  }

  update(deltaTime) {
    const currentSample = getTrackSampleAtDistance(this.trackData, this.distance);
    const previousSpeedMs = this.speedMs;
    const trackGradient = this.getTrackGradient(currentSample.tangent);
    const speedResult = this.calculateSpeed(
      currentSample.point.y,
      this.previousHeight,
      previousSpeedMs,
      trackGradient,
      deltaTime
    );
    const nextSpeedMs = speedResult.speedMs;

    const distanceStep = ((previousSpeedMs + nextSpeedMs) * 0.5) * deltaTime;
    this.cumulativeDistance += distanceStep;
    this.distance = positiveModulo(this.distance + distanceStep, this.trackData.length);
    this.elapsedTime += deltaTime;

    const updatedSample = getTrackSampleAtDistance(this.trackData, this.distance);
    const tangentialAcceleration = speedResult.acceleration;
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
      gradientDeg: speedResult.gradientDeg,
      boosterActive: speedResult.boosterActive,
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
      gradientDeg: THREE.MathUtils.radToDeg(
        this.getTrackGradient(this.latestSample.tangent)
      ),
      boosterActive: false,
      point: this.latestSample.point,
      tangent: this.latestSample.tangent,
      collision: false
    };
  }
}

export default PhysicsEngine;
