import * as THREE from 'three';

class TrainCar {
  constructor({ color = '#eb5f49', accentColor = '#f8fbff', carIndex = 0 } = {}) {
    this.color = color;
    this.accentColor = accentColor;
    this.carIndex = carIndex;
    this.group = new THREE.Group();
    this.group.name = `TrainCar-${carIndex + 1}`;

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

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: '#7cc9ff',
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.74, 2.48),
      bodyMaterial
    );
    body.position.y = 0.66;
    body.castShadow = true;
    body.receiveShadow = true;

    const lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.34, 2.12),
      darkMetal
    );
    lowerBody.position.y = 0.28;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;

    const nose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.56, 0.92, 16),
      accentMaterial
    );
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.82, 1.56);
    nose.castShadow = true;
    nose.receiveShadow = true;

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(1.02, 0.44, 1.08),
      accentMaterial
    );
    canopy.position.set(0, 1.16, 0.18);
    canopy.castShadow = true;
    canopy.receiveShadow = true;

    const headrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.42, 0.18),
      accentMaterial
    );
    headrest.position.set(0, 1.34, -0.56);
    headrest.castShadow = true;
    headrest.receiveShadow = true;

    const restraint = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.05, 12, 24, Math.PI),
      new THREE.MeshStandardMaterial({
        color: '#ffb14d',
        roughness: 0.34,
        metalness: 0.62
      })
    );
    restraint.rotation.x = Math.PI / 2;
    restraint.position.set(0, 1.02, 0.12);
    restraint.castShadow = true;

    const sideWindows = [-0.72, 0.72].map((offset) => {
      const windowPane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.44),
        glassMaterial
      );
      windowPane.position.set(offset, 1.08, -0.08);
      windowPane.rotation.y = offset < 0 ? Math.PI / 2 : -Math.PI / 2;
      return windowPane;
    });

    const frontWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.34),
      glassMaterial
    );
    frontWindow.position.set(0, 1.12, 0.74);

    const wheelGeometry = new THREE.CylinderGeometry(0.19, 0.19, 0.14, 16);
    const wheelOffsets = [
      [-0.56, 0.2, 0.76],
      [0.56, 0.2, 0.76],
      [-0.56, 0.2, -0.76],
      [0.56, 0.2, -0.76]
    ];
    const wheels = wheelOffsets.map(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeometry, darkMetal);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      return wheel;
    });

    const couplerFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.12, 0.42),
      darkMetal
    );
    couplerFront.position.set(0, 0.42, 1.52);

    const couplerRear = couplerFront.clone();
    couplerRear.position.z = -1.52;

    this.group.add(
      body,
      lowerBody,
      nose,
      canopy,
      headrest,
      restraint,
      frontWindow,
      couplerFront,
      couplerRear,
      ...sideWindows,
      ...wheels
    );
  }

  getMesh() {
    return this.group;
  }
}

export default TrainCar;
