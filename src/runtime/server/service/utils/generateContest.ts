import {nanoid} from 'nanoid'
import { type FootballCaptchaHandlerOptions } from '../FootballCaptchaHandler'
import { generateObjects } from './generateObjects'
import { getRandomBackground } from './assetsStore'
import sharp from 'sharp'
import { generateInteractiveObjects } from './generateInteractiveObjects'

export const generateContest = async (options: FootballCaptchaHandlerOptions) => {
  const objects = generateObjects(options)
  const targetIndex = Math.round(Math.random() * (objects.length - 1))
  const background = getRandomBackground()
  const captchaImage = await sharp(background.bitmap)
    .composite(objects)
    // .rotate(Math.round(360 * Math.random()))
    .toBuffer()
  const interactiveObjects = generateInteractiveObjects(options)
  const description = objects[targetIndex].config['ru_RU'][Math.round((objects[targetIndex].config['ru_RU'].length - 1) * Math.random())]

  return {
    id: nanoid(24),
    target: {
      x: objects[targetIndex].left,
      y: objects[targetIndex].top,
      index: targetIndex,
    },
    captchaImage,
    interactiveObjects,
    description,
  }
}
