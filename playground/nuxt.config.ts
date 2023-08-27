import path from "path";

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  footballCaptcha: {
    assetsPath: path.resolve('./footballCaptchaAssets')
  },
  routeRules: {
    // Use client-side rendering for all routes
    '/**': { ssr: false },
  },
  vite: {
    vue: {
      script: {
        defineModel: true,
      },
    },
  },
  nitro: {
    preset: 'vercel-edge',
  }
})
