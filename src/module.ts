import { defineNuxtModule, addPlugin, createResolver, addComponent, addImports, addTemplate } from '@nuxt/kit'
import defu from 'defu'

// Module options TypeScript interface definition
export interface ModuleOptions {
  component: {
    global: boolean
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-football-captcha-module',
    configKey: 'footballCaptcha'
  },
  // Default configuration options of the Nuxt module
  defaults: {
    component: {
      global: false,
    }
  },
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    addComponent({
      name: 'FootballCaptcha', // name of the component to be used in vue templates
      export: 'default', // (optional) if the component is a named (rather than default) export
      filePath: resolver.resolve('./runtime/components/FootballCaptcha.vue'),
      global: options.component.global,
    })

    addImports({
      name: 'useFootballCaptcha', // name of the FootballCaptcha to be used
      as: 'useFootballCaptcha', 
      from: resolver.resolve('./runtime/composables/useFootballCaptcha') // path of composable 
    })

    // 5. Create virtual imports for server-side
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}

      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [resolver.resolve('./runtime')]
      })
      nitroConfig.alias['#football-captcha'] = resolver.resolve('./runtime/server/service')
      nitroConfig.alias['#football-captcha-component'] = resolver.resolve('./runtime/components/FootballCaptcha.vue')
    })

    addTemplate({
      filename: 'types/nuxt-football-captcha.d.ts',
      getContents: () => [
        'declare module \'#football-captcha\' {',
        `  const FootballCaptchaHandler: typeof import('${resolver.resolve('./runtime/server/service')}').FootballCaptchaHandler`,
        '}',
        'declare module \'#football-captcha-component\' {',
        `  const FootballCaptchaHandler: typeof import('${resolver.resolve('./runtime/components/FootballCaptcha.vue')}').default`,
        '}'
      ].join('\n')
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolver.resolve(nuxt.options.buildDir, 'types/nuxt-football-captcha.d.ts') })
    })
  }
})
