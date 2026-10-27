import React, { forwardRef, useEffect, useImperativeHandle, useRef, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import './BinaryOrbits.css';

const TWO_PI = 2 * Math.PI;

const subscribeReducedMotion = (callback) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

let colorContext = null;
const parseColorToRgb = (colorStr, fallback = [0.04, 0.04, 0.04]) => {
  if (typeof document === 'undefined') return fallback;
  if (!colorContext) {
    const canvas = document.createElement('canvas');
    colorContext = canvas.getContext('2d');
  }
  if (!colorContext) return fallback;
  colorContext.fillStyle = '#010203';
  colorContext.fillStyle = colorStr;
  const resolved = String(colorContext.fillStyle);
  if (resolved === '#010203' && colorStr.trim().toLowerCase() !== '#010203') {
    return fallback;
  }
  if (resolved.startsWith('#')) {
    const hex = resolved.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255
    ];
  }
  const match = resolved.match(/[\d.]+/g);
  if (!match || match.length < 3) return fallback;
  return [Number(match[0]) / 255, Number(match[1]) / 255, Number(match[2]) / 255];
};

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

const rgbToOklab = ([r, g, b]) => {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
};

const orbitCommonGlsl = `
uniform float uTime;
uniform float uSpin;
uniform float uCoreRadius;
uniform float uArms;
uniform float uTwist;
uniform float uEps;
uniform float uPattern;

float omega(float a) {
  return uSpin / sqrt(a * a + uCoreRadius * uCoreRadius);
}

vec3 orbit(float a, float psi, float bulge, out float phase) {
  float th = psi + omega(a) * uTime;
  phase = uArms * (th + uTwist * log(max(a, 1e-3)) - uPattern * uTime);
  float r = a * (1.0 - uEps * cos(phase) * (1.0 - bulge));
  return vec3(r * cos(th), r * sin(th), th);
}
`;

const stateSimFragmentGlsl = `
precision highp float;
uniform sampler2D uStatic;
uniform sampler2D uState;
uniform vec4 uSegment;
uniform float uGather;
uniform float uDrag;
uniform float uWidth;
uniform float uDecay;
${orbitCommonGlsl}
out vec4 fragColor;

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  vec2 offset = texelFetch(uState, cell, 0).xy;
  if (uGather > 0.0) {
    vec4 star = texelFetch(uStatic, cell, 0);
    float phase;
    vec3 at = orbit(star.x, star.y, star.z, phase);
    vec2 radial = vec2(cos(at.z), sin(at.z));
    vec2 tangent = vec2(-radial.y, radial.x);
    vec2 p = at.xy + radial * offset.x + tangent * offset.y;
    vec2 d = uSegment.zw - uSegment.xy;
    float len = length(d);
    vec2 dir = len > 1e-6 ? d / len : vec2(1.0, 0.0);
    float along = clamp(dot(p - uSegment.xy, dir), 0.0, len);
    vec2 n = p - uSegment.xy - dir * along;
    float w = exp(-dot(n, n) / (uWidth * uWidth)) * (1.0 - 0.7 * star.z) * smoothstep(0.05, 0.3, star.x);
    vec2 delta = (dir * uDrag * uWidth - n * uGather) * w;
    offset += vec2(dot(delta, radial), dot(delta, tangent));
  }
  fragColor = vec4(offset * uDecay, 0.0, 1.0);
}
`;

const starVertexGlsl = `
in vec4 aOrbit;
in vec4 aTraits;
uniform sampler2D uState;
uniform int uStride;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uFocal;
uniform float uDistance;
uniform float uIncline;
uniform float uRoll;
uniform float uPixelRatio;
uniform float uRealTime;
uniform float uDust;
uniform float uCore;
uniform float uVoid;
uniform float uSize;
uniform float uSizeScale;
uniform float uSparkle;
uniform float uTwinkle;
uniform float uBack;
uniform float uEnergy;
uniform float uInk;
uniform vec3 uLabA;
uniform vec3 uLabB;
uniform vec4 uRipples[6];
uniform float uActive;
${orbitCommonGlsl}
out vec3 vColor;
out float vGain;

vec3 labToLinear(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return max(vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ), 0.0);
}

void main() {
  float a = aOrbit.x;
  float bulge = aTraits.x;
  float phase;
  vec3 at = orbit(a, aOrbit.y, bulge, phase);
  vec2 radial = vec2(cos(at.z), sin(at.z));
  vec2 tangent = vec2(-radial.y, radial.x);
  vec2 offset = texelFetch(uState, ivec2(gl_VertexID % uStride, gl_VertexID / uStride), 0).xy;
  vec3 p = vec3(at.xy + radial * offset.x + tangent * offset.y, aOrbit.z);
  float tidal = smoothstep(0.004, 0.03, length(offset));
  float ring = 0.0;
  if (uActive > 0.5) {
    for (int k = 0; k < 6; k++) {
      vec4 wave = uRipples[k];
      if (wave.w <= 0.0) continue;
      float age = uRealTime - wave.z;
      if (age < 0.0 || age > 7.0) continue;
      vec2 rel = p.xy - wave.xy;
      float rr = length(rel);
      float front = 0.05 + 0.32 * age;
      float width = 0.07 + 0.03 * age;
      float g = (rr - front) / width;
      float band = exp(-g * g);
      float envelope = wave.w * smoothstep(0.0, 0.7, age) * exp(-age / 2.2) * smoothstep(0.03, 0.2, front + length(wave.xy));
      p.xy -= rel / max(rr, 1e-4) * (rr - front) * 0.55 * envelope * band;
      p.z += 0.03 * envelope * band;
      ring += envelope * band;
    }
  }

  float ci = cos(uIncline);
  float si = sin(uIncline);
  vec3 q = vec3(p.x, p.y * ci + p.z * si, -p.y * si + p.z * ci);
  float cr = cos(uRoll);
  float sr = sin(uRoll);
  q.xy = vec2(cr * q.x - sr * q.y, sr * q.x + cr * q.y);
  float depth = uDistance - q.z;
  vec2 screen = uCenter + uFocal * q.xy / depth;

  float mk = uArms * uTwist;
  float crest = (cos(phase) - mk * sin(phase)) / sqrt(1.0 + mk * mk);
  float arm = pow(max(crest, 0.0), 2.0) * (1.0 - bulge);
  float laneCrest = (cos(phase - 0.55) - mk * sin(phase - 0.55)) / sqrt(1.0 + mk * mk);
  float lane = pow(max(laneCrest, 0.0), 8.0) * (1.0 - arm) * (1.0 - bulge) * smoothstep(0.1, 0.3, a);

  float reach = smoothstep(0.02, 0.55, a);
  vec3 tone = labToLinear(mix(uLabB, uLabA, reach));
  vec3 core = labToLinear(vec3(min(uLabB.x * 1.08 + 0.06, 0.98), uLabB.yz * 0.45));
  vec3 color = mix(tone, core, bulge * 0.75);
  vec3 youngColor = labToLinear(vec3(min(uLabB.x * 0.92, 0.9), uLabB.yz * 1.25));
  float young = smoothstep(0.84, 0.97, aTraits.z) * arm;
  float kindled = clamp(tidal * 0.7 + ring * 1.5, 0.0, 0.75) * (1.0 - bulge * 0.7);
  color = mix(color, youngColor, max(young * 0.75, kindled));
  float bright = step(1.0 - uSparkle, aTraits.y) * (1.0 - bulge * 0.6);
  color = mix(color, vec3(1.0, 0.97, 1.0), bright * 0.35);

  float twinkle = 1.0 - uTwinkle * 0.55 * (0.5 + 0.5 * sin(uRealTime * (0.6 + 1.6 * aTraits.w) + aTraits.w * 61.0));
  float body = mix(0.5 + 1.2 * arm + young * 1.4, uCore * 1.1, bulge) * (1.0 + bright * 2.2);
  body *= 1.0 - uDust * 0.8 * lane;
  float edge = 1.0 - smoothstep(0.82, 1.08, a);
  float hollow = smoothstep(uVoid * 0.85, uVoid * 1.15 + 0.01, a);
  float near = clamp(0.5 + 0.5 * q.z / 0.9, 0.0, 1.0);
  float gain = body * edge * hollow * twinkle * mix(uBack, 1.0, near) * (1.0 + uEnergy * 0.15);
  gain *= 1.0 + 0.9 * tidal * (1.0 - bulge * 0.7) + 0.5 * min(ring, 1.0);

  vColor = mix(color, labToLinear(vec3(uLabA.x * 0.62, uLabA.yz * 1.15)), uInk * 0.35);
  vGain = gain;
  float size = uSize * uSizeScale * uPixelRatio * mix(0.6, 1.1, fract(aTraits.y * 7.31)) * (1.0 + bright * 0.7 + young * 0.4);
  gl_PointSize = max(size * uDistance / depth, 1.0);
  gl_Position = vec4(screen / uResolution * 2.0 - 1.0, 0.0, 1.0);
}
`;

const starFragmentGlsl = `
precision highp float;
uniform float uStarGain;
in vec3 vColor;
in float vGain;
out vec4 fragColor;

void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  float e = (exp(-r2 * 6.0) + 0.25 * exp(-r2 * 2.0)) * vGain * uStarGain;
  fragColor = vec4(vColor * e, e);
}
`;

const quadVertexGlsl = `
in vec3 position;
in vec2 uv;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const downsampleBloomGlsl = `
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec4 a = texture(uSource, vUv + uTexel * vec2(-1.0, -1.0));
  vec4 b = texture(uSource, vUv + uTexel * vec2(1.0, -1.0));
  vec4 c = texture(uSource, vUv + uTexel * vec2(-1.0, 1.0));
  vec4 d = texture(uSource, vUv + uTexel * vec2(1.0, 1.0));
  fragColor = (a + b + c + d) * 0.125 + texture(uSource, vUv) * 0.5;
}
`;

const upsampleBloomGlsl = `
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec4 sum = texture(uSource, vUv) * 4.0;
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, 0.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(1.0, 0.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(0.0, -1.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(0.0, 1.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, -1.0));
  sum += texture(uSource, vUv + uTexel * vec2(1.0, -1.0));
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, 1.0));
  sum += texture(uSource, vUv + uTexel * vec2(1.0, 1.0));
  fragColor = texture(uBase, vUv) + sum / 16.0;
}
`;

const compositeFragmentGlsl = `
precision highp float;
uniform sampler2D uLines;
uniform sampler2D uBloom;
uniform vec3 uBackground;
uniform float uGlow;
uniform float uExposure;
uniform float uMode;
uniform float uGrain;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  vec4 lines = texture(uLines, vUv);
  vec4 bloom = texture(uBloom, vUv);
  vec3 color;
  if (uMode < 0.5) {
    vec3 light = (lines.rgb + bloom.rgb * uGlow) * uExposure;
    vec3 exposed = 1.0 - exp(-light);
    float peak = max(exposed.r, max(exposed.g, exposed.b));
    exposed = mix(exposed, vec3(peak), smoothstep(0.75, 1.0, peak) * 0.35);
    color = uBackground + (1.0 - uBackground) * exposed;
  } else {
    float energy = lines.a + bloom.a * uGlow * 0.2;
    vec3 hue = (lines.rgb + bloom.rgb * uGlow * 0.2) / max(energy, 1e-4);
    float cover = clamp(1.0 - exp(-energy * uExposure * 1.4), 0.0, 0.94);
    color = mix(uBackground, clamp(hue * 0.8, 0.0, 1.0), cover);
  }
  float grain = hash(gl_FragCoord.xy + uGrain * 311.0) - 0.5;
  fragColor = vec4(encode(color) + grain * (1.2 / 255.0), 1.0);
}
`;

/**
 * BinaryOrbits - Official React Bits Pro Implementation
 * A tilted spiral galaxy of stars streaming through its arms
 */
const BinaryOrbits = forwardRef(function BinaryOrbits(
  {
    colors = ['#00ffbc', '#00fafc'],
    backgroundColor = '#0d0300',
    mode = 'auto',
    stars = 70000,
    starSize = 1.7,
    sparkle = 0.5,
    arms = 3,
    twist = 3.5,
    armStrength = 1.0,
    dust = 0.5,
    core = 1,
    coreSize = 0.07,
    innerVoid = 0,
    thickness = 0.02,
    tilt = 62,
    roll = -8,
    scale = 1,
    centerX = 0.5,
    centerY = 0.52,
    speed = 1,
    twinkle = 0.35,
    depth = 0.4,
    glow = 0.45,
    intensity = 1,
    interactive = true,
    hoverWake = true,
    clickRipple = true,
    wakeStrength = 1,
    rippleStrength = 1,
    hoverBoost = 0.5,
    paused = false,
    quality = 1,
    className = '',
    style = {},
    children
  },
  ref
) {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  const propsRef = useRef({
    colors,
    backgroundColor,
    mode,
    stars,
    starSize,
    sparkle,
    arms,
    twist,
    armStrength,
    dust,
    core,
    coreSize,
    innerVoid,
    thickness,
    tilt,
    roll,
    scale,
    centerX,
    centerY,
    speed,
    twinkle,
    depth,
    glow,
    intensity,
    interactive,
    hoverWake,
    clickRipple,
    wakeStrength,
    rippleStrength,
    hoverBoost,
    paused,
    quality,
    reduced: reducedMotion
  });

  useEffect(() => {
    propsRef.current = {
      colors,
      backgroundColor,
      mode,
      stars,
      starSize,
      sparkle,
      arms,
      twist,
      armStrength,
      dust,
      core,
      coreSize,
      innerVoid,
      thickness,
      tilt,
      roll,
      scale,
      centerX,
      centerY,
      speed,
      twinkle,
      depth,
      glow,
      intensity,
      interactive,
      hoverWake,
      clickRipple,
      wakeStrength,
      rippleStrength,
      hoverBoost,
      paused,
      quality,
      reduced: reducedMotion
    };
    controllerRef.current?.sync();
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initEngine = (domElement, pRef) => {
      let renderer;
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.className = 'binary-orbits-canvas';
      domElement.prepend(canvas);

      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: false,
          antialias: false,
          powerPreference: 'high-performance'
        });
      } catch {
        canvas.remove();
        return null;
      }

      if (!renderer.capabilities.isWebGL2) {
        renderer.dispose();
        canvas.remove();
        return null;
      }

      renderer.autoClear = false;

      const halfFloat =
        renderer.extensions.has('EXT_color_buffer_float') ||
        renderer.extensions.has('EXT_color_buffer_half_float')
          ? THREE.HalfFloatType
          : THREE.UnsignedByteType;

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const quadGeometry = new THREE.PlaneGeometry(2, 2);
      const ripples = Array.from({ length: 6 }, () => new THREE.Vector4(0, 0, -100, 0));
      const floatType = renderer.extensions.has('EXT_color_buffer_float')
        ? THREE.FloatType
        : THREE.HalfFloatType;

      const commonUniforms = {
        uTime: { value: 0 },
        uSpin: { value: 0.11 },
        uCoreRadius: { value: 0.12 },
        uArms: { value: 3 },
        uTwist: { value: 3.5 },
        uEps: { value: 0.1 },
        uPattern: { value: 0.04 }
      };

      const starMaterial = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          ...commonUniforms,
          uState: { value: null },
          uStride: { value: 512 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uCenter: { value: new THREE.Vector2() },
          uFocal: { value: 1 },
          uDistance: { value: 3.6 },
          uIncline: { value: 1 },
          uRoll: { value: 0 },
          uPixelRatio: { value: 1 },
          uRealTime: { value: 0 },
          uDust: { value: 0.5 },
          uCore: { value: 1 },
          uVoid: { value: 0 },
          uSize: { value: 1.4 },
          uSizeScale: { value: 1 },
          uSparkle: { value: 0.08 },
          uTwinkle: { value: 0.4 },
          uBack: { value: 0.5 },
          uEnergy: { value: 0 },
          uInk: { value: 0 },
          uLabA: { value: new THREE.Vector3() },
          uLabB: { value: new THREE.Vector3() },
          uRipples: { value: ripples },
          uActive: { value: 0 },
          uStarGain: { value: 0.3 }
        },
        vertexShader: starVertexGlsl,
        fragmentShader: starFragmentGlsl,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor
      });

      const makeQuadMaterial = (frag, unifs) =>
        new THREE.RawShaderMaterial({
          glslVersion: THREE.GLSL3,
          uniforms: unifs,
          vertexShader: quadVertexGlsl,
          fragmentShader: frag,
          depthTest: false,
          depthWrite: false,
          blending: THREE.NoBlending
        });

      const stateMaterial = makeQuadMaterial(stateSimFragmentGlsl, {
        ...commonUniforms,
        uStatic: { value: null },
        uState: { value: null },
        uSegment: { value: new THREE.Vector4() },
        uGather: { value: 0 },
        uDrag: { value: 0 },
        uWidth: { value: 0.09 },
        uDecay: { value: 1 }
      });

      const downsampleMaterial = makeQuadMaterial(downsampleBloomGlsl, {
        uSource: { value: null },
        uTexel: { value: new THREE.Vector2() }
      });

      const upsampleMaterial = makeQuadMaterial(upsampleBloomGlsl, {
        uSource: { value: null },
        uBase: { value: null },
        uTexel: { value: new THREE.Vector2() }
      });

      const compositeMaterial = makeQuadMaterial(compositeFragmentGlsl, {
        uLines: { value: null },
        uBloom: { value: null },
        uBackground: { value: new THREE.Vector3() },
        uGlow: { value: 0.5 },
        uExposure: { value: 1 },
        uMode: { value: 0 },
        uGrain: { value: 0 }
      });

      const points = new THREE.Points(new THREE.BufferGeometry(), starMaterial);
      points.frustumCulled = false;
      const starScene = new THREE.Scene();
      starScene.add(points);

      const quadMesh = new THREE.Mesh(quadGeometry, compositeMaterial);
      quadMesh.frustumCulled = false;
      const quadScene = new THREE.Scene();
      quadScene.add(quadMesh);

      let configSignature = '';
      let staticTexture = null;
      let stateTargets = [];
      let currentStateIdx = 0;

      const createTarget = (w, h) =>
        new THREE.WebGLRenderTarget(Math.max(1, w), Math.max(1, h), {
          type: halfFloat,
          format: THREE.RGBAFormat,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
          stencilBuffer: false,
          generateMipmaps: false
        });

      let renderTargetScene = null;
      let downTargets = [];
      let upTargets = [];
      let isDestroyed = false;
      let animFrameId = 0;
      let lastTimeMs = 0;
      let isVisible = true;
      let simTime = 40;
      let realTime = 0;
      let energySmoothed = 0;
      let containerWidth = 1;
      let containerHeight = 1;
      let effectiveDpr = 1;
      let grainSeed = 0;
      let lastWakeTime = -100;
      const pointerState = { inside: false, disc: null, trail: null };

      const disposeTargets = () => {
        renderTargetScene?.dispose();
        downTargets.forEach((t) => t.dispose());
        upTargets.forEach((t) => t.dispose());
        renderTargetScene = null;
        downTargets = [];
        upTargets = [];
      };

      const renderPass = (mat, target) => {
        quadMesh.material = mat;
        renderer.setRenderTarget(target);
        renderer.render(quadScene, camera);
      };

      const generateStars = () => {
        const p = pRef.current;
        const count = Math.round(clamp(p.stars, 2000, 250000));
        const coreRad = clamp(p.coreSize, 0.02, 0.3);
        const thick = clamp(p.thickness, 0, 0.2);
        const sig = [count, coreRad, thick].join('|');
        if (sig === configSignature) return;

        configSignature = sig;
        points.geometry.dispose();
        staticTexture?.dispose();
        stateTargets.forEach((t) => t.dispose());

        const createGeometryAndTex = (numStars, cRad, discThick) => {
          let seed = 23;
          const rand = () => ((seed = (16807 * seed) % 0x7fffffff) / 0x7fffffff);
          const randGaussian = () =>
            Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-9))) * Math.cos(TWO_PI * rand());

          const rows = Math.ceil(numStars / 512);
          const vertexArray = new Float32Array(8 * numStars);
          const staticArray = new Float32Array(512 * rows * 4);

          for (let i = 0; i < numStars; i++) {
            let radius, zVal;
            const isBulge = rand() < 0.16;
            if (isBulge) {
              radius = Math.min(
                cRad / Math.sqrt(Math.pow(Math.min(Math.max(rand(), 1e-4), 0.995), -2 / 3) - 1),
                4 * cRad
              );
              zVal = randGaussian() * radius * 0.5;
            } else {
              do {
                radius = -0.32 * Math.log(Math.max(rand() * rand(), 1e-9));
              } while (radius > 1.08);
              radius = Math.max(radius, 0.012);
              zVal = randGaussian() * discThick * (0.5 + 0.5 * Math.exp(-radius / 0.25));
            }
            const angle = rand() * TWO_PI;
            vertexArray.set(
              [radius, angle, zVal, rand(), isBulge ? 1 : 0, rand(), rand(), rand()],
              8 * i
            );
            staticArray.set([radius, angle, isBulge ? 1 : 0, 0], 4 * i);
          }

          const geom = new THREE.BufferGeometry();
          const buffer = new THREE.InterleavedBuffer(vertexArray, 8);
          geom.setAttribute('aOrbit', new THREE.InterleavedBufferAttribute(buffer, 4, 0));
          geom.setAttribute('aTraits', new THREE.InterleavedBufferAttribute(buffer, 4, 4));
          geom.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer, 3, 0));

          const tex = new THREE.DataTexture(
            staticArray,
            512,
            rows,
            THREE.RGBAFormat,
            floatType
          );
          tex.minFilter = THREE.NearestFilter;
          tex.magFilter = THREE.NearestFilter;
          tex.generateMipmaps = false;
          tex.needsUpdate = true;

          return { geometry: geom, texture: tex, rows };
        };

        const result = createGeometryAndTex(count, coreRad, thick);
        points.geometry = result.geometry;
        staticTexture = result.texture;

        stateTargets = [0, 1].map(
          () =>
            new THREE.WebGLRenderTarget(512, result.rows, {
              type: floatType,
              format: THREE.RGBAFormat,
              minFilter: THREE.NearestFilter,
              magFilter: THREE.NearestFilter,
              depthBuffer: false,
              stencilBuffer: false,
              generateMipmaps: false
            })
        );
        currentStateIdx = 0;

        for (const target of stateTargets) {
          renderer.setRenderTarget(target);
          renderer.setClearColor(0, 0);
          renderer.clear();
        }

        stateMaterial.uniforms.uStatic.value = staticTexture;
        starMaterial.uniforms.uState.value = stateTargets[0].texture;
      };

      const getProjectionParams = () => {
        const p = pRef.current;
        const width = containerWidth * effectiveDpr;
        const height = containerHeight * effectiveDpr;
        const minDim = 0.36 * clamp(p.scale, 0.2, 4) * Math.min(width, 1.7 * height);
        return {
          incline: (clamp(p.tilt, 0, 85) * Math.PI) / 180,
          roll: (clamp(p.roll, -180, 180) * Math.PI) / 180,
          focal: 3.6 * minDim,
          center: [
            clamp(p.centerX, -0.5, 1.5) * width,
            (1 - clamp(p.centerY, -0.5, 1.5)) * height
          ]
        };
      };

      const projectPointerToGalaxy = (clientX, clientY) => {
        const rect = domElement.getBoundingClientRect();
        const proj = getProjectionParams();
        const screenX = (clientX - rect.left) * effectiveDpr;
        const screenY = (rect.height - (clientY - rect.top)) * effectiveDpr;
        const normX = (screenX - proj.center[0]) / proj.focal;
        const normY = (screenY - proj.center[1]) / proj.focal;
        const cosRoll = Math.cos(proj.roll);
        const sinRoll = Math.sin(proj.roll);
        const rotatedY = -sinRoll * normX + cosRoll * normY;
        const cosInc = Math.cos(proj.incline);
        const sinInc = Math.sin(proj.incline);
        const denominator = cosInc - rotatedY * sinInc;
        if (denominator <= 0.02) return null;
        const discY = (3.6 * rotatedY) / denominator;
        const discX = (cosRoll * normX + sinRoll * normY) * (3.6 + discY * sinInc);
        return { x: discX, y: discY };
      };

      const triggerRipple = (x = 0, y = 0) => {
        const p = pRef.current;
        if (p.reduced || p.paused) return;
        const strength = clamp(p.rippleStrength, 0, 3);
        let newest = 0;
        let oldest = 0;
        for (let i = 1; i < 6; i++) {
          if (ripples[i].z > ripples[newest].z) newest = i;
          if (ripples[i].z < ripples[oldest].z) oldest = i;
        }
        const newestWave = ripples[newest];
        if (
          newestWave.w > 0 &&
          realTime - newestWave.z < 0.35 &&
          Math.hypot(newestWave.x - x, newestWave.y - y) < 0.15
        ) {
          newestWave.w = Math.min(newestWave.w + 0.3 * strength, 1.6 * strength);
        } else if (realTime - ripples[oldest].z > 7) {
          ripples[oldest].set(x, y, realTime, strength);
        } else {
          newestWave.w = Math.min(newestWave.w + 0.25 * strength, 1.6 * strength);
        }
        requestTick();
      };

      const hasActiveRipples = () => ripples.some((r) => r.w > 0 && realTime - r.z < 7);

      const renderFrame = () => {
        if (!renderTargetScene || !downTargets.length) return;
        generateStars();

        const p = pRef.current;
        const sUniforms = starMaterial.uniforms;
        const width = containerWidth * effectiveDpr;
        const height = containerHeight * effectiveDpr;
        const proj = getProjectionParams();

        const bgRgb = parseColorToRgb(p.backgroundColor, [0.04, 0.04, 0.04]);
        const bgLuminance = 0.2126 * bgRgb[0] + 0.7152 * bgRgb[1] + 0.0722 * bgRgb[2];
        const isInkMode = p.mode === 'ink' || (p.mode === 'auto' && bgLuminance > 0.5);

        const colorA = rgbToOklab(parseColorToRgb(p.colors[0], [0.48, 0.3, 1]));
        const colorB = rgbToOklab(parseColorToRgb(p.colors[1], [1, 0.78, 0.95]));

        const armsCount = Math.round(clamp(p.arms, 1, 8));
        const twistVal = clamp(p.twist, 0.5, 8);
        const armStr = clamp(p.armStrength, 0, 1);

        sUniforms.uResolution.value.set(width, height);
        sUniforms.uCenter.value.set(proj.center[0], proj.center[1]);
        sUniforms.uFocal.value = proj.focal;
        sUniforms.uIncline.value = proj.incline;
        sUniforms.uRoll.value = proj.roll;
        sUniforms.uPixelRatio.value = effectiveDpr;

        commonUniforms.uTime.value = simTime;
        sUniforms.uRealTime.value = realTime;
        commonUniforms.uArms.value = armsCount;
        commonUniforms.uTwist.value = twistVal;
        commonUniforms.uEps.value = (0.92 * armStr) / Math.sqrt(1 + armsCount * armsCount * twistVal * twistVal);

        sUniforms.uDust.value = clamp(p.dust, 0, 1);
        sUniforms.uCore.value = clamp(p.core, 0, 3);
        sUniforms.uVoid.value = clamp(p.innerVoid, 0, 0.6);
        sUniforms.uSize.value = clamp(p.starSize, 0.3, 6);
        sUniforms.uSparkle.value = 0.2 * clamp(p.sparkle, 0, 1);
        sUniforms.uTwinkle.value = p.reduced ? 0 : clamp(p.twinkle, 0, 1);
        sUniforms.uBack.value = 1 - clamp(p.depth, 0, 1);
        sUniforms.uEnergy.value = energySmoothed;
        sUniforms.uInk.value = isInkMode ? 1 : 0;
        sUniforms.uLabA.value.set(colorA[0], colorA[1], colorA[2]);
        sUniforms.uLabB.value.set(colorB[0], colorB[1], colorB[2]);
        sUniforms.uActive.value = hasActiveRipples() ? 1 : 0;

        const starCount = Math.round(clamp(p.stars, 2000, 250000));
        const focalRatio = Math.pow(proj.focal / 3.6 / effectiveDpr / 380, 2);
        const dynamicFraction = clamp(focalRatio, 0.2, 1);
        const scaleExponent = clamp(Math.pow(focalRatio, 0.25), 0.9, 1.22);

        points.geometry.setDrawRange(0, Math.round(starCount * dynamicFraction));
        sUniforms.uSizeScale.value = scaleExponent;
        sUniforms.uStarGain.value =
          0.3 *
          Math.sqrt(60000 / starCount) *
          clamp(focalRatio / (dynamicFraction * scaleExponent * scaleExponent), 0.5, 1.5);

        const compUniforms = compositeMaterial.uniforms;
        compUniforms.uBackground.value.set(
          srgbToLinear(bgRgb[0]),
          srgbToLinear(bgRgb[1]),
          srgbToLinear(bgRgb[2])
        );
        compUniforms.uGlow.value = clamp(p.glow, 0, 3);
        compUniforms.uExposure.value =
          (isInkMode ? 4.5 : 1) * clamp(p.intensity, 0, 4) * (1 + 0.08 * energySmoothed);
        compUniforms.uMode.value = isInkMode ? 1 : 0;
        compUniforms.uGrain.value = grainSeed;

        renderer.setRenderTarget(renderTargetScene);
        renderer.setClearColor(0, 0);
        renderer.clear();
        renderer.render(starScene, camera);

        // Bloom downsampling pyramid
        let currentSource = renderTargetScene;
        for (const downTarget of downTargets) {
          downsampleMaterial.uniforms.uSource.value = currentSource.texture;
          downsampleMaterial.uniforms.uTexel.value.set(1 / currentSource.width, 1 / currentSource.height);
          renderPass(downsampleMaterial, downTarget);
          currentSource = downTarget;
        }

        // Bloom upsampling blending
        let currentBloom = downTargets[downTargets.length - 1];
        for (let i = downTargets.length - 2; i >= 0; i--) {
          upsampleMaterial.uniforms.uSource.value = currentBloom.texture;
          upsampleMaterial.uniforms.uBase.value = downTargets[i].texture;
          upsampleMaterial.uniforms.uTexel.value.set(1 / currentBloom.width, 1 / currentBloom.height);
          renderPass(upsampleMaterial, upTargets[i]);
          currentBloom = upTargets[i];
        }

        // Final Composite to Canvas
        compositeMaterial.uniforms.uLines.value = renderTargetScene.texture;
        compositeMaterial.uniforms.uBloom.value = currentBloom.texture;
        renderPass(compositeMaterial, null);
      };

      const computeHoverTarget = () => {
        const p = pRef.current;
        return pointerState.inside && p.interactive && !p.reduced ? clamp(p.hoverBoost, 0, 2) : 0;
      };

      const animationLoop = (timeNow) => {
        animFrameId = 0;
        if (isDestroyed) return;

        const dtSec = Math.min(0.05, Math.max(0, (timeNow - lastTimeMs) / 1000));
        lastTimeMs = timeNow;

        const p = pRef.current;
        energySmoothed += (computeHoverTarget() - energySmoothed) * (1 - Math.exp(-dtSec / 0.5));

        if (!p.paused && !p.reduced) {
          realTime += dtSec;
          simTime += dtSec * clamp(p.speed, -4, 4) * (1 + 0.25 * energySmoothed);
          grainSeed = (grainSeed + 0.618034) % 1;
        }

        generateStars();

        // Update tidal filament sweep simulation
        if (stateTargets.length && !p.paused && !p.reduced && dtSec > 0) {
          let gather = 0;
          let drag = 0;
          const trail = pointerState.trail;
          const disc = pointerState.disc;
          const simUnifs = stateMaterial.uniforms;

          if (pointerState.inside && p.interactive && p.hoverWake && trail && disc) {
            const dist = Math.hypot(disc.x - trail.x, disc.y - trail.y);
            if (dist > 1e-5) {
              const speedNorm = clamp((dist / Math.max(dtSec, 1 / 240) - 0.05) / 1.15, 0, 1);
              gather = 0.9 * clamp(p.wakeStrength, 0, 3) * speedNorm * speedNorm * (3 - 2 * speedNorm) * (dist / (dist + 0.16));
              drag = 0.25 * gather;
              simUnifs.uSegment.value.set(trail.x, trail.y, disc.x, disc.y);
              if (gather > 0) lastWakeTime = realTime;
            }
          }

          pointerState.trail = disc ? { x: disc.x, y: disc.y } : null;

          if (gather > 0 || realTime - lastWakeTime <= 24.5) {
            simUnifs.uGather.value = gather;
            simUnifs.uDrag.value = drag;
            simUnifs.uDecay.value = Math.exp(-dtSec / 3.5);
            simUnifs.uState.value = stateTargets[currentStateIdx].texture;
            simUnifs.uTime.value = simTime;

            quadMesh.material = stateMaterial;
            renderer.setRenderTarget(stateTargets[1 - currentStateIdx]);
            renderer.render(quadScene, camera);
            currentStateIdx = 1 - currentStateIdx;
            starMaterial.uniforms.uState.value = stateTargets[currentStateIdx].texture;
          }
        }

        renderFrame();

        const currentP = pRef.current;
        const shouldRun = !currentP.paused && !currentP.reduced;
        const isTransientActive =
          Math.abs(energySmoothed - computeHoverTarget()) > 0.002 ||
          hasActiveRipples() ||
          realTime - lastWakeTime < 24.5;

        if (isVisible && !document.hidden && (shouldRun || isTransientActive)) {
          animFrameId = requestAnimationFrame(animationLoop);
        }
      };

      const requestTick = () => {
        if (!isDestroyed && !animFrameId && isVisible) {
          lastTimeMs = performance.now();
          animFrameId = requestAnimationFrame(animationLoop);
        }
      };

      const handleResize = () => {
        const rect = domElement.getBoundingClientRect();
        containerWidth = Math.max(1, rect.width);
        containerHeight = Math.max(1, rect.height);
        effectiveDpr = Math.min(window.devicePixelRatio || 1, 2) * clamp(pRef.current.quality, 0.25, 1);

        renderer.setPixelRatio(effectiveDpr);
        renderer.setSize(containerWidth, containerHeight, false);

        const w = Math.round(containerWidth * effectiveDpr);
        const h = Math.round(containerHeight * effectiveDpr);

        disposeTargets();
        renderTargetScene = createTarget(w, h);

        const mipLevels = clamp(Math.floor(Math.log2(Math.min(w, h) / 8)), 3, 7);
        for (let i = 1; i <= mipLevels; i++) {
          downTargets.push(createTarget(Math.max(1, w >> i), Math.max(1, h >> i)));
          upTargets.push(createTarget(Math.max(1, w >> i), Math.max(1, h >> i)));
        }

        renderFrame();
        requestTick();
      };

      const onPointerMove = (e) => {
        const p = pRef.current;
        if (e.pointerType === 'touch' || !p.interactive) return;
        if (!pointerState.inside) {
          pointerState.inside = true;
          pointerState.trail = null;
          requestTick();
        }
        const coords = projectPointerToGalaxy(e.clientX, e.clientY);
        pointerState.disc = coords && Math.hypot(coords.x, coords.y) < 1.6 ? coords : null;
        if (!pointerState.disc) pointerState.trail = null;
        requestTick();
      };

      const onPointerLeave = () => {
        pointerState.inside = false;
        pointerState.disc = null;
        pointerState.trail = null;
        requestTick();
      };

      const onPointerDown = (e) => {
        const p = pRef.current;
        if (e.button !== 0 || !p.interactive || !p.clickRipple) return;
        const coords = projectPointerToGalaxy(e.clientX, e.clientY);
        const valid = coords && Math.hypot(coords.x, coords.y) < 1.2;
        triggerRipple(valid ? coords.x : 0, valid ? coords.y : 0);
      };

      domElement.addEventListener('pointermove', onPointerMove);
      domElement.addEventListener('pointerleave', onPointerLeave);
      domElement.addEventListener('pointercancel', onPointerLeave);
      domElement.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(domElement);

      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries.some((entry) => entry.isIntersecting);
          if (isVisible) requestTick();
        },
        { rootMargin: '80px' }
      );
      intersectionObserver.observe(domElement);

      const onVisibilityChange = () => {
        if (!document.hidden) requestTick();
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const preventContextLoss = (e) => e.preventDefault();
      canvas.addEventListener('webglcontextlost', preventContextLoss);

      handleResize();

      return {
        sync: () => {
          const targetDpr =
            Math.min(window.devicePixelRatio || 1, 2) * clamp(pRef.current.quality, 0.25, 1);
          if (Math.abs(targetDpr - effectiveDpr) > 0.001) {
            handleResize();
          } else {
            renderFrame();
          }
          requestTick();
        },
        destroy: () => {
          isDestroyed = true;
          cancelAnimationFrame(animFrameId);
          domElement.removeEventListener('pointermove', onPointerMove);
          domElement.removeEventListener('pointerleave', onPointerLeave);
          domElement.removeEventListener('pointercancel', onPointerLeave);
          domElement.removeEventListener('pointerdown', onPointerDown);
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerdown', onPointerDown);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          canvas.removeEventListener('webglcontextlost', preventContextLoss);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          disposeTargets();
          points.geometry.dispose();
          staticTexture?.dispose();
          stateTargets.forEach((t) => t.dispose());
          quadGeometry.dispose();
          [
            starMaterial,
            stateMaterial,
            downsampleMaterial,
            upsampleMaterial,
            compositeMaterial
          ].forEach((m) => m.dispose());
          renderer.dispose();
          renderer.forceContextLoss();
          canvas.remove();
        },
        ripple: () => triggerRipple(0, 0)
      };
    };

    const instance = initEngine(container, propsRef);
    controllerRef.current = instance;

    return () => {
      instance?.destroy();
      controllerRef.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      ripple: () => controllerRef.current?.ripple()
    }),
    []
  );

  return (
    <div
      ref={containerRef}
      className={`binary-orbits-root ${className}`}
      style={{ backgroundColor, ...style }}
    >
      {children && <div className="binary-orbits-content">{children}</div>}
    </div>
  );
});

BinaryOrbits.displayName = 'BinaryOrbits';

export default BinaryOrbits;
