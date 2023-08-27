import { type FootballCaptchaHandlerOptions } from '../FootballCaptchaHandler'

export const generateInteractiveObjects = (options: FootballCaptchaHandlerOptions) => [
  {
    x: options.canvas.width / 2 + Math.round(50 * Math.random()) - 25,
    y: options.canvas.height / 2 + Math.round(50 * Math.random()) - 25,
    type: 1,
    size: 25,
    r: 255,
    g: 0,
    b: 255,
    isDraggable: true,
  }
]
