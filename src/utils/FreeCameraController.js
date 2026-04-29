import * as THREE from 'three';
import { clamp } from './MathUtils';

class FreeCameraController {
  constructor(camera, domElement, options = {}) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = false;
    this.moveSpeed = options.moveSpeed ?? 40;
    this.minSpeed = 10;
    this.maxSpeed = 100;
    this.keys = {};
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.pitch = 0;
    this.yaw = 0;
    this.sensitivity = options.sensitivity ?? 0.003;
    this.maxPitch = Math.PI / 2.5;
    this.minPitch = -Math.PI / 2.5;
    this.acceleration = 150;
    this.friction = 0.84;
    this.sprintMultiplier = 2;
    this.isSprinting = false;
    this.isLooking = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.minimumClearance = options.minimumClearance ?? 1.8;
    this.minimumHeight = options.minimumHeight ?? 2;
    this.getHeightAt = options.getHeightAt ?? null;
    this.onSpeedChange = options.onSpeedChange ?? null;

    this.boundHandlers = {
      keydown: (event) => this.onKeyDown(event),
      keyup: (event) => this.onKeyUp(event),
      mousemove: (event) => this.onMouseMove(event),
      mousedown: (event) => this.onMouseDown(event),
      mouseup: (event) => this.onMouseUp(event),
      wheel: (event) => this.onWheel(event),
      blur: () => this.onBlur(),
      contextmenu: (event) => this.onContextMenu(event)
    };

    this.setupEventListeners();
    this.reset();
  }

  setupEventListeners() {
    window.addEventListener('keydown', this.boundHandlers.keydown);
    window.addEventListener('keyup', this.boundHandlers.keyup);
    window.addEventListener('mousemove', this.boundHandlers.mousemove);
    window.addEventListener('mouseup', this.boundHandlers.mouseup);
    window.addEventListener('blur', this.boundHandlers.blur);
    this.domElement.addEventListener('mousedown', this.boundHandlers.mousedown);
    this.domElement.addEventListener('wheel', this.boundHandlers.wheel, {
      passive: false
    });
    this.domElement.addEventListener('contextmenu', this.boundHandlers.contextmenu);
  }

  dispose() {
    window.removeEventListener('keydown', this.boundHandlers.keydown);
    window.removeEventListener('keyup', this.boundHandlers.keyup);
    window.removeEventListener('mousemove', this.boundHandlers.mousemove);
    window.removeEventListener('mouseup', this.boundHandlers.mouseup);
    window.removeEventListener('blur', this.boundHandlers.blur);
    this.domElement.removeEventListener('mousedown', this.boundHandlers.mousedown);
    this.domElement.removeEventListener('wheel', this.boundHandlers.wheel);
    this.domElement.removeEventListener('contextmenu', this.boundHandlers.contextmenu);
  }

  onBlur() {
    this.keys = {};
    this.isLooking = false;
    this.isSprinting = false;
    document.body.style.cursor = this.enabled ? 'grab' : 'auto';
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    this.keys[key] = true;

    if (key === 'shift') {
      this.isSprinting = true;
    }
  }

  onKeyUp(event) {
    const key = event.key.toLowerCase();
    this.keys[key] = false;

    if (key === 'shift') {
      this.isSprinting = false;
    }
  }

  onMouseDown(event) {
    if (!this.enabled || event.button !== 2) {
      return;
    }

    this.isLooking = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    document.body.style.cursor = 'grabbing';
    event.preventDefault();
  }

  onMouseUp(event) {
    if (event.button !== 2) {
      return;
    }

    this.isLooking = false;
    document.body.style.cursor = this.enabled ? 'grab' : 'auto';
  }

  onMouseMove(event) {
    if (!this.enabled || !this.isLooking) {
      return;
    }

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.yaw -= deltaX * this.sensitivity;
    this.pitch = clamp(
      this.pitch - deltaY * this.sensitivity,
      this.minPitch,
      this.maxPitch
    );

    this.applyEulerRotation();
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  onWheel(event) {
    if (!this.enabled) {
      return;
    }

    event.preventDefault();
    const nextSpeed = clamp(
      this.moveSpeed + (event.deltaY > 0 ? -4 : 4),
      this.minSpeed,
      this.maxSpeed
    );
    this.moveSpeed = nextSpeed;
    this.onSpeedChange?.(nextSpeed);
  }

  onContextMenu(event) {
    if (this.enabled) {
      event.preventDefault();
    }
  }

  applyEulerRotation() {
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  syncEulerFromCamera() {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(this.camera.quaternion, 'YXZ');
    this.pitch = clamp(euler.x, this.minPitch, this.maxPitch);
    this.yaw = euler.y;
    this.applyEulerRotation();
  }

  getCurrentFloorHeight() {
    if (!this.getHeightAt) {
      return this.minimumHeight;
    }

    return this.getHeightAt(this.camera.position.x, this.camera.position.z) + this.minimumClearance;
  }

  setMoveSpeed(speed) {
    this.moveSpeed = clamp(speed, this.minSpeed, this.maxSpeed);
  }

  setMouseSensitivity(sensitivity) {
    this.sensitivity = clamp(sensitivity, 0.0005, 0.01);
  }

  teleportTo(position) {
    this.camera.position.copy(position);
    const floorHeight = this.getCurrentFloorHeight();
    if (this.camera.position.y < floorHeight) {
      this.camera.position.y = floorHeight;
    }
  }

  enable() {
    this.enabled = true;
    this.syncEulerFromCamera();
    document.body.style.cursor = 'grab';
  }

  disable() {
    this.enabled = false;
    this.keys = {};
    this.isLooking = false;
    this.isSprinting = false;
    this.velocity.set(0, 0, 0);
    document.body.style.cursor = 'auto';
  }

  reset() {
    this.camera.position.set(0, 30, 50);
    this.camera.lookAt(0, 15, 0);
    this.velocity.set(0, 0, 0);
    this.syncEulerFromCamera();
  }

  update(deltaTime) {
    if (!this.enabled) {
      return;
    }

    this.direction.set(0, 0, 0);

    if (this.keys.w || this.keys.arrowup) {
      this.direction.z -= 1;
    }
    if (this.keys.s || this.keys.arrowdown) {
      this.direction.z += 1;
    }
    if (this.keys.a || this.keys.arrowleft) {
      this.direction.x -= 1;
    }
    if (this.keys.d || this.keys.arrowright) {
      this.direction.x += 1;
    }
    if (this.keys.q) {
      this.direction.y -= 1;
    }
    if (this.keys.e) {
      this.direction.y += 1;
    }

    const currentSpeed = this.isSprinting
      ? this.moveSpeed * this.sprintMultiplier
      : this.moveSpeed;

    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
      this.direction.applyQuaternion(this.camera.quaternion);
      this.velocity.addScaledVector(
        this.direction,
        currentSpeed * this.acceleration * deltaTime
      );
    } else {
      this.velocity.multiplyScalar(Math.pow(this.friction, deltaTime * 60));
    }

    if (this.velocity.length() > currentSpeed) {
      this.velocity.normalize().multiplyScalar(currentSpeed);
    }

    this.camera.position.addScaledVector(this.velocity, deltaTime);

    const floorHeight = this.getCurrentFloorHeight();
    if (this.camera.position.y < floorHeight) {
      this.camera.position.y = floorHeight;
      if (this.velocity.y < 0) {
        this.velocity.y = 0;
      }
    }
  }
}

export default FreeCameraController;
