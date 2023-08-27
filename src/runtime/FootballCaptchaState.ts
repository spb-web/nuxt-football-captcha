import mitt from 'mitt'
import {uint8ArrayToUtf8} from 'pack-bytes-to-utf8'
import {excludeCharacters} from './constants/footballCaptcha'

export const EMIT_SYMBOL = Symbol('FootballCaptchaState:emit')
export const MITT_SYMBOL = Symbol('FootballCaptchaState:mitt')
export const TOKEN_SYMBOL = Symbol('FootballCaptchaState:token')
export const POINTS_SYMBOL = Symbol('FootballCaptchaState:points')
export const SET_TOKEN_SYMBOL = Symbol('FootballCaptchaState:setToken')

export type SolutionPoint = [
    /** X */
    number,
    /** X */
    number,
    /** ShapeIndex */
    number,
    /** Time */
    number,
]

export type Solution = {
    points: SolutionPoint[],
    lastPointTime: number,
}

export class FootballCaptchaState {
    private [MITT_SYMBOL] = mitt<{
        contestDescription: string,
        success: string,
        fail: void,
    }>()
    private [POINTS_SYMBOL]: Solution = {
        points: [],
        lastPointTime: 0,
    }
    private description = ''
    private [TOKEN_SYMBOL] = ''

    public on = this[MITT_SYMBOL].on
    public off = this[MITT_SYMBOL].off
    public [EMIT_SYMBOL] = this[MITT_SYMBOL].emit

    public setDescription(description:string) {
        this.description = description
        this[EMIT_SYMBOL]('contestDescription', description)
    }

    public getDescription() {
        return this.description
    }

    resetSolution() {
        this[POINTS_SYMBOL] = {
            points: [],
            lastPointTime: 0,
        }
    }

    addPoint(x: number, y: number, shapeIndex: number) {
        const now = Date.now()
        const time = this[POINTS_SYMBOL].lastPointTime === 0 ? 0 : now - this[POINTS_SYMBOL].lastPointTime;

        this[POINTS_SYMBOL].lastPointTime = now;
        
        this[POINTS_SYMBOL].points.push([x, y, shapeIndex, time])
    }

    getSolution() {
        const data = new Uint16Array(this[POINTS_SYMBOL].points.flat())
        const result = uint8ArrayToUtf8(
            new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
            excludeCharacters,
        );

        return result
    }

    public [SET_TOKEN_SYMBOL](token: string) {
        this[EMIT_SYMBOL]('success', token)
        this[TOKEN_SYMBOL] = token
    }

    public getToken() {
        return this[TOKEN_SYMBOL]
    }

    public fail() {
        this[EMIT_SYMBOL]('fail')
        this[SET_TOKEN_SYMBOL]('')
    }
}
