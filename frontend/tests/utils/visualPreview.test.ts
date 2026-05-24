import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  class MockVector3 {
    set = vi.fn();
  }

  class MockVector4 {
    set = vi.fn();
  }

  class MockWebGLRenderer {
    domElement = Object.assign(document.createElement('canvas'), { width: 320, height: 240 });
    setPixelRatio = vi.fn();
    setSize = mockSetSize;
    render = mockRender;
    dispose = mockDispose;

    constructor() {}
  }

  class MockRawShaderMaterial {
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
    RawShaderMaterial: MockRawShaderMaterial,
    PlaneGeometry: MockPlaneGeometry,
    Mesh: MockMesh,
    DataTexture: MockDataTexture,
    Vector3: MockVector3,
    Vector4: MockVector4,
    LinearSRGBColorSpace: 'srgb-linear',
    GLSL3: '300 es',
    RGBAFormat: 1023,
    LinearFilter: 9729,
  };
});

import {
  activateVisualPreview,
  deactivateVisualPreview,
  listenToActiveVisualPreview,
  startVisualPreview,
} from '../../src/utils/visualPreview';

describe('visualPreview events', () => {
  it('activates and deactivates a single card preview', () => {
    const callback = vi.fn();
    const cleanup = listenToActiveVisualPreview('card-1', callback);

    activateVisualPreview('card-1');
    expect(callback).toHaveBeenLastCalledWith(true);

    deactivateVisualPreview('card-1');
    expect(callback).toHaveBeenLastCalledWith(false);

    cleanup();
  });

  it('ignores deactivate calls for a different card id', () => {
    const callback = vi.fn();
    listenToActiveVisualPreview('card-1', callback);

    activateVisualPreview('card-1');
    deactivateVisualPreview('card-2');

    expect(callback).toHaveBeenLastCalledWith(true);
  });

  it('notifies listeners when another card becomes active', () => {
    const first = vi.fn();
    const second = vi.fn();

    listenToActiveVisualPreview('card-1', first);
    listenToActiveVisualPreview('card-2', second);

    activateVisualPreview('card-1');
    activateVisualPreview('card-2');

    expect(first).toHaveBeenLastCalledWith(false);
    expect(second).toHaveBeenLastCalledWith(true);
  });
});

describe('startVisualPreview', () => {
  beforeEach(() => {
    resizeCallback = null;
    rafCallback = null;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as WebGL2RenderingContext
    );

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
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    mockRender.mockClear();
    mockDispose.mockClear();
    mockSetSize.mockClear();
  });

  it('returns undefined when WebGL2 is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const container = document.createElement('div');
    const cleanup = startVisualPreview(container, 'void main() {}');

    expect(cleanup).toBeUndefined();
    expect(container.children).toHaveLength(0);
  });

  it('mounts a canvas, renders, and calls onReady after the first frame', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 320, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 240, configurable: true });

    const onReady = vi.fn();
    const cleanup = startVisualPreview(container, 'void main() {}', undefined, false, onReady);

    expect(container.querySelector('canvas')).toBeTruthy();
    expect(mockObserve).toHaveBeenCalled();

    resizeCallback?.();
    rafCallback?.(performance.now());

    expect(mockRender).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalledTimes(1);

    cleanup?.();
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockGeometryDispose).toHaveBeenCalled();
    expect(mockMaterialDispose).toHaveBeenCalled();
    expect(mockTextureDispose).toHaveBeenCalled();
    expect(mockDispose).toHaveBeenCalled();
  });

  it('updates fft data from getAudioData when provided', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 320, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 240, configurable: true });

    const getAudioData = vi.fn(() => new Uint8Array([10, 20, 30]));

    startVisualPreview(container, 'void main() {}', getAudioData);

    resizeCallback?.();
    rafCallback?.(performance.now());

    expect(getAudioData).toHaveBeenCalled();
  });
});
