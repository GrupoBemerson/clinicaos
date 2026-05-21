import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function sendWhatsApp(telefone: string, mensagem: string, consultaId?: string) {
  console.log(`Simulated WhatsApp to ${telefone}: ${mensagem}`)
  const nota = await prisma.notificacao.create({
    data: { consultaId, tipo: 'WHATSAPP', mensagem, enviada_em: new Date(), status: 'SENT' }
  })
  return nota
}
