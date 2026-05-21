import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;
  try {
    const result = await authService.login(email, senha);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  try {
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  try {
    await authService.logout(refreshToken);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
