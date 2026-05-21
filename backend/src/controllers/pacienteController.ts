import { Request, Response } from 'express'
import * as service from '../services/consultaService'

export async function faltas(req: Request, res: Response) {
  try {
    const pacienteId = req.params.id
    const rows = await service.pacienteFaltas(pacienteId)
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
