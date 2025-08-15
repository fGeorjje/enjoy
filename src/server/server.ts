import express from 'express'
import cors from 'cors'
import ws from 'ws'
import path from 'path'
import { TWITCH_NAMES, OBS_WEBSOCKET_IP, OBS_WEBSOCKET_PASSWORD, SERVER_PORT } from './env'
import { loginDiscord } from './voice'
import { BrowserConfig, BrowserMessage, DiscordPopoutData } from '../shared/message'
import { readFile } from 'fs/promises'

const app = express()
app.use(cors())
app.get('/discord/init', (_req, res) => {
  res.sendFile(path.resolve('build', 'discord-inject', 'bootloader.js'))
})

const expressServer = app.listen(SERVER_PORT)
const discordSocketServer = new ws.Server({ noServer: true })
const browserSocketServer = new ws.Server({ noServer: true })

function onDiscordSocketConnect (socket: ws): void {
  if (discordSocketServer.clients.size > 1) {
    socket.close()
    console.log('More than one discord socket connected!')
    return
  }
  console.log('Discord socket connected')
  void readFile('build/discord-inject/socket.js', 'utf-8').then((code) => socket.send(code)).catch(console.error)
  socket.on('message', (data: Buffer) => {
    const popoutData: DiscordPopoutData = JSON.parse(data.toString())
    const browserMessage: BrowserMessage = { popoutData }
    const browserMessageString = JSON.stringify(browserMessage)
    browserSocketServer.clients.forEach(client => client.send(browserMessageString))
  })
}

function onBrowserSocketConnect (socket: ws): void {
  console.log('Browser socket connected')
  discordSocketServer.clients.forEach(client => client.close())
  const config: BrowserConfig = {
    twitchNames: TWITCH_NAMES,
    obs: {
      ip: OBS_WEBSOCKET_IP,
      password: OBS_WEBSOCKET_PASSWORD
    }
  }
  const browserMessage: BrowserMessage = { config }
  socket.send(JSON.stringify(browserMessage))
}

expressServer.on('upgrade', (request, socket, head) => {
  console.log('Websocket connection at', request.url)
  if (request.url === '/discord/ws') {
    discordSocketServer.handleUpgrade(request, socket, head, onDiscordSocketConnect)
  }
  if (request.url === '/browser/ws') {
    browserSocketServer.handleUpgrade(request, socket, head, onBrowserSocketConnect)
  }
})

app.use('/obs-frontend', express.static('build/obs-frontend'))

console.log('Server running')
void loginDiscord(browserSocketServer)
