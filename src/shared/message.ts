export interface CropData {
  body: DOMRect
  videos: DOMRect[]
}

export interface DiscordPopoutData {
  cropData?: CropData
  names?: string[]
}

export interface BrowserConfig {
  twitchNames: string[]
  obs: {
    ip: string
    password: string
  }
}

export interface DiscordTalkingData {
  displayName: string
  talking: boolean
}

export interface BrowserMessage {
  config?: BrowserConfig
  popoutData?: DiscordPopoutData
  talkingData?: DiscordTalkingData
}
