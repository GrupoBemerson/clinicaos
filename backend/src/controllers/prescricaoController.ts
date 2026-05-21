import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function create(req: Request, res: Response) {
  try {
    const prontuarioId = req.params.id
    const body = req.body
    const created = await prisma.prescricao.create({ data: { prontuarioId, ...body } })
    res.json(created)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function list(req: Request, res: Response) {
  try {
    const prontuarioId = req.params.id
    const rows = await prisma.prescricao.findMany({ where: { prontuarioId }, orderBy: { created_at: 'desc' } })
    res.json(rows)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    await prisma.prescricao.delete({ where: { id } })
    res.json({ ok: true })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}
