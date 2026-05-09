import * as THREE from 'three';

const CAR_WIDTH = 1.34;
const CAR_LENGTH = 2.56;
const RAIL_CONTACT_WIDTH = 1.46;
const SIDE_WHEEL_WIDTH = 1.02;
const MAIN_WHEEL_RADIUS = 0.18;

class TrainCar {
  constructor({ color = '#eb5f49', accentColor = '#f8fbff', carIndex = 0 } = {}) {
    this.color = color;
    this.accentColor = accentColor;
    this.carIndex = carIndex;
    this.group = new THREE.Group();
    this.group.name = `TrainCar-${carIndex + 1}`;
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.name = `TrainCar-${carIndex + 1}-Body`;
    this.wheelGroup = new THREE.Group();
    this.wheelGroup.name = `TrainCar-${carIndex + 1}-Wheels`;
    this.mainWheels = [];
    this.guideWheels = [];

    this.createTrainCar();
  }

  createTrainCar() {
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.32,
      metalness: 0.72
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: this.accentColor,
      roughness: 0.24,
      metalness: 0.9
    });

    const darkMetal = new THREE.MeshStandardMaterial({
      color: '#1e2732',
      roughness: 0.58,
      metalness: 0.48
    });

    const rubberMaterial = new THREE.MeshStandardMaterial({
      color: '#0d1117',
      roughness: 0.72,
      metalness: 0.18
    });

    const seatMaterial = new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.46,
      metalness: 0.24
    });

    const yellowMaterial = new THREE.MeshStandardMaterial({
      color: '#ffb14d',
      roughness: 0.34,
      metalness: 0.62
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: '#7cc9ff',
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(CAR_WIDTH, 0.58, CAR_LENGTH),
      bodyMaterial
    );
    body.position.y = 0.5;
    body.castShadow = true;
    body.receiveShadow = true;

    const lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.28, 2.18),
      darkMetal
    );
    lowerBody.position.y = 0.14;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;

    const nose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.48, 0.86, 16),
      accentMaterial
    );
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.58, 1.56);
    nose.castShadow = true;
    nose.receiveShadow = true;

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(0.98, 0.34, 1.08),
      accentMaterial
    );
    canopy.position.set(0, 0.96, 0.18);
    canopy.castShadow = true;
    canopy.receiveShadow = true;

    const headrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.36, 0.18),
      accentMaterial
    );
    headrest.position.set(0, 1.16, -0.56);
    headrest.castShadow = true;
    headrest.receiveShadow = true;

    const seats = [-0.34, 0.34].map((x) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.52), seatMaterial);
      seat.position.set(x, 0.84, -0.22);
      seat.castShadow = true;
      seat.receiveShadow = true;
      return seat;
    });

    const restraint = new THREE.Mesh(
      new THREE.TorusGeometry(0.54, 0.04, 12, 24, Math.PI),
      yellowMaterial
    );
    restraint.rotation.x = Math.PI / 2;
    restraint.position.set(0, 0.86, 0.14);
    restraint.castShadow = true;

    const sidePanels = [-0.72, 0.72].map((x) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.4, 1.78),
        bodyMaterial
      );
      panel.position.set(x, 0.58, -0.12);
      panel.castShadow = true;
      panel.receiveShadow = true;
      return panel;
    });

    const sideWindows = [-0.72, 0.72].map((offset) => {
      const windowPane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.44, 0.34),
        glassMaterial
      );
      windowPane.position.set(offset, 0.92, -0.08);
      windowPane.rotation.y = offset < 0 ? Math.PI / 2 : -Math.PI / 2;
      return windowPane;
    });

    const frontWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.64, 0.28),
      glassMaterial
    );
    frontWindow.position.set(0, 0.94, 0.74);

    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.14, 2.24),
      darkMetal
    );
    chassis.position.y = -0.08;
    chassis.castShadow = true;
    chassis.receiveShadow = true;

    const axleGeometry = new THREE.CylinderGeometry(0.045, 0.045, RAIL_CONTACT_WIDTH, 10);
    const axlePositions = [0.78, -0.78];
    const axles = axlePositions.map((z) => {
      const axle = new THREE.Mesh(axleGeometry, darkMetal);
      axle.rotation.z = Math.PI / 2;
      axle.position.set(0, -0.16, z);
      axle.castShadow = true;
      return axle;
    });

    const wheelGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.16, 20);
    const flangeGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.035, 20);
    const wheelOffsets = [
      [-RAIL_CONTACT_WIDTH / 2, -0.16, 0.78],
      [RAIL_CONTACT_WIDTH / 2, -0.16, 0.78],
      [-RAIL_CONTACT_WIDTH / 2, -0.16, -0.78],
      [RAIL_CONTACT_WIDTH / 2, -0.16, -0.78]
    ];
    const wheelAssemblies = wheelOffsets.flatMap(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeometry, rubberMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      this.mainWheels.push(wheel);

      const flange = new THREE.Mesh(flangeGeometry, darkMetal);
      flange.rotation.z = Math.PI / 2;
      flange.position.set(x + (x < 0 ? 0.09 : -0.09), y, z);
      flange.castShadow = true;
      flange.receiveShadow = true;

      return [wheel, flange];
    });

    const sideGuideGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    const sideGuideOffsets = [
      [-SIDE_WHEEL_WIDTH / 2, 0.04, 0.7],
      [SIDE_WHEEL_WIDTH / 2, 0.04, 0.7],
      [-SIDE_WHEEL_WIDTH / 2, 0.04, -0.7],
      [SIDE_WHEEL_WIDTH / 2, 0.04, -0.7]
    ];
    const guideWheels = sideGuideOffsets.map(([x, y, z]) => {
      const guideWheel = new THREE.Mesh(sideGuideGeometry, rubberMaterial);
      guideWheel.rotation.x = Math.PI / 2;
      guideWheel.position.set(x, y, z);
      guideWheel.castShadow = true;
      guideWheel.receiveShadow = true;
      this.guideWheels.push(guideWheel);
      return guideWheel;
    });

    const couplerFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.12, 0.42),
      darkMetal
    );
    couplerFront.position.set(0, 0.42, 1.52);

    const couplerRear = couplerFront.clone();
    couplerRear.position.z = -1.52;

    this.bodyGroup.add(
      body,
      lowerBody,
      nose,
      canopy,
      headrest,
      restraint,
      frontWindow,
      ...seats,
      ...sidePanels,
      ...sideWindows
    );

    this.wheelGroup.add(
      chassis,
      ...axles,
      ...wheelAssemblies,
      ...guideWheels
    );

    this.group.add(
      this.bodyGroup,
      this.wheelGroup,
      couplerFront,
      couplerRear
    );
  }

  animate({ cumulativeDistance = 0, speedMs = 0, gForce = 1, elapsedTime = 0 } = {}) {
    const wheelSpin = cumulativeDistance / MAIN_WHEEL_RADIUS;
    const speedFactor = THREE.MathUtils.clamp(speedMs / 42, 0, 1);
    const forceFactor = THREE.MathUtils.clamp((gForce - 1) / 3.5, 0, 1);
    const phase = elapsedTime * (8 + speedFactor * 18) + this.carIndex * 0.72;
    const bob = Math.sin(phase) * 0.018 * speedFactor;
    const rattle = Math.sin(phase * 2.7) * 0.007 * (0.35 + forceFactor);

    this.mainWheels.forEach((wheel, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      wheel.rotation.x = wheelSpin * direction;
      wheel.rotation.z = Math.PI / 2;
    });

    this.guideWheels.forEach((wheel, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      wheel.rotation.x = Math.PI / 2;
      wheel.rotation.z = wheelSpin * 1.25 * direction;
    });

    this.bodyGroup.position.y = bob + rattle;
    this.bodyGroup.rotation.x = Math.sin(phase * 0.82) * 0.012 * speedFactor;
    this.bodyGroup.rotation.z = Math.sin(phase * 0.64) * 0.014 * forceFactor;
  }

  getMesh() {
    return this.group;
  }
}

export default TrainCar;
