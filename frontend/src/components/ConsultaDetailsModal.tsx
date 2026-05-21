import React, { useState } from 'react'

export default function DetailsModal({ consulta, onClose }: { consulta: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function doPresenca(compareceu: boolean) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/consultas/${consulta.id}/presenca`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ compareceu }) })
      if (!res.ok) { const b = await res.json(); setError(b.error || 'Erro'); setLoading(false); return }
      onClose()
    } catch (e) { setError('Erro'); }
    setLoading(false)
  }

  async function cancelar() {
    setLoading(true)
    try {
      await fetch(`/api/consultas/${consulta.id}`, { method: 'DELETE' })
      onClose()
    } catch (e) { setError('Erro'); }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-96">
        <h3 className="font-bold">Consulta</h3>
        <div className="text-sm">Paciente: {consulta.pacienteId}</div>
        <div className="text-sm">Médico: {consulta.medicoId}</div>
        <div className="text-sm">Data: {new Date(consulta.data_hora).toLocaleString()}</div>
        <div className="text-sm">Status: {consulta.status}</div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => doPresenca(true)} className="bg-green-600 text-white px-3 py-1">Registrar presença</button>
          <button onClick={() => doPresenca(false)} className="bg-yellow-600 text-white px-3 py-1">Registrar falta</button>
          <button onClick={cancelar} className="bg-red-600 text-white px-3 py-1">Cancelar</button>
        </div>
        <div className="flex justify-end mt-2"><button onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  )
}
