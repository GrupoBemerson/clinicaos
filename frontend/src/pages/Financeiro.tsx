import React, { useEffect, useState } from 'react'

export default function Financeiro() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (dateStart) params.set('date_start', dateStart)
    if (dateEnd) params.set('date_end', dateEnd)
    const res = await fetch('/api/financeiro?' + params.toString())
    const data = await res.json()
    setRows(data)
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  async function marcarPago(id: string) {
    await fetch(`/api/financeiro/${id}/pagamento`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ pago: true }) })
    load()
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Controle Financeiro</h2>
      <div className="flex gap-2 mb-4">
        <input type="date" value={dateStart} onChange={e=>setDateStart(e.target.value)} className="p-2 border" />
        <input type="date" value={dateEnd} onChange={e=>setDateEnd(e.target.value)} className="p-2 border" />
        <button onClick={load} className="bg-blue-600 text-white px-3 py-1">Filtrar</button>
      </div>
      {loading ? <div>Carregando...</div> : (
        <table className="w-full border">
          <thead><tr><th className="p-2">Data</th><th>Paciente</th><th>Médico</th><th>Tipo</th><th>Valor</th><th>Pago</th><th>Repasse</th><th>Ações</th></tr></thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">{r.consulta?.paciente?.nome || r.consulta?.pacienteId}</td>
                <td className="p-2">{r.consulta?.medicoId}</td>
                <td className="p-2">{r.tipo_atendimento}</td>
                <td className="p-2">{r.valor_total}</td>
                <td className="p-2">{r.pago? 'Sim':'Não'}</td>
                <td className="p-2">{r.valor_repasse_medico}</td>
                <td className="p-2">{!r.pago && <button onClick={()=>marcarPago(r.id)} className="bg-green-600 text-white px-2 py-1">Marcar pago</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
