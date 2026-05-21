import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { state } = useAuth()
  if (!state.user || !state.accessToken) return <Navigate to="/login" replace />
  return children
}

export default PrivateRoute
