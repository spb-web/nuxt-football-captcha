import type { H3Event } from 'h3'
import { generateContest } from './utils/generateContest'
import { uint8ArrayToUtf8 } from 'pack-bytes-to-utf8'
import { dataDividerChar, excludeCharacters, shapeFields } from '../constants/footballCaptcha'
import { FootballCaptchaHandlerOptions } from './FootballCaptchaHandler'
import { type FootballCaptchaSession } from './handleSession'

export const handleGetContest = async (
  event: H3Event,
  session: FootballCaptchaSession,
  options: FootballCaptchaHandlerOptions,
) => {
  const contest = await generateContest(options)
  const interactiveObjectsUint16Arr = new Uint16Array(
    contest.interactiveObjects.flatMap((shape) => (
      shapeFields.map((field) => Number(shape[field]))
    ))
  )

  session.data.contest = {
    id: contest.id,
    target: {
      x: contest.target.x,
      y: contest.target.y,
      interactiveObjectIndex: 0,
    }
  }

  await session.save()

  return [
    // id
    contest.id,
    // interactive objects
    uint8ArrayToUtf8(
      new Uint8Array(
        interactiveObjectsUint16Arr.buffer,
        interactiveObjectsUint16Arr.byteOffset,
        interactiveObjectsUint16Arr.byteLength
      ),
      excludeCharacters,
    ),
    // description
    contest.description,
    // background
    uint8ArrayToUtf8(
      new Uint8Array(contest.captchaImage),
      excludeCharacters,
    ),
  ].join(dataDividerChar)
}
