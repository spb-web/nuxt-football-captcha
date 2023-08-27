import { type FootballCaptchaHandlerOptions } from '../FootballCaptchaHandler'
import { getRandomObjects } from './assetsStore'

export const generateObjects = (options: FootballCaptchaHandlerOptions) => {
  const objectsAreaPadding = (
    options.canvas.objectsAreaPadding.min
    + ((options.canvas.objectsAreaPadding.max - options.canvas.objectsAreaPadding.min) * Math.random())
  )
  const objectAreaWidth = options.canvas.width - objectsAreaPadding * 2
  const objectAreaHeight = options.canvas.height - objectsAreaPadding * 2  
  const ceils: number[][] = []

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      ceils.push([x * objectAreaWidth / 3, y * objectAreaHeight / 3])
    }
  }

  const randomObjects = getRandomObjects(5)

  return randomObjects.map((object) => {
    const ceilIndex = Math.floor(Math.random() * ceils.length)
    const [[x,y]] = ceils.splice(ceilIndex, 1)

    return {
      input: object.bitmap,
      left: Math.round(x - 30 + 60 * Math.random()),
      top: Math.round(y - 30 + 60 * Math.random()),
      config: object.config,
    }
  })
}
