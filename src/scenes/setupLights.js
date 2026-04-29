import * as THREE from 'three';

function setupLights(scene) {
  const group = new THREE.Group();

  const ambientLight = new THREE.AmbientLight('#ffffff', 0.55);

  const sunLight = new THREE.DirectionalLight('#fff3d5', 2.25);
  sunLight.position.set(180, 220, 90);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 550;
  sunLight.shadow.camera.left = -250;
  sunLight.shadow.camera.right = 250;
  sunLight.shadow.camera.top = 250;
  sunLight.shadow.camera.bottom = -250;
  sunLight.shadow.bias = -0.00008;

  const sunTarget = new THREE.Object3D();
  sunTarget.position.set(0, 0, 0);
  sunLight.target = sunTarget;

  const fillLight = new THREE.PointLight('#5cc6ff', 32, 600, 2);
  fillLight.position.set(-120, 80, -90);

  const rimLight = new THREE.DirectionalLight('#b7f1ff', 0.55);
  rimLight.position.set(-90, 40, -120);

  group.add(ambientLight, sunLight, sunTarget, fillLight, rimLight);
  scene.add(group);

  return {
    group,
    ambientLight,
    sunLight,
    sunTarget,
    fillLight,
    rimLight
  };
}

export default setupLights;
