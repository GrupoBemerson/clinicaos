import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: { nome: string; email: string; senha_hash: string; papel: any }) {
  return prisma.user.create({ data });
}
