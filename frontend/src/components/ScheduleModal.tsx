import React, { useState } from 'react'

export default function ScheduleModal({ onClose }: { onClose: () => void }) {
  const [paciente, setPaciente] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [tipo, setTipo] = useState('CONVENIO')
  const [valor, setValor] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alerta, setAlerta] = useState<any>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!paciente || !medicoId || !data || !hora) return setError('Preencha todos os campos')
    setLoading(true)
    const data_hora = new Date(`${data}T${hora}`)
    try {
      const res = await fetch('/api/consultas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pacienteId: paciente, medicoId, data_hora, tipo_atendimento: tipo, valor: Number(valor) }) })
      if (res.status === 409) {
        setError('Conflito de horário: escolha outro horário')
        setLoading(false)
        return
      }
      const body = await res.json()
      if (body.alerta) setAlerta(body.alerta)
      setLoading(false)
      onClose()
    } catch (e: any) {
      setError('Erro ao criar consulta')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded w-96">
        <h3 className="font-bold mb-2">Agendar Consulta</h3>
        {error && <div className="text-red-600">{error}</div>}
        {alerta && <div className="bg-yellow-100 p-2 mb-2">{alerta.mensagem}</div>}
        <input placeholder="Paciente ID" value={paciente} onChange={e=>setPaciente(e.target.value)} className="w-full p-2 mb-2 border" />
        <input placeholder="Médico ID" value={medicoId} onChange={e=>setMedicoId(e.target.value)} className="w-full p-2 mb-2 border" />
        <div className="flex gap-2 mb-2">
          <input type="date" value={data} onChange={e=>setData(e.target.value)} className="flex-1 p-2 border" />
          <input type="time" value={hora} onChange={e=>setHora(e.target.value)} className="w-32 p-2 border" />
        </div>
        <select value={tipo} onChange={e=>setTipo(e.target.value)} className="w-full p-2 mb-2 border">
          <option>CONVENIO</option>
          <option>PARTICULAR</option>
        </select>
        <input placeholder="Valor" value={valor} onChange={e=>setValor(e.target.value)} className="w-full p-2 mb-2 border" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1">Fechar</button>
          <button className="bg-blue-600 text-white px-3 py-1">{loading? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </div>
  )
}
