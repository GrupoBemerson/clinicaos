import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function FinanceRelatorio() {
  const [mes, setMes] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
  const [data, setData] = useState<any>(null)

  async function load() {
    const res = await fetch(`/api/financeiro/relatorio?mes=${mes}`)
    const json = await res.json()
    setData(json)
  }

  useEffect(()=>{ load() }, [mes])

  function exportCSV() {
    if (!data) return
    const rows = [['medico_id','nome','total','repasse'], ...data.faturamento_por_medico.map((m:any)=>[m.medico_id,m.nome,m.total,m.repasse])]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `relatorio-${mes}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Relatório Financeiro</h2>
      <div className="flex gap-2 mb-4">
        <input type="month" value={mes} onChange={e=>setMes(e.target.value)} className="p-2 border" />
        <button onClick={exportCSV} className="bg-gray-800 text-white px-3 py-1">Exportar CSV</button>
      </div>
      {!data ? <div>Carregando...</div> : (
        <div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-white shadow">Total faturado<br/><b>{data.total_faturado}</b></div>
            <div className="p-4 bg-white shadow">Total recebido<br/><b>{data.total_recebido}</b></div>
            <div className="p-4 bg-white shadow">Total pendente<br/><b>{data.total_pendente}</b></div>
            <div className="p-4 bg-white shadow">Total repasses<br/><b>{data.total_repasses_medicos}</b></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 shadow">
              <h4>Faturamento por médico</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.faturamento_por_medico}>
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 shadow">
              <h4>Particular vs Convênio</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={[{name:'Particular', value:data.total_particular},{name:'Convênio', value:data.total_convenio}]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    <Cell fill="#8884d8" />
                    <Cell fill="#82ca9d" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
