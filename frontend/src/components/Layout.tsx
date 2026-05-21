import React from 'react'
import { useAuth } from '../hooks/useAuth'

const menuItems: Record<string, Array<{ key: string; label: string }>> = {
  ADMIN: [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'medicos', label: 'Médicos' }
  ],
  MEDICO: [
    { key: 'agenda', label: 'Agenda' },
    { key: 'prontuarios', label: 'Prontuários' }
  ],
  RECEPCIONISTA: [{ key: 'agendamentos', label: 'Agendamentos' }],
  ENFERMEIRO: [{ key: 'triagem', label: 'Triagem' }]
}

export default function Layout() {
  const { state, logout } = useAuth()
  const papel = state.user?.papel || 'RECEPCIONISTA'

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 font-bold">ClinicaOS</div>
        <nav className="p-4">
          {menuItems[papel].map(m => (
            <div key={m.key} className="py-2 text-gray-700">{m.label}</div>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={logout} className="text-sm text-red-600">Sair</button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">Conteúdo principal</main>
    </div>
  )
}
