import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function createConsulta(data: any) {
  return prisma.consulta.create({ data })
}

export function findConflictingConsulta(medicoId: string, data_hora: Date, excludeId?: string) {
  return prisma.consulta.findFirst({
    where: {
      medicoId,
      data_hora,
      NOT: [{ status: 'CANCELADA' }, ...(excludeId ? [{ id: excludeId }] : [])]
    }
  })
}

export function findMany(filters: any) {
  const where: any = {}
  if (filters.medicoId) where.medicoId = filters.medicoId
  if (filters.status) where.status = filters.status
  if (filters.date) {
    const date = new Date(filters.date)
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    where.data_hora = { gte: date, lt: next }
  }
  return prisma.consulta.findMany({ where, orderBy: { data_hora: 'asc' } })
}

export function updateConsulta(id: string, data: any) {
  return prisma.consulta.update({ where: { id }, data })
}

export function cancelConsulta(id: string) {
  return prisma.consulta.update({ where: { id }, data: { status: 'CANCELADA' } })
}

export function findById(id: string) {
  return prisma.consulta.findUnique({ where: { id } })
}

export function findConsultasByPacienteFaltas(pacienteId: string) {
  return prisma.consulta.findMany({ where: { pacienteId, status: 'CANCELADA' }, orderBy: { data_hora: 'desc' } })
}
