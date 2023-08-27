import { FootballCaptcha } from "../FootballCaptcha"

export const useFootballCaptcha = (canvas: Ref<HTMLCanvasElement|undefined>) => {
    const captcha = new FootballCaptcha()

    watch(canvas, (canvasElement) => {
      captcha.setCanvas(canvasElement)
    }, {immediate: true})
    
    return captcha
}
