import * as THREE from 'three';
import { DEFAULT_PREVIEW_GLSL } from './previewShaders';

const ACTIVE_PREVIEW_EVENT = 'visual-card-preview-change';

const FFT_W = 512;
const FFT_H = 2;

let activePreviewCardId: string | null = null;

export function activateVisualPreview(id: string) {
  activePreviewCardId = id;
  window.dispatchEvent(new CustomEvent(ACTIVE_PREVIEW_EVENT, { detail: id }));
}

export function deactivateVisualPreview(id: string) {
  if (activePreviewCardId !== id) return;

  activePreviewCardId = null;
  window.dispatchEvent(new CustomEvent(ACTIVE_PREVIEW_EVENT, { detail: '' }));
}

export function listenToActiveVisualPreview(id: string, callback: (isActive: boolean) => void) {
  function handlePreviewChange(event: Event) {
    const previewEvent = event as CustomEvent<string>;
    callback(previewEvent.detail === id);
  }

  window.addEventListener(ACTIVE_PREVIEW_EVENT, handlePreviewChange);

  return () => {
    window.removeEventListener(ACTIVE_PREVIEW_EVENT, handlePreviewChange);
  };
}

export function startVisualPreview(container: HTMLDivElement, previewGlsl = DEFAULT_PREVIEW_GLSL) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', {
    antialias: true,
    powerPreference: 'high-performance',
    depth: false,
    stencil: false,
    alpha: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false,
  });

  if (!context) return undefined;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.filter = 'saturate(2.5) contrast(1.7) brightness(1.5)';
  if (THREE.LinearSRGBColorSpace) {
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const vertexShader = `
  in vec3 position;

  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

  const fftData = new Uint8Array(FFT_W * FFT_H * 4);

  for (let i = 0; i < FFT_W * FFT_H; i++) {
    const offset = i * 4;
    const x = i % FFT_W;
    const bassShape = Math.max(0, 1 - x / 120);
    const waveShape = 0.45 + 0.35 * Math.sin(x * 0.08);

    const value = Math.floor(90 + 130 * bassShape + 35 * waveShape);

    fftData[offset] = value;
    fftData[offset + 1] = value;
    fftData[offset + 2] = value;
    fftData[offset + 3] = 255;
  }

  const fftTexture = new THREE.DataTexture(fftData, FFT_W, FFT_H, THREE.RGBAFormat);

  fftTexture.flipY = false;
  fftTexture.minFilter = THREE.LinearFilter;
  fftTexture.magFilter = THREE.LinearFilter;
  fftTexture.needsUpdate = true;

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(width, height, 1) },
    iMouse: { value: new THREE.Vector4(width * 0.5, height * 0.5, 0, 0) },
    iFrame: { value: 0 },
    iTimeDelta: { value: 0 },
    iFrameRate: { value: 60 },
    iChannelTime: { value: [0, 0, 0, 0] },
    iChannelResolution: {
      value: [
        new THREE.Vector3(FFT_W, FFT_H, 1),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ],
    },
    iDate: { value: new THREE.Vector4() },
    iChannel0: { value: fftTexture },
  };

  const material = new THREE.RawShaderMaterial({
    vertexShader,
    fragmentShader: previewGlsl,
    uniforms,
    glslVersion: THREE.GLSL3,
    toneMapped: false,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
  container.appendChild(renderer.domElement);

  let animationFrameId = 0;
  const startTime = performance.now();
  let lastTime = startTime;
  let frame = 0;

  function animate(now: number) {
    const deltaTime = (now - lastTime) * 0.001;
    lastTime = now;

    uniforms.iTime.value = (now - startTime) * 0.001;
    uniforms.iTimeDelta.value = deltaTime;
    uniforms.iFrame.value = frame++;
    uniforms.iFrameRate.value = deltaTime > 0 ? 1 / deltaTime : 0;
    uniforms.iResolution.value.set(width, height, 1);

    const date = new Date();
    uniforms.iDate.value.set(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours() * 3600 +
        date.getMinutes() * 60 +
        date.getSeconds() +
        date.getMilliseconds() * 0.001
    );

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  }

  animationFrameId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationFrameId);
    geometry.dispose();
    material.dispose();
    fftTexture.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
