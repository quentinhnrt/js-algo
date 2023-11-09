export function wsInit() {
  const ws = new WebSocket(`ws://${location.host}`)
  ws.onopen = () => setInterval(() => ws.send("ping"), 5000)
  ws.onmessage = (event: MessageEvent) => {
    if (event.data !== "Well received") {
      console.log(event.data)
    }
    if (event.data === "reload") {
      location.reload()
    }
  }
}
