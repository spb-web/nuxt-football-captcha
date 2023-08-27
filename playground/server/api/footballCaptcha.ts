import {FootballCaptchaHandler} from '../../../src/provider/FootballCaptchaHandler'

export default FootballCaptchaHandler({
  session: {
    name: 'session-name',
    serializeOptions: {},
    store: new Map(),
  },
  canvas: {
    objectsAreaPadding: {
      min: 0,
      max: 30,
    },
    width: 600,
    height: 600,
  },
  assets: {
    objects: {
      dir: '/Users/vyacheslav/Documents/footballCaptcha/playground/footballCaptchaAssets/objects',
    },
    background: {
      dir: '/Users/vyacheslav/Documents/footballCaptcha/playground/footballCaptchaAssets/background',
    }
  },
  generateAccessToken: () => Math.random().toString(16)
})
