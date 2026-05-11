import * as THREE from "three";

const ACTIVE_PREVIEW_EVENT = "visual-card-preview-change";

let activePreviewCardId: string | null = null;

export function activateVisualPreview(id: string) {
  activePreviewCardId = id;
  window.dispatchEvent(new CustomEvent(ACTIVE_PREVIEW_EVENT, { detail: id }));
}

export function deactivateVisualPreview(id: string) {
  if (activePreviewCardId !== id) return;

  activePreviewCardId = null;
  window.dispatchEvent(new CustomEvent(ACTIVE_PREVIEW_EVENT, { detail: "" }));
}

export function listenToActiveVisualPreview(
  id: string,
  callback: (isActive: boolean) => void
) {
  function handlePreviewChange(event: Event) {
    const previewEvent = event as CustomEvent<string>;
    callback(previewEvent.detail === id);
  }

  window.addEventListener(ACTIVE_PREVIEW_EVENT, handlePreviewChange);

  return () => {
    window.removeEventListener(ACTIVE_PREVIEW_EVENT, handlePreviewChange);
  };
}

export function startVisualPreview(container: HTMLDivElement) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(width, height) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uResolution;

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        float pulse = sin(uTime * 2.0 + uv.x * 8.0 + uv.y * 6.0);
        vec3 purple = vec3(0.49, 0.36, 0.99);
        vec3 cyan = vec3(0.0, 0.83, 1.0);
        vec3 color = mix(purple, cyan, pulse * 0.5 + 0.5);

        gl_FragColor = vec4(color, 0.75);
      }
    `,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
  container.appendChild(renderer.domElement);

  let animationFrameId = 0;
  const startTime = performance.now();

  function animate() {
    uniforms.uTime.value = (performance.now() - startTime) / 1000;
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  return () => {
    cancelAnimationFrame(animationFrameId);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
