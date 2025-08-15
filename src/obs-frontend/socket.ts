let ws: WebSocket | undefined
export function connectSocket (onMessage: (event: MessageEvent<string>) => void): void {
  console.log('Attempting to connect to server ws...')
  const _ws = new WebSocket(`ws://${location.host}/browser/ws`)
  _ws.onopen = () => {
    ws = _ws
    ws.onmessage = onMessage
    console.log('Connected to server ws')
  }
  _ws.onerror = console.error
  _ws.onclose = () => {
    ws = undefined
    setTimeout(() => {
      connectSocket(onMessage)
    }, 1000)
  }
}
