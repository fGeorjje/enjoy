console.log('Bootloader init!')
function connect (): void {
  const global = window as any
  const port: number = global.port
  const ws = global.ws = new WebSocket(`ws://127.0.0.1:${port}`)

  ws.addEventListener('message', (e) => {
    global.eval(e.data)
  }, { once: true })
  ws.addEventListener('close', () => {
    setTimeout(connect, 100)
  })
}
connect()
