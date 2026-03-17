import { z } from 'zod';
import { SUBSCRIPTION_PLANS } from '@repo/constants';

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(2, 'Nomi juda qisqa')
    .max(100, 'Nomi juda uzun'),
  slug: z
    .string()
    .min(2, 'Slug juda qisqa')
    .max(50, 'Slug juda uzun')
    .regex(
      /^[a-z0-9-]+$/,
      'Slugda faqat kichik harflar, raqamlar va chiziqcha bo\'lishi mumkin'
    ),
  phone: z
    .string()
    .regex(/^\+998[0-9]{9}$/, 'Telefon raqam formati: +998XXXXXXXXX'),
  address: z.string().max(200).optional(),

  adminName: z.string().min(2).max(50),
  adminPhone: z.string().regex(/^\+998[0-9]{9}$/),
  adminPassword: z.string().min(6),

  plan: z.enum(SUBSCRIPTION_PLANS),

  commissionEnabled: z.boolean().optional().default(false),
  defaultCommission: z.number().min(0).max(100).optional().default(10),

  createSampleData: z.boolean().optional().default(true),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+998[0-9]{9}$/).optional(),
  address: z.string().max(200).optional(),
  logo: z.string().url().optional(),
  isActive: z.boolean().optional(),
  settings: z
    .object({
      commissionEnabled: z.boolean().optional(),
      defaultCommission: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

export const updateSubscriptionSchema = z.object({
  plan: z.enum(SUBSCRIPTION_PLANS),
  expiresAt: z.string().datetime().optional(),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
