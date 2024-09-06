<template>
  <div ref="site" class="Site">
    <div ref="scroll" class="Site-inner">
      <nuxt ref="page" />
    </div>
    <no-ssr>
      <WebGL ref="webgl" />
    </no-ssr>
  </div>
</template>


<script>
import WebGL from '~/components/WebGL.vue';

export default {
  components: {
    WebGL
  }
};
</script>

<style lang="scss" scoped>
.Site {
  position: relative;
}

.Site-inner {
  position: relative;
  z-index: 10;
}
</style>
