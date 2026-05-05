import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

const ACTIVE_PREVIEW_EVENT = "visual-card-preview-change";

let activePreviewCardId: string | null = null;

interface VisualCardProps {
  id: string;
  name: string;
  tags: string[];
  thumbnailUrl?: string;
  isDemo?: boolean;
  isSaved?: boolean;
  isAuthenticated?: boolean;
  onToggleSave?: (id: string) => void;
}

export default function VisualCard({
  id,
  name,
  tags,
  thumbnailUrl,
  isDemo = false,
  isSaved = false,
  isAuthenticated = false,
  onToggleSave,
}: VisualCardProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const playPath = isDemo ? "/visualizer/demo" : `/visualizer/${id}`;

  useEffect(() => {
    function handlePreviewChange(event: Event) {
      const previewEvent = event as CustomEvent<string>;
      setIsPreviewActive(previewEvent.detail === id);
    }

    window.addEventListener(ACTIVE_PREVIEW_EVENT, handlePreviewChange);

    return () => {
      window.removeEventListener(ACTIVE_PREVIEW_EVENT, handlePreviewChange);
    };
  }, [id]);

  useEffect(() => {
    if (!isPreviewActive || !previewRef.current) return;

    const container = previewRef.current;
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
  }, [isPreviewActive]);

  function activatePreview() {
    activePreviewCardId = id;
    window.dispatchEvent(new CustomEvent(ACTIVE_PREVIEW_EVENT, { detail: id }));
  }

  function deactivatePreview() {
    if (activePreviewCardId !== id) return;

    activePreviewCardId = null;
    window.dispatchEvent(new CustomEvent(ACTIVE_PREVIEW_EVENT, { detail: "" }));
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20">
      <div
        className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#7C5CFC]/40 via-[#00D4FF]/20 to-black"
        onMouseEnter={activatePreview}
        onMouseLeave={deactivatePreview}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
            Preview loading
          </div>
        )}

        <div
          ref={previewRef}
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-300 ${
            isPreviewActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {isAuthenticated && (
          <button
            type="button"
            aria-label={isSaved ? `Unsave ${name}` : `Save ${name}`}
            onClick={() => onToggleSave?.(id)}
            className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-2 text-white transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
          >
            {isSaved ? "\u2665" : "\u2661"}
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{name}</h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Link
          to={playPath}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#7C5CFC] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6A4FE0] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
        >
          Play
        </Link>
      </div>
    </article>
  );
}
