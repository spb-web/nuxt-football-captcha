import { defineNuxtModule, addPlugin, createResolver, addComponent, addImports, addServerHandler } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  assetsPath: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-football-captcha-module',
    configKey: 'footballCaptcha'
  },
  // Default configuration options of the Nuxt module
  defaults: {
    assetsPath: './footballCaptchaAssets',
  },
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    addComponent({
      name: 'FootballCaptcha', // name of the component to be used in vue templates
      export: 'default', // (optional) if the component is a named (rather than default) export
      filePath: resolver.resolve('./runtime/components/FootballCaptcha.vue')
    })

    addImports({
      name: 'useFootballCaptcha', // name of the FootballCaptcha to be used
      as: 'useFootballCaptcha', 
      from: resolver.resolve('./runtime/composables/useFootballCaptcha') // path of composable 
    })

    // addServerHandler({
    //   route: '/api/footballCaptcha',
    //   handler: resolver.resolve('./runtime/server/api/footballCaptcha.get.ts')
    // })

    // addServerHandler({
    //   route: '/api/footballCaptcha/check',
    //   handler: resolver.resolve('./runtime/server/api/footballCaptcha.post.ts')
    // })
  }
})
