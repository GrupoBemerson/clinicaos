import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function updatePagamento(id: string, payload: { pago: boolean; tipo_atendimento?: string; valor?: number }) {
  return prisma.$transaction(async (tx) => {
    const updateData: any = { pago: payload.pago }
    if (payload.tipo_atendimento) updateData.tipo_atendimento = payload.tipo_atendimento
    if (typeof payload.valor === 'number') updateData.valor_total = payload.valor
    const updated = await tx.registroFinanceiro.update({ where: { id }, data: updateData })
    return updated
  })
}

export async function listFinanceiro(filters: any) {
  const where: any = {}
  if (filters.medicoId) where.consulta = { medicoId: filters.medicoId }
  if (filters.tipo) where.tipo_atendimento = filters.tipo
  if (filters.pago !== undefined) where.pago = filters.pago === 'true' || filters.pago === true
  if (filters.dateStart || filters.dateEnd) {
    where.created_at = {}
    if (filters.dateStart) where.created_at.gte = new Date(filters.dateStart)
    if (filters.dateEnd) where.created_at.lte = new Date(filters.dateEnd)
  }
  return prisma.registroFinanceiro.findMany({ where, include: { consulta: { include: { paciente: true, medico: true } } }, orderBy: { created_at: 'desc' } })
}

export async function repasses(medicoId: string, mes: string) {
  const [year, month] = mes.split('-').map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  const rows = await prisma.registroFinanceiro.findMany({ where: { consulta: { medicoId }, created_at: { gte: start, lte: end } } })
  const total = rows.reduce((s, r) => s + (r.valor_repasse_medico || 0), 0)
  return { medicoId, mes, total }
}

export async function relatorio(mes: string) {
  const [year, month] = mes.split('-').map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)

  const regs = await prisma.registroFinanceiro.findMany({ where: { created_at: { gte: start, lte: end } }, include: { consulta: { include: { medico: true } } } })

  const total_faturado = regs.reduce((s, r) => s + (r.valor_total || 0), 0)
  const total_recebido = regs.filter(r => r.pago).reduce((s, r) => s + (r.valor_total || 0), 0)
  const total_repasses_medicos = regs.reduce((s, r) => s + (r.valor_repasse_medico || 0), 0)
  const total_particular = regs.filter(r => r.tipo_atendimento === 'PARTICULAR').reduce((s, r) => s + (r.valor_total || 0), 0)
  const total_convenio = regs.filter(r => r.tipo_atendimento === 'CONVENIO').reduce((s, r) => s + (r.valor_total || 0), 0)

  // faturamento por medico
  const mapa: Record<string, { medico_id: string; nome: string; total: number; repasse: number }> = {}
  for (const r of regs) {
    const mId = r.consulta?.medicoId || 'unknown'
    const nome = (r.consulta?.medico?.especialidade) || r.consulta?.medicoId
    if (!mapa[mId]) mapa[mId] = { medico_id: mId, nome, total: 0, repasse: 0 }
    mapa[mId].total += r.valor_total || 0
    mapa[mId].repasse += r.valor_repasse_medico || 0
  }

  const faturamento_por_medico = Object.values(mapa)

  const consultas_realizadas = regs.filter(r => r.consulta && r.consulta.status === 'FINALIZADA').length
  const consultas_canceladas = regs.filter(r => r.consulta && r.consulta.status === 'CANCELADA').length

  return {
    total_faturado,
    total_recebido,
    total_pendente: total_faturado - total_recebido,
    total_convenio,
    total_particular,
    total_repasses_medicos,
    faturamento_por_medico,
    consultas_realizadas,
    consultas_canceladas
  }
}

export async function computeRepasseForConsulta(consultaId: string) {
  return prisma.$transaction(async (tx) => {
    const consulta = await tx.consulta.findUnique({ where: { id: consultaId }, include: { medico: true } })
    if (!consulta) throw new Error('Consulta não encontrada')
    const registro = await tx.registroFinanceiro.findUnique({ where: { consultaId } })
    if (!registro) throw new Error('Registro financeiro não encontrado')
    const medico = consulta.medico
    if (!medico) throw new Error('Médico não encontrado')
    const repasse = registro.valor_total * (medico.percentual_repasse / 100)
    const updated = await tx.registroFinanceiro.update({ where: { id: registro.id }, data: { valor_repasse_medico: repasse } })
    return updated
  })
}
