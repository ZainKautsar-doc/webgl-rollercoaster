import * as THREE from 'three';
import { GROUND_LEVEL, SUPPORT_SPACING } from '../utils/Constants';

const upVector = new THREE.Vector3(0, 1, 0);
const helperMatrix = new THREE.Matrix4();
const helperQuaternion = new THREE.Quaternion();
const helperScale = new THREE.Vector3();
const helperMidpoint = new THREE.Vector3();
const helperDirection = new THREE.Vector3();
const helperStart = new THREE.Vector3();
const helperEnd = new THREE.Vector3();

export function createSupportStructure(trackData) {
  const group = new THREE.Group();
  group.name = 'Track Supports';

  const supportCount = Math.max(Math.floor(trackData.sampleCount / SUPPORT_SPACING), 1);

  const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.34, 1, 10);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: '#384450',
    roughness: 0.72,
    metalness: 0.44
  });

  const pillars = new THREE.InstancedMesh(pillarGeometry, pillarMaterial, supportCount);
  pillars.castShadow = true;
  pillars.receiveShadow = true;

  const braceGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1, 8);
  const braceMaterial = new THREE.MeshStandardMaterial({
    color: '#546272',
    roughness: 0.84,
    metalness: 0.22
  });

  const braces = new THREE.InstancedMesh(braceGeometry, braceMaterial, supportCount * 2);
  braces.castShadow = true;
  braces.receiveShadow = true;

  let braceIndex = 0;

  for (let index = 0; index < supportCount; index += 1) {
    const sample = trackData.samples[index * SUPPORT_SPACING];

    helperStart.set(sample.point.x, GROUND_LEVEL, sample.point.z);
    helperEnd.copy(sample.point).addScaledVector(sample.up, -0.2);
    placeCylinder(pillars, index, helperStart, helperEnd, 1);

    if (index < supportCount - 1) {
      const nextSample = trackData.samples[(index + 1) * SUPPORT_SPACING];
      placeCylinder(
        braces,
        braceIndex,
        helperStart,
        nextSample.point.clone().addScaledVector(nextSample.up, -0.2),
        1
      );
      braceIndex += 1;
      placeCylinder(
        braces,
        braceIndex,
        nextSample.point.clone().setY(GROUND_LEVEL),
        helperEnd,
        1
      );
      braceIndex += 1;
    }
  }

  braces.count = braceIndex;
  pillars.instanceMatrix.needsUpdate = true;
  braces.instanceMatrix.needsUpdate = true;

  group.add(pillars, braces);

  return group;
}

function placeCylinder(mesh, index, start, end, width = 1) {
  helperDirection.subVectors(end, start);
  const length = helperDirection.length();

  if (length <= 0.01) {
    return;
  }

  helperMidpoint.copy(start).add(end).multiplyScalar(0.5);
  helperQuaternion.setFromUnitVectors(upVector, helperDirection.normalize());
  helperScale.set(width, length, width);
  helperMatrix.compose(helperMidpoint, helperQuaternion, helperScale);
  mesh.setMatrixAt(index, helperMatrix);
}
