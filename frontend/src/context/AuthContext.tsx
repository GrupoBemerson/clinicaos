import React, { createContext, useReducer, useEffect } from 'react'
import { apiFetch } from '../lib/api'

type User = { id: string; nome: string; email: string; papel: string }

type State = { user: User | null; accessToken: string | null }

type Action = { type: 'LOGIN'; payload: State } | { type: 'LOGOUT' }

const initialState: State = { user: null, accessToken: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return action.payload
    case 'LOGOUT':
      return { user: null, accessToken: null }
    default:
      return state
  }
}

const AuthContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}>(null as any)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    try {
      const s = localStorage.getItem('auth')
      return s ? JSON.parse(s) : initialState
    } catch {
      return initialState
    }
  })

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(state))
  }, [state])

  async function login(email: string, senha: string) {
    const resp = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })
    if (!resp.ok) {
      const body = await resp.json()
      throw new Error(body.error || 'Erro')
    }
    const data = await resp.json()
    dispatch({ type: 'LOGIN', payload: { user: data.user, accessToken: data.accessToken } })
    // store refresh token in cookie/localStorage as needed
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  function logout() {
    const rt = localStorage.getItem('refreshToken')
    if (rt) apiFetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }) })
    localStorage.removeItem('refreshToken')
    dispatch({ type: 'LOGOUT' })
  }

  return <AuthContext.Provider value={{ state, dispatch, login, logout }}>{children}</AuthContext.Provider>
}

export default AuthContext
