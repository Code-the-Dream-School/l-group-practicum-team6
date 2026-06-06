import * as THREE from 'three';

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

function fillSyntheticFft(fftData: Uint8Array) {
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
}

function fillFftFromAudio(fftData: Uint8Array, audio: Uint8Array) {
  if (audio.length === 0) {
    fftData.fill(0);
    return;
  }

  for (let x = 0; x < FFT_W; x++) {
    const binIndex = Math.min(audio.length - 1, Math.floor((x / FFT_W) * audio.length));
    const value = audio[binIndex] ?? 0;

    for (let y = 0; y < FFT_H; y++) {
      const offset = (y * FFT_W + x) * 4;
      fftData[offset] = value;
      fftData[offset + 1] = value;
      fftData[offset + 2] = value;
      fftData[offset + 3] = 255;
    }
  }
}

export function startVisualPreview(
  container: HTMLDivElement,
  previewGlsl: string,
  getAudioData?: () => Uint8Array,
  immersive = false,
  onReady?: () => void,
  getIsPlaying?: () => boolean,
  captureRef?: { current: ((blob: Blob) => void) | null }
) {
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

  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';

  if (!immersive) {
    renderer.domElement.style.filter = 'saturate(2.5) contrast(1.7) brightness(1.5)';
  }

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

  if (getAudioData) {
    fillFftFromAudio(fftData, getAudioData());
  } else {
    fillSyntheticFft(fftData);
  }

  const fftTexture = new THREE.DataTexture(fftData, FFT_W, FFT_H, THREE.RGBAFormat);

  fftTexture.flipY = false;
  fftTexture.minFilter = THREE.LinearFilter;
  fftTexture.magFilter = THREE.LinearFilter;
  fftTexture.needsUpdate = true;

  let width = 0;
  let height = 0;

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(1, 1, 1) },
    iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
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

  function syncShaderResolution() {
    const canvas = renderer.domElement;
    width = canvas.width;
    height = canvas.height;

    uniforms.iResolution.value.set(width, height, 1);
    uniforms.iMouse.value.set(width * 0.5, height * 0.5, 0, 0);
  }

  function resize() {
    const layoutWidth = container.clientWidth;
    const layoutHeight = container.clientHeight;

    if (layoutWidth === 0 || layoutHeight === 0) return;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(layoutWidth, layoutHeight);
    syncShaderResolution();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let animationFrameId = 0;
  const startTime = performance.now();
  let lastTime = startTime;
  let frame = 0;
  let hasNotifiedReady = false;
  let timePauseAccum = 0;
  let pauseStartWall: number | null = null;

  function animate(now: number) {
    if (width === 0 || height === 0) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    const playing = getIsPlaying?.() ?? true;

    if (!playing) {
      if (pauseStartWall === null) {
        pauseStartWall = now;
      }

      uniforms.iTimeDelta.value = 0;
      uniforms.iFrameRate.value = 0;
    } else {
      if (pauseStartWall !== null) {
        timePauseAccum += now - pauseStartWall;
        pauseStartWall = null;
        lastTime = now;
      }

      const deltaTime = (now - lastTime) * 0.001;
      lastTime = now;

      uniforms.iTime.value = (now - startTime - timePauseAccum) * 0.001;
      uniforms.iTimeDelta.value = deltaTime;
      uniforms.iFrame.value = frame++;
      uniforms.iFrameRate.value = deltaTime > 0 ? 1 / deltaTime : 0;
    }

    syncShaderResolution();

    if (getAudioData) {
      if (playing) {
        fillFftFromAudio(fftData, getAudioData());
      } else {
        fftData.fill(0);
      }

      fftTexture.needsUpdate = true;
    }

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

    if (captureRef?.current) {
      const cb = captureRef.current;
      captureRef.current = null;
      canvas.toBlob((blob) => {
        if (blob) cb(blob);
      }, 'image/png');
    }

    if (!hasNotifiedReady) {
      hasNotifiedReady = true;
      onReady?.();
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animationFrameId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
    geometry.dispose();
    material.dispose();
    fftTexture.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
