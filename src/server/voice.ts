import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice'
import { BaseGuildVoiceChannel, ChannelType, Client, GatewayIntentBits } from 'discord.js'
import { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, EMPTY_SLOTS } from './env'
import { obs } from './obs'
import { getCachedNames } from './socket/names'

const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
})

async function getChannel (): Promise<BaseGuildVoiceChannel> {
  const channel = client.channels.cache.get(DISCORD_CHANNEL_ID) ?? await client.channels.fetch(DISCORD_CHANNEL_ID)
  if (channel === null) throw new Error(`Channel not found ${DISCORD_CHANNEL_ID}`)
  if (channel.type !== ChannelType.GuildVoice) throw new Error(`Channel is not voice channel ${DISCORD_CHANNEL_ID}`)
  return channel
}

export async function loginDiscord (): Promise<void> {
  await client.login(DISCORD_BOT_TOKEN)
  console.log('Logged into discord')
  const channel = await getChannel()

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator
  })
  await entersState(connection, VoiceConnectionStatus.Ready, 10_000)
  const receiver = connection.receiver
  receiver.speaking.on('start', (userId: string) => {
    void setSpeaking(userId, true)
  })
  receiver.speaking.on('end', (userId: string) => {
    void setSpeaking(userId, false)
  })
}

function rgb (r: number, g: number, b: number): number {
  return r + (g << 8) + (b << 16) + (255 << 24)
}

async function setSpeaking (userId: string, state: boolean): Promise<void> {
  if (obs.identified !== true) return

  const channel = await getChannel()
  const members = channel.guild.members
  let member = members.cache.get(userId)
  if (member === undefined) {
    console.log('Fetching member', userId)
    member = await members.fetch(userId)
  }
  const color: [number, number, number] = state ? [127, 255, 127] : [255, 255, 255]
  const index = getCachedNames().findIndex((cached) => cached === member.displayName)
  if (index === -1) return
  const slot = index + 1 + EMPTY_SLOTS
  await obs.call('SetInputSettings', {
    inputName: `Player ${slot}`,
    inputSettings: {
      color: rgb(...color)
    }
  })
}
