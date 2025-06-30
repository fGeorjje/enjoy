import { WebSocket } from 'ws'
import { Message } from '../message'

const ws = (window as any).ws as WebSocket

const lastProps = new Map<keyof Message, string>()
function send<T extends keyof Message> (value: Message[T], key: T): void {
  const json = JSON.stringify({
    [key]: value
  })
  if (value === undefined || lastProps.get(key) === json) {
    return
  }
  lastProps.set(key, json)
  ws.send(json)
}

const log = (...log: unknown[]): void => {
  console.log(...log)
  ws.send(JSON.stringify({ log }))
}

log('Socket stage init!')

const query = (q: string): HTMLElement[] => Array.from(document.querySelectorAll(q))

function update (): void {
  const start = Date.now()
  query('[class^="overlayContainer__"], [class^="indicators__"]').forEach(o => {
    o.style.opacity = '0'
  })
  query('[class^="videoControls_"]')[0].style.display = 'none'
  query('[class^="chatIcon__"]')[0].style.display = 'none'

  send(query('[class^="overlayTitleText__"]').map(e => e.innerText), 'names')
  send(document.body.getBoundingClientRect(), 'body')
  send(query('video').map((elem) => elem.getBoundingClientRect()), 'videos')
  const end = Date.now()
  const duration = end - start
  if (duration > 5) {
    log('Update took', end - start, 'ms')
  }
}

const updateTask = setInterval(update, 100)
ws.addEventListener('close', () => {
  clearInterval(updateTask)
}, { once: true })
