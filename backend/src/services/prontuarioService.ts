import * as repo from '../repositories/prontuarioRepository'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createProntuario(data: any, user: any) {
  // only MEDICO or ADMIN allowed - caller should enforce; ensure medicoId matches user if MEDICO
  if (user.papel === 'MEDICO' && user.id !== data.medicoId) throw { status: 403, message: 'Não autorizado' }
  // ensure consulta exists? assume frontend passes consultaId
  return repo.createProntuario(data)
}

export async function listByPaciente(pacienteId: string) {
  return repo.findByPaciente(pacienteId)
}

export async function getById(id: string) {
  return repo.findById(id)
}

export async function update(id: string, data: any, user: any) {
  const p = await repo.findById(id)
  if (!p) throw { status: 404, message: 'Prontuário não encontrado' }
  if (user.papel !== 'ADMIN' && user.id !== p.medicoId) throw { status: 403, message: 'Somente o médico criador ou ADMIN pode editar' }
  return repo.updateProntuario(id, data)
}

export async function autosave(id: string, conteudo: any, user: any) {
  const p = await repo.findById(id)
  if (!p) throw { status: 404 }
  // allow autosave by medico who owns or admin
  if (user.papel !== 'ADMIN' && user.id !== p.medicoId) throw { status: 403 }
  return repo.autosave(id, conteudo)
}
