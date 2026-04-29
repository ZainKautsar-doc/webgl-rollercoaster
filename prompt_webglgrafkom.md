# Prompt: Perancangan Simulasi Pergerakan Kamera pada Jalur Roller Coaster 3D Berbasis WebGL

## 📋 Overview Proyek
Buat aplikasi web interaktif yang mensimulasikan pergerakan kamera sepanjang jalur roller coaster 3D menggunakan WebGL. Aplikasi harus menampilkan jalur roller coaster yang dapat divisualisasikan dari perspektif kamera yang bergerak mengikuti track dengan physics yang realistis.

## 🛠️ Tech Stack
- **Frontend Framework**: React 18+
- **Build Tool**: Vite
- **3D Graphics**: Three.js (terbaru)
- **Physics Engine**: Cannon.js (cannon-es)
- **UI Components**: HTML5 + CSS3 + Tailwind CSS (optional)
- **State Management**: Zustand
- **Animations**: GSAP
- **Development**: Node.js + npm

## 📁 Struktur Folder
```
webglgrafkom/
├── src/
│   ├── components/
│   │   ├── Canvas.jsx              # Three.js Canvas container
│   │   ├── UI/
│   │   │   ├── Controls.jsx        # Control panel
│   │   │   ├── InfoPanel.jsx       # Display info (speed, height, G-force)
│   │   │   └── Stats.jsx           # Performance stats
│   │   └── Scene.jsx               # Main scene component
│   ├── scenes/
│   │   ├── setupScene.js           # Three.js scene initialization
│   │   ├── setupCamera.js          # Camera setup & positioning
│   │   ├── setupLights.js          # Lighting configuration
│   │   └── setupRenderer.js        # WebGL renderer config
│   ├── objects/
│   │   ├── RollerCoasterTrack.js   # Track geometry & mesh
│   │   ├── Support.js              # Support structures
│   │   └── Environment.js          # Terrain, sky, environment
│   ├── utils/
│   │   ├── TrackGenerator.js       # Generate roller coaster path menggunakan Catmull-Rom Spline
│   │   ├── CameraController.js     # Control camera movement along track
│   │   ├── PhysicsEngine.js        # Physics calculations (gravity, speed, forces)
│   │   ├── MathUtils.js            # Vector math & interpolation utilities
│   │   └── Constants.js            # Project constants
│   ├── store/
│   │   └── simulationStore.js      # Zustand store untuk state management
│   ├── App.jsx                     # Main React component
│   ├── App.css                     # Main styles
│   └── main.jsx                    # Entry point
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

## 📦 Dependencies
Install dengan: `npm install`

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^r128",
    "cannon-es": "^0.20.0",
    "zustand": "^4.3.2",
    "gsap": "^3.12.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.2.0"
  }
}
```

## 🎯 Core Features yang Harus Diimplementasi

### 1. Track Generation
- Menggunakan **Catmull-Rom Spline** untuk membuat jalur yang smooth
- Support untuk multiple loops, corkscrews, dan drops
- Predefined tracks atau custom track creator
- Minimal 5 kontrol points yang dapat disesuaikan

### 2. Camera Movement
- Kamera mengikuti track path dengan smooth interpolation
- Speed control: adjustable dari 0-200 km/h
- Perspective: Realistic camera position (berada di ride kendaraan)
- Look-ahead function: Kamera melihat ke depan untuk antisipasi

### 3. Physics Simulation
- **Gravity**: Constant gravitational pull (9.8 m/s²)
- **Speed Calculation**: Berdasarkan ketinggian dan friction
- **G-Force**: Display realtime G-force forces yang dialami
- **Energy Conservation**: Momentum dan energy calculations

### 4. User Interface
- **Play/Pause Button**: Kontrol simulasi
- **Speed Slider**: Adjust kecepatan (0-200 km/h)
- **Camera Mode Toggle**: First-person view vs third-person
- **Track Selector**: Pilih jalur yang berbeda
- **Real-time Display**:
  - Current speed (km/h)
  - Current height (m)
  - G-Force reading
  - Distance traveled
  - Elapsed time

### 5. Visual Enhancement
- **Lighting**: Multiple light sources (ambient, directional, point lights)
- **Materials**: Realistic materials untuk track, supports, environment
- **Shadows**: Real-time shadows untuk depth perception
- **Anti-aliasing**: Smooth rendering
- **Post-processing**: Optional blur/motion effects saat high speed

## 🔧 Implementation Details

### TrackGenerator.js
```
- createCatmullRomCurve(controlPoints): Generate smooth path
- createTrackGeometry(curve): Build 3D mesh dari curve
- getPointAtDistance(distance): Get position at specific distance
- getTangent(t): Get direction tangent
- getNormal(t): Get normal vector untuk camera orientation
- calculateTrackLength(): Total path length
```

### CameraController.js
```
- updatePosition(distanceAlongTrack): Move camera along path
- setLookAhead(distance): Look ahead on path
- rotateToCameraAngle(angle): Bank camera with track
- setViewMode(firstPerson/thirdPerson): Toggle view modes
- interpolatePosition(t): Smooth position interpolation
```

### PhysicsEngine.js
```
- calculateSpeed(currentHeight, previousHeight, speed, friction): Physics-based speed
- calculateGForce(acceleration): Compute G-forces
- updateVelocity(distance, gravity): Velocity changes
- checkCollision(): Basic collision detection
- applyFriction(velocity): Friction simulation
```

## 📊 Predefined Tracks
Sediakan minimal 3 jalur predefined:
1. **Beginner Loop**: Simple circular loop
2. **Corkscrew Extreme**: Double corkscrew dengan drops
3. **Hypercoaster**: Long track dengan multiple elements

## 🎨 Visual Specifications
- **Canvas Size**: Full window (responsive)
- **Background**: Gradient skybox atau sky texture
- **Track Color**: Metallic (red/blue options)
- **Support Color**: Dark steel gray
- **Ambient Light**: Soft white (intensity 0.5)
- **Directional Light**: Simulated sunlight
- **Camera FOV**: 75 degrees
- **Render Resolution**: Device pixel ratio aware

## 🚀 Development Workflow
1. Setup Vite + React + Three.js
2. Implement basic scene rendering
3. Create track geometry dengan splines
4. Implement camera controller
5. Add physics calculations
6. Build UI controls
7. Add predefined tracks
8. Polish visuals & animations
9. Optimize performance

## 📝 Key Code Patterns

### Main App Loop
```javascript
- requestAnimationFrame untuk continuous rendering
- Delta time tracking untuk smooth physics
- Event listeners untuk user input
- State updates via Zustand store
```

### Three.js Setup
```javascript
- WebGLRenderer dengan antialias enabled
- PerspectiveCamera dengan proper aspect ratio
- Scene dengan multiple light sources
- Proper resource cleanup
```

### React Integration
```javascript
- useEffect untuk Three.js initialization
- useRef untuk canvas & Three objects
- Custom hooks untuk reusable logic
- Zustand stores untuk global state
```

## ✅ Acceptance Criteria
- ✅ Roller coaster track smooth dan jalan dengan physics yang realistis
- ✅ Kamera mengikuti track dengan natural movement
- ✅ UI controls responsive dan intuitif
- ✅ Real-time data display (speed, height, G-force) akurat
- ✅ Minimal 3 predefined tracks berbeda
- ✅ Smooth 60 FPS rendering
- ✅ Responsive design (desktop priority)
- ✅ Clean, well-organized code structure

## 🎓 Performance Optimization
- Use BufferGeometry untuk efficient rendering
- Implement LOD (Level of Detail) jika needed
- Use requestAnimationFrame untuk smooth animation
- Optimize material shaders
- Proper memory cleanup untuk Three.js objects

## 📚 References
- Three.js Documentation: https://threejs.org/docs/
- Catmull-Rom Spline: https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
- WebGL Best Practices: https://www.khronos.org/webgl/
- Physics Simulation: Newton's laws & kinematics formulas
- Three.js Examples: https://threejs.org/examples/

## 🎮 Nice-to-Have Features (Optional)
- POV video recording/playback
- Multiple camera angles switching
- Track editor mode untuk custom designs
- Sound effects (whoosh, wind, screams)
- Mobile touch controls
- Multiplayer/comparison mode
- Leaderboards untuk fastest speed
- VR compatibility
- Dark/light theme toggle

## 📝 Notes
- Use semantic HTML5 elements
- Follow React best practices
- Comment code untuk clarity
- Use meaningful variable names
- Modular component structure
- No external CSS frameworks required (but optional)
- Focus on desktop first, mobile responsiveness secondary
