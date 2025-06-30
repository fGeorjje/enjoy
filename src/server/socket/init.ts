import { readFile } from 'fs/promises'
import type { WebSocket, WebSocketServer } from 'ws'
import { onMessage } from './onMessage'

export async function initSocket (socket: WebSocket, server: WebSocketServer): Promise<void> {
  if (server.clients.size > 1) {
    console.log('More than one client attempted to connect, closing socket')
    socket.close()
    return
  }
  console.log('Initial connect')
  const toExecute = await readFile('dist/client/socket.js', 'utf-8')
  console.log('Sending bootloader code')
  socket.on('message', onMessage)
  socket.send(toExecute)
}
