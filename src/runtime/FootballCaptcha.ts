import { FootballCaptchaApi } from "./FootballCaptchaApi";
import { FootballCaptchaCanvas } from "./FootballCaptchaCanvas";
import { FootballCaptchaState, SET_TOKEN_SYMBOL } from "./FootballCaptchaState";

const API_SYMBOL = Symbol('FootballCaptcha:api')
const CANVAS_SYMBOL = Symbol('FootballCaptcha:canvas')

export class FootballCaptcha {
  private [CANVAS_SYMBOL] = new FootballCaptchaCanvas()
  id = ''
  state = new FootballCaptchaState()
  width = 600;
  height = 600;
  image: HTMLImageElement = document.createElement('img')

  private [API_SYMBOL] = new FootballCaptchaApi('/api/footballCaptcha');

  public setCanvas(canvas: HTMLCanvasElement | undefined) {
    this[CANVAS_SYMBOL].setCanvas(canvas)
  }

  public setApi(api: string | undefined) {
    if (typeof api !== 'string') {
      throw new Error('Api is mot string')
    }

    this[API_SYMBOL].setApi(api)
  }
  
  constructor() {
    this[CANVAS_SYMBOL].on('interactiveElement:drag', ({x, y, index}) => this.state.addPoint(x, y, index))
    this[CANVAS_SYMBOL].on('interactiveElement:drop', async ({x, y, index}) => {
      this.state.addPoint(x, y, index)

      const result = await this[API_SYMBOL].checkResult(this.id, this.state.getSolution())

      if (result.success) {
        this.state[SET_TOKEN_SYMBOL](result.token)
      } else {
        this.state.fail()
        this.load()
      }
    })
  }

  private async load() {
    this.state.resetSolution();

    const data = await this[API_SYMBOL].loadCaptcha();

    this.state.setDescription(data.description)
    this[CANVAS_SYMBOL].setBackgroundImage(data.image)
    this[CANVAS_SYMBOL].setInteractiveElements(data.shapes)
    this.id = data.id
  }
}
  