import { Request, Response } from 'express'
import * as service from '../services/consultaService'

export async function create(req: Request, res: Response) {
  try {
    const payload = req.body
    if (!payload.pacienteId || !payload.medicoId || !payload.data_hora) return res.status(400).json({ error: 'campos obrigatórios faltando' })
    const result = await service.createConsulta(payload)
    res.json(result)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'erro' })
  }
}

export async function list(req: Request, res: Response) {
  try {
    const filters = { medicoId: req.query.medicoId as string, status: req.query.status as string, date: req.query.date as string }
    const rows = await service.listConsultas(filters)
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function listToday(req: Request, res: Response) {
  try {
    const rows = await service.listToday()
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const data = req.body
    const updated = await service.updateConsulta(id, data)
    res.json(updated)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

export async function cancel(req: Request, res: Response) {
  try {
    const id = req.params.id
    const updated = await service.cancelConsulta(id)
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function presenca(req: Request, res: Response) {
  try {
    const id = req.params.id
    const { compareceu } = req.body
    if (typeof compareceu !== 'boolean') return res.status(400).json({ error: 'compareceu deve ser booleano' })
    const updated = await service.setPresenca(id, compareceu)
    res.json(updated)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    const id = req.params.id
    const { status } = req.body
    if (!status) return res.status(400).json({ error: 'status obrigatório' })
    const updated = await service.updateStatus(id, status)

    // broadcast via websocket
    const ws = await import('../wsServer')
    // fetch names
    const consulta = await service.repoFindByIdWithNames(id)
    ws.broadcast({ tipo: 'STATUS_ATUALIZADO', consulta_id: id, novo_status: status, paciente_nome: consulta.paciente?.nome, medico_nome: consulta.medico?.user?.nome })

    res.json(updated)
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

