import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, SuperAdmin } from '../models';
import type { UserRole } from '@repo/types';

interface JwtPayload {
  id: string;
  restaurantId?: string;
  role: UserRole | 'superAdmin';
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token kiritilmagan' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = {
      id: decoded.id,
      restaurantId: decoded.restaurantId,
      role: decoded.role,
      name: '',
    };
    req.restaurantId = decoded.restaurantId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token yaroqsiz' });
  }
}

export function authorize(...roles: Array<UserRole | 'superAdmin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    next();
  };
}

export async function loadUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next();
  }

  try {
    if (req.user.role === 'superAdmin') {
      const admin = await SuperAdmin.findById(req.user.id);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
      }
      req.user.name = admin.name;
    } else {
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
      }
      req.user.name = user.name;
    }
    next();
  } catch {
    return res.status(500).json({ error: 'Server xatosi' });
  }
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}
