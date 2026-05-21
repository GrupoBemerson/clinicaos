import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !senha) return setError('Preencha email e senha')
    try {
      await login(email, senha)
    } catch (err: any) {
      setError(err?.message || 'Erro ao autenticar')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">ClinicaOS — Login</h1>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <label className="block mb-2">
          <div className="text-sm">Email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded" />
        </label>
        <label className="block mb-4">
          <div className="text-sm">Senha</div>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} className="mt-1 w-full p-2 border rounded" />
        </label>
        <button className="w-full bg-blue-600 text-white p-2 rounded">Entrar</button>
      </form>
    </div>
  )
}
