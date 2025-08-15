import textFit from 'textfit'
import { obs } from './obs'
import { getConfig } from './config'

for (let i = 0; i < 36; i++) {
  const box = document.createElement('div')
  box.classList = 'box'
  box.style.display = 'none'
  const name = document.createElement('span')
  name.classList = 'name'
  box.appendChild(name)
  document.querySelector<HTMLDivElement>('.container')?.appendChild(box)
}

export const boxes = document.querySelectorAll<HTMLElement>('.box')
export const names = document.querySelectorAll<HTMLElement>('.name')

export function fitName (i: number): void {
  if (boxes[i].style.display === 'none') return
  textFit(names[i], {
    alignHoriz: true,
    alignVert: true,
    maxFontSize: 500
  })
}

export async function updateSlotVideo (i: number, body: DOMRect, video: DOMRect | undefined): Promise<void> {
  console.log('slot video', { i, body, video })
  const sceneName = 'Games'
  const searchOffset = i - getConfig().twitchNames.length
  const twitch = searchOffset < 0
  const sceneItemEnabled = video !== undefined || twitch
  const isVisible = boxes[i].style.display !== 'none'
  if (sceneItemEnabled !== isVisible) {
    boxes[i].style.display = sceneItemEnabled ? '' : 'none'
  }

  await new Promise(resolve => setTimeout(resolve, 20))
  const browserRect = boxes[i].getBoundingClientRect()
  const sceneItemTransform = {
    positionX: browserRect.x,
    positionY: browserRect.y,
    boundsWidth: browserRect.width,
    boundsHeight: browserRect.height
  }

  if (!twitch) {
    const { sceneItemId } = await obs.call('GetSceneItemId', {
      sourceName: 'Discord', sceneName: 'Games', searchOffset
    })
    void obs.call('SetSceneItemEnabled', { sceneName, sceneItemId, sceneItemEnabled })

    if (video === undefined) return
    const gameWidth = video.height * 4 / 3
    const discordX = video.left + (video.width - gameWidth) / 2
    void obs.call('SetSceneItemTransform', {
      sceneName: 'Games',
      sceneItemId,
      sceneItemTransform: Object.assign({}, sceneItemTransform, {
        cropLeft: Math.max(0, Math.ceil(discordX)),
        cropRight: Math.max(0, body.width - Math.floor(discordX + gameWidth)),
        cropTop: Math.max(0, Math.ceil(video.top)),
        cropBottom: Math.max(0, body.height - Math.floor(video.bottom))
      })
    })
  } else {
    const { sceneItemId } = await obs.call('GetSceneItemId', {
      sourceName: `Twitch ${i + 1}`, sceneName: 'Games'
    })
    void obs.call('SetSceneItemEnabled', { sceneName, sceneItemId, sceneItemEnabled })
    void obs.call('SetSceneItemTransform', { sceneName, sceneItemId, sceneItemTransform })
  }
}
