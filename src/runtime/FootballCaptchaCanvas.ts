import {InteractiveElement} from './types/InteractiveElement';
import mitt from 'mitt'

function assert(value: unknown, message: string): asserts value {
  if (value === undefined || value === null) {
    throw new Error(message)
  }
}

const vecToIndex = (vec: Uint8ClampedArray | number[]) => {
  return ((1 << 24) + (vec[0] << 16) + (vec[1] << 8) + vec[2]) & 0x0ffffff;
};

const indexToColor = (index: number) => `#${index.toString(16).padStart(6, '0')}`

export const MITT_SYMBOL = Symbol('FootballCaptchaCanvas:mitt')

export class FootballCaptchaCanvas {
  private canvasResizeObserver: ResizeObserver
  private canvas: HTMLCanvasElement | undefined
  private ctx: CanvasRenderingContext2D | undefined
  private [MITT_SYMBOL] = mitt<{
    'interactiveElement:drag': {x: number, y: number, index: number},
    'interactiveElement:drop': {x: number, y: number, index: number},
  }>()

  private mapCanvas: HTMLCanvasElement
  private mapCtx: CanvasRenderingContext2D
  private mapCanvasPixelRatio = {
    horizontal: 1,
    vertical: 1,
  }
  private dragState = {
    isDragging: false,
    initX: 0,
    initY: 0,
    index: -1
  };
  private backgroundImage?: HTMLImageElement
  private interactiveElements: InteractiveElement[] = []
  
  public on = this[MITT_SYMBOL].on

  width = 600
  height = 600

  constructor() {
    const mapCanvas = document.createElement('canvas')
    const mapCtx = mapCanvas.getContext('2d', {willReadFrequently: true, alpha: false});

    assert(mapCtx, 'FootballCaptchaCanvas: can not create 2d ctx')

    this.mapCanvas = mapCanvas
    this.mapCtx = mapCtx
    this.canvasResizeObserver = new ResizeObserver((entries) => this.handleResizeCanvas(entries))
  }

  public setBackgroundImage(image: HTMLImageElement) {
    this.backgroundImage = image

    this.drawMap()
  }

  public setInteractiveElements(interactiveElements: InteractiveElement[]) {
    this.interactiveElements = interactiveElements

    this.drawMap()
  }

  public setCanvas(canvas: HTMLCanvasElement | undefined) {
    if (canvas === this.canvas) {
      return
    }

    if (!canvas) {
      this.ctx = undefined
      this.canvas = undefined

      return
    }

    const ctx = canvas.getContext('2d', {alpha: false})
  
    assert(ctx, 'FootballCaptchaCanvas: can not create 2d ctx')

    this.ctx = ctx;
    this.canvas = canvas;

    this.addCanvasEventListener()
    this.setCanvasSize()
    this.canvasResizeObserver.observe(canvas)
    this.draw()
    this.drawMap()
  }

  private addCanvasEventListener() {
    const {canvas} = this
  
    assert(canvas, 'FootballCaptchaCanvas: canvas element is nil')
    canvas.addEventListener('mousedown', (e) => this.handleStartDrag(e));
    canvas.addEventListener('mousemove', (e) => this.handleDrag(e));
    canvas.addEventListener('mouseup', (e) => this.handleDrop(e));
  }

  private setCanvasSize() {
    const {canvas, mapCanvas} = this

    assert(canvas, 'FootballCaptchaCanvas: canvas element is nil')

    canvas.width = this.width
    canvas.height = this.height
    mapCanvas.width = this.width
    mapCanvas.height = this.height
  }

  drawMap() {
    const { mapCtx, width, height } = this;

    mapCtx.fillStyle = '#ffffff'
    mapCtx.fillRect(
      0,
      0,
      width,
      height,
    )

    this.interactiveElements.forEach((interactiveElement, index) => {
      if (!interactiveElement.isDraggable) {
        return
      }

      mapCtx.fillStyle = indexToColor(index);

      switch (interactiveElement.type) {
        case 0: {
          mapCtx.fillRect(
            (interactiveElement.x - interactiveElement.size / 2),
            (interactiveElement.y - interactiveElement.size / 2),
            interactiveElement.size,
            interactiveElement.size,
          )

          break;
        }
        case 1: {
          mapCtx.beginPath()
          mapCtx.arc(
            interactiveElement.x,
            interactiveElement.y,
            (interactiveElement.size / 2),
            0,
            2 * Math.PI,
          )

          mapCtx.fill()
        }
      }
    })
  }

  draw() {
    const { ctx, width, height } = this;

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, this.width, this.height)

    if (this.backgroundImage) {
      ctx.drawImage(this.backgroundImage, 0, 0, width, height);
    }

    requestAnimationFrame(() => this.draw());

    this.interactiveElements.forEach((interactiveElement) => {
      ctx.fillStyle = `#${vecToIndex([interactiveElement.r, interactiveElement.g, interactiveElement.b]).toString(16)}`;

      switch (interactiveElement.type) {
        case 0: {
          ctx.fillRect(
            interactiveElement.x - interactiveElement.size / 2,
            interactiveElement.y - interactiveElement.size / 2,
            interactiveElement.size,
            interactiveElement.size,
          );

          break;
        }
        case 1: {
          ctx.beginPath();
          ctx.arc(interactiveElement.x, interactiveElement.y, interactiveElement.size / 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    });
  }

  getCanvasCoordinatesFromEvent(event: MouseEvent) {
    const {mapCanvasPixelRatio} = this

    return {
      x: event.offsetX * mapCanvasPixelRatio.horizontal, 
      y: event.offsetY * mapCanvasPixelRatio.vertical, 
    }
  }

  handleStartDrag(event: MouseEvent) {
    this.drawMap()

    const { mapCtx } = this
    const { x, y } = this.getCanvasCoordinatesFromEvent(event)
    const pixel = mapCtx.getImageData(x, y, 1, 1).data
    const index = vecToIndex(pixel)

    console.log(index)

    this.dragState.isDragging = this.interactiveElements.length > index

    if (!this.dragState.isDragging) {
      return
    }

    this.dragState.initX = x - this.interactiveElements[index].x
    this.dragState.initY = y - this.interactiveElements[index].y
    this.dragState.index = index
  }

  handleDrag(event: MouseEvent) {
    const {dragState} = this
    
    if (dragState.isDragging) {
      const {x, y} = this.getCanvasCoordinatesFromEvent(event)
      const {index: index} = dragState
      const interactiveElement = this.interactiveElements[index]

      interactiveElement.x = x - dragState.initX;
      interactiveElement.y = y - dragState.initY;

      this[MITT_SYMBOL].emit('interactiveElement:drag', {x, y, index})
    }
  }

  async handleDrop(event: MouseEvent) {
    const {dragState} = this

    if (!dragState.isDragging) {
      return
    }
  
    dragState.isDragging = false;

    const {x, y} = this.getCanvasCoordinatesFromEvent(event)

    this[MITT_SYMBOL].emit('interactiveElement:drop', {x, y, index: this.dragState.index})
    this.drawMap();
  }

  private handleResizeCanvas([{contentRect}]: ResizeObserverEntry[]) {  
    this.mapCanvasPixelRatio = {
      horizontal: this.width / contentRect.width,
      vertical: this.height / contentRect.height,
    }
    
    this.drawMap()
  }
}