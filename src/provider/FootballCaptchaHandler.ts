import {type CookieSerializeOptions} from 'cookie-es'
import { handleGetContest } from './handleGetContest'
import { handleSession } from './handleSession'
import { handleCheckSolution } from './handleCheckSolution'
import { loadAssets } from './utils/assetsStore'

export type FootballCaptchaHandlerOptions = {
  session: {
    name: string,
    serializeOptions: CookieSerializeOptions,
    store: {
      get: (id: string) => Promise<string | undefined> | string | undefined,
      set: (id: string, value: string) => Promise<void> | void,
      delete: (id: string) => Promise<void> | void,
    }
  },
  canvas: {
    objectsAreaPadding: {
      min: number,
      max: number,
    },
    width: number,
    height: number,
  },
  assets: {
    objects: {
      dir: string,
    },
    background: {
      dir: string,
    }
  },
  generateAccessToken: () => Promise<string> | string
}

export const FootballCaptchaHandler = (options: FootballCaptchaHandlerOptions) => {
  return eventHandler(async (event) => {
    switch (event.method) {
      case 'GET': {
        await loadAssets(options)

        const session = await handleSession(event, options)

        return handleGetContest(event, session, options)
      }

      case 'POST': {
        const session = await handleSession(event, options)

        return handleCheckSolution(event, session, options)
      }
    }
  })
}
