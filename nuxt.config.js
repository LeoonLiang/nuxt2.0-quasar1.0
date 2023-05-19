import { join } from 'path'
import Components from 'unplugin-vue-components/webpack'
import QuasarResolver from './webpack/QuasarResolver'
export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuxt-quasar',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['@/plugins/quasar'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/style-resources',
  ],
  styleResources: {
    scss: ['@/css/quasar.variables.scss'],
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['quasar'],
    babel: {
      plugins: [
        [
          'transform-imports',
          {
            quasar: {
              transform: require('quasar/dist/babel-transforms/imports.js'),
              preventFullImport: true,
            },
          },
        ],
      ]
    },
    plugins: [
      Components({
        dts: true,
        directives: true,
        resolvers: [QuasarResolver()],
      }),
    ],
    extend(config) {
      config.module.rules.push({
        test: /\.sass$/,
        use: [
          {
            loader: join(__dirname, './webpack/sass-variables-loader.js'),
          },
        ],
      })
    },
  },
}
