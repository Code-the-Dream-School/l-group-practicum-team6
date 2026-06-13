import { useEffect, type RefObject } from 'react';
import * as THREE from 'three';
import type { Visualizer } from '@sonix/shared';

const AUDIO_TEXTURE_WIDTH = 128;
const AUDIO_TEXTURE_HEIGHT = 1;

const VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export function useVisualizer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  visualizer: Visualizer,
  getAudioData: () => Uint8Array
): void {
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const canvas: HTMLCanvasElement = canvasElement;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const audioData = new Uint8Array(AUDIO_TEXTURE_WIDTH);
    const audioTexture = new THREE.DataTexture(
      audioData,
      AUDIO_TEXTURE_WIDTH,
      AUDIO_TEXTURE_HEIGHT,
      THREE.RedFormat
    );

    audioTexture.flipY = false;
    audioTexture.minFilter = THREE.LinearFilter;
    audioTexture.magFilter = THREE.LinearFilter;
    audioTexture.needsUpdate = true;

    const uniforms = {
      iTime: { value: 0 },
      iTimeDelta: { value: 0 },
      iFrameRate: { value: 60 },
      iFrame: { value: 0 },
      iResolution: { value: new THREE.Vector3() },
      iMouse: { value: new THREE.Vector4() },
      iDate: { value: new THREE.Vector4() },
      iChannelTime: { value: [0, 0, 0, 0] },
      iChannelResolution: {
        value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()],
      },
      iChannel0: { value: audioTexture },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: visualizer.glsl,
      uniforms,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function resize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width === 0 || height === 0) return;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      uniforms.iResolution.value.set(width, height, 1);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const startTime = performance.now();
    let animationFrameId = 0;

    let lastTime = performance.now();
    function animate(now: number) {
      const elapsed = (now - startTime) * 0.001;
      const delta = (now - lastTime) * 0.001;
      lastTime = now;

      uniforms.iTime.value = elapsed;
      uniforms.iTimeDelta.value = delta;
      uniforms.iFrame.value += 1;
      uniforms.iFrameRate.value = delta > 0 ? 1 / delta : 60;

      const d = new Date();
      uniforms.iDate.value.set(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() * 0.001
      );

      const data = getAudioData();
      const copyLength = Math.min(data.length, AUDIO_TEXTURE_WIDTH);
      audioData.set(data.subarray(0, copyLength));
      audioTexture.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      audioTexture.dispose();
      renderer.dispose();
    };
  }, [canvasRef, visualizer.glsl, getAudioData]);
}
