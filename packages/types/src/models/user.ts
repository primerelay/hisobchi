export type UserRole = 'admin' | 'waiter' | 'superAdmin';

export interface User {
  _id: string;
  restaurantId: string;
  role: UserRole;
  name: string;
  phone: string;
  passwordHash?: string;
  commissionPercent: number;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWaiterInput {
  name: string;
  phone: string;
  password: string;
  commissionPercent?: number;
}

export interface UpdateWaiterInput {
  name?: string;
  phone?: string;
  password?: string;
  commissionPercent?: number;
  isActive?: boolean;
}

export interface SuperAdmin {
  _id: string;
  email: string;
  passwordHash?: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface UserPublic {
  _id: string;
  restaurantId: string;
  role: UserRole;
  name: string;
  phone: string;
  commissionPercent: number;
  isActive: boolean;
}
