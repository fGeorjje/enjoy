import { OBS_WEBSOCKET_IP, OBS_WEBSOCKET_PASSWORD } from './env'
import OBSWebSocket from 'obs-websocket-js'

export const obs = new OBSWebSocket()
export function identified (): boolean {
  return obs.identified as boolean
}

async function connectOBS (): Promise<void> {
  try {
    console.log('Connecting to OBS...')
    await obs.connect(OBS_WEBSOCKET_IP, OBS_WEBSOCKET_PASSWORD)
    console.log('Connected to OBS')
  } catch (error) {
    console.error(error)
  }
}

obs.on('ConnectionClosed', (error) => {
  if (identified()) {
    console.error('OBS connection closed', error)
  }
  setTimeout(() => {
    void connectOBS()
  }, 1000)
})

void connectOBS()
