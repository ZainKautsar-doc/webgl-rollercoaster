import * as THREE from 'three';

function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b8def8');
  scene.fog = new THREE.FogExp2('#b8d9f0', 0.00075);

  return scene;
}

export default setupScene;
