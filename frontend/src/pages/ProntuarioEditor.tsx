import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import debounce from 'lodash.debounce'
import { apiFetch } from '../lib/api'

function renderField(key: string, value: any, onChange: (k:string,v:any)=>void) {
  return (
    <div className="mb-2" key={key}>
      <label className="block text-sm font-semibold">{key}</label>
      <textarea value={value||''} onChange={e=>onChange(key,e.target.value)} className="w-full p-2 border rounded" rows={4} />
    </div>
  )
}

export default function ProntuarioEditor() {
  const { consultaId } = useParams()
  const [modelos, setModelos] = useState<any[]>([])
  const [modelo, setModelo] = useState<any|null>(null)
  const [conteudo, setConteudo] = useState<any>({})
  const [statusMsg, setStatusMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [prontuarioId, setProntuarioId] = useState<string | null>(null)
  const retryRef = useRef<number | null>(null)

  useEffect(()=>{ apiFetch('/api/modelos-prontuario').then(r=>r.json()).then(setModelos) }, [])

  const doAutosave = useCallback(debounce(async (id:string, content:any)=>{
    try {
      setSaving(true)
      const res = await apiFetch(`/api/prontuarios/${id}/autosave`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(content) })
      if (!res.ok) throw new Error('fail')
      setStatusMsg('Salvo automaticamente às ' + new Date().toLocaleTimeString())
      setSaving(false)
    } catch (e) {
      setStatusMsg('Falha ao salvar automaticamente')
      setSaving(false)
      retryRef.current = window.setTimeout(()=>{ if (id) doAutosave(id, content) }, 10000)
    }
  }, 500), [])

  useEffect(()=>{
    return ()=>{ doAutosave.cancel(); if (retryRef.current) clearTimeout(retryRef.current) }
  }, [])

  async function handleStart() {
    // create prontuario for the consulta
    // fetch consulta to get medicoId and pacienteId
    const resp = await apiFetch(`/api/consultas?`) // simplified; assume frontend provides ids
    // For demo, create with placeholders
    const body = { consultaId, pacienteId: 'placeholder-paciente', medicoId: 'placeholder-medico', conteudo_json: conteudo, especialidade_modelo: modelo?.especialidade }
    const r = await apiFetch('/api/prontuarios', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const data = await r.json()
    setProntuarioId(data.id)
  }

  function handleFieldChange(k:string, v:any) {
    const next = { ...conteudo, [k]: v }
    setConteudo(next)
    if (prontuarioId) doAutosave(prontuarioId, next)
  }

  async function handleSave() {
    if (!prontuarioId) return
    setSaving(true)
    await apiFetch(`/api/prontuarios/${prontuarioId}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ conteudo_json: conteudo }) })
    setSaving(false)
    setStatusMsg('Salvo manualmente às ' + new Date().toLocaleTimeString())
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Prontuário</h2>
      <div className="mb-4">
        <label className="block mb-1">Modelo</label>
        <select onChange={e=>{ const m=modelos.find(x=>x.id===e.target.value); setModelo(m); setConteudo(m?.estrutura_json || {}) }} className="p-2 border">
          <option value="">-- selecionar --</option>
          {modelos.map(m=> <option key={m.id} value={m.id}>{m.nome} ({m.especialidade})</option>)}
        </select>
      </div>

      {modelo && <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">{modelo.nome}</h3>
        {Object.keys(modelo.estrutura_json).map((k:string)=> renderField(k, conteudo[k], handleFieldChange))}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">{saving ? 'Salvando…' : statusMsg}</div>
          <div>
            {!prontuarioId && <button onClick={handleStart} className="bg-blue-600 text-white px-3 py-1 mr-2">Iniciar Prontuário</button>}
            <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1">Salvar</button>
          </div>
        </div>
      </div>}
    </div>
  )
}
