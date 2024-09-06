import { Scene, OrthographicCamera } from 'three';

import createTouches from 'touches';

import TrailBuffer from './buffers/TrailBuffer';
import Renderer from './core/Renderer';
import Oil from './objects/Oil';

const PLANE_ASPECT_RATIO = 9 / 16;

class WebGL {
  constructor({ $el, width, height }) {
    this.width = width;
    this.height = height;
    this.$canvas = $el;
    this.renderer = Renderer;

    // clamp delta to stepping anything too far forward
    this.maxDeltaTime = 1 / 30;

    this.time = 0;
    this.lastTime = performance.now();

    this.frustumSize = 500;
    this.aspect = width / height;

    this.scene = new Scene();
    this.camera = this.createCamera();

    // really basic touch handler that propagates through the scene
    this.touchHandler = createTouches(window, {
      target: window,
      filtered: true,
      preventSimulated: false
    });

    const planeWidth = window.innerWidth;
    const planeHeight = planeWidth * PLANE_ASPECT_RATIO;

    // the trail buffer need to have exaclty the same
    // aspect ratio than plane to make mouse position match
    this.trailBuffer = new TrailBuffer({
      renderer: this.renderer,
      width: planeWidth,
      height: planeHeight
    });

    const oil = new Oil({
      width: planeWidth,
      height: planeHeight,
      trail: this.trailBuffer.renderTargetB.texture,
      textureSrc: 'oil.jpg',
      flowMapSrc: 'flow.png'
    });

    // make the oil texture align to the bottom of the viewport
    oil.position.y = (planeHeight - window.innerHeight) * 0.5;

    this.scene.add(oil);

    this.update();
    this.bindEvents();
  }

  bindEvents() {
    this.touchHandler.on('move', (ev, pos) => {
      this.traverse('onMouseMove', ev, pos);
    });
  }

  createCamera() {
    const camera = new OrthographicCamera(
      this.width / -2,
      this.width / 2,
      this.height / 2,
      this.height / -2,
      -10000,
      10000
    );

    camera.position.z = 500;

    return camera;
  }

  update() {
    const now = Date.now();
    const dt = Math.min(this.maxDeltaTime, (now - this.lastTime) / 1000);
    this.time += dt;
    this.lastTime = now;

    this.trailBuffer.update();

    // recursively tell all child objects to update
    this.scene.traverse(obj => {
      if (typeof obj.update === 'function') {
        obj.update(dt, this.time);
      }
    });

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  traverse(fn, ...args) {
    this.scene.traverse(child => {
      if (typeof child[fn] === 'function') {
        child[fn].apply(child, args);
      }
    });
  }

  onResize({ width, height }) {
    this.width = width;
    this.height = height;

    this.camera.left = -this.width / 2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = -this.height / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    this.traverse('onResize', {
      width: this.width,
      height: this.height
    });
  }
}

export default WebGL;
