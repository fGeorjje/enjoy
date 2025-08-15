import { BrowserConfig } from 'src/shared/message'
import { connectOBS } from './obs'

let config: BrowserConfig
export function handleConfig (data?: BrowserConfig): void {
  if (data === undefined) return
  config = data
  void connectOBS(data)
}

export function getConfig (): BrowserConfig {
  return config
}
