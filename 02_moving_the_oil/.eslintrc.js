module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended',
    'plugin:prettier/recommended',
    'prettier/vue'
  ],
  // add your custom rules here
  rules: {
    'prettier/prettier': 'disable',
    'vue/no-v-html': 'disable',
    'no-unused-vars': 'warn',
    'no-console': 'warn'
  },
  globals: {
    THREE: 'readable',
    $nuxt: 'readable'
  }
};
