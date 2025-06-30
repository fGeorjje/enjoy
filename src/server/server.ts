import express from 'express'
import cors from 'cors'
import ws from 'ws'
import { initSocket } from './socket/init'
import path from 'path'
import { SERVER_PORT } from './env'
import { loginDiscord } from './voice'

main()
function main (): void {
  const app = express()
  app.use(cors())
  app.get('/init', (_req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'client', 'bootloader.js'))
  })

  const server = app.listen(SERVER_PORT)
  const wsServer = new ws.Server({ noServer: true })

  server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
      void initSocket(socket, wsServer)
    })
  })

  console.log('Server running')
  void loginDiscord()
}
