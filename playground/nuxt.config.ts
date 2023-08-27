import path from "path";

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  footballCaptcha: {
    assetsPath: path.resolve('./footballCaptchaAssets')
  },
  vite: {
    vue: {
      script: {
        defineModel: true,
      },
    },
  },
})
