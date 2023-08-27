import fs from 'node:fs/promises'
import path from 'node:path'
import pMap from 'p-map'
import { FootballCaptchaHandlerOptions } from '../FootballCaptchaHandler'

type ObjectsAssets = {
  bitmap: Buffer,
  config: any,
}
let isLoaded = false
let objectsAssets: ObjectsAssets[] = []
let interactiveObjects: ObjectsAssets[] = []

let backgroundAssets: {
  bitmap: Buffer,
}[] = []

export const loadAssets = async (options: FootballCaptchaHandlerOptions) => {
  if (isLoaded) {
    return;
  }

  const files = await fs.readdir(options.assets.objects.dir)

  objectsAssets = await pMap(
    files.filter(file => file.endsWith('.png')),
    async (file) => {
      const configRaw = await fs.readFile(path.join(options.assets.objects.dir, `${path.basename(file, '.png')}.json`))

      return {
        bitmap: await fs.readFile(path.join(options.assets.objects.dir, file)),
        config: JSON.parse(configRaw.toString())
      }
    }
  )

  const files2 = await fs.readdir(options.assets.background.dir)

  backgroundAssets = await pMap(
    files2.filter(file => file.endsWith('.jpg')),
    async (file) => {
      return {
        bitmap: await fs.readFile(path.join(options.assets.background.dir, file)),
      }
    }
  )

  const files3 = await fs.readdir(options.assets.interactiveObjects.dir)

  interactiveObjects = await pMap(
    files3.filter(file => file.endsWith('.png')),
    async (file) => {
      return {
        bitmap: await fs.readFile(path.join(options.assets.interactiveObjects.dir, file)),
        config: [],
      }
    }
  )

  isLoaded = false
}

export const getRandomBackground = () => backgroundAssets[Math.round((backgroundAssets.length - 1) * Math.random())]

export const getRandomObjects = (count: number) => {
  if (count < 1) {
    throw new Error('[getRandomObjects]: count lt 1')
  }

  if (objectsAssets.length < count) {
    throw new Error('[getRandomObjects]: not enough assets')
  }

  const randomObjectsAssets: ObjectsAssets[] = []
  const selectedAssets = new Set()
  let index = 0

  do {
    const randomIndex = Math.round(Math.random() * (objectsAssets.length - 1))

    if (!selectedAssets.has(randomIndex)) {
      selectedAssets.add(randomIndex)
      randomObjectsAssets.push(objectsAssets[randomIndex])
      index = 0
    } else {
      index += 1

      if (index > 500) {
        throw new Error('[getRandomObjects]: can not get assets')
      } 
    }
  } while (randomObjectsAssets.length < count)

  return randomObjectsAssets
}
