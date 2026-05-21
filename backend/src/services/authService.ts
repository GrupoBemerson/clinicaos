import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);

export async function login(email: string, senha: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Credenciais inválidas');

  const ok = await bcrypt.compare(senha, user.senha_hash);
  if (!ok) throw new Error('Credenciais inválidas');

  const accessToken = jwt.sign({ sub: user.id, papel: user.papel }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

  // create refresh token
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  return { accessToken, refreshToken, user: { id: user.id, nome: user.nome, email: user.email, papel: user.papel } };
}

export async function refreshToken(refreshToken: string) {
  if (!refreshToken) throw new Error('Refresh token inválido');
  const record = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
  if (!record) throw new Error('Refresh token inválido');
  if (record.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: record.id } });
    throw new Error('Refresh token expirado');
  }

  const user = record.user;
  const accessToken = jwt.sign({ sub: user.id, papel: user.papel }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  return { accessToken, user: { id: user.id, nome: user.nome, email: user.email, papel: user.papel } };
}

export async function logout(refreshToken: string) {
  if (!refreshToken) throw new Error('Refresh token inválido');
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
