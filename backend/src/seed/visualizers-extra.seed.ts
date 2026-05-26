export interface ExtraVisualizerFixture {
  id: string;
  name: string;
  source: string;
  tags: string[];
  glsl: string;
}

const SHADER_HEADER = `precision highp float;
precision highp int;

uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform float iFrameRate;
uniform int iFrame;
uniform float iChannelTime[4];
uniform vec3 iChannelResolution[4];
uniform vec4 iMouse;
uniform vec4 iDate;
uniform sampler2D iChannel0;
out vec4 fragColor;
`;

const SHADER_FOOTER = `
void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

function shader(body: string): string {
  return `${SHADER_HEADER}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
${body}
}
${SHADER_FOOTER}`;
}

export const extraVisualizerFixtures: ExtraVisualizerFixture[] = [
  {
    id: '6a0f3881c0598928a25a9001',
    name: 'Plasma',
    source: 'Sonix team',
    tags: ['plasma', 'classic'],
    glsl: shader(`  vec2 uv = fragCoord / iResolution.xy;
  float v = sin(uv.x * 10.0 + iTime);
  v += sin(uv.y * 10.0 + iTime * 1.3);
  v += sin(length(uv - 0.5) * 20.0 - iTime);
  fragColor = vec4(
    0.5 + 0.5 * sin(v),
    0.5 + 0.5 * cos(v + 2.0),
    0.5 + 0.5 * sin(v + 4.0),
    1.0
  );`),
  },
  {
    id: '6a0f3881c0598928a25a9002',
    name: 'Lissajous',
    source: 'Sonix team',
    tags: ['lissajous', 'parametric', 'lines'],
    glsl: shader(`  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float t = iTime * 0.5;
  float a = 3.0;
  float b = 4.0;
  float minDist = 1.0;
  for (int i = 0; i < 200; i++) {
    float s = float(i) / 200.0 * 6.2832;
    vec2 p = 0.4 * vec2(sin(a * s + t), sin(b * s));
    minDist = min(minDist, length(uv - p));
  }
  float c = smoothstep(0.02, 0.005, minDist);
  fragColor = vec4(c, c * 0.5, 1.0 - c, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a9003',
    name: 'Waveform',
    source: 'Sonix team',
    tags: ['waveform', 'audio', 'line'],
    glsl: shader(`  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float y = 0.3 * sin(uv.x * 8.0 + iTime * 2.0);
  y += 0.1 * sin(uv.x * 20.0 - iTime * 3.0);
  float d = abs(uv.y - y);
  float c = smoothstep(0.02, 0.0, d);
  fragColor = vec4(c, c * 0.6, c * 0.2, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a9004',
    name: 'Starfield',
    source: 'Sonix team',
    tags: ['starfield', 'space', 'particles'],
    glsl: shader(`  vec2 uv = fragCoord / iResolution.xy;
  vec3 col = vec3(0.0);
  for (int i = 0; i < 80; i++) {
    float fi = float(i);
    vec2 seed = vec2(sin(fi * 12.9898), cos(fi * 78.233));
    vec2 p = fract(seed * 43758.5453);
    p.x = fract(p.x - iTime * 0.05 * (0.3 + p.y));
    float d = length((uv - p) * vec2(iResolution.x / iResolution.y, 1.0));
    col += vec3(1.0) * smoothstep(0.005, 0.0, d);
  }
  fragColor = vec4(col, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a9005',
    name: 'Nebula',
    source: 'Sonix team',
    tags: ['nebula', 'space', 'noise'],
    glsl: shader(`  vec2 uv = fragCoord / iResolution.xy;
  vec2 p = uv * 4.0;
  float n = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    n += amp * sin(p.x * 1.7 + iTime * 0.3) * cos(p.y * 1.3 + iTime * 0.2);
    p *= 2.0;
    amp *= 0.5;
  }
  vec3 col = mix(vec3(0.1, 0.0, 0.3), vec3(0.8, 0.3, 0.6), 0.5 + 0.5 * n);
  col += vec3(0.1, 0.2, 0.5) * (0.5 + 0.5 * sin(n * 5.0));
  fragColor = vec4(col, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a9006',
    name: 'Tunnel',
    source: 'Sonix team',
    tags: ['tunnel', 'radial', 'depth'],
    glsl: shader(`  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float z = 1.0 / max(r, 0.01);
  float t = z + iTime;
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 1.0, 2.0) + t + a * 2.0);
  col *= clamp(r * 2.0, 0.0, 1.0);
  fragColor = vec4(col, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a9007',
    name: 'Kaleidoscope',
    source: 'Sonix team',
    tags: ['kaleidoscope', 'symmetry', 'geometric'],
    glsl: shader(`  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float a = atan(uv.y, uv.x);
  float r = length(uv);
  float n = 6.0;
  a = mod(a, 6.2832 / n);
  a = abs(a - 3.1416 / n);
  vec2 p = vec2(cos(a), sin(a)) * r;
  vec3 col = 0.5 + 0.5 * cos(iTime + vec3(p.x, p.y, p.x + p.y) * 10.0);
  fragColor = vec4(col, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a9008',
    name: 'Wave Grid',
    source: 'Sonix team',
    tags: ['grid', 'geometric', 'animated'],
    glsl: shader(`  vec2 uv = fragCoord / iResolution.xy;
  vec2 g = fract(uv * 10.0 + vec2(0.0, sin(iTime + uv.x * 5.0) * 0.2)) - 0.5;
  float d = min(abs(g.x), abs(g.y));
  float c = smoothstep(0.05, 0.0, d);
  fragColor = vec4(c * 0.2, c * 0.8, c, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a9009',
    name: 'Mandelbrot Flow',
    source: 'Sonix team',
    tags: ['fractal', 'mandelbrot', 'math'],
    glsl: shader(`  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 c = uv * 1.5 - vec2(0.5, 0.0);
  vec2 z = vec2(0.0);
  float n = 0.0;
  for (int i = 0; i < 30; i++) {
    if (dot(z, z) > 4.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    n += 1.0;
  }
  float v = n / 30.0;
  fragColor = vec4(v, v * v, 0.5 + 0.5 * sin(v * 6.0 + iTime), 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a900a',
    name: 'Ripples',
    source: 'Sonix team',
    tags: ['ripples', 'water', 'radial'],
    glsl: shader(`  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = length(uv);
  float w = sin(r * 30.0 - iTime * 3.0);
  vec3 col = 0.5 + 0.5 * vec3(w, w * 0.7, w * 0.3);
  col *= smoothstep(1.0, 0.0, r);
  fragColor = vec4(col, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a900b',
    name: 'Spiral',
    source: 'Sonix team',
    tags: ['spiral', 'rotation', 'hypnotic'],
    glsl: shader(`  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float v = sin(a * 5.0 + r * 20.0 - iTime * 2.0);
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + v * 3.14);
  fragColor = vec4(col, 1.0);`),
  },
  {
    id: '6a0f3881c0598928a25a900c',
    name: 'Prism',
    source: 'Sonix team',
    tags: ['prism', 'rainbow', 'color'],
    glsl: shader(`  vec2 uv = fragCoord / iResolution.xy;
  float t = iTime * 0.5;
  vec3 col;
  col.r = 0.5 + 0.5 * sin(uv.x * 10.0 + t);
  col.g = 0.5 + 0.5 * sin(uv.x * 10.0 + t + 2.094);
  col.b = 0.5 + 0.5 * sin(uv.x * 10.0 + t + 4.188);
  col *= 0.7 + 0.3 * sin(uv.y * 20.0 + t);
  fragColor = vec4(col, 1.0);`),
  },
];
