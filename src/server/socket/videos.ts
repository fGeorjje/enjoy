import { obs } from '../obs'
import { getCachedNames, updateNames } from './names'
import type { JsonObject } from 'type-fest'
import { getBodySize } from './onMessage'
import { EMPTY_SLOTS } from '../env'

export async function updateVideos (videos: DOMRect[]): Promise<void> {
  if (getCachedNames().length !== videos.length) {
    console.log('NAME COUNT MISMATCH - HOVER OVER DISCORD')
    updateNames([''])
  }

  const { scenes } = await obs.call('GetSceneList')
  const sceneItemData: Array<[string, number[]]> = await Promise.all(scenes.map(async (scene) => {
    const sceneName = scene.sceneName as string
    const { sceneItems } = await obs.call('GetSceneItemList', { sceneName })
    const discordSceneItemIds = sceneItems.reverse().flatMap((sceneItem) => {
      if (sceneItem.sourceName !== 'Discord') return []
      return [sceneItem.sceneItemId as number]
    })
    return [sceneName, discordSceneItemIds]
  }))

  for (let i = 0; i < 25; i++) {
    updateDiscordCrop(i, videos[i - EMPTY_SLOTS], sceneItemData)
  }
}

function updateDiscordCrop (slot: number, video: DOMRect | undefined, sceneItemData: Array<[string, number[]]>): void {
  sceneItemData.forEach(data => {
    const sceneName = data[0]
    const sceneItemId = data[1][slot]
    if (sceneItemId === undefined) {
      return
    }
    obs.call('SetSceneItemEnabled', {
      sceneName, sceneItemId, sceneItemEnabled: video !== undefined
    })
    if (video === undefined) return
    const sceneItemTransform = getCrop(video)
    void obs.call('SetSceneItemTransform', { sceneName, sceneItemId, sceneItemTransform })
  })
}

function getCrop (video: DOMRect): JsonObject {
  const aspect = 16 / 9
  const gameWidth = video.height * aspect
  const x = video.left + (video.width - gameWidth) / 2

  return {
    cropLeft: Math.max(0, Math.ceil(x)),
    cropRight: Math.max(0, getBodySize().width - Math.floor(x + gameWidth)),
    cropTop: Math.max(0, Math.ceil(video.top)),
    cropBottom: Math.max(0, getBodySize().height - Math.floor(video.bottom))
  }
}
