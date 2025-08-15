import OBSWebSocket from 'obs-websocket-js'
import { BrowserConfig } from 'src/shared/message'

export const obs = new OBSWebSocket()
export async function connectOBS (data: BrowserConfig): Promise<void> {
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
