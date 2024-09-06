import { WebGLRenderer } from 'three';

class Renderer extends WebGLRenderer {
  constructor() {
    super({
      antialias: true,
      alpha: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance'
    });

    this.setClearColor(0xffffff);
  }
}

export default new Renderer();
