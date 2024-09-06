import {
  Object3D,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector2,
  LinearFilter
} from 'three';
import glslify from 'glslify';

import gui from 'assets/js/utils/gui';
import vertexShader from 'assets/shaders/oil.vert';
import fragmentShader from 'assets/shaders/oil.frag';
import { loadTexture } from '../../utils/assets';

class Oil extends Object3D {
  constructor({ width, height, trail, textureSrc, flowMapSrc }) {
    super();

    const { texture, flowMap } = this.loadTexture(textureSrc, flowMapSrc);

    this.width = width;
    this.height = height;

    this.uniforms = {
      uFlowSpeed: { value: 0.085 },
      uTime: { value: 1.0 },
      uTexture: {
        type: 't',
        value: texture
      },
      uTrailTexture: {
        type: 't',
        value: trail
      },
      uFlowMap: {
        type: 't',
        value: flowMap
      },
      uFlowOffset: {
        value: 0.0
      },
      uFlowMapBlurRadius: {
        value: 15.0
      },
      uNoiseSpeed: {
        value: 0.3
      },
      uNoiseScaleX: {
        value: 3.3
      },
      uNoiseScaleY: {
        value: 4.4
      },
      uNoiseAmplitude: {
        value: 0.05
      },
      uResolution: {
        value: new Vector2(window.innerWidth, window.innerHeight)
      }
    };

    this.init();
  }

  init() {
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify(vertexShader),
      fragmentShader: glslify(fragmentShader)
    });

    const geometry = new PlaneBufferGeometry(this.width, this.height);

    this.mesh = new Mesh(geometry, this.material);
    this.add(this.mesh);

    this.initGUI();
  }

  loadTexture(textureSrc, flowMapSrc) {
    const texture = loadTexture(require(`~/assets/textures/${textureSrc}`), {
      minFilter: LinearFilter
    });

    const flowMap = loadTexture(require(`~/assets/textures/${flowMapSrc}`), {
      minFilter: LinearFilter
    });

    return { texture, flowMap };
  }

  initGUI() {
    const settings = {
      flowSpeed: this.material.uniforms.uFlowSpeed.value,
      flowBlurRadius: this.material.uniforms.uFlowMapBlurRadius.value,
      noiseSpeed: this.material.uniforms.uNoiseSpeed.value,
      noiseScaleX: this.material.uniforms.uNoiseScaleX.value,
      noiseScaleY: this.material.uniforms.uNoiseScaleY.value,
      noiseAmplitude: this.material.uniforms.uNoiseAmplitude.value
    };

    const update = () => {
      // Light
      this.material.uniforms.uFlowSpeed.value = settings.flowSpeed;
      this.material.uniforms.uFlowMapBlurRadius.value = settings.flowBlurRadius;

      // Noise
      this.material.uniforms.uNoiseSpeed.value = settings.noiseSpeed;
      this.material.uniforms.uNoiseScaleX.value = settings.noiseScaleX;
      this.material.uniforms.uNoiseScaleY.value = settings.noiseScaleY;
      this.material.uniforms.uNoiseAmplitude.value = settings.noiseAmplitude;
    };

    const folder = gui.addFolder('Oil');

    const flowFolder = folder.addFolder('Flow');

    flowFolder.add(settings, 'flowSpeed', 0.001, 0.5).onChange(update);
    flowFolder.add(settings, 'flowBlurRadius', 0.0, 50.0).onChange(update);

    const noiseFolder = folder.addFolder('Noise');

    noiseFolder
      .add(settings, 'noiseSpeed', 0, 3)
      .step(0.05)
      .name('speed')
      .onChange(update);
    noiseFolder
      .add(settings, 'noiseScaleX', 0, 25)
      .name('frequency X')
      .onChange(update);
    noiseFolder
      .add(settings, 'noiseScaleY', 0, 25)
      .name('frequency Y')
      .onChange(update);
    noiseFolder
      .add(settings, 'noiseAmplitude', 0, 1)
      .step(0.01)
      .name('amplitude')
      .onChange(update);
  }

  update(dt, time) {
    this.material.uniforms.uTime.value = time * 1.5;
  }
}

export default Oil;
