import { Request, Response } from 'express'
import * as service from '../services/prontuarioService'
import { AuthRequest } from '../middleware/auth'

export async function create(req: AuthRequest, res: Response) {
  try {
    const body = req.body
    const user = req.user
    const created = await service.createProntuario(body, user)
    res.json(created)
  } catch (err: any) { res.status(err.status || 500).json({ error: err.message }) }
}

export async function listByPaciente(req: AuthRequest, res: Response) {
  try {
    const pacienteId = req.params.paciente_id
    const rows = await service.listByPaciente(pacienteId)
    res.json(rows)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id
    const p = await service.getById(id)
    res.json(p)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id
    const user = req.user
    const updated = await service.update(id, req.body, user)
    res.json(updated)
  } catch (err: any) { res.status(err.status || 500).json({ error: err.message }) }
}

export async function autosave(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id
    const user = req.user
    await service.autosave(id, req.body, user)
    res.status(204).send()
  } catch (err: any) { res.status(err.status || 500).json({ error: err.message }) }
}
