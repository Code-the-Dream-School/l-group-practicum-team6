import shadersData from '../mockdata/shaders.json';

export type MockShader = {
  shader: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  id: string;
};

const shaders = shadersData as MockShader[];

export function decodeGlsl(base64: string): string {
  return atob(base64);
}

export function getAllShaders(): MockShader[] {
  return shaders;
}

export function getShaderById(id: string): MockShader | undefined {
  return shaders.find((entry) => entry.id === id);
}
