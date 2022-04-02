import { createVuePlugin } from 'vite-plugin-vue2'

export default {
  plugins: [
    createVuePlugin(/* options */)
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}