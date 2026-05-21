import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
import * as notificationService from './services/notificationService'

const prisma = new PrismaClient()

// runs every day at 08:00
cron.schedule('0 8 * * *', async () => {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const start = new Date(tomorrow)
    start.setHours(0,0,0,0)
    const end = new Date(tomorrow)
    end.setHours(23,59,59,999)

    const consultas = await prisma.consulta.findMany({ where: { data_hora: { gte: start, lte: end }, status: { not: 'CANCELADA' } }, include: { paciente: true, medico: true } })
    for (const c of consultas) {
      const msg = `Lembrete: sua consulta em ${c.data_hora.toLocaleString()} com o médico ${c.medicoId}. Confirma?` // medico.name not available in model quickly
      if (c.paciente?.telefone) await notificationService.sendWhatsApp(c.paciente.telefone, msg, c.id)
    }
  } catch (e) {
    console.error('Erro no job de lembretes', e)
  }
})
