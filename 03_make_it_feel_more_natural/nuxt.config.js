const baseUrl = process.env.BASE_URL || '/';

module.exports = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: 'Akaru 2019 - Case study',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  /*
   ** CSS
   */
  css: ['@/assets/scss/main.scss'],
  /*
   ** Customize the progress bar color
   */
  loading: false,
  /*
   ** Build configuration
   */
  build: {
    filenames: {
      // needed for imagemin modules to keep name of file
      img: ({ isDev }) =>
        isDev ? '[path][name].[ext]' : 'img/[name]-[hash:7].[ext]'
    },
    extend(config, { isDev, isClient }) {
      // Disable hot reload
      const vueLoader = config.module.rules.find(
        rule => rule.loader === 'vue-loader'
      );

      vueLoader.options.hotReload = false;

      // better debug
      if (isDev) {
        config.devtool = 'cheap-module-eval-source-map';
      }

      /*
       ** SVG Loader
       */
      const svgRule = config.module.rules.find(rule => rule.test.test('.svg'));

      svgRule.test = /\.(png|jpe?g|gif|webp)$/;

      config.module.rules.push({
        test: /\.svg$/,
        loader: 'vue-svg-loader'
      });

      /**
       * glsl
       */
      config.module.rules.push({
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader']
      });

      /*
       ** Run ESLint on save
       */
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
          options: {
            fix: true
          }
        });
      }
    }
  },
  env: {
    baseUrl
  },
  /*
   ** Router
   */
  router: {
    base: baseUrl
  },
  /*
   ** Plugins
   */
  plugins: [
    '~/plugins/event-bus.js',
    { src: '~/plugins/ticker.js', ssr: false },
    { src: '~/plugins/resize.js', ssr: false }
  ]
  /*
   ** Modules
   */
};
