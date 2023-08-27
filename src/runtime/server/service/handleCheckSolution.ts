import { type H3Event, readRawBody } from 'h3'
import { type FootballCaptchaHandlerOptions } from './FootballCaptchaHandler'
import { type FootballCaptchaSession } from './handleSession'
import { checkSolution } from './utils/checkSolution'
import { dataDividerChar } from '../../constants/footballCaptcha'
import { utf8ToUint8Array } from 'pack-bytes-to-utf8'

export const handleCheckSolution = async (
  event: H3Event,
  session: FootballCaptchaSession,
  options: FootballCaptchaHandlerOptions,
) => {
  const body = await readRawBody(event, 'utf8')
  
  if (!body) {
    return []
  }

  const [id, mousePathBin] = body.split(dataDividerChar)

  if (session.data.contest?.id !== id) {
    return []
  }

  const mousePath = new Uint16Array(utf8ToUint8Array(mousePathBin).buffer)
  const isSuccess = await checkSolution(session.data.contest, mousePath)

  if (!isSuccess) {
    session.data.retry += 1

    return []
  }

  await session.delete()

  const token = await options.generateAccessToken()

  return {
    success: true,
    token,
  }
}
