import * as THREE from 'three';
import { TRACK_TIE_SPACING } from '../utils/Constants';

const helperMatrix = new THREE.Matrix4();
const helperPosition = new THREE.Vector3();

const MAIN_RAIL_SPACING = 1.46;
const MAIN_RAIL_HEIGHT = 0.42;
const MAIN_RAIL_RADIUS = 0.11;
const GUARD_RAIL_OFFSET = 1.18;
const GUARD_RAIL_HEIGHT = 0.14;
const GUARD_RAIL_RADIUS = 0.045;
const WALKWAY_OFFSET = 1.42;

function createOffsetCurve(trackData, lateralOffset, verticalOffset = 0) {
  const points = trackData.samples.slice(0, -1).map((sample) =>
    sample.point
      .clone()
      .addScaledVector(sample.right, lateralOffset)
      .addScaledVector(sample.up, verticalOffset)
  );

  return new THREE.CatmullRomCurve3(points, trackData.closed, 'centripetal', 0.35);
}

function createRailMesh(curve, radius, color, roughness, metalness, tubularSegments) {
  const geometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    radius,
    10,
    true
  );

  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

export function createRollerCoasterTrack(trackData, trackConfig) {
  const group = new THREE.Group();
  group.name = `${trackConfig.name} Track`;

  const leftRailCurve = createOffsetCurve(
    trackData,
    -MAIN_RAIL_SPACING / 2,
    MAIN_RAIL_HEIGHT
  );
  const rightRailCurve = createOffsetCurve(
    trackData,
    MAIN_RAIL_SPACING / 2,
    MAIN_RAIL_HEIGHT
  );
  const leftGuardCurve = createOffsetCurve(
    trackData,
    -GUARD_RAIL_OFFSET,
    GUARD_RAIL_HEIGHT
  );
  const rightGuardCurve = createOffsetCurve(
    trackData,
    GUARD_RAIL_OFFSET,
    GUARD_RAIL_HEIGHT
  );
  const centerSpineCurve = createOffsetCurve(trackData, 0, 0.1);

  const leftRail = createRailMesh(
    leftRailCurve,
    MAIN_RAIL_RADIUS,
    '#1b212c',
    0.24,
    0.86,
    trackData.sampleCount
  );
  const rightRail = createRailMesh(
    rightRailCurve,
    MAIN_RAIL_RADIUS,
    '#1b212c',
    0.24,
    0.86,
    trackData.sampleCount
  );
  const leftGuardRail = createRailMesh(
    leftGuardCurve,
    GUARD_RAIL_RADIUS,
    '#2f3844',
    0.48,
    0.52,
    Math.floor(trackData.sampleCount * 0.7)
  );
  const rightGuardRail = createRailMesh(
    rightGuardCurve,
    GUARD_RAIL_RADIUS,
    '#2f3844',
    0.48,
    0.52,
    Math.floor(trackData.sampleCount * 0.7)
  );
  const centerSpine = createRailMesh(
    centerSpineCurve,
    0.085,
    trackConfig.color,
    0.36,
    0.68,
    Math.floor(trackData.sampleCount * 0.78)
  );

  const tieCount = Math.max(Math.floor(trackData.sampleCount / TRACK_TIE_SPACING), 1);
  const tieGeometry = new THREE.BoxGeometry(0.22, 0.12, MAIN_RAIL_SPACING + 0.62);
  const tieMaterial = new THREE.MeshStandardMaterial({
    color: '#4a4f57',
    roughness: 0.9,
    metalness: 0.18,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  });
  const ties = new THREE.InstancedMesh(tieGeometry, tieMaterial, tieCount);
  ties.castShadow = true;
  ties.receiveShadow = true;

  const clampGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.2);
  const clampMaterial = new THREE.MeshStandardMaterial({
    color: '#dce4ec',
    roughness: 0.42,
    metalness: 0.88
  });
  const clamps = new THREE.InstancedMesh(clampGeometry, clampMaterial, tieCount * 2);
  clamps.castShadow = true;
  clamps.receiveShadow = true;

  const crossbeamGeometry = new THREE.BoxGeometry(0.16, 0.16, MAIN_RAIL_SPACING + 0.26);
  const crossbeamMaterial = new THREE.MeshStandardMaterial({
    color: '#222b36',
    roughness: 0.64,
    metalness: 0.62
  });
  const crossbeams = new THREE.InstancedMesh(
    crossbeamGeometry,
    crossbeamMaterial,
    tieCount
  );
  crossbeams.castShadow = true;
  crossbeams.receiveShadow = true;

  const spineBracketGeometry = new THREE.BoxGeometry(0.14, MAIN_RAIL_HEIGHT, 0.12);
  const spineBracketMaterial = new THREE.MeshStandardMaterial({
    color: '#f0f4f8',
    roughness: 0.46,
    metalness: 0.82
  });
  const spineBrackets = new THREE.InstancedMesh(
    spineBracketGeometry,
    spineBracketMaterial,
    tieCount * 2
  );
  spineBrackets.castShadow = true;
  spineBrackets.receiveShadow = true;

  const walkwayGeometry = new THREE.BoxGeometry(0.34, 0.045, 0.5);
  const walkwayMaterial = new THREE.MeshStandardMaterial({
    color: '#596472',
    roughness: 0.88,
    metalness: 0.34
  });
  const walkways = new THREE.InstancedMesh(walkwayGeometry, walkwayMaterial, tieCount);
  walkways.castShadow = true;
  walkways.receiveShadow = true;

  const handrailPostGeometry = new THREE.BoxGeometry(0.055, 0.46, 0.055);
  const handrailPostMaterial = new THREE.MeshStandardMaterial({
    color: '#d6dee8',
    roughness: 0.48,
    metalness: 0.82
  });
  const handrailPosts = new THREE.InstancedMesh(
    handrailPostGeometry,
    handrailPostMaterial,
    tieCount
  );
  handrailPosts.castShadow = true;
  handrailPosts.receiveShadow = true;

  for (let index = 0; index < tieCount; index += 1) {
    const sample = trackData.samples[index * TRACK_TIE_SPACING];
    const basisX = sample.tangent.clone().normalize();
    const basisY = sample.up.clone().normalize();
    const basisZ = sample.right.clone().normalize();

    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperPosition.copy(sample.point).addScaledVector(sample.up, 0.18);
    helperMatrix.setPosition(helperPosition);
    ties.setMatrixAt(index, helperMatrix);

    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperPosition.copy(sample.point).addScaledVector(sample.up, MAIN_RAIL_HEIGHT - 0.16);
    helperMatrix.setPosition(helperPosition);
    crossbeams.setMatrixAt(index, helperMatrix);

    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperPosition
      .copy(sample.point)
      .addScaledVector(sample.up, MAIN_RAIL_HEIGHT * 0.5)
      .addScaledVector(sample.right, -MAIN_RAIL_SPACING / 2);
    helperMatrix.setPosition(helperPosition);
    spineBrackets.setMatrixAt(index * 2, helperMatrix);

    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperPosition
      .copy(sample.point)
      .addScaledVector(sample.up, MAIN_RAIL_HEIGHT * 0.5)
      .addScaledVector(sample.right, MAIN_RAIL_SPACING / 2);
    helperMatrix.setPosition(helperPosition);
    spineBrackets.setMatrixAt(index * 2 + 1, helperMatrix);

    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperPosition
      .copy(sample.point)
      .addScaledVector(sample.up, MAIN_RAIL_HEIGHT - 0.18)
      .addScaledVector(sample.right, WALKWAY_OFFSET);
    helperMatrix.setPosition(helperPosition);
    walkways.setMatrixAt(index, helperMatrix);

    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperPosition
      .copy(sample.point)
      .addScaledVector(sample.up, MAIN_RAIL_HEIGHT + 0.08)
      .addScaledVector(sample.right, WALKWAY_OFFSET + 0.24);
    helperMatrix.setPosition(helperPosition);
    handrailPosts.setMatrixAt(index, helperMatrix);

    const leftClampPosition = sample.point
      .clone()
      .addScaledVector(sample.up, MAIN_RAIL_HEIGHT - 0.04)
      .addScaledVector(sample.right, -MAIN_RAIL_SPACING / 2);
    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperMatrix.setPosition(leftClampPosition);
    clamps.setMatrixAt(index * 2, helperMatrix);

    const rightClampPosition = sample.point
      .clone()
      .addScaledVector(sample.up, MAIN_RAIL_HEIGHT - 0.04)
      .addScaledVector(sample.right, MAIN_RAIL_SPACING / 2);
    helperMatrix.makeBasis(basisX, basisY, basisZ);
    helperMatrix.setPosition(rightClampPosition);
    clamps.setMatrixAt(index * 2 + 1, helperMatrix);
  }

  ties.instanceMatrix.needsUpdate = true;
  clamps.instanceMatrix.needsUpdate = true;
  crossbeams.instanceMatrix.needsUpdate = true;
  spineBrackets.instanceMatrix.needsUpdate = true;
  walkways.instanceMatrix.needsUpdate = true;
  handrailPosts.instanceMatrix.needsUpdate = true;

  group.add(
    leftRail,
    rightRail,
    leftGuardRail,
    rightGuardRail,
    centerSpine,
    ties,
    clamps,
    crossbeams,
    spineBrackets,
    walkways,
    handrailPosts
  );

  return group;
}
