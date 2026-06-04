/// <reference types="node" />

import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db/connect';
import Visualizer from '../models/Visualizer';
import UserVisual from '../models/UserVisual';

const e2eShader = `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec3 color = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0.0, 2.0, 4.0));
  fragColor = vec4(color, 1.0);
}
`;

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
  }

  await connectDB(mongoUri);

  await UserVisual.deleteMany({});
  await Visualizer.deleteMany({});

  await Visualizer.insertMany([
    {
      name: 'E2E Demo Visualizer',
      source: 'E2E seed',
      glsl: e2eShader,
      isDemo: true,
      tags: ['demo', 'shader'],
    },
    {
      name: 'E2E Plasma Visualizer',
      source: 'E2E seed',
      glsl: e2eShader,
      isDemo: false,
      tags: ['abstract', 'shader'],
    },
    {
      name: 'E2E Waveform Visualizer',
      source: 'E2E seed',
      glsl: e2eShader,
      isDemo: false,
      tags: ['reactive', 'waveform'],
    },
  ]);

  console.log('Seeded E2E visualizers');

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('E2E seed failed:', error);
  process.exit(1);
});
