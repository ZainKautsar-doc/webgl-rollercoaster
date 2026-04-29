import * as THREE from 'three';
import { TRACK_RADIUS, TRACK_TIE_SPACING } from '../utils/Constants';
import { createTrackGeometry } from '../utils/TrackGenerator';

const helperMatrix = new THREE.Matrix4();
const helperPosition = new THREE.Vector3();

export function createRollerCoasterTrack(trackData, trackConfig) {
  const group = new THREE.Group();
  group.name = `${trackConfig.name} Track`;

  const spineGeometry = createTrackGeometry(trackData.curve, {
    radius: TRACK_RADIUS,
    tubularSegments: trackData.sampleCount
  });

  const spineMaterial = new THREE.MeshStandardMaterial({
    color: trackConfig.color,
    roughness: 0.36,
    metalness: 0.78,
    envMapIntensity: 1.1
  });

  const spineMesh = new THREE.Mesh(spineGeometry, spineMaterial);
  spineMesh.castShadow = true;
  spineMesh.receiveShadow = true;

  const coreGeometry = createTrackGeometry(trackData.curve, {
    radius: TRACK_RADIUS * 0.34,
    tubularSegments: trackData.sampleCount
  });

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: '#f5f7fb',
    roughness: 0.24,
    metalness: 1
  });

  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;

  const accentGeometry = new THREE.BufferGeometry().setFromPoints(trackData.points);
  const accentMaterial = new THREE.LineBasicMaterial({
    color: '#fefefe',
    transparent: true,
    opacity: 0.65
  });
  const accentLine = new THREE.Line(accentGeometry, accentMaterial);

  const tieCount = Math.max(Math.floor(trackData.sampleCount / TRACK_TIE_SPACING), 1);
  const tieGeometry = new THREE.BoxGeometry(2.6, 0.16, 0.42);
  const tieMaterial = new THREE.MeshStandardMaterial({
    color: '#2e3744',
    roughness: 0.88,
    metalness: 0.16
  });
  const ties = new THREE.InstancedMesh(tieGeometry, tieMaterial, tieCount);
  ties.castShadow = true;
  ties.receiveShadow = true;

  for (let index = 0; index < tieCount; index += 1) {
    const sample = trackData.samples[index * TRACK_TIE_SPACING];
    const basisX = sample.binormal.clone().normalize();
    const basisY = sample.normal.clone().normalize();
    const basisZ = sample.tangent.clone().normalize();

    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperPosition.copy(sample.point).addScaledVector(basisY, -0.05);
    helperMatrix.setPosition(helperPosition);
    ties.setMatrixAt(index, helperMatrix);
  }

  ties.instanceMatrix.needsUpdate = true;

  group.add(spineMesh, coreMesh, accentLine, ties);

  return group;
}

export function createCartMesh(color) {
  const cart = new THREE.Group();
  cart.name = 'Camera Cart';

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.7, 2.2),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.34,
      metalness: 0.66
    })
  );
  base.castShadow = true;
  base.receiveShadow = true;

  const cockpit = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.55, 1.2),
    new THREE.MeshStandardMaterial({
      color: '#f7fbff',
      roughness: 0.2,
      metalness: 0.88
    })
  );
  cockpit.position.set(0, 0.52, 0.1);
  cockpit.castShadow = true;
  cockpit.receiveShadow = true;

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 0.95, 16),
    new THREE.MeshStandardMaterial({
      color: '#1f2a38',
      roughness: 0.48,
      metalness: 0.52
    })
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.08, 1.5);
  nose.castShadow = true;
  nose.receiveShadow = true;

  cart.add(base, cockpit, nose);

  return cart;
}
