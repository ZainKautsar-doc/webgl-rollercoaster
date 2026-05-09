import { useEffect } from 'react';
import setupScene from '../scenes/setupScene';
import setupCamera from '../scenes/setupCamera';
import setupLights from '../scenes/setupLights';
import setupRenderer from '../scenes/setupRenderer';
import { createRollerCoasterTrack } from '../objects/RollerCoasterTrack';
import { createSupportStructure } from '../objects/Support';
import { createEnvironment } from '../objects/Environment';
import TrainComposition from '../objects/TrainComposition';
import CameraController from '../utils/CameraController';
import FreeCameraController from '../utils/FreeCameraController';
import PhysicsEngine from '../utils/PhysicsEngine';
import { buildTrackData } from '../utils/TrackGenerator';
import { validateTrackContinuity } from '../utils/TrackValidator';
import {
  FPS_SMOOTHING,
  HUD_REFRESH_MS,
  PERFORMANCE_REFRESH_MS,
  PREDEFINED_TRACKS
} from '../utils/Constants';
import { useSimulationStore } from '../store/simulationStore';

const getTrackById = (trackId) =>
  PREDEFINED_TRACKS.find((track) => track.id === trackId) ?? PREDEFINED_TRACKS[0];

const disposeSceneBranch = (object) => {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => material.dispose?.());
    }
  });
};

function Scene({ mountRef }) {
  const selectedTrackId = useSimulationStore((state) => state.selectedTrackId);
  const simulationKey = useSimulationStore((state) => state.simulationKey);

  useEffect(() => {
    const mountNode = mountRef.current;

    if (!mountNode) {
      return undefined;
    }

    const store = useSimulationStore.getState();
    const setStatus = store.setStatus;
    const setTrackMeta = store.setTrackMeta;
    const updateMetrics = store.updateMetrics;
    const setPerformance = store.setPerformance;

    setStatus('Generating coaster scene...');

    const renderer = setupRenderer(mountNode);
    const scene = setupScene();
    const camera = setupCamera(mountNode);
    const lightRig = setupLights(scene);

    const trackConfig = getTrackById(selectedTrackId);
    const trackData = buildTrackData(trackConfig);
    const continuity = validateTrackContinuity(trackData.curve);
    const environment = createEnvironment(trackData);
    const trackGroup = createRollerCoasterTrack(trackData, trackConfig);
    const supportGroup = createSupportStructure(trackData, trackConfig);
    const train = new TrainComposition({
      color: trackConfig.color
    });

    scene.add(environment);
    scene.add(trackGroup);
    scene.add(supportGroup);
    scene.add(train.getMesh());

    const cameraController = new CameraController(camera, trackData, {
      viewMode: useSimulationStore.getState().viewMode,
      trainCarCount: train.carCount,
      trainCarSpacing: train.carSpacing
    });
    const freeCameraController = new FreeCameraController(camera, renderer.domElement, {
      moveSpeed: useSimulationStore.getState().freeCameraSpeed,
      sensitivity: useSimulationStore.getState().freeCameraMouseSensitivity,
      minimumHeight: 2,
      minimumClearance: 1.8,
      getHeightAt: environment.userData.getHeightAt,
      onSpeedChange: (speed) =>
        useSimulationStore.getState().setFreeCameraSpeed(speed)
    });

    const physicsEngine = new PhysicsEngine({
      trackData,
      initialSpeedKmh: trackConfig.suggestedSpeedKmh,
      friction: trackConfig.friction,
      rollingResistance: trackConfig.rollingResistance,
      minimumSpeedKmh: trackConfig.minimumSpeedKmh,
      boosterStrength: trackConfig.boosterStrength
    });

    physicsEngine.setSpeedLimitKmh(useSimulationStore.getState().speedLimitKmh);
    const initialSnapshot = physicsEngine.getSnapshot();
    cameraController.updatePosition(initialSnapshot.distance, train, initialSnapshot);

    if (useSimulationStore.getState().viewMode === 'freeCamera') {
      freeCameraController.reset();
    }

    setTrackMeta(trackData.length, trackData.sampleCount);
    updateMetrics({
      speedKmh: initialSnapshot.speedKmh,
      height: initialSnapshot.height,
      gForce: initialSnapshot.gForce,
      distance: initialSnapshot.cumulativeDistance,
      elapsedTime: initialSnapshot.elapsedTime,
      maxHeight: trackData.maxHeight,
      gradientDeg: initialSnapshot.gradientDeg,
      boosterActive: initialSnapshot.boosterActive,
      loopProgress: (initialSnapshot.distance / trackData.length) * 100,
      loopReady: continuity.isContinuous,
      continuityGap: continuity.continuityGap,
      tangentAlignment: continuity.tangentAlignment
    });
    setStatus(continuity.isContinuous ? 'Ready to ride' : 'Loop continuity warning');

    let rafId = 0;
    let previousTime = performance.now();
    let lastHudUpdate = previousTime;
    let lastPerformanceUpdate = previousTime;
    let currentSnapshot = initialSnapshot;
    let smoothedFps = 60;

    const handleResize = () => {
      const width = mountNode.clientWidth;
      const height = mountNode.clientHeight;

      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    const tick = (now) => {
      const deltaTime = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      rafId = window.requestAnimationFrame(tick);

      const currentState = useSimulationStore.getState();
      cameraController.setViewMode(currentState.viewMode);
      physicsEngine.setSpeedLimitKmh(currentState.speedLimitKmh);
      freeCameraController.setMoveSpeed(currentState.freeCameraSpeed);
      freeCameraController.setMouseSensitivity(
        currentState.freeCameraMouseSensitivity
      );

      if (currentState.isPlaying) {
        currentSnapshot = physicsEngine.update(deltaTime);
      }

      if (currentState.viewMode === 'freeCamera') {
        if (!freeCameraController.enabled) {
          freeCameraController.enable();
        }

        cameraController.updateTrainPosition(currentSnapshot.distance, train, currentSnapshot);
        freeCameraController.update(deltaTime);
      } else {
        if (freeCameraController.enabled) {
          freeCameraController.disable();
        }

        cameraController.updatePosition(currentSnapshot.distance, train, currentSnapshot);
      }

      smoothedFps =
        smoothedFps * (1 - FPS_SMOOTHING) +
        Math.max(1 / Math.max(deltaTime, 0.0001), 1) * FPS_SMOOTHING;

      if (now - lastHudUpdate >= HUD_REFRESH_MS) {
        updateMetrics({
          speedKmh: currentSnapshot.speedKmh,
          height: currentSnapshot.height,
          gForce: currentSnapshot.gForce,
          distance: currentSnapshot.cumulativeDistance,
          elapsedTime: currentSnapshot.elapsedTime,
          maxHeight: trackData.maxHeight,
          gradientDeg: currentSnapshot.gradientDeg,
          boosterActive: currentSnapshot.boosterActive,
          loopProgress: (currentSnapshot.distance / trackData.length) * 100,
          loopReady: continuity.isContinuous,
          continuityGap: continuity.continuityGap,
          tangentAlignment: continuity.tangentAlignment
        });
        lastHudUpdate = now;
      }

      if (now - lastPerformanceUpdate >= PERFORMANCE_REFRESH_MS) {
        setPerformance(smoothedFps);
        lastPerformanceUpdate = now;
      }

      lightRig.sunTarget.position.copy(currentSnapshot.point);
      renderer.render(scene, camera);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      lightRig.group.removeFromParent();
      environment.removeFromParent();
      trackGroup.removeFromParent();
      supportGroup.removeFromParent();
      train.getMesh().removeFromParent();
      freeCameraController.disable();
      freeCameraController.dispose();
      disposeSceneBranch(environment);
      disposeSceneBranch(trackGroup);
      disposeSceneBranch(supportGroup);
      disposeSceneBranch(train.getMesh());

      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [mountRef, selectedTrackId, simulationKey]);

  return null;
}

export default Scene;
