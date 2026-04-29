# Prompt: Improvement & Refinement - Roller Coaster WebGL Project

## 🎯 Tujuan Utama
Memperbaiki layout UI agar rapih, menambah free camera mode, sempurnakan bentuk kereta dengan 4 gerbong, dan tingkatkan physics agar kereta kuat menanjak.

---

## 🎨 SECTION 1: UI Layout Refinement

### Problem Statement
- Renderer Stats, Live Ride Data, dan Simulation Controls saling tumpang tindih
- Layout tidak responsif dengan ukuran window berbeda
- Text dan element beberapa tidak terlihat jelas
- Spacing dan alignment tidak optimal

### Solution: Responsive Dashboard Layout

#### **Layout Architecture**
Gunakan **CSS Grid + Flexbox** untuk responsive layout:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────────────┐         ┌────────────────────┐  │
│  │ Simulation Controls  │         │  Live Ride Data    │  │
│  │  (Left Panel)        │         │  (Right Panel)     │  │
│  │                      │         │                    │  │
│  │  - Track Preset      │         │  - Current Speed   │  │
│  │  - Speed Cap         │         │  - Current Height  │  │
│  │  - Camera View       │         │  - G-Force         │  │
│  │  - Buttons           │         │  - Distance        │  │
│  │                      │         │  - Elapsed Time    │  │
│  └──────────────────────┘         └────────────────────┘  │
│                                                             │
│                  [3D CANVAS - CENTER]                      │
│                                                             │
│                  ┌─────────────────────┐                   │
│                  │ Renderer Stats      │                   │
│                  │  (Bottom Center)    │                   │
│                  │                     │                   │
│                  │ - FPS               │                   │
│                  │ - Track Length      │                   │
│                  │ - Spline Samples    │                   │
│                  │ - Performance Notes │                   │
│                  └─────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### **CSS Modifications**
Gunakan **CSS Grid** untuk overall page layout:

```css
/* Main container */
.app-container {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  grid-template-rows: 1fr auto;
  height: 100vh;
  gap: 12px;
  padding: 12px;
  background: #0a0e27;
}

/* Left panel - Simulation Controls */
.simulation-controls {
  grid-column: 1;
  grid-row: 1;
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 24px);
  backdrop-filter: blur(10px);
}

/* Center canvas */
#canvas-container {
  grid-column: 2;
  grid-row: 1 / 3;
  background: #0a0e27;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Right panel - Live Ride Data */
.live-ride-data {
  grid-column: 3;
  grid-row: 1;
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(50vh - 12px);
  backdrop-filter: blur(10px);
}

/* Bottom stats */
.renderer-stats {
  grid-column: 2;
  grid-row: 2;
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: 12px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  max-height: 120px;
  backdrop-filter: blur(10px);
}

/* Responsive untuk smaller screens */
@media (max-width: 1400px) {
  .app-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto auto;
  }
  
  .simulation-controls,
  .live-ride-data,
  .renderer-stats {
    grid-column: 1;
  }
}
```

#### **Component Improvements**

1. **Simulation Controls Panel**
   - Background: Semi-transparent dark dengan blur effect
   - Border: Subtle blue glow
   - Scrollable jika content melebihi ukuran
   - Clear section dividers

2. **Live Ride Data Panel**
   - Grid 2x3 untuk 6 data points
   - Larger font untuk readability
   - Real-time update animation (fade in/out)
   - Color coding: green untuk normal, yellow untuk warning, red untuk extreme

3. **Renderer Stats Panel**
   - Horizontal layout (4 columns)
   - Icon + label + value structure
   - Bottom positioned agar tidak overlap
   - Performance indicator color

#### **Visual Enhancements**
```css
/* Glow effect untuk panel aktif */
.panel-active {
  box-shadow: 0 0 20px rgba(100, 200, 255, 0.4),
              inset 0 0 20px rgba(100, 200, 255, 0.1);
}

/* Smooth transitions */
.stat-value {
  transition: all 0.3s ease;
  font-feature-settings: "tnum";
}

/* Color indicators */
.speed-safe { color: #4ade80; }
.speed-warning { color: #facc15; }
.speed-danger { color: #ef4444; }

.gforce-safe { color: #4ade80; }
.gforce-high { color: #f97316; }
.gforce-extreme { color: #ef4444; }
```

---

## 🎥 SECTION 2: Free Camera Mode

### Feature Requirements

#### **Free Camera Implementation**
- **Toggle**: Button "Free Camera" di Simulation Controls
- **Controls**:
  - **Mouse**: Right-click drag untuk rotate
  - **Keyboard**: WASD untuk movement (speed adjustable)
  - **Mouse Wheel**: Zoom in/out
  - **Space/Ctrl**: Up/down movement

#### **Code Structure**

```javascript
// freeCameraController.js

export class FreeCameraController {
  constructor(camera) {
    this.camera = camera;
    this.enabled = false;
    this.speed = 50; // units per second
    this.sensitivity = 0.003;
    
    // Movement tracking
    this.keys = {};
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.PI_2 = Math.PI / 2;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.keys[e.key] = true);
    document.addEventListener('keyup', (e) => this.keys[e.key] = false);
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
    document.addEventListener('wheel', (e) => this.onMouseWheel(e));
  }
  
  update(deltaTime) {
    if (!this.enabled) return;
    
    // Handle WASD movement
    const moveVector = new THREE.Vector3();
    if (this.keys['w'] || this.keys['W']) moveVector.z -= 1;
    if (this.keys['s'] || this.keys['S']) moveVector.z += 1;
    if (this.keys['a'] || this.keys['A']) moveVector.x -= 1;
    if (this.keys['d'] || this.keys['D']) moveVector.x += 1;
    if (this.keys[' ']) moveVector.y += 1;
    if (this.keys['Control']) moveVector.y -= 1;
    
    // Normalize dan apply
    if (moveVector.length() > 0) {
      moveVector.normalize();
      moveVector.multiplyScalar(this.speed * deltaTime);
      moveVector.applyEuler(this.euler);
      this.camera.position.add(moveVector);
    }
  }
  
  enable() {
    this.enabled = true;
    document.body.style.cursor = 'grabbing';
  }
  
  disable() {
    this.enabled = false;
    document.body.style.cursor = 'auto';
  }
  
  onMouseMove(event) {
    if (!this.isMouseDown) return;
    
    const deltaX = event.movementX * this.sensitivity;
    const deltaY = event.movementY * this.sensitivity;
    
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.rotateY(-deltaX);
    this.euler.rotateX(-deltaY);
    this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));
    
    this.camera.quaternion.setFromEuler(this.euler);
  }
  
  onMouseDown(event) {
    if (event.button === 2) { // Right click
      this.isMouseDown = true;
      event.preventDefault();
    }
  }
  
  onMouseUp(event) {
    if (event.button === 2) {
      this.isMouseDown = false;
    }
  }
  
  onMouseWheel(event) {
    event.preventDefault();
    const direction = this.camera.getWorldDirection(new THREE.Vector3());
    const zoomSpeed = 5;
    const moveDistance = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    direction.multiplyScalar(moveDistance);
    this.camera.position.add(direction);
  }
}
```

#### **Integration ke Simulation Controls**
```javascript
// simulationStore.js (Zustand)

export const useSimulationStore = create((set) => ({
  freeCameraMode: false,
  toggleFreeCamera: () => set((state) => ({
    freeCameraMode: !state.freeCameraMode
  })),
  
  freeCameraSpeed: 50,
  setFreeCameraSpeed: (speed) => set({ freeCameraSpeed: speed })
}));
```

#### **UI Button**
```jsx
// Components/UI/Controls.jsx

import { useSimulationStore } from '../../store/simulationStore';

export function FreeCameraToggle() {
  const { freeCameraMode, toggleFreeCamera } = useSimulationStore();
  
  return (
    <button
      onClick={toggleFreeCamera}
      className={`free-camera-btn ${freeCameraMode ? 'active' : ''}`}
    >
      📷 Free Camera
      {freeCameraMode && <span className="indicator">ON</span>}
    </button>
  );
}
```

---

## 🚂 SECTION 3: Sempurnakan Kereta (Train Car)

### Current Issues
- Bentuk masih sederhana/belum detail
- Hanya 1 gerbong, perlu 4 gerbong

### Solusi: Advanced Train Geometry

#### **Spesifikasi Kereta**

```javascript
// objects/TrainCar.js

export class TrainCar {
  constructor(position = new THREE.Vector3(), carIndex = 0) {
    this.group = new THREE.Group();
    this.carIndex = carIndex;
    this.position = position;
    
    this.createTrainCar();
  }
  
  createTrainCar() {
    // Main body - sleek design
    const bodyGeometry = new THREE.BoxGeometry(1.2, 1.0, 2.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      shininess: 100,
      metalness: 0.8,
      emissive: 0x003300
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    this.group.add(body);
    
    // Cabin/cockpit - front section
    const cabinGeometry = new THREE.ConeGeometry(0.6, 1.0, 8);
    const cabinMaterial = new THREE.MeshPhongMaterial({
      color: 0x44aa44,
      shininess: 120
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 1.2, 1.3);
    cabin.castShadow = true;
    this.group.add(cabin);
    
    // Windows - untuk realism
    this.createWindows();
    
    // Wheels/bogies
    this.createWheels();
    
    // Safety restraints bar
    this.createSafetyBar();
    
    // Connectors - untuk connect antar gerbong
    this.createConnectors();
    
    this.group.position.copy(this.position);
    this.group.castShadow = true;
    this.group.receiveShadow = true;
  }
  
  createWindows() {
    const windowMaterial = new THREE.MeshPhongMaterial({
      color: 0x6699ff,
      shininess: 200,
      transparent: true,
      opacity: 0.6
    });
    
    // Side windows
    for (let i = 0; i < 2; i++) {
      const windowGeometry = new THREE.PlaneGeometry(0.4, 0.5);
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(
        i === 0 ? -0.65 : 0.65,
        1.0,
        -0.5
      );
      window.castShadow = true;
      this.group.add(window);
    }
  }
  
  createWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      shininess: 30
    });
    
    // Front wheels
    for (let i = 0; i < 2; i++) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(i === 0 ? -0.6 : 0.6, 0.35, 0.8);
      wheel.castShadow = true;
      this.group.add(wheel);
    }
    
    // Rear wheels
    for (let i = 0; i < 2; i++) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(i === 0 ? -0.6 : 0.6, 0.35, -0.8);
      wheel.castShadow = true;
      this.group.add(wheel);
    }
  }
  
  createSafetyBar() {
    const barGeometry = new THREE.BoxGeometry(1.5, 0.08, 0.08);
    const barMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      shininess: 100
    });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.y = 1.5;
    bar.castShadow = true;
    this.group.add(bar);
  }
  
  createConnectors() {
    // Connection point untuk coupler ke gerbong berikutnya
    const couplerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.4);
    const couplerMaterial = new THREE.MeshPhongMaterial({
      color: 0x555555,
      shininess: 50
    });
    const coupler = new THREE.Mesh(couplerGeometry, couplerMaterial);
    coupler.position.z = -1.3;
    coupler.name = 'coupler';
    this.group.add(coupler);
  }
  
  getMesh() {
    return this.group;
  }
  
  setPosition(position) {
    this.group.position.copy(position);
  }
  
  setRotation(quaternion) {
    this.group.quaternion.copy(quaternion);
  }
}
```

#### **Train Composition (4 Gerbong)**

```javascript
// objects/TrainComposition.js

export class TrainComposition {
  constructor() {
    this.cars = [];
    this.group = new THREE.Group();
    this.carSpacing = 2.8; // Jarak antar gerbong
    
    this.createComposition();
  }
  
  createComposition() {
    // Create 4 connected train cars
    for (let i = 0; i < 4; i++) {
      const position = new THREE.Vector3(0, 0, -i * this.carSpacing);
      const car = new TrainCar(position, i);
      this.cars.push(car);
      this.group.add(car.getMesh());
    }
  }
  
  updatePosition(trackPoint, trackQuaternion) {
    // Update position dan rotation semua gerbong
    this.group.position.copy(trackPoint);
    this.group.quaternion.copy(trackQuaternion);
  }
  
  getMesh() {
    return this.group;
  }
  
  getCenterOfMass() {
    // Return pusat massa untuk physics calculations
    const cg = new THREE.Vector3();
    this.cars.forEach((car, idx) => {
      const carPos = car.getMesh().position;
      cg.add(carPos);
    });
    cg.divideScalar(this.cars.length);
    return cg;
  }
  
  getLength() {
    return this.carSpacing * this.cars.length;
  }
}
```

#### **Integration ke Scene**

```javascript
// scenes/setupScene.js

import { TrainComposition } from '../objects/TrainComposition';

export function setupTrainInScene(scene) {
  const train = new TrainComposition();
  scene.add(train.getMesh());
  return train;
}
```

---

## ⚡ SECTION 4: Tingkatkan Physics untuk Naik Kuat

### Current Issue
- Kereta berhenti saat menanjak
- Physics tidak cukup kuat
- Energy loss terlalu besar

### Solusi: Enhanced Physics Engine

#### **Improved Speed Calculation**

```javascript
// utils/PhysicsEngine.js

export class PhysicsEngine {
  constructor(config = {}) {
    this.gravity = config.gravity || 9.8;
    this.friction = config.friction || 0.02; // Reduced dari 0.05
    this.rollingResistance = config.rollingResistance || 0.001;
    this.initialSpeed = config.initialSpeed || 150; // km/h pada start
    this.maxSpeed = config.maxSpeed || 200; // km/h
    
    // Energy boosters untuk steep sections
    this.useEnergyBoosters = true;
  }
  
  calculateSpeed(
    currentHeight,
    previousHeight,
    currentSpeed,
    trackGradient, // Slope angle
    deltaTime
  ) {
    // Convert speeds: km/h ke m/s
    let speedMs = currentSpeed / 3.6;
    
    // 1. Gravitational acceleration (downhill benefit)
    const heightDifference = previousHeight - currentHeight; // Positive when going down
    const gravitationalForce = this.gravity * Math.sin(trackGradient);
    
    // 2. Friction and air resistance
    const frictionForce = -this.friction * speedMs;
    const rollingResistanceForce = -this.rollingResistance * speedMs * speedMs;
    
    // 3. Net acceleration
    const acceleration = gravitationalForce + frictionForce + rollingResistanceForce;
    
    // 4. Update speed
    speedMs += acceleration * deltaTime;
    
    // 5. Energy booster untuk uphill steep sections
    if (trackGradient > 0.3 && speedMs < 20) { // Steep uphill, slow speed
      speedMs += 2 * deltaTime; // Give it boost
    }
    
    // 6. Clamp speeds
    speedMs = Math.max(5, Math.min(speedMs, this.maxSpeed / 3.6));
    
    // Convert back to km/h
    return speedMs * 3.6;
  }
  
  calculateGForce(acceleration, radius = 100) {
    // G-Force = centripetal + gravitational
    const centripetal = (acceleration * acceleration) / (radius * this.gravity);
    const vertical = 1.0; // 1G gravity
    const total = Math.sqrt(centripetal * centripetal + vertical * vertical);
    return total;
  }
  
  // Helper untuk track gradient
  getTrackGradient(tangent, upDirection = new THREE.Vector3(0, 1, 0)) {
    // Angle antara track direction dan vertical
    const dot = Math.max(-1, Math.min(1, tangent.dot(upDirection)));
    return Math.asin(dot);
  }
}
```

#### **Improved Camera Controller dengan Physics**

```javascript
// utils/CameraController.js

export class CameraController {
  constructor(camera, track, physicsEngine) {
    this.camera = camera;
    this.track = track;
    this.physics = physicsEngine;
    
    this.distanceAlongTrack = 0;
    this.currentSpeed = 150; // km/h (start)
    this.lookAhead = 15; // meters
    this.deltaTime = 0;
  }
  
  update(deltaTime) {
    this.deltaTime = deltaTime;
    
    // Get current position on track
    const trackLength = this.track.getLength();
    const currentPoint = this.track.getPointAtDistance(this.distanceAlongTrack);
    const currentHeight = currentPoint.y;
    
    // Get previous position untuk height difference
    const prevPoint = this.track.getPointAtDistance(
      Math.max(0, this.distanceAlongTrack - 0.1)
    );
    const previousHeight = prevPoint.y;
    
    // Get track gradient
    const tangent = this.track.getTangent(this.distanceAlongTrack / trackLength);
    const gradient = this.physics.getTrackGradient(tangent);
    
    // Calculate new speed dengan physics
    this.currentSpeed = this.physics.calculateSpeed(
      currentHeight,
      previousHeight,
      this.currentSpeed,
      gradient,
      deltaTime
    );
    
    // Move along track
    const distanceToMove = (this.currentSpeed / 3.6) * deltaTime; // m/s * s = m
    this.distanceAlongTrack += distanceToMove;
    
    // Loop ketika mencapai akhir
    if (this.distanceAlongTrack > trackLength) {
      this.distanceAlongTrack = 0;
      this.currentSpeed = 150; // Reset speed
    }
    
    // Update camera position
    const nextPoint = this.track.getPointAtDistance(this.distanceAlongTrack);
    const lookAheadPoint = this.track.getPointAtDistance(
      Math.min(trackLength, this.distanceAlongTrack + this.lookAhead)
    );
    
    // Set camera position (slightly above track)
    this.camera.position.copy(nextPoint);
    this.camera.position.y += 0.8; // Rider eye height
    
    // Look ahead
    this.camera.lookAt(lookAheadPoint);
    
    // Get rotation untuk train visualization
    const trackQuaternion = this.getTrackQuaternion(nextPoint, lookAheadPoint);
    
    return {
      position: nextPoint,
      quaternion: trackQuaternion,
      speed: this.currentSpeed,
      height: currentHeight,
      distance: this.distanceAlongTrack
    };
  }
  
  getTrackQuaternion(from, to) {
    const direction = new THREE.Vector3().subVectors(to, from).normalize();
    const axis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
    const angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(direction));
    return new THREE.Quaternion().setFromAxisAngle(axis, angle);
  }
  
  getGForce() {
    const trackLength = this.track.getLength();
    const t = this.distanceAlongTrack / trackLength;
    const radius = 50; // Curve radius estimation
    const acceleration = (this.currentSpeed / 3.6) * (this.currentSpeed / 3.6) / radius;
    return this.physics.calculateGForce(acceleration, radius);
  }
  
  setSpeed(speed) {
    this.currentSpeed = speed;
  }
  
  getCurrentSpeed() {
    return this.currentSpeed;
  }
}
```

#### **Configuration untuk Different Tracks**

```javascript
// utils/TrackConfigs.js

export const TRACK_CONFIGS = {
  beginner: {
    friction: 0.02,
    rollingResistance: 0.001,
    initialSpeed: 100,
    maxSpeed: 150,
    description: 'Simple loop, slow and safe'
  },
  
  corkscrew: {
    friction: 0.018,
    rollingResistance: 0.0008,
    initialSpeed: 120,
    maxSpeed: 180,
    description: 'Double corkscrew, moderate thrill'
  },
  
  hypercoaster: {
    friction: 0.015,
    rollingResistance: 0.0005,
    initialSpeed: 150,
    maxSpeed: 200,
    description: 'Long hills and drops, maximum speed'
  }
};

export function getPhysicsConfig(trackName) {
  return TRACK_CONFIGS[trackName] || TRACK_CONFIGS.beginner;
}
```

---

## 🔧 SECTION 5: Integration Checklist

### Code Changes Required

- [ ] **UI Layout**: Update App.jsx dengan CSS Grid layout
- [ ] **Free Camera**: Tambah FreeCameraController.js
- [ ] **Train Cars**: Buat TrainCar.js dan TrainComposition.js
- [ ] **Physics**: Update PhysicsEngine.js dengan new calculations
- [ ] **Camera Controller**: Upgrade CameraController.js
- [ ] **UI Components**: Update Controls.jsx, LiveRideData.jsx, RendererStats.jsx
- [ ] **Scene Setup**: Integrate train composition ke scene

### Testing Points

- [ ] UI panels tidak overlapping pada berbagai window size
- [ ] Free camera controls responsive (WASD, mouse, wheel)
- [ ] Train composition 4 gerbong muncul correct
- [ ] Speed meningkat saat downhill, maintain saat uphill
- [ ] Kereta tidak berhenti di uphill steep
- [ ] G-Force display accurate
- [ ] FPS stable di 60 fps
- [ ] Smooth transitions antara camera modes

---

## 📊 Performance Optimization Tips

1. **LOD (Level of Detail)**: Reduce train detail saat jauh dari camera
2. **Instancing**: Gunakan InstancedMesh untuk repeated geometries
3. **Texture Compression**: Use WebP textures
4. **Shadow Maps**: Optimize shadow rendering quality
5. **Physics Calculations**: Only calculate visible sections

---

## 🎨 Visual Polish

- Add trail/motion blur pada high speeds
- Particle effects untuk wind/air
- Sound effects (engine sounds, air whoosh)
- Camera shake pada high G-forces
- Dynamic lighting changes

---

## 📝 Additional Notes

- Test extensively di berbagai browser (Chrome, Firefox, Safari, Edge)
- Monitor memory usage dengan DevTools
- Profile performance dengan Chrome DevTools Performance tab
- Keep code modular untuk easy maintenance
- Document functions dan complex algorithms
