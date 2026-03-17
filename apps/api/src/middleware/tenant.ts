import { Request, Response, NextFunction } from 'express';
import { Restaurant } from '../models';

/**
 * Middleware to ensure tenant context is set
 * Must be used after authenticate middleware
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.restaurantId) {
    return res.status(400).json({ error: 'Restaurant konteksti topilmadi' });
  }
  next();
}

/**
 * Middleware to validate tenant is active
 */
export async function validateTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.restaurantId) {
    return next();
  }

  try {
    const restaurant = await Restaurant.findById(req.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant topilmadi' });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({ error: 'Restaurant faol emas' });
    }

    // Check subscription
    if (restaurant.subscription.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Obuna muddati tugagan' });
    }

    next();
  } catch {
    return res.status(500).json({ error: 'Server xatosi' });
  }
}
