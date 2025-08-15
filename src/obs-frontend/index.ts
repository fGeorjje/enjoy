import equal from 'fast-deep-equal'
import { OBSWebSocket } from 'obs-websocket-js'
import { BrowserConfig, BrowserMessage, CropData, DiscordPopoutData, DiscordTalkingData } from 'src/shared/message'
import textFit from 'textfit'

let ws: WebSocket | undefined
connectSocket()
function connectSocket (): void {
  console.log('Attempting to connect to server ws...')
  const _ws = new WebSocket(`ws://${location.host}/browser/ws`)
  _ws.onopen = () => {
    ws = _ws
    ws.onmessage = onMessage
    console.log('Connected to server ws')
  }
  _ws.onerror = console.error
  _ws.onclose = () => {
    ws = undefined
    setTimeout(connectSocket, 1000)
  }
}

const obs = new OBSWebSocket()
async function connectOBS (data: BrowserConfig): Promise<void> {
  obs.once('ConnectionClosed', () => {
    console.log('Disconnected from OBS')
    setTimeout(() => {
      void connectOBS(data)
    }, 1000)
  })
  console.log('Attempting to connect to OBS...')
  await obs.connect(data.obs.ip, data.obs.password)
  console.log('Connected to OBS')
}

function onMessage (ev: MessageEvent<string>): void {
  console.log(ev.data)
  const json = JSON.parse(ev.data) as BrowserMessage
  handleConfig(json.config)
  handlePopoutData(json.popoutData)
  handleTalkingData(json.talkingData)
}

class Slot {
  #index: number
  box: HTMLDivElement
  name: HTMLSpanElement
  constructor (index: number) {
    this.#index = index
    this.box = document.createElement('div')
    this.box.classList = 'box'
    this.name = document.createElement('span')
    this.name.classList = 'name'
    this.box.style.display = 'none'
    this.box.appendChild(this.name)
    document.querySelector<HTMLDivElement>('.container')?.appendChild(this.box)
  }

  fitName (): void {
    if (this.box.style.display === 'none') return
    textFit(this.name, {
      maxFontSize: 500
    })
  }

  async setVideoData (body: DOMRect, video: DOMRect | undefined, twitch: boolean): Promise<void> {
    const sceneName = 'Games'
    const sceneItemEnabled = video !== undefined || twitch
    const isVisible = this.box.style.display !== 'none'
    if (sceneItemEnabled !== isVisible) {
      this.box.style.display = sceneItemEnabled ? '' : 'none'
    }

    await new Promise(resolve => setTimeout(resolve, 100))
    const browserRect = this.box.getBoundingClientRect()
    const sceneItemTransform = {
      positionX: browserRect.x,
      positionY: browserRect.y,
      boundsWidth: browserRect.width,
      boundsHeight: browserRect.height
    }
    if (!twitch) {
      const { sceneItemId } = await obs.call('GetSceneItemId', {
        sourceName: 'Discord', sceneName: 'Games', searchOffset: this.#index - config.twitchNames.length
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
        sourceName: `Twitch ${this.#index + 1}`, sceneName: 'Games'
      })
      void obs.call('SetSceneItemEnabled', { sceneName, sceneItemId, sceneItemEnabled })
      void obs.call('SetSceneItemTransform', { sceneName, sceneItemId, sceneItemTransform })
    }
  }
}

const slots: Slot[] = []
for (let i = 0; i < 36; i++) {
  slots.push(new Slot(i))
}

let config: BrowserConfig
function handleConfig (data?: BrowserConfig): void {
  if (data === undefined) return
  config = data
  void connectOBS(data)
}

function handlePopoutData (data?: DiscordPopoutData): void {
  if (data === undefined) return
  updateNames(data.names)
  updateCropData(data.cropData)
}

let cachedNames: string[] = []
function updateNames (names?: string[]): void {
  if (names !== undefined && names.length !== 0 && !equal(names, cachedNames)) {
    cachedNames = names
  }
  slots.forEach((slot, i) => {
    slot.name.innerText = config.twitchNames[i] ?? cachedNames[i - config.twitchNames.length] ?? ''
    slot.fitName()
  })
}

let cachedCropData: CropData | undefined
function updateCropData (cropData?: CropData): void {
  if (cropData === undefined || equal(cropData, cachedCropData)) return
  cachedCropData = cropData
  const { body, videos } = cropData
  const grid = Math.ceil(Math.sqrt(videos.length + config.twitchNames.length))
  document.documentElement.style.setProperty('--grid', `${grid}`)
  if (cachedNames.length !== videos.length) {
    cachedNames = []
  }

  slots.forEach((slot) => slot.fitName())

  slots.forEach((slot, i) => {
    void slot.setVideoData(body, videos[i - config.twitchNames.length], i < config.twitchNames.length)
  })
  updateNames()
}

function handleTalkingData (talkingData?: DiscordTalkingData): void {
  if (talkingData === undefined) return
  slots.filter(e => e.name.querySelector('.textFitted')?.innerHTML === talkingData.displayName)
    .forEach(slot => {
      slot.name.style.color = talkingData.talking ? 'green' : ''
      slot.box.style.borderColor = talkingData.talking ? 'green' : ''
    })
}
