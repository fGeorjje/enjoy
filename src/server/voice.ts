import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice'
import { BaseGuildVoiceChannel, ChannelType, Client, GatewayIntentBits } from 'discord.js'
import { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID } from './env'
import { WebSocketServer } from 'ws'
import { BrowserMessage } from '../shared/message'

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

export async function loginDiscord (browserSocketServer: WebSocketServer): Promise<void> {
  if (DISCORD_BOT_TOKEN === '') {
    console.log('No discord bot token provided. Name light ups will not work')
    return
  }
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
    void speaking(userId, true, browserSocketServer)
  })
  receiver.speaking.on('end', (userId: string) => {
    void speaking(userId, false, browserSocketServer)
  })
}

async function speaking (userId: string, talking: boolean, browserSocketServer: WebSocketServer): Promise<void> {
  const channel = await getChannel()
  const members = channel.guild.members
  let member = members.cache.get(userId)
  if (member === undefined) {
    console.log('Fetching member', userId)
    member = await members.fetch(userId)
  }
  const displayName = member.displayName
  const message: BrowserMessage = {
    talkingData: { displayName, talking }
  }
  const text = JSON.stringify(message)
  browserSocketServer.clients.forEach(client => client.send(text))
}
