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
  constructor({ width, height, textureSrc, flowMapSrc }) {
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
      flowBlurRadius: this.material.uniforms.uFlowMapBlurRadius.value
    };

    const update = () => {
      // Light
      this.material.uniforms.uFlowSpeed.value = settings.flowSpeed;
      this.material.uniforms.uFlowMapBlurRadius.value = settings.flowBlurRadius;
    };

    const folder = gui.addFolder('Oil');

    const flowFolder = folder.addFolder('Flow');

    flowFolder.add(settings, 'flowSpeed', 0.001, 0.5).onChange(update);
    flowFolder.add(settings, 'flowBlurRadius', 0.0, 50.0).onChange(update);
  }

  update(dt, time) {
    this.material.uniforms.uTime.value = time * 1.5;
  }
}

export default Oil;
