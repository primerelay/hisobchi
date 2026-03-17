import { UserRole } from '@repo/types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        restaurantId?: string;
        role: UserRole | 'superAdmin';
        name: string;
      };
      restaurantId?: string;
    }
  }
}

export {};
