import { describe, it, expect } from 'vitest';
import Visualizer from '../../src/models/Visualizer';

describe('Visualizer model', () => {
  it('fails validation when name is missing', () => {
    const doc = new Visualizer({ glsl: 'void main() {}' });
    const error = doc.validateSync();
    expect(error?.errors['name']).toBeDefined();
  });

  it('fails validation when glsl is missing', () => {
    const doc = new Visualizer({ name: 'Test' });
    const error = doc.validateSync();
    expect(error?.errors['glsl']).toBeDefined();
  });

  it('passes validation with required fields', () => {
    const doc = new Visualizer({ name: 'Test', glsl: 'void main() {}' });
    const error = doc.validateSync();
    expect(error).toBeUndefined();
  });

  it('tags default to empty array', () => {
    const doc = new Visualizer({ name: 'Test', glsl: 'void main() {}' });
    expect(doc.tags).toEqual([]);
  });

  it('isDemo defaults to false', () => {
    const doc = new Visualizer({ name: 'Test', glsl: 'void main() {}' });
    expect(doc.isDemo).toBe(false);
  });

  it('imageUrl is optional', () => {
    const doc = new Visualizer({ name: 'Test', glsl: 'void main() {}' });
    const error = doc.validateSync();
    expect(error?.errors['imageUrl']).toBeUndefined();
  });

  it('source is optional', () => {
    const doc = new Visualizer({ name: 'Test', glsl: 'void main() {}' });
    const error = doc.validateSync();
    expect(error?.errors['source']).toBeUndefined();
  });
});
