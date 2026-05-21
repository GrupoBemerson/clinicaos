import { Server as HttpServer } from 'http'
import WebSocket, { WebSocketServer } from 'ws'

let wss: WebSocketServer | null = null

export function setupWebSocket(server: HttpServer) {
  wss = new WebSocketServer({ server })
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      // no-op for now
    })
  })
}

export function broadcast(payload: any) {
  if (!wss) return
  const msg = JSON.stringify(payload)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg)
  })
}
