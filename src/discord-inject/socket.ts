import { WebSocket } from 'ws'
import { DiscordPopoutData } from '../shared/message'

const ws = (window as any).ws as WebSocket
const query = (q: string): HTMLElement[] => Array.from(document.querySelectorAll(q))

function update (): void {
  const start = Date.now()
  query('[class^="overlayContainer__"], [class^="indicators__"]').forEach(o => {
    o.style.opacity = '0'
  })
  query('[class^="videoControls_"]')[0].style.display = 'none'
  query('[class^="chatIcon__"]')[0].style.display = 'none'

  const message: DiscordPopoutData = {
    cropData: {
      body: document.body.getBoundingClientRect(),
      videos: query('video').map((elem) => elem.getBoundingClientRect())
    },
    names: query('[class^="overlayTitleText__"]').map(e => e.innerText)
  }
  ws.send(JSON.stringify(message))
  const end = Date.now()
  const duration = end - start
  if (duration > 5) {
    console.log('Update took', end - start, 'ms')
  }
}

const updateTask = setInterval(update, 100)
ws.addEventListener('close', () => {
  clearInterval(updateTask)
}, { once: true })
