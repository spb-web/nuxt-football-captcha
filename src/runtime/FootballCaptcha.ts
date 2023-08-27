import { FootballCaptchaApi } from "./FootballCaptchaApi";
import { FootballCaptchaState, SET_TOKEN_SYMBOL } from "./FootballCaptchaState";

const vecToIndex = (vec: Uint8ClampedArray | number[]) => {
    return ((1 << 24) + (vec[0] << 16) + (vec[1] << 8) + vec[2]) & 0x0ffffff;
};

const indexToColor = (index: number) => `#${index.toString(16).padStart(6, '0')}`
const API_SYMBOL = Symbol('FootballCaptchaState:api')

export class FootballCaptcha {
    id = ''
    state = new FootballCaptchaState()
    width = 600;
    height = 600;
    image: HTMLImageElement = document.createElement('img')
    shapes: {
        x: number;
        y: number;
        type: number;
        size: number;
        r: number;
        g: number;
        b: number;
        isDraggable: boolean;
    }[] = []
  
    dragState = {
      isDragging: false,
      initX: 0,
      initY: 0,
      shapeIndex: -1
    };
  
    ctx: CanvasRenderingContext2D | undefined;
    mapCtx: CanvasRenderingContext2D;

    private [API_SYMBOL] = new FootballCaptchaApi('/api/footballCaptcha');

    public setCanvas(canvas: HTMLCanvasElement | undefined) {
      if (!canvas) {
        this.ctx = undefined

        return
      }

      const ctx = canvas.getContext('2d');
  
      if (!ctx) {
        throw new Error();
      }
  
      this.ctx = ctx;
      canvas.width = this.width
      canvas.height = this.height

      canvas.addEventListener('mousedown', (e) => this.handleStartDrag(e));
      canvas.addEventListener('mousemove', (e) => this.handleDrag(e));
      canvas.addEventListener('mouseup', (e) => this.handleDrop(e));

      this.draw()
      this.drawMap()
    }
  
    constructor() {
      const mapCanvas = document.createElement('canvas');
      const mapCtx = mapCanvas.getContext('2d', { willReadFrequently: true });
  
      if (!mapCtx) {
        throw new Error();
      }
  
      this.mapCtx = mapCtx;
  
      mapCanvas.width = this.width
      mapCanvas.height = this.height
    }

    private async load() {
      this.state.resetSolution();

      const data = await this[API_SYMBOL].loadCaptcha();

      this.state.setDescription(data.description)
      this.shapes = data.shapes;
      this.image = data.image
      this.id = data.id
    }
  
    drawMap() {
      const { mapCtx, width, height } = this;
  
      mapCtx.fillStyle = '#ffffff';
      mapCtx.fillRect(0, 0, width, height);
  
      this.shapes.forEach((shape, index) => {
        mapCtx.fillStyle = indexToColor(index);
  
        switch (shape.type) {
          case 0: {
            mapCtx.fillRect(
              shape.x - shape.size / 2,
              shape.y - shape.size / 2,
              shape.size,
              shape.size
            );
  
            break;
          }
          case 1: {
            mapCtx.beginPath();
            mapCtx.arc(shape.x, shape.y, shape.size / 2, 0, 2 * Math.PI);
            mapCtx.fill();
          }
        }
      });
    }
  
    draw() {
      const { ctx, width, height } = this;

      if (!ctx) {
        return;
      }
  
      ctx.fillStyle = 'green';
      ctx.drawImage(this.image, 0, 0, width, height);
  
      requestAnimationFrame(() => this.draw());
  
      this.shapes.forEach((shape) => {
        ctx.fillStyle = `#${vecToIndex([shape.r, shape.g, shape.b]).toString(16)}`;
  
        switch (shape.type) {
          case 0: {
            ctx.fillRect(
              shape.x - shape.size / 2,
              shape.y - shape.size / 2,
              shape.size,
              shape.size,
            );
  
            break;
          }
          case 1: {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.size / 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      });
    }
  
    handleStartDrag(event: MouseEvent) {
      this.drawMap();
      const { mapCtx } = this;
      const { offsetX: x, offsetY: y } = event;
      const pixel = mapCtx.getImageData(x, y, 1, 1).data;
      const shapeIndex = vecToIndex(pixel);
  
      this.dragState.isDragging = this.shapes.length > shapeIndex;
      if (!this.dragState.isDragging) {
        return;
      }
      this.dragState.initX = x - this.shapes[shapeIndex].x;
      this.dragState.initY = y - this.shapes[shapeIndex].y;
      this.dragState.shapeIndex = shapeIndex;
    }
  
    handleDrag(event: MouseEvent) {
      const {dragState} = this
      
      if (dragState.isDragging) {
        const {offsetX: x, offsetY: y} = event;
        const {shapeIndex} = dragState
        const shape = this.shapes[shapeIndex];
  
        this.state.addPoint(x, y, shapeIndex);
        
        shape.x = x - dragState.initX;
        shape.y = y - dragState.initY;
      }
    }
  
    async handleDrop(event: MouseEvent) {
      this.dragState.isDragging = false;
      this.drawMap();

      console.log('this.state.getSolution()', this.state.getSolution())
      console.log('this.state.getSolution().length', this.state.getSolution().length)

      const result = await this[API_SYMBOL].checkResult(this.id, this.state.getSolution())

      if (result.success) {
        this.state[SET_TOKEN_SYMBOL](result.token)
      } else {
        this.state.fail()
        this.load()
      }
    }
}
  