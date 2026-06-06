import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RefObject } from 'react';
import type { Visualizer } from '@sonix/shared';

import { useVisualizer } from '../../src/hooks/useVisualizer';

const rendererDisposeMock = vi.fn();
const rendererRenderMock = vi.fn();
const rendererSetPixelRatioMock = vi.fn();
const rendererSetSizeMock = vi.fn();
const geometryDisposeMock = vi.fn();
const materialDisposeMock = vi.fn();
const textureDisposeMock = vi.fn();
const vector3SetMock = vi.fn();
const vector4SetMock = vi.fn();

let resizeObserverCallback: ResizeObserverCallback | null = null;
let shaderMaterialUniforms: Record<string, { value: unknown }> | null = null;

vi.mock('three', () => {
  class WebGLRenderer {
    dispose = rendererDisposeMock;
    render = rendererRenderMock;
    setPixelRatio = rendererSetPixelRatioMock;
    setSize = rendererSetSizeMock;
  }

  class Scene {
    add = vi.fn();
  }

  class OrthographicCamera {}

  class DataTexture {
    flipY = true;
    minFilter = null;
    magFilter = null;
    needsUpdate = false;
    dispose = textureDisposeMock;

    constructor(
      public data: Uint8Array,
      public width: number,
      public height: number,
      public format: string
    ) {}
  }

  class Vector3 {
    set = vector3SetMock;
  }

  class Vector4 {
    set = vector4SetMock;
  }

  class ShaderMaterial {
    dispose = materialDisposeMock;

    constructor(options: { uniforms: Record<string, { value: unknown }> }) {
      shaderMaterialUniforms = options.uniforms;
    }
  }

  class PlaneGeometry {
    dispose = geometryDisposeMock;
  }

  class Mesh {}

  return {
    WebGLRenderer,
    Scene,
    OrthographicCamera,
    DataTexture,
    Vector3,
    Vector4,
    ShaderMaterial,
    PlaneGeometry,
    Mesh,
    RedFormat: 'RedFormat',
    LinearFilter: 'LinearFilter',
  };
});

const visualizer = {
  _id: 'visualizer-1',
  name: 'Test Visualizer',
  glsl: 'void main() { gl_FragColor = vec4(1.0); }',
  isDemo: true,
  createdAt: '2026-06-06T00:00:00.000Z',
  updatedAt: '2026-06-06T00:00:00.000Z',
} as Visualizer;

const createCanvasRef = () => {
  const canvas = document.createElement('canvas');

  Object.defineProperty(canvas, 'clientWidth', {
    configurable: true,
    value: 640,
  });

  Object.defineProperty(canvas, 'clientHeight', {
    configurable: true,
    value: 360,
  });

  return { current: canvas } as RefObject<HTMLCanvasElement | null>;
};

describe('useVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resizeObserverCallback = null;
    shaderMaterialUniforms = null;

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1)
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        observe = vi.fn();
        disconnect = vi.fn();

        constructor(callback: ResizeObserverCallback) {
          resizeObserverCallback = callback;
        }
      }
    );

    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 1,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts the animation loop on mount and cancels it on unmount', () => {
    const canvasRef = createCanvasRef();
    const getAudioData = vi.fn(() => new Uint8Array(128));

    const { unmount } = renderHook(() => useVisualizer(canvasRef, visualizer, getAudioData));

    expect(requestAnimationFrame).toHaveBeenCalled();

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(rendererDisposeMock).toHaveBeenCalled();
    expect(geometryDisposeMock).toHaveBeenCalled();
    expect(materialDisposeMock).toHaveBeenCalled();
    expect(textureDisposeMock).toHaveBeenCalled();
  });

  it('updates iResolution when ResizeObserver runs', () => {
    const canvasRef = createCanvasRef();
    const getAudioData = vi.fn(() => new Uint8Array(128));

    renderHook(() => useVisualizer(canvasRef, visualizer, getAudioData));

    resizeObserverCallback?.([], {} as ResizeObserver);

    expect(rendererSetPixelRatioMock).toHaveBeenCalledWith(1);
    expect(rendererSetSizeMock).toHaveBeenCalledWith(640, 360);
    expect(shaderMaterialUniforms).not.toBeNull();
    expect(vector3SetMock).toHaveBeenCalledWith(640, 360, 1);
  });
});
