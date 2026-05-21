import * as repo from '../repositories/consultaRepository'
import * as notificationService from './notificationService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createConsulta(data: any) {
  // conflict check
  const conflict = await repo.findConflictingConsulta(data.medicoId, new Date(data.data_hora))
  if (conflict) throw { status: 409, message: 'Conflito de horário para este médico' }

  // transaction: create consulta + registro financeiro atomically
  const result = await prisma.$transaction(async (tx) => {
    const c = await tx.consulta.create({ data })
    await tx.registroFinanceiro.create({ data: { consultaId: c.id, valor_total: data.valor, tipo_atendimento: data.tipo_atendimento, pago: false, valor_repasse_medico: 0 } })
    return c
  })

  // send async notification (no await)
  setImmediate(async () => {
    try {
      // fetch paciente telefone
      const paciente = await prisma.paciente.findUnique({ where: { id: data.pacienteId } })
      if (paciente && paciente.telefone) {
        await notificationService.sendWhatsApp(paciente.telefone, `Sua consulta em ${new Date(data.data_hora).toLocaleString()} foi agendada.`, result.id)
      }
    } catch (e) {
      console.error('Erro ao enviar notificação', e)
    }
  })

  // check faltas alert
  const paciente = await prisma.paciente.findUnique({ where: { id: data.pacienteId } })
  const alerta = paciente && paciente.historico_faltas_count >= 3

  return { consulta: result, alerta: alerta ? { alerta: true, mensagem: 'Paciente com histórico frequente de faltas' } : undefined }
}

export async function listConsultas(filters: any) {
  return repo.findMany(filters)
}

export async function listToday() {
  const today = new Date()
  const start = new Date(today)
  start.setHours(0,0,0,0)
  const end = new Date(today)
  end.setHours(23,59,59,999)
  return prisma.consulta.findMany({ where: { data_hora: { gte: start, lte: end } }, include: { paciente: true, medico: { include: { user: true } } }, orderBy: { data_hora: 'asc' } })
}

// helper for controller to fetch names
export async function repoFindByIdWithNames(id: string) {
  return prisma.consulta.findUnique({ where: { id }, include: { paciente: true, medico: { include: { user: true } } } })
}

export async function updateConsulta(id: string, data: any) {
  // if changing medicoId or data_hora, check conflict
  if (data.medicoId || data.data_hora) {
    const existing = await repo.findConflictingConsulta(data.medicoId, new Date(data.data_hora), id)
    if (existing) throw { status: 409, message: 'Conflito de horário para este médico' }
  }
  return repo.updateConsulta(id, data)
}

export async function updateStatus(id: string, status: string) {
  // validate sequence
  const order = ['CHEGOU','TRIAGEM','AGUARDANDO_MEDICO','EM_ATENDIMENTO','FINALIZADA']
  const consulta = await repo.findById(id)
  if (!consulta) throw { status: 404, message: 'Consulta não encontrada' }
  const currentIndex = order.indexOf(consulta.status as string)
  const newIndex = order.indexOf(status)
  if (newIndex === -1) throw { status: 400, message: 'Status inválido' }
  if (newIndex < currentIndex) throw { status: 400, message: 'Transição de status inválida' }
  if (newIndex - currentIndex > 1 && status !== 'FINALIZADA') throw { status: 400, message: 'Transição não segue sequência lógica' }

  const updated = await prisma.consulta.update({ where: { id }, data: { status } })

  if (status === 'FINALIZADA') {
    // compute repasse
    const finance = await import('./financeService')
    try { await finance.computeRepasseForConsulta(id) } catch (e) { console.error('Erro repasse', e) }
  }

  return updated
}

export async function cancelConsulta(id: string) {
  return repo.cancelConsulta(id)
}

export async function setPresenca(id: string, compareceu: boolean) {
  const consulta = await repo.findById(id)
  if (!consulta) throw { status: 404, message: 'Consulta não encontrada' }

  const dataUpdate: any = { compareceu }
  if (compareceu) dataUpdate.status = 'FINALIZADA'
  else dataUpdate.status = 'CANCELADA'

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.consulta.update({ where: { id }, data: dataUpdate })
    if (!compareceu) {
      await tx.paciente.update({ where: { id: updated.pacienteId }, data: { historico_faltas_count: { increment: 1 } } })
      return updated
    }

    // if finalized, calculate repasse and update registro financeiro
    const medico = await tx.medico.findUnique({ where: { id: updated.medicoId } })
    const registro = await tx.registroFinanceiro.findUnique({ where: { consultaId: updated.id } })
    if (registro && medico) {
      const repasse = registro.valor_total * (medico.percentual_repasse / 100)
      await tx.registroFinanceiro.update({ where: { id: registro.id }, data: { valor_repasse_medico: repasse } })
    }

    return updated
  })

  return result
}

export async function pacienteFaltas(pacienteId: string) {
  return repo.findConsultasByPacienteFaltas(pacienteId)
}
