import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import React, { useEffect, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  InstancedMesh,
  MathUtils,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  ShaderChunk,
  SphereGeometry,
  SRGBColorSpace,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
  type WebGLRendererParameters,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

gsap.registerPlugin(Observer);

/* ------------------------------------------------------------------ */
/*  Shared temp objects (avoid per-frame allocations)                 */
/* ------------------------------------------------------------------ */
// const _tmpPos = new Vector3();
// const _tmpVel = new Vector3();
// const _tmpOtherPos = new Vector3();
// const _tmpOtherVel = new Vector3();
// const _tmpDiff = new Vector3();
// const _tmpCorrection = new Vector3();
// const _tmpVelCorrection = new Vector3();
// const _tmpFirst = new Vector3();
const _matrixDummy = new Object3D();

/* ------------------------------------------------------------------ */
/*  Renderer / Scene container                                        */
/* ------------------------------------------------------------------ */
interface XConfig {
  canvas?: HTMLCanvasElement;
  id?: string;
  rendererOptions?: Partial<WebGLRendererParameters>;
  size?: 'parent' | { width: number; height: number };
}

interface SizeData {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
}

class X {
  #config: XConfig;
  #postprocessing: any;
  #resizeObserver?: ResizeObserver;
  #intersectionObserver?: IntersectionObserver;
  #resizeTimer?: number;
  #animationFrameId = 0;
  #timer = new Timer();
  #animationState = { elapsed: 0, delta: 0 };
  #isAnimating = false;
  #isVisible = false;
  #userPaused = false;

  // Bound handlers stored so they can actually be removed later
  #onResizeBound = this.#onResize.bind(this);
  #onVisibilityChangeBound = this.#onVisibilityChange.bind(this);

  canvas!: HTMLCanvasElement;
  camera!: PerspectiveCamera;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  cameraFov!: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene!: Scene;
  renderer!: WebGLRenderer;
  size: SizeData = {
    width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0,
  };

  render: () => void = this.#render.bind(this);
  onBeforeRender: (s: { elapsed: number; delta: number }) => void = () => {};
  onAfterRender: (s: { elapsed: number; delta: number }) => void = () => {};
  onAfterResize: (s: SizeData) => void = () => {};
  isDisposed = false;
  get paused() { return this.#userPaused; }
  set paused(value: boolean) {
    if (this.#userPaused === value) return;
    this.#userPaused = value;
    if (value) {
      this.#stopAnimation();
    } else if (this.#isAnimating) {
      // Resume only if still on-screen and tab is visible
      if (!document.hidden) this.#startAnimation();
    }
  }
  
  constructor(config: XConfig) {
    this.#config = { ...config };
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
    this.scene = new Scene();
    this.#initRenderer();
    this.resize();
    this.#initObservers();
  }

#initRenderer() {
  if (this.#config.canvas) {
    this.canvas = this.#config.canvas;
  } else if (this.#config.id) {
    const elem = document.getElementById(this.#config.id);
    if (elem instanceof HTMLCanvasElement) this.canvas = elem;
  }
  if (!this.canvas) {
    throw new Error('Three: Missing canvas or id parameter');
  }
  this.canvas.style.display = 'block';
  this.renderer = new WebGLRenderer({
    canvas: this.canvas,
    powerPreference: 'high-performance',
    ...(this.#config.rendererOptions ?? {}),
  });
  this.renderer.outputColorSpace = SRGBColorSpace;
}


  #onResize() {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
    this.#resizeTimer = window.setTimeout(() => this.resize(), 100);
  }

  resize() {
    let w: number, h: number;
    if (this.#config.size instanceof Object) {
      w = this.#config.size.width;
      h = this.#config.size.height;
    } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
      const parent = this.canvas.parentNode as HTMLElement;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
    } else {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    this.size.width = w;
    this.size.height = h;
    this.size.ratio = w / h;
    this.#updateCamera();
    this.#updateRenderer();
    this.onAfterResize(this.size);
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFov(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  #adjustFov(aspect: number) {
    const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
    const newTan = tanFov / (this.camera.aspect / aspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    }
  }

  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#postprocessing?.setSize(this.size.width, this.size.height);
    let pr = window.devicePixelRatio;
    if (this.maxPixelRatio && pr > this.maxPixelRatio) pr = this.maxPixelRatio;
    else if (this.minPixelRatio && pr < this.minPixelRatio) pr = this.minPixelRatio;
    this.renderer.setPixelRatio(pr);
    this.size.pixelRatio = pr;
  }

  get postprocessing() { return this.#postprocessing; }
  set postprocessing(value: any) {
    this.#postprocessing = value;
    this.render = value.render.bind(value);
  }

  #startAnimation() {
    if (this.#isVisible) return;
    const tick = () => {
      this.#animationFrameId = requestAnimationFrame(tick);
      this.#timer.update();
      this.#animationState.delta = this.#timer.getDelta();
      this.#animationState.elapsed += this.#animationState.delta;
      this.onBeforeRender(this.#animationState);
      this.render();
      this.onAfterRender(this.#animationState);
    };
    this.#isVisible = true;
    this.#timer.reset();
    tick();
  }

  #stopAnimation() {
    if (this.#isVisible) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#isVisible = false;
    }
  }

  #render() {
    this.renderer.render(this.scene, this.camera);
  }

 #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#onResizeBound);
      if (this.#config.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResizeBound);
        this.#resizeObserver.observe(this.canvas.parentNode as Element);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.#isAnimating = entries[0].isIntersecting;
        if (this.#userPaused) return;          // 👈 respect user pause
        this.#isAnimating ? this.#startAnimation() : this.#stopAnimation();
      },
      { root: null, rootMargin: '0px', threshold: 0 },
    );
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#onVisibilityChangeBound);
  }

  #onVisibilityChange() {
    if (this.#isAnimating && !this.#userPaused) {  // 👈 respect user pause
      document.hidden ? this.#stopAnimation() : this.#startAnimation();
    }
  }


  clear() {
    this.scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material;
        for (const key in mat) {
          const v = mat[key];
          if (v && typeof v === 'object' && typeof v.dispose === 'function') v.dispose();
        }
        mat.dispose();
        obj.geometry?.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    // ✅ Now actually removes listeners (no more .bind() bug)
    window.removeEventListener('resize', this.#onResizeBound);
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.#onVisibilityChangeBound);

    this.#stopAnimation();
    this.#timer.dispose();
    this.clear();
    this.#postprocessing?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.isDisposed = true;
  }
}

/* ------------------------------------------------------------------ */
/*  Physics (heavily optimized — works directly with Float32Arrays)   */
/* ------------------------------------------------------------------ */
interface WConfig {
  count: number;
  maxX: number; maxY: number; maxZ: number;
  maxSize: number; minSize: number; size0: number;
  gravity: number; friction: number;
  wallBounce: number; maxVelocity: number;
  controlSphere0?: boolean;
  followCursor?: boolean;
}

class W {
  config: WConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center = new Vector3();

  constructor(config: WConfig) {
    this.config = config;
    const n = config.count;
    this.positionData = new Float32Array(3 * n);
    this.velocityData = new Float32Array(3 * n);
    this.sizeData = new Float32Array(n);
    this.#initializePositions();
    this.setSizes();
  }

  #initializePositions() {
    const { config, positionData } = this;
    // first sphere stays at center (0,0,0)
    for (let i = 1; i < config.count; i++) {
      const idx = 3 * i;
      positionData[idx]     = MathUtils.randFloatSpread(2 * config.maxX);
      positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
      positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
    }
  }

  update(deltaInfo: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData } = this;
    const { count, gravity, friction, maxVelocity, wallBounce,
            maxX, maxY, maxZ, maxSize } = config;

    let startIdx = 0;

    // --- Sphere 0 follows cursor center ---
    if (config.controlSphere0) {
      startIdx = 1;
      positionData[0] += (center.x - positionData[0]) * 0.1;
      positionData[1] += (center.y - positionData[1]) * 0.1;
      positionData[2] += (center.z - positionData[2]) * 0.1;
      velocityData[0] = 0;
      velocityData[1] = 0;
      velocityData[2] = 0;
    }

    // --- Integration step (no Vector3 allocations) ---
    const maxVelSq = maxVelocity * maxVelocity;
    for (let idx = startIdx; idx < count; idx++) {
      const base = 3 * idx;

      // gravity
      velocityData[base + 1] -= deltaInfo.delta * gravity * sizeData[idx];

      // friction
      velocityData[base]     *= friction;
      velocityData[base + 1] *= friction;
      velocityData[base + 2] *= friction;

      // clamp velocity length
      const vx = velocityData[base];
      const vy = velocityData[base + 1];
      const vz = velocityData[base + 2];
      const lenSq = vx * vx + vy * vy + vz * vz;
      if (lenSq > maxVelSq) {
        const scale = maxVelocity / Math.sqrt(lenSq);
        velocityData[base]     = vx * scale;
        velocityData[base + 1] = vy * scale;
        velocityData[base + 2] = vz * scale;
      }

      // integrate position
      positionData[base]     += velocityData[base];
      positionData[base + 1] += velocityData[base + 1];
      positionData[base + 2] += velocityData[base + 2];
    }

    // --- Collisions + walls ---
    const maxZBoundary = Math.max(maxZ, maxSize);

    for (let idx = startIdx; idx < count; idx++) {
      const base = 3 * idx;
      const radius = sizeData[idx];

      // Pair collisions
      for (let jdx = idx + 1; jdx < count; jdx++) {
        const otherBase = 3 * jdx;
        const dx = positionData[otherBase]     - positionData[base];
        const dy = positionData[otherBase + 1] - positionData[base + 1];
        const dz = positionData[otherBase + 2] - positionData[base + 2];

        const sumRadius = radius + sizeData[jdx];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < sumRadius * sumRadius && distSq > 1e-8) {
          const dist = Math.sqrt(distSq);
          const overlap = sumRadius - dist;
          const invDist = 1 / dist;
          const cx = dx * invDist * 0.5 * overlap;
          const cy = dy * invDist * 0.5 * overlap;
          const cz = dz * invDist * 0.5 * overlap;

          // current velocity magnitudes
          const vAx = velocityData[base];
          const vAy = velocityData[base + 1];
          const vAz = velocityData[base + 2];
          const vAmag = Math.max(Math.sqrt(vAx * vAx + vAy * vAy + vAz * vAz), 1);

          const vBx = velocityData[otherBase];
          const vBy = velocityData[otherBase + 1];
          const vBz = velocityData[otherBase + 2];
          const vBmag = Math.max(Math.sqrt(vBx * vBx + vBy * vBy + vBz * vBz), 1);

          // apply correction
          positionData[base]     -= cx;
          positionData[base + 1] -= cy;
          positionData[base + 2] -= cz;
          velocityData[base]     -= cx * vAmag;
          velocityData[base + 1] -= cy * vAmag;
          velocityData[base + 2] -= cz * vAmag;

          positionData[otherBase]     += cx;
          positionData[otherBase + 1] += cy;
          positionData[otherBase + 2] += cz;
          velocityData[otherBase]     += cx * vBmag;
          velocityData[otherBase + 1] += cy * vBmag;
          velocityData[otherBase + 2] += cz * vBmag;
        }
      }

      // Collision with sphere0 (cursor)
      if (config.controlSphere0) {
        const dx = positionData[0] - positionData[base];
        const dy = positionData[1] - positionData[base + 1];
        const dz = positionData[2] - positionData[base + 2];
        const sumR0 = radius + sizeData[0];
        const dSq = dx * dx + dy * dy + dz * dz;
        if (dSq < sumR0 * sumR0 && dSq > 1e-8) {
          const d = Math.sqrt(dSq);
          const inv = (sumR0 - d) / d;
          const cx = dx * inv;
          const cy = dy * inv;
          const cz = dz * inv;
          const vx = velocityData[base];
          const vy = velocityData[base + 1];
          const vz = velocityData[base + 2];
          const vMag = Math.max(Math.sqrt(vx * vx + vy * vy + vz * vz), 2);

          positionData[base]     -= cx;
          positionData[base + 1] -= cy;
          positionData[base + 2] -= cz;
          velocityData[base]     -= cx * vMag;
          velocityData[base + 1] -= cy * vMag;
          velocityData[base + 2] -= cz * vMag;
        }
      }

      // Wall collisions
      const px = positionData[base];
      const py = positionData[base + 1];
      const pz = positionData[base + 2];

      if (Math.abs(px) + radius > maxX) {
        positionData[base] = Math.sign(px) * (maxX - radius);
        velocityData[base] = -velocityData[base] * wallBounce;
      }

      if (gravity === 0) {
        if (Math.abs(py) + radius > maxY) {
          positionData[base + 1] = Math.sign(py) * (maxY - radius);
          velocityData[base + 1] = -velocityData[base + 1] * wallBounce;
        }
      } else if (py - radius < -maxY) {
        positionData[base + 1] = -maxY + radius;
        velocityData[base + 1] = -velocityData[base + 1] * wallBounce;
      }

      if (Math.abs(pz) + radius > maxZBoundary) {
        positionData[base + 2] = Math.sign(pz) * (maxZ - radius);
        velocityData[base + 2] = -velocityData[base + 2] * wallBounce;
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Subsurface scattering material (unchanged)                        */
/* ------------------------------------------------------------------ */
class Y extends MeshPhysicalMaterial {
  uniforms: { [key: string]: { value: any } } = {
    thicknessDistortion: { value: 0.1 },
    thicknessAmbient: { value: 0 },
    thicknessAttenuation: { value: 0.1 },
    thicknessPower: { value: 2 },
    thicknessScale: { value: 10 },
  };
  defines: { USE_UV: string };
  onBeforeCompile2?: (shader: any) => void;

  constructor(params: any) {
    super(params);
    this.defines = { USE_UV: '' };
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
        ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor.rgb;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }
        void main() {
        `,
      );
      const lightsChunk = ShaderChunk.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `,
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsChunk);
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Default config + pointer manager                                  */
/* ------------------------------------------------------------------ */
const defaultConfig = {
  count: 200,
  colors: [0, 0, 0],
  ambientColor: 0xffffff,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: { metalness: 0.5, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.15 },
  minSize: 0.5, maxSize: 1, size0: 1,
  gravity: 0.5, friction: 0.9975,
  wallBounce: 0.95, maxVelocity: 0.15,
  maxX: 5, maxY: 5, maxZ: 2,
  controlSphere0: false, followCursor: true,
};

let globalPointerActive = false;
const pointerPosition = new Vector2();

interface PointerData {
  position: Vector2;
  nPosition: Vector2;
  hover: boolean;
  touching: boolean;
  onEnter: (d: PointerData) => void;
  onMove: (d: PointerData) => void;
  onClick: (d: PointerData) => void;
  onLeave: (d: PointerData) => void;
  dispose?: () => void;
}

const pointerMap = new Map<HTMLElement, PointerData>();

function isInsideRect(rect: DOMRect) {
  return (
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.right &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.bottom
  );
}

function updatePointerData(data: PointerData, rect: DOMRect) {
  const px = pointerPosition.x - rect.left;
  const py = pointerPosition.y - rect.top;
  data.position.set(px, py);
  data.nPosition.set((px / rect.width) * 2 - 1, (-py / rect.height) * 2 + 1);
}

function onPointerMove(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY);
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    if (isInsideRect(rect)) {
      updatePointerData(data, rect);
      if (!data.hover) {
        data.hover = true;
        data.onEnter(data);
      }
      data.onMove(data);
    } else if (data.hover && !data.touching) {
      data.hover = false;
      data.onLeave(data);
    }
  }
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 0) return;
  e.preventDefault();
  pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    if (isInsideRect(rect)) {
      data.touching = true;
      updatePointerData(data, rect);
      if (!data.hover) {
        data.hover = true;
        data.onEnter(data);
      }
      data.onMove(data);
    }
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 0) return;
  e.preventDefault();
  pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    updatePointerData(data, rect);
    if (isInsideRect(rect)) {
      if (!data.hover) {
        data.hover = true;
        data.touching = true;
        data.onEnter(data);
      }
      data.onMove(data);
    } else if (data.hover && data.touching) {
      data.onMove(data);
    }
  }
}

function onTouchEnd() {
  for (const data of pointerMap.values()) {
    if (data.touching) {
      data.touching = false;
      if (data.hover) {
        data.hover = false;
        data.onLeave(data);
      }
    }
  }
}

function onPointerClick(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY);
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    updatePointerData(data, rect);
    if (isInsideRect(rect)) data.onClick(data);
  }
}

function onPointerLeave() {
  for (const data of pointerMap.values()) {
    if (data.hover) {
      data.hover = false;
      data.onLeave(data);
    }
  }
}

function attachGlobalPointerListeners() {
  if (globalPointerActive) return;
  document.body.addEventListener('pointermove', onPointerMove);
  document.body.addEventListener('pointerleave', onPointerLeave);
  document.body.addEventListener('click', onPointerClick);
  document.body.addEventListener('touchstart', onTouchStart, { passive: false });
  document.body.addEventListener('touchmove', onTouchMove, { passive: false });
  document.body.addEventListener('touchend', onTouchEnd, { passive: false });
  document.body.addEventListener('touchcancel', onTouchEnd, { passive: false });
  globalPointerActive = true;
}

function detachGlobalPointerListeners() {
  document.body.removeEventListener('pointermove', onPointerMove);
  document.body.removeEventListener('pointerleave', onPointerLeave);
  document.body.removeEventListener('click', onPointerClick);
  document.body.removeEventListener('touchstart', onTouchStart);
  document.body.removeEventListener('touchmove', onTouchMove);
  document.body.removeEventListener('touchend', onTouchEnd);
  document.body.removeEventListener('touchcancel', onTouchEnd);
  globalPointerActive = false;
}

function createPointerData(options: Partial<PointerData> & { domElement: HTMLElement }): PointerData {
  const data: PointerData = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter: () => {},
    onMove: () => {},
    onClick: () => {},
    onLeave: () => {},
    ...options,
  };
  if (!pointerMap.has(options.domElement)) {
    pointerMap.set(options.domElement, data);
    attachGlobalPointerListeners();
  }
  data.dispose = () => {
    pointerMap.delete(options.domElement);
    if (pointerMap.size === 0) detachGlobalPointerListeners();
  };
  return data;
}

/* ------------------------------------------------------------------ */
/*  InstancedMesh wrapper                                             */
/* ------------------------------------------------------------------ */
class Z extends InstancedMesh {
  config: typeof defaultConfig;
  physics: W;
  ambientLight!: AmbientLight;
  light!: PointLight;
  // Cached color gradient buffers
  #colorObjects: Color[] = [];
  #tmpColor = new Color();

  constructor(renderer: WebGLRenderer, params: Partial<typeof defaultConfig> = {}) {
    const config = { ...defaultConfig, ...params };
    const roomEnv = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(roomEnv).texture;
    // Cleanup PMREM helpers once env texture is generated
    pmrem.dispose();

    const geometry = new SphereGeometry();
    const material = new Y({ envMap: envTexture, ...config.materialParams });
    material.envMapRotation.x = -Math.PI / 2;
    super(geometry, material, config.count);
    this.config = config;
    this.physics = new W(config);
    this.#setupLights();
    this.setColors(config.colors);
  }

  #setupLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }

  #getColorAt(ratio: number, out: Color) {
    const colors = this.#colorObjects;
    const clamped = ratio < 0 ? 0 : ratio > 1 ? 1 : ratio;
    const scaled = clamped * (colors.length - 1);
    const idx = Math.floor(scaled);
    const start = colors[idx];
    if (idx >= colors.length - 1) return out.copy(start);
    const alpha = scaled - idx;
    const end = colors[idx + 1];
    out.r = start.r + alpha * (end.r - start.r);
    out.g = start.g + alpha * (end.g - start.g);
    out.b = start.b + alpha * (end.b - start.b);
    return out;
  }

  setColors(colors: number[]) {
    if (!Array.isArray(colors) || colors.length < 2) return;
    this.#colorObjects = colors.map((c) => new Color(c));
    const tmp = this.#tmpColor;
    for (let idx = 0; idx < this.count; idx++) {
      this.#getColorAt(idx / this.count, tmp);
      this.setColorAt(idx, tmp);
      if (idx === 0) this.light.color.copy(tmp);
    }
    if (this.instanceColor) this.instanceColor.needsUpdate = true;
  }

  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo);
    const positionData = this.physics.positionData;
    const sizeData = this.physics.sizeData;
    const followCursor = this.config.followCursor;

    for (let idx = 0; idx < this.count; idx++) {
      const base = 3 * idx;
      _matrixDummy.position.set(positionData[base], positionData[base + 1], positionData[base + 2]);
      _matrixDummy.scale.setScalar(idx === 0 && followCursor === false ? 0 : sizeData[idx]);
      _matrixDummy.updateMatrix();
      this.setMatrixAt(idx, _matrixDummy.matrix);
      if (idx === 0) this.light.position.copy(_matrixDummy.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

/* ------------------------------------------------------------------ */
/*  Factory                                                           */
/* ------------------------------------------------------------------ */
interface CreateBallpitReturn {
  three: X;
  spheres: Z;
  setCount: (count: number) => void;
  togglePause: () => void;
  setPaused: (paused: boolean) => void;
  dispose: () => void;
}

function createBallpit(canvas: HTMLCanvasElement, config: any = {}): CreateBallpitReturn {
  const threeInstance = new X({
    canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true },
  });

  let spheres: Z;
  threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
  threeInstance.camera.position.set(0, 0, 20);
  threeInstance.camera.lookAt(0, 0, 0);
  threeInstance.cameraMaxAspect = 1.5;
  threeInstance.resize();

  const initialize = (cfg: any) => {
    if (spheres) {
      threeInstance.clear();
      threeInstance.scene.remove(spheres);
    }
    spheres = new Z(threeInstance.renderer, cfg);
    threeInstance.scene.add(spheres);
  };
  initialize(config);

  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const intersectionPoint = new Vector3();
  let isPaused = false;

  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  (canvas.style as any).webkitUserSelect = 'none';

  const pointerData = createPointerData({
    domElement: canvas,
    onMove() {
      if (isPaused) return;                          // ignore pointer when paused
      raycaster.setFromCamera(pointerData.nPosition, threeInstance.camera);
      threeInstance.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      spheres.physics.center.copy(intersectionPoint);
      spheres.config.controlSphere0 = true;
    },
    onLeave() {
      spheres.config.controlSphere0 = false;
    },
  });

  threeInstance.onBeforeRender = (delta) => {
    spheres.update(delta);  // no need to guard — loop itself is stopped when paused
  };
  threeInstance.onAfterResize = (size) => {
    spheres.config.maxX = size.wWidth / 2;
    spheres.config.maxY = size.wHeight / 2;
  };

threeInstance.onBeforeRender = (delta) => spheres.update(delta);


return {
  three: threeInstance,
  get spheres() { return spheres; },
  setCount(count: number) {
    initialize({ ...spheres.config, count });
  },
  togglePause() { threeInstance.paused = !threeInstance.paused; },
  setPaused(p: boolean) { threeInstance.paused = p; },
  dispose() {
    pointerData.dispose?.();
    threeInstance.dispose();
  },
};

}

/* ------------------------------------------------------------------ */
/*  React component                                                   */
/* ------------------------------------------------------------------ */
interface BallpitProps {
  className?: string;
  followCursor?: boolean;
  paused?: boolean;
  [key: string]: any;
}

export const Ballpit: React.FC<BallpitProps> = ({
  className = '',
  followCursor = true,
  paused = false,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<CreateBallpitReturn | null>(null);

  // Keep latest props/flags in refs so we never re-init on prop changes
  const propsRef = useRef({ followCursor, props });
  propsRef.current = { followCursor, props };

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    // Defer init so React 18 StrictMode's first mount/unmount cycle
    // completes BEFORE we ever create a WebGL context.
    const rafId = requestAnimationFrame(() => {
      if (cancelled || !canvas.isConnected) return;
      try {
        instanceRef.current = createBallpit(canvas, {
          followCursor: propsRef.current.followCursor,
          ...propsRef.current.props,
        });
        if (pausedRef.current) instanceRef.current.setPaused(true);
      } catch (err) {
        console.error('Ballpit init failed:', err);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync paused state declaratively
  useEffect(() => {
    instanceRef.current?.setPaused(paused);
  }, [paused]);

  return (
    <canvas
      className={className}
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};