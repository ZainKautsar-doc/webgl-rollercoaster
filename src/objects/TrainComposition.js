import * as THREE from 'three';
import TrainCar from './TrainCar';

class TrainComposition {
  constructor({ color = '#eb5f49', carCount = 4, carSpacing = 3.1 } = {}) {
    this.carCount = carCount;
    this.carSpacing = carSpacing;
    this.group = new THREE.Group();
    this.group.name = 'TrainComposition';
    this.focusTarget = new THREE.Object3D();
    this.focusTarget.name = 'TrainFocusTarget';
    this.cars = [];

    for (let index = 0; index < carCount; index += 1) {
      const car = new TrainCar({
        color,
        accentColor: index === 0 ? '#ffffff' : '#dbe9f5',
        carIndex: index
      });

      this.cars.push(car);
      this.group.add(car.getMesh());
    }

    this.group.add(this.focusTarget);
  }

  updateFromSamples(samples) {
    const center = new THREE.Vector3();

    samples.forEach((sample, index) => {
      const car = this.cars[index];

      if (!car || !sample) {
        return;
      }

      const carMesh = car.getMesh();
      const liftedPosition = sample.point
        .clone()
        .addScaledVector(sample.up, 1.18);

      carMesh.position.copy(liftedPosition);
      carMesh.up.copy(sample.up);

      const lookTarget = sample.point
        .clone()
        .addScaledVector(sample.tangent, 2.1)
        .addScaledVector(sample.up, 1.18);
      carMesh.lookAt(lookTarget);

      center.add(liftedPosition);
    });

    if (samples.length > 0) {
      center.divideScalar(samples.length);
      this.focusTarget.position.copy(center).addScaledVector(samples[0].up, 0.9);
    }
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

export default TrainComposition;
