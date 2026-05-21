import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type Msg = { tipo: string; consulta_id: string; novo_status: string; paciente_nome?: string; medico_nome?: string }

export function useClinicSocket(onMessage: (m: Msg) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const backoffRef = useRef(1000)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true
    function connect() {
      const ws = new WebSocket((location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.hostname + ':4000')
      ws.onopen = () => { if (!mounted) return; wsRef.current = ws; setConnected(true); backoffRef.current = 1000 }
      ws.onmessage = (ev) => { const data = JSON.parse(ev.data); onMessage(data); if (data.tipo === 'STATUS_ATUALIZADO') toast.info(`${data.paciente_nome} -> ${data.novo_status}`) }
      ws.onclose = () => { if (!mounted) return; setConnected(false); scheduleReconnect() }
      ws.onerror = () => { ws.close() }
    }

    function scheduleReconnect() {
      const delay = backoffRef.current
      backoffRef.current = Math.min(backoffRef.current * 2, 8000)
      timeoutRef.current = window.setTimeout(() => connect(), delay)
    }

    connect()
    return () => { mounted = false; if (timeoutRef.current) clearTimeout(timeoutRef.current); wsRef.current?.close() }
  }, [onMessage])

  return { connected, reconnect: () => { if (wsRef.current) wsRef.current.close() } }
}

export default useClinicSocket
