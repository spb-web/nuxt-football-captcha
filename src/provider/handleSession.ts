import {
  type H3Event,
  setCookie,
  getCookie,
} from 'h3'
import { type FootballCaptchaHandlerOptions } from './FootballCaptchaHandler'
import { nanoid } from 'nanoid'

export type SessionData = {
  retry: number,
  contest?: {
    id: string,
    target: {
      x: number,
      y: number,
      interactiveObjectIndex: number,
    }
  }
}

const generateNewSessionData = (): SessionData => {
  return {
    retry: 0,
  }
}

export class FootballCaptchaSession {
  public data: SessionData
  public sessionId: string
  private store: FootballCaptchaHandlerOptions['session']['store']

  constructor(
    store: FootballCaptchaHandlerOptions['session']['store'],
    sessionId?: string,
    data?: SessionData
  ) {
    if ((!sessionId && data) || (sessionId && !data)) {
      throw new Error()
    }
  
    this.store = store
    this.data = data ?? generateNewSessionData()
    this.sessionId = sessionId ?? nanoid(24)
  }

  public async save() {
    await this.store.set(this.sessionId, JSON.stringify(this.data))
  }

  public async delete() {
    await this.store.delete(this.sessionId)
  }
}

export const handleSession = async (event: H3Event, options: FootballCaptchaHandlerOptions) => {
  const sessionId = getCookie(event, options.session.name)

  if (sessionId) {
    const session = await options.session.store.get(sessionId)

    if (session) {
      return new FootballCaptchaSession(options.session.store, sessionId, JSON.parse(session))
    }
  }

  const session = new FootballCaptchaSession(options.session.store)

  setCookie(event, options.session.name, session.sessionId, options.session.serializeOptions)

  await session.save()

  return session
}