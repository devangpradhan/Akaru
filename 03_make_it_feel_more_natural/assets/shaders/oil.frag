#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)
#pragma glslify: blur = require(glsl-fast-gaussian-blur)

varying vec2 vUv;

uniform float uTime;
uniform float uFlowSpeed;
uniform float uFlowMapBlurRadius;

uniform float uNoiseSpeed;
uniform float uNoiseScaleX;
uniform float uNoiseScaleY;
uniform float uNoiseAmplitude;

uniform vec2 uResolution;

uniform sampler2D uTexture;
uniform sampler2D uFlowMap;

vec2 correctAspect(vec2 uv) {
  uv.x *= uResolution.x / uResolution.y;

  return uv;
}

float applyNoise(vec2 uv) {
  float x = uv.x * uNoiseScaleX;
  float y = uv.y * uNoiseScaleY;

  float n = cnoise3(vec3(x, y, uTime * uNoiseSpeed));

  n *= uNoiseAmplitude;

  return n;
}

vec2 getFlowDir(vec2 uv) {
  vec4 horizontalBlur = blur(uFlowMap, uv, uResolution, vec2(uFlowMapBlurRadius, 0.0));
  vec4 verticalBlur = blur(uFlowMap, uv, uResolution, vec2(0.0, uFlowMapBlurRadius));

  vec4 texture = mix(horizontalBlur, verticalBlur, 0.5);

  vec2 flowDir = texture.rg;

  flowDir -= vec2(0.5, 0.5);

  return flowDir;
}

vec3 flow(vec2 uv) {
  float phase1 = fract(uTime * uFlowSpeed + 0.5);
  float phase2 = fract(uTime * uFlowSpeed + 1.0);

  vec2 flowDir = getFlowDir(uv);

  // mirroring phase
  phase1 = 1.0 - phase1;
  phase2 = 1.0 - phase2;

  vec2 distordedUv = uv + applyNoise(uv);

  vec3 color1 = texture2D(
      uTexture,
      distordedUv + flowDir * phase1).rgb;

  vec3 color2 = texture2D(
      uTexture,
      distordedUv + flowDir * phase2).rgb;

  float flowLerp = abs((0.5 - phase1) / 0.5);
  vec3 finalColor = mix(color1, color2, flowLerp);

  return finalColor;
}

void main() {
	vec2 uv = vUv;

  vec3 color = flow(uv);

  gl_FragColor = vec4(color, 1.0);
}
