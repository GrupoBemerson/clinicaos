import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export interface AuthRequest extends Request {
  user?: any;
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token ausente' });

  const token = auth.split(' ')[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, papel: payload.papel };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function authorizeRoles(...allowed: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Não autenticado' });
    if (!allowed.includes(user.papel)) return res.status(403).json({ error: 'Acesso negado' });
    next();
  };
}
