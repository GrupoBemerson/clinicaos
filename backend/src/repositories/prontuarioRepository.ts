import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function createProntuario(data: any) {
  return prisma.prontuario.create({ data })
}

export function findByPaciente(pacienteId: string) {
  return prisma.prontuario.findMany({ where: { pacienteId }, orderBy: { created_at: 'desc' } })
}

export function findById(id: string) {
  return prisma.prontuario.findUnique({ where: { id }, include: { prescricoes: true, paciente: true, medico: { include: { user: true } } } })
}

export function updateProntuario(id: string, data: any) {
  return prisma.prontuario.update({ where: { id }, data })
}

export function autosave(id: string, conteudo: any) {
  return prisma.prontuario.update({ where: { id }, data: { conteudo_json: conteudo, last_autosave_at: new Date() } })
}
