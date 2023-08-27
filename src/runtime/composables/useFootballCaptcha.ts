import { FootballCaptcha } from '../FootballCaptcha'
import { watch } from 'vue'

export const useFootballCaptcha = (canvas: Ref<HTMLCanvasElement|undefined>, api: Ref<string|undefined>) => {
    const captcha = new FootballCaptcha()

    watch(canvas, (canvasElement) => {
      captcha.setCanvas(canvasElement)
    }, {immediate: true})

    watch(api, (apiUrl) => {
      captcha.setApi(apiUrl)
    }, {immediate: true})
    
    return captcha
}
