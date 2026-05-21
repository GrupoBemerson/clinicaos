import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function listByEspecialidade(req: Request, res: Response) {
  try {
    const esp = req.query.especialidade as string
    const where = esp ? { especialidade: esp } : {}
    const rows = await prisma.modeloProntuario.findMany({ where })
    res.json(rows)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
}
