#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTexture;

void main() {
  vec3 color = texture2D(uTexture, vUv).rgb;

  gl_FragColor = vec4(color, 1.0);
}
