import * as THREE from 'three';
import { GROUND_LEVEL } from '../utils/Constants';

export function createEnvironment() {
  const group = new THREE.Group();
  group.name = 'Environment';

  const sky = createSkyDome();
  const ground = createGroundPlane();
  const skyline = createSkylineRings();

  group.add(sky, ground, skyline);

  return group;
}

function createSkyDome() {
  const geometry = new THREE.SphereGeometry(1400, 48, 48);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color('#8fd8ff') },
      midColor: { value: new THREE.Color('#dbeeff') },
      bottomColor: { value: new THREE.Color('#f7f0d6') }
    },
    vertexShader: `
      varying vec3 vWorldPosition;

      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;

      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, 250.0, 0.0)).y;
        vec3 color = mix(bottomColor, midColor, smoothstep(-0.25, 0.22, h));
        color = mix(color, topColor, smoothstep(0.18, 0.9, h));
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  return new THREE.Mesh(geometry, material);
}

function createGroundPlane() {
  const geometry = new THREE.PlaneGeometry(1800, 1800, 140, 140);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const wave =
      Math.sin(x * 0.011) * 5.6 +
      Math.cos(y * 0.009) * 4.2 +
      Math.sin((x + y) * 0.0065) * 3;
    position.setZ(index, wave + GROUND_LEVEL);
  }

  geometry.computeVertexNormals();
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: '#33523f',
    roughness: 0.97,
    metalness: 0.02
  });

  const ground = new THREE.Mesh(geometry, material);
  ground.receiveShadow = true;
  ground.position.y = 0;

  return ground;
}

function createSkylineRings() {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: '#6f8aa0',
    roughness: 0.82,
    metalness: 0.08
  });

  for (let index = 0; index < 26; index += 1) {
    const angle = (index / 26) * Math.PI * 2;
    const distance = 460 + (index % 5) * 55;
    const height = 20 + (index % 7) * 10;
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 14, height, 8),
      material
    );

    mesh.position.set(
      Math.cos(angle) * distance,
      GROUND_LEVEL + height / 2 - 4,
      Math.sin(angle) * distance
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);
  }

  return group;
}
