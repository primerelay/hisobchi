export type SubscriptionPlan = 'trial' | 'basic' | 'premium';

export interface RestaurantSettings {
  currency: string;
  commissionEnabled: boolean;
  defaultCommission: number;
  timezone: string;
}

export interface RestaurantSubscription {
  plan: SubscriptionPlan;
  expiresAt: Date;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  phone: string;
  address?: string;
  logo: string;
  settings: RestaurantSettings;
  subscription: RestaurantSubscription;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRestaurantInput {
  name: string;
  slug: string;
  phone: string;
  address?: string;
  logo?: string;
  adminName: string;
  adminPhone: string;
  adminPassword: string;
  plan: SubscriptionPlan;
  commissionEnabled?: boolean;
  defaultCommission?: number;
  createSampleData?: boolean;
}

export interface UpdateRestaurantInput {
  name?: string;
  phone?: string;
  address?: string;
  logo?: string;
  isActive?: boolean;
  settings?: Partial<RestaurantSettings>;
}
