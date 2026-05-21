import { Request, Response } from 'express'
import * as service from '../services/financeService'

export async function pagamento(req: Request, res: Response) {
  try {
    const id = req.params.id
    const body = req.body
    const updated = await service.updatePagamento(id, body)
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function list(req: Request, res: Response) {
  try {
    const filters = { medicoId: req.query.medicoId as string, tipo: req.query.tipo as string, pago: req.query.pago as string, dateStart: req.query.date_start as string, dateEnd: req.query.date_end as string }
    const rows = await service.listFinanceiro(filters)
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function repasses(req: Request, res: Response) {
  try {
    const medicoId = req.query.medico_id as string
    const mes = req.query.mes as string
    const result = await service.repasses(medicoId, mes)
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function relatorio(req: Request, res: Response) {
  try {
    const mes = req.query.mes as string
    const result = await service.relatorio(mes)
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
