export const USER_ROLES = ['admin', 'waiter'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  waiter: 'Ofitsiant',
};

export const ROLE_LABELS_EN: Record<UserRole, string> = {
  admin: 'Admin',
  waiter: 'Waiter',
};

export const SUBSCRIPTION_PLANS = ['trial', 'basic', 'premium'] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  trial: 'Sinov (14 kun)',
  basic: 'Asosiy',
  premium: 'Premium',
};

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  trial: 0,
  basic: 100000,
  premium: 250000,
};

export const PLAN_DURATION_DAYS: Record<SubscriptionPlan, number> = {
  trial: 14,
  basic: 30,
  premium: 30,
};
