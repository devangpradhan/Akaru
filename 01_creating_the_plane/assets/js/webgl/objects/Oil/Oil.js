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
  constructor({ width, height, textureSrc }) {
    super();

    const { texture } = this.loadTexture(textureSrc);

    this.width = width;
    this.height = height;

    this.uniforms = {
      uTime: { value: 1.0 },
      uTexture: {
        type: 't',
        value: texture
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
  }

  loadTexture(textureSrc) {
    const texture = loadTexture(require(`~/assets/textures/${textureSrc}`), {
      minFilter: LinearFilter
    });

    return { texture };
  }

  update(dt, time) {
    this.material.uniforms.uTime.value = time * 1.5;
  }
}

export default Oil;
