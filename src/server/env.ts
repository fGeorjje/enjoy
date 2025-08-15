import { config } from 'dotenv'

config()

function asString (key: string): string {
  const value = process.env[key]
  if (value === undefined) throw new Error(`Missing env key: ${key}`)
  return value
}

function asNumber (key: string): number {
  const string = asString(key)
  const number = parseInt(string, 10)
  if (isNaN(number)) throw new Error(`Invalid number for env key ${key}: ${number}`)
  return number
}

export const OBS_WEBSOCKET_IP = asString('OBS_WEBSOCKET_IP')
export const OBS_WEBSOCKET_PASSWORD = asString('OBS_WEBSOCKET_PASSWORD')
export const SERVER_PORT = asNumber('SERVER_PORT')
export const DISCORD_BOT_TOKEN = asString('DISCORD_BOT_TOKEN')
export const DISCORD_CHANNEL_ID = asString('DISCORD_CHANNEL_ID')
export const TWITCH_NAMES = asString('TWITCH_NAMES').split('/').filter(s => s !== '')
