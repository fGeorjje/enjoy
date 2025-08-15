import equal from 'fast-deep-equal'
import { BrowserMessage, CropData, DiscordPopoutData, DiscordTalkingData } from 'src/shared/message'
import { boxes, fitName, names, updateSlotVideo } from './slots'
import { getConfig, handleConfig } from './config'
import { connectSocket } from './socket'

connectSocket((event) => {
  const json = JSON.parse(event.data) as BrowserMessage
  handleConfig(json.config)
  handlePopoutData(json.popoutData)
  handleTalkingData(json.talkingData)
})

function handlePopoutData (data?: DiscordPopoutData): void {
  if (data === undefined) return
  updateNames(data.names)
  updateCropData(data.cropData)
}

let cachedNames: string[] = []
function updateNames (value?: string[]): void {
  if (value !== undefined && value.length !== 0 && !equal(value, cachedNames)) {
    cachedNames = value
  }
  names.forEach((name, i) => {
    name.innerHTML = getConfig().twitchNames[i] ?? cachedNames[i - getConfig().twitchNames.length] ?? ''
    fitName(i)
  })
}

let cachedCropData: CropData | undefined
function updateCropData (cropData?: CropData): void {
  if (cropData === undefined || equal(cropData, cachedCropData)) return
  cachedCropData = cropData
  const { body, videos } = cropData
  const grid = Math.ceil(Math.sqrt(videos.length + getConfig().twitchNames.length))
  document.documentElement.style.setProperty('--grid', `${grid}`)
  if (cachedNames.length !== videos.length) {
    cachedNames = []
  }

  boxes.forEach((_, i) => {
    void updateSlotVideo(i, body, videos[i - getConfig().twitchNames.length])
  })

  updateNames()
}

function handleTalkingData (talkingData?: DiscordTalkingData): void {
  if (talkingData === undefined) return
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i]
    const name = names[i]
    if (name.querySelector('.textFitted')?.innerHTML !== talkingData.displayName) continue
    name.style.color = talkingData.talking ? 'green' : ''
    box.style.borderColor = talkingData.talking ? 'rgba(0, 255, 0, 0.8)' : ''
  }
}
