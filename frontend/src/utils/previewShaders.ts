const shader1 = `
precision highp float;
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

#define BEATMOVE 1

const float FREQ_RANGE = 128.0;
const float PI = 3.1415;
const float RADIUS = 0.5;
const float BRIGHTNESS = 0.15;
const float SPEED = 0.5;

vec3 hsv2rgb(vec3 color) {
  vec4 konvert = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 calc = abs(fract(color.xxx + konvert.xyz) * 6.0 - konvert.www);
  return color.z * mix(konvert.xxx, clamp(calc - konvert.xxx, 0.0, 1.0), color.y);
}

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.5));
}

float getFrequency(float x) {
  return texture(iChannel0, vec2(floor(x * FREQ_RANGE + 1.0) / FREQ_RANGE, 0.25)).x + 0.10;
}

float getFrequency_smooth(float x) {
  float index = floor(x * FREQ_RANGE) / FREQ_RANGE;
  float next = floor(x * FREQ_RANGE + 1.0) / FREQ_RANGE;
  return mix(getFrequency(index), getFrequency(next), smoothstep(0.0, 1.0, fract(x * FREQ_RANGE)));
}

float getFrequency_blend(float x) {
  return mix(getFrequency(x), getFrequency_smooth(x), 0.5);
}

vec3 circleIllumination(vec2 fragment, float radius) {
  float distance = length(fragment);
  float ring = 1.0 / abs(distance - radius - (getFrequency_smooth(0.0) / 4.50));

  vec3 color = vec3(0.0);

  float angle = atan(fragment.x, fragment.y);
  color += hsv2rgb(vec3((angle + iTime * 2.5) / (PI * 2.0), 1.0, 1.0)) * ring * BRIGHTNESS;

  float frequency = max(getFrequency_blend(abs(angle / PI)) - 0.02, 0.0);
  color *= frequency;

  return color;
}

vec3 doLine(vec2 fragment, float radius, float x) {
  vec3 col = hsv2rgb(vec3(x * 0.23 + iTime * 0.12, 1.0, 1.0));

  float freq = abs(fragment.x * 0.5);

  col *= (1.0 / abs(fragment.y)) * BRIGHTNESS * getFrequency(freq);
  col = col * smoothstep(radius, radius * 1.8, abs(fragment.x));

  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 fragPos = fragCoord / iResolution.xy;
  fragPos = (fragPos - 0.5) * 2.0;
  fragPos.x *= iResolution.x / iResolution.y;

  vec3 color = vec3(0.0);
  color += circleIllumination(fragPos, RADIUS);

  float c = cos(iTime * SPEED);
  float s = sin(iTime * SPEED);
  vec2 rot = mat2(c, s, -s, c) * fragPos;
  color += doLine(rot, RADIUS, rot.x);

  float c1 = sin(iTime * SPEED);
  float s1 = cos(iTime * SPEED);
  vec2 rot1 = mat2(c1, s1, -s1, c1) * fragPos;
  color += doLine(rot1, RADIUS, rot1.y);

  color += max(luma(color) - 1.0, 0.0);
  color *= 1.8;

  fragColor = vec4(color, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

const shader2 = `
precision highp float;
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

out vec4 fragColor;

float colormap_red(float x) {
  if (x < 0.0) {
    return 54.0 / 255.0;
  } else if (x < 20049.0 / 82979.0) {
    return (829.79 * x + 54.51) / 255.0;
  } else {
    return 1.0;
  }
}

float colormap_green(float x) {
  if (x < 20049.0 / 82979.0) {
    return 0.0;
  } else if (x < 327013.0 / 810990.0) {
    return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
  } else if (x <= 1.0) {
    return (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0;
  } else {
    return 1.0;
  }
}

float colormap_blue(float x) {
  if (x < 0.0) {
    return 54.0 / 255.0;
  } else if (x < 7249.0 / 82979.0) {
    return (829.79 * x + 54.51) / 255.0;
  } else if (x < 20049.0 / 82979.0) {
    return 127.0 / 255.0;
  } else if (x < 327013.0 / 810990.0) {
    return (792.0224934136139 * x - 64.36479073560233) / 255.0;
  } else {
    return 1.0;
  }
}

vec4 colormap(float x) {
  return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 1.0);
}

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);

  float res = mix(
    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );

  return res * res;
}

const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p) {
  float f = 0.0;

  f += 0.500000 * noise(p + iTime);
  p = mtx * p * 2.02;

  f += 0.031250 * noise(p);
  p = mtx * p * 2.01;

  f += 0.250000 * noise(p);
  p = mtx * p * 2.03;

  f += 0.125000 * noise(p);
  p = mtx * p * 2.01;

  f += 0.062500 * noise(p);
  p = mtx * p * 2.04;

  f += 0.015625 * noise(p + sin(iTime));

  return f / 0.96875;
}

float pattern(in vec2 p) {
  return fbm(p + fbm(p + fbm(p)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.x;
  float shade = pattern(uv);

  vec3 color = colormap(shade).rgb;
  color *= 1.6;

  fragColor = vec4(color, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

const shader3 = `
precision highp float;
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

#define FAR 30.0

float map(vec3 p) {
  float n = sin(dot(floor(p), vec3(7.0, 157.0, 113.0)));
  vec3 rnd = fract(vec3(2097152.0, 262144.0, 32768.0) * n) * 0.16 - 0.08;

  p = fract(p + rnd) - 0.5;

  float eq = texture(iChannel0, vec2(fract(n), 0.25)).r;
  float boxsize = 0.1 + eq * 0.6;

  p = abs(p);
  return max(p.x, max(p.y, p.z)) - boxsize + dot(p, p) * 0.5;
}

float trace(vec3 ro, vec3 rd) {
  float t = 0.0;
  float d = 0.0;

  for (int i = 0; i < 64; i++) {
    d = map(ro + rd * t);

    if (abs(d) < 0.002 || t > FAR) {
      break;
    }

    t += d * 0.75;
  }

  return t;
}

vec3 getNormal(in vec3 p) {
  vec2 e = vec2(0.0035, -0.0035);

  return normalize(
    e.xyy * map(p + e.xyy) +
    e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) +
    e.xxx * map(p + e.xxx)
  );
}

vec3 getObjectColor(vec3 p) {
  vec3 col = vec3(1.0);

  if (fract(dot(floor(p), vec3(0.5))) > 0.001) {
    col = vec3(0.6, 0.3, 1.0);
  }

  return col;
}

vec3 doColor(in vec3 sp, in vec3 rd, in vec3 sn, in vec3 lp) {
  vec3 ld = lp - sp;
  float lDist = max(length(ld), 0.001);
  ld /= lDist;

  float atten = 1.0 / (1.0 + lDist * 0.2 + lDist * lDist * 0.1);
  float diff = max(dot(sn, ld), 0.0);
  float spec = pow(max(dot(reflect(-ld, sn), -rd), 0.0), 8.0);

  vec3 objCol = getObjectColor(sp);
  vec3 sceneCol = (objCol * (diff + 0.15) + vec3(1.0, 0.6, 0.2) * spec * 2.0) * atten;

  return sceneCol;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord.xy - iResolution.xy * 0.5) / iResolution.y;

  vec3 rd = normalize(vec3(uv, 1.0));

  float cs = cos(iTime * 0.25);
  float si = sin(iTime * 0.25);

  rd.xy = mat2(cs, si, -si, cs) * rd.xy;
  rd.xz = mat2(cs, si, -si, cs) * rd.xz;

  vec3 ro = vec3(0.0, 0.0, iTime * 1.5);
  vec3 lp = ro + vec3(0.0, 1.0, -0.5);

  float t = trace(ro, rd);
  float fog = smoothstep(0.0, 0.95, t / FAR);

  ro += rd * t;

  vec3 sn = getNormal(ro);
  vec3 sceneColor = doColor(ro, rd, sn, lp);

  sceneColor = mix(sceneColor, vec3(0.0), fog);
  sceneColor *= 1.8;

  fragColor = vec4(sqrt(clamp(sceneColor, 0.0, 1.0)), 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

const shader4 = `
precision highp float;
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

float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float res = mix(
    mix(
      fract(sin(dot(i + vec2(0.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453123),
      fract(sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453123),
      f.x
    ),
    mix(
      fract(sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453123),
      fract(sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453123),
      f.x
    ),
    f.y
  );

  return res;
}

float fbm(in vec2 p) {
  float f = 0.0;

  f += 0.5000 * noise(p);
  p = p * 2.02 + vec2(0.15);

  f += 0.2500 * noise(p);
  p = p * 2.03 + vec2(0.15);

  f += 0.1250 * noise(p);
  p = p * 2.01 + vec2(0.15);

  f += 0.0625 * noise(p);

  return f / 0.9375;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;

  float bass = texture(iChannel0, vec2(0.02, 0.0)).x + 0.28;
  float mids = texture(iChannel0, vec2(0.30, 0.0)).x + 0.22;

  float bassActivity = smoothstep(0.18, 0.75, bass) * 1.35;
  float midActivity = pow(mids, 2.0) * 1.75;

  vec2 p = uv * 3.0;

  vec2 q = vec2(
    fbm(p + iTime * 0.22),
    fbm(p + vec2(5.2, 1.3) - iTime * 0.12)
  );

  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + bassActivity + iTime * 0.55),
    fbm(p + 4.0 * q + vec2(8.3, 2.8) - bassActivity + iTime * 0.35)
  );

  float f = fbm(p + 4.0 * r);

  vec3 deepBlue = vec3(0.04, 0.05, 0.20);
  vec3 electricBlue = vec3(0.10, 0.45, 1.00);
  vec3 cyan = vec3(0.00, 0.95, 1.00);
  vec3 gold = vec3(1.00, 0.72, 0.22);
  vec3 purple = vec3(0.65, 0.25, 1.00);

  vec3 col = mix(deepBlue, electricBlue, f);

  float highlight = dot(r, r);
  col = mix(col, gold, highlight * highlight * 0.85);

  float centerGlow = 1.0 / (1.0 + 7.0 * dot(uv, uv));
  float waveGlow = smoothstep(0.35, 1.0, f);

  col += cyan * centerGlow * 0.55;
  col += purple * waveGlow * 0.28;

  col *= 1.05 + midActivity * 1.35;
  col = col * col * 4.6;

  col *= 1.0 - length(uv) * 0.25;

  fragColor = vec4(col, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

export const PREVIEW_SHADERS = [shader1, shader2, shader3, shader4];

export const DEFAULT_PREVIEW_GLSL = shader4;

export function getPreviewShaderById(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % PREVIEW_SHADERS.length;

  return PREVIEW_SHADERS[index];
}
