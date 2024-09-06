<template>
  <div :style="{ zIndex: isDebug ? 100 : 0 }" class="WebGL"></div>
</template>

<script>
const WebGL = process.browser ? require('assets/js/webgl').default : {};

export default {
  data() {
    return {
      isDebug: false,
      width: null,
      height: null,
      shouldUpdate: true
    };
  },
  mounted() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.webgl = new WebGL({
      $el: this.$refs.canvas,
      width: this.width,
      height: this.height,
      debug: this.isDebug
    });

    this.$el.appendChild(this.webgl.renderer.domElement);

    this.onResize();
    this.bindEvents();
  },
  methods: {
    bindEvents() {
      this.$bus.$on('tick', () => {
        if (!this.shouldUpdate) {
          return;
        }

        this.webgl.update();
      });

      this.$bus.$on('resize', () => {
        this.onResize();
      });
    },
    onResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.webgl.onResize({
        width: this.width,
        height: this.height
      });
    }
  }
};
</script>

<style lang="scss">
.WebGL {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  touch-action: none;

  /deep/ canvas {
    display: block;
    z-index: 0;
  }
}
</style>
