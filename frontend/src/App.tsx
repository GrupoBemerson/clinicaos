import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Agenda from './pages/Agenda'
import Financeiro from './pages/Financeiro'
import FinanceRelatorio from './pages/FinanceRelatorio'
import FluxoPainel from './pages/FluxoPainel'
import ProntuarioEditor from './pages/ProntuarioEditor'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>} />
      <Route path="/agenda" element={<PrivateRoute><Agenda /></PrivateRoute>} />
      <Route path="/financeiro" element={<PrivateRoute><Financeiro /></PrivateRoute>} />
      <Route path="/relatorio" element={<PrivateRoute><FinanceRelatorio /></PrivateRoute>} />
      <Route path="/fluxo" element={<PrivateRoute><FluxoPainel /></PrivateRoute>} />
      <Route path="/prontuario/:consultaId" element={<PrivateRoute><ProntuarioEditor /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
