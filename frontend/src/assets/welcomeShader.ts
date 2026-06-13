export const welcomeShader = `
precision highp float;
precision highp int;

uniform vec3      iResolution;           // viewport resolution (in pixels)
uniform float     iTime;                 // shader playback time (in seconds)
uniform float     iTimeDelta;            // render time (in seconds)
uniform float     iFrameRate;            // shader frame rate
uniform int       iFrame;                // shader playback frame
uniform float     iChannelTime[4];       // channel playback time (in seconds)
uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform vec4      iDate;                 // (year, month, day, time in seconds)
uniform sampler2D iChannel0;             // Audio input texture
out vec4 fragColor;

float getAudio(float freq) {
    return texture(iChannel0, vec2(fract(freq), 0.25)).x;
}

float sdLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    
    float bass = getAudio(0.05);
    float mid = getAudio(0.4);
    float treble = getAudio(0.8);

    uv.y += sin(iTime * 2.0) * 0.05;
    
    uv *= 1.0 - (bass * 0.15);

    uv = uv * 1.45 + vec2(0.0, 0.14);

    uv.x = abs(uv.x);

    vec2 pNose = vec2(0.0, -0.2);
    vec2 pCheek1 = vec2(0.25, -0.05);
    vec2 pCheek2 = vec2(0.4, 0.15);
    
    vec2 pEarTip = vec2(0.3 + treble * 0.05, 0.5 + treble * 0.2);
    vec2 pEarInner = vec2(0.1, 0.25);
    vec2 pHeadTop = vec2(0.0, 0.2);

    float dOutline = sdLine(uv, pNose, pCheek1);
    dOutline = min(dOutline, sdLine(uv, pCheek1, pCheek2));
    dOutline = min(dOutline, sdLine(uv, pCheek2, pEarTip));
    dOutline = min(dOutline, sdLine(uv, pEarTip, pEarInner));
    dOutline = min(dOutline, sdLine(uv, pEarInner, pHeadTop));
    
    dOutline = min(dOutline, sdLine(uv, pEarInner, vec2(0.2, 0.35)));

    float glowWidth = 0.003 + (mid * 0.002);
    float glowLine = glowWidth / (dOutline + 0.001);
    vec3 color = vec3(1.0, 0.3 + mid * 0.3, 0.0) * glowLine; // Neon Orange

    vec2 pEye1 = vec2(0.12, 0.0);
    vec2 pEye2 = vec2(0.25, 0.05 - bass * 0.04);
    float dEye = sdLine(uv, pEye1, pEye2);
    
    color += vec3(0.0, 0.8, 1.0) * (0.004 / (dEye + 0.001));

    float dNose = length(uv - pNose) - 0.02;
    color += vec3(1.0, 0.2, 0.5) * (0.005 / (max(dNose, 0.0) + 0.001)); // Pink nose

    vec2 pW1 = vec2(0.15, -0.1);
    vec2 pW1_end = vec2(0.35, -0.15);
    vec2 pW2 = vec2(0.18, -0.05);
    vec2 pW2_end = vec2(0.4, -0.05);

    float dWhiskers = sdLine(uv, pW1, pW1_end);
    dWhiskers = min(dWhiskers, sdLine(uv, pW2, pW2_end));

    color += vec3(0.8, 0.9, 1.0) * (0.0015 / (dWhiskers + 0.001));
    color += vec3(1.0, 0.2, 0.0) * max(0.0, 0.15 - length(uv)) * bass * 2.0;
    fragColor = vec4(color, 1.0);
}

void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}
`;
