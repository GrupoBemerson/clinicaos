import React, { useEffect, useState } from 'react'
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core'
import useClinicSocket from '../hooks/useClinicSocket'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { apiFetch } from '../lib/api'

const order = ['CHEGOU','TRIAGEM','AGUARDANDO_MEDICO','EM_ATENDIMENTO','FINALIZADA']

export default function FluxoPainel() {
  const [columns, setColumns] = useState<Record<string, any[]>>(() => {
    const c: any = {}
    order.forEach(s => c[s]=[])
    return c
  })
  const [wsState, setWsState] = useState(false)

  async function load() {
    const res = await apiFetch('/api/consultas/hoje')
    const rows = await res.json()
    const grouped: any = {}
    order.forEach(s=>grouped[s]=[])
    for (const r of rows) grouped[r.status].push(r)
    setColumns(grouped)
  }

  useEffect(()=>{ load() }, [])

  const { connected, reconnect } = useClinicSocket((m:any)=>{
    if (m.tipo === 'STATUS_ATUALIZADO') {
      toast.info(`Status atualizado: ${m.paciente_nome} -> ${m.novo_status}`)
      load()
    }
  })

  useEffect(()=>{ setWsState(connected) }, [connected])

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const id = active.id
    const newStatus = over.id as string
    const confirmed = window.confirm('Confirmar mudança de status?')
    if (!confirmed) return
    apiFetch(`/api/consultas/${id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: newStatus }) })
      .then(res => { if (!res.ok) throw new Error('Erro'); load() })
      .catch(()=> toast.error('Erro ao atualizar status'))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Painel de Fluxo</h2>
        <div>
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${wsState? 'bg-green-500':'bg-red-500'}`}></span>
          <button onClick={reconnect} className="text-sm">Reconectar</button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-4">
          {order.map(status => (
            <div key={status} className="bg-white p-2">
              <h4 className="font-bold mb-2">{status}</h4>
              <div id={status} style={{ minHeight: 200 }}>
                {columns[status]?.map((c:any) => (
                  <div key={c.id} id={c.id} data-id={c.id} className="p-2 mb-2 border rounded bg-gray-50"> 
                    <div className="font-bold">{c.paciente?.nome || c.pacienteId}</div>
                    <div className="text-sm">{new Date(c.data_hora).toLocaleTimeString()}</div>
                    <div className="text-xs">{c.medico?.user?.nome || c.medicoId}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DndContext>
      <ToastContainer position="top-right" />
    </div>
  )
}
