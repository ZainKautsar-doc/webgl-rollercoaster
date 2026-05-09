import * as THREE from 'three';
import TrainCar from './TrainCar';

const upVector = new THREE.Vector3(0, 1, 0);
const helperDirection = new THREE.Vector3();
const helperMidpoint = new THREE.Vector3();
const helperQuaternion = new THREE.Quaternion();
const helperScale = new THREE.Vector3();
const helperMatrix = new THREE.Matrix4();
const GRAVITY = 9.82;
const MAX_BANK_ANGLE = 0.42;

class TrainComposition {
  constructor({ color = '#eb5f49', carCount = 4, carSpacing = 3.1 } = {}) {
    this.carCount = carCount;
    this.carSpacing = carSpacing;
    this.group = new THREE.Group();
    this.group.name = 'TrainComposition';
    this.focusTarget = new THREE.Object3D();
    this.focusTarget.name = 'TrainFocusTarget';
    this.cars = [];
    this.couplers = [];

    for (let index = 0; index < carCount; index += 1) {
      const car = new TrainCar({
        color,
        accentColor: index === 0 ? '#ffffff' : '#dbe9f5',
        carIndex: index
      });

      this.cars.push(car);
      this.group.add(car.getMesh());
    }

    this.createDynamicCouplers();
    this.group.add(this.focusTarget);
  }

  createDynamicCouplers() {
    const couplerGeometry = new THREE.CylinderGeometry(0.055, 0.055, 1, 10);
    const couplerMaterial = new THREE.MeshStandardMaterial({
      color: '#2b3542',
      roughness: 0.52,
      metalness: 0.72
    });

    for (let index = 0; index < this.carCount - 1; index += 1) {
      const coupler = new THREE.Mesh(couplerGeometry, couplerMaterial);
      coupler.name = `DynamicCoupler-${index + 1}`;
      coupler.castShadow = true;
      coupler.receiveShadow = true;
      this.couplers.push(coupler);
      this.group.add(coupler);
    }
  }

  updateFromSamples(samples, dynamics = {}) {
    const center = new THREE.Vector3();

    samples.forEach((sample, index) => {
      const car = this.cars[index];

      if (!car || !sample) {
        return;
      }

      const carMesh = car.getMesh();
      const liftedPosition = sample.point
        .clone()
        .addScaledVector(sample.up, 0.92);

      carMesh.position.copy(liftedPosition);
      carMesh.up.copy(sample.up);

      const lookTarget = sample.point
        .clone()
        .addScaledVector(sample.tangent, 2.1)
        .addScaledVector(sample.up, 0.92);
      carMesh.lookAt(lookTarget);

      const lateralForce = (dynamics.speedMs ?? 0) ** 2 * sample.curvature;
      const turnDirection = Math.sign(sample.normal.dot(sample.right)) || 1;
      const bankAngle = THREE.MathUtils.clamp(
        Math.atan(lateralForce / GRAVITY) * 0.45,
        0,
        MAX_BANK_ANGLE
      );
      carMesh.rotateZ(-bankAngle * turnDirection);

      car.animate({
        ...dynamics,
        cumulativeDistance:
          (dynamics.cumulativeDistance ?? 0) - index * this.carSpacing
      });

      center.add(liftedPosition);
    });

    this.updateCouplers(samples);

    if (samples.length > 0) {
      center.divideScalar(samples.length);
      this.focusTarget.position.copy(center).addScaledVector(samples[0].up, 0.9);
    }
  }

  updateCouplers(samples) {
    this.couplers.forEach((coupler, index) => {
      const frontSample = samples[index];
      const rearSample = samples[index + 1];

      if (!frontSample || !rearSample) {
        coupler.visible = false;
        return;
      }

      coupler.visible = true;

      const start = frontSample.point
        .clone()
        .addScaledVector(frontSample.up, 0.74)
        .addScaledVector(frontSample.tangent, -1.36);
      const end = rearSample.point
        .clone()
        .addScaledVector(rearSample.up, 0.74)
        .addScaledVector(rearSample.tangent, 1.36);

      placeCylinderBetween(coupler, start, end);
    });
  }

  getMesh() {
    return this.group;
  }

  getFocusTarget() {
    return this.focusTarget;
  }

  getLength() {
    return this.carSpacing * this.carCount;
  }
}

function placeCylinderBetween(mesh, start, end) {
  helperDirection.subVectors(end, start);
  const length = helperDirection.length();

  if (length <= 0.001) {
    mesh.visible = false;
    return;
  }

  helperMidpoint.copy(start).add(end).multiplyScalar(0.5);
  helperQuaternion.setFromUnitVectors(upVector, helperDirection.normalize());
  helperScale.set(1, length, 1);
  helperMatrix.compose(helperMidpoint, helperQuaternion, helperScale);
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(helperMatrix);
}

export default TrainComposition;
