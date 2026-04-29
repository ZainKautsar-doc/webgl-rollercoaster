import * as THREE from 'three';
import { CAMERA_FOV } from '../utils/Constants';

function setupCamera(container) {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    width / Math.max(height, 1),
    0.1,
    3000
  );

  camera.position.set(0, 20, 40);

  return camera;
}

export default setupCamera;
