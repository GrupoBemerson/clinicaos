import { PrismaClient } from '@prisma/client'
import { hashPassword } from './services/authService'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@clinicaos.local'
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    console.log('Admin já existe')
    return
  }
  const senha_hash = await hashPassword('admin123')
  await prisma.user.create({ data: { nome: 'Administrador', email, senha_hash, papel: 'ADMIN' } })
  console.log('Admin criado: admin@clinicaos.local / admin123')
}

// create initial ModeloProntuario entries
async function seedModelos() {
  const modelos = [
    { especialidade: 'Clínica Geral', nome: 'Clínica Geral', estrutura_json: {
      queixa_principal: '', historico_doenca_atual: '', antecedentes: '', exame_fisico: '', hipotese_diagnostica: '', conduta: ''
    }},
    { especialidade: 'Pediatria', nome: 'Pediatria', estrutura_json: {
      queixa_principal: '', historico_doenca_atual: '', antecedentes: '', exame_fisico: '', hipotese_diagnostica: '', conduta: ''
    }},
    { especialidade: 'Cardiologia', nome: 'Cardiologia', estrutura_json: {
      queixa_principal: '', historico_doenca_atual: '', antecedentes: '', exame_fisico: '', hipotese_diagnostica: '', conduta: ''
    }},
  ]

  for (const m of modelos) {
    const exists = await prisma.modeloProntuario.findFirst({ where: { nome: m.nome } })
    if (!exists) await prisma.modeloProntuario.create({ data: m as any })
  }
  console.log('Modelos de prontuário populados')
}

// run additional seeds
seedModelos().catch(e => console.error(e))

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
