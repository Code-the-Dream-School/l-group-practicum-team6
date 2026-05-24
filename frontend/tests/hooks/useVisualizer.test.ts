import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import type { Visualizer } from '@sonix/shared';
import { useVisualizer } from '../../src/hooks/useVisualizer';

const mockRender = vi.fn();
const mockDispose = vi.fn();
const mockSetSize = vi.fn();
const mockGeometryDispose = vi.fn();
const mockMaterialDispose = vi.fn();
const mockTextureDispose = vi.fn();
const mockDisconnect = vi.fn();
const mockObserve = vi.fn();

let resizeCallback: (() => void) | null = null;
let rafCallback: FrameRequestCallback | null = null;

vi.mock('three', () => {
  class MockVector2 {
    set = vi.fn();
  }

  class MockWebGLRenderer {
    setPixelRatio = vi.fn();
    setSize = mockSetSize;
    render = mockRender;
    dispose = mockDispose;

    constructor() {}
  }

  class MockShaderMaterial {
    dispose = mockMaterialDispose;

    constructor() {}
  }

  class MockPlaneGeometry {
    dispose = mockGeometryDispose;

    constructor() {}
  }

  class MockDataTexture {
    dispose = mockTextureDispose;
    needsUpdate = false;

    constructor() {}
  }

  class MockScene {
    add = vi.fn();

    constructor() {}
  }

  class MockMesh {
    constructor() {}
  }

  class MockOrthographicCamera {
    constructor() {}
  }

  return {
    WebGLRenderer: MockWebGLRenderer,
    Scene: MockScene,
    OrthographicCamera: MockOrthographicCamera,
    ShaderMaterial: MockShaderMaterial,
    PlaneGeometry: MockPlaneGeometry,
    Mesh: MockMesh,
    DataTexture: MockDataTexture,
    Vector2: MockVector2,
    RedFormat: 1028,
    LinearFilter: 9729,
  };
});

const visualizer: Visualizer = {
  _id: 'visual-1',
  name: 'Test Visual',
  source: '',
  glsl: 'void main() {}',
  isDemo: false,
};

describe('useVisualizer', () => {
  beforeEach(() => {
    resizeCallback = null;
    rafCallback = null;
    mockRender.mockClear();
    mockDispose.mockClear();
    mockSetSize.mockClear();
    mockGeometryDispose.mockClear();
    mockMaterialDispose.mockClear();
    mockTextureDispose.mockClear();
    mockDisconnect.mockClear();
    mockObserve.mockClear();

    class MockResizeObserver {
      constructor(callback: () => void) {
        resizeCallback = callback;
      }

      observe = mockObserve;
      disconnect = mockDisconnect;
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafCallback = callback;
      return 1;
    });

    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when the canvas ref is missing', () => {
    const canvasRef = createRef<HTMLCanvasElement>();

    renderHook(() => useVisualizer(canvasRef, visualizer, vi.fn()));

    expect(mockObserve).not.toHaveBeenCalled();
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('initializes the renderer and updates uniforms from audio data', () => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const canvas = document.createElement('canvas');

    Object.defineProperty(canvas, 'clientWidth', { value: 640, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 360, configurable: true });

    canvasRef.current = canvas;

    const getAudioData = vi.fn(() => new Uint8Array([5, 10, 15]));

    renderHook(() => useVisualizer(canvasRef, visualizer, getAudioData));

    expect(mockObserve).toHaveBeenCalledWith(canvas);

    resizeCallback?.();
    rafCallback?.(performance.now());

    expect(mockSetSize).toHaveBeenCalled();
    expect(getAudioData).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
  });

  it('cleans up renderer resources on unmount', () => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const canvas = document.createElement('canvas');

    Object.defineProperty(canvas, 'clientWidth', { value: 640, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 360, configurable: true });

    canvasRef.current = canvas;

    const { unmount } = renderHook(() => useVisualizer(canvasRef, visualizer, vi.fn()));

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockGeometryDispose).toHaveBeenCalled();
    expect(mockMaterialDispose).toHaveBeenCalled();
    expect(mockTextureDispose).toHaveBeenCalled();
    expect(mockDispose).toHaveBeenCalled();
  });
});
