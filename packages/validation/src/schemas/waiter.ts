import { z } from 'zod';

export const createWaiterSchema = z.object({
  name: z
    .string()
    .min(2, 'Ism juda qisqa')
    .max(50, 'Ism juda uzun'),
  phone: z
    .string()
    .regex(/^\+998[0-9]{9}$/, 'Telefon raqam formati: +998XXXXXXXXX'),
  password: z
    .string()
    .min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  commissionPercent: z
    .number()
    .min(0, 'Komissiya manfiy bo\'lishi mumkin emas')
    .max(100, 'Komissiya 100% dan oshmasligi kerak')
    .optional()
    .default(0),
});

export const updateWaiterSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^\+998[0-9]{9}$/).optional(),
  password: z.string().min(6).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type CreateWaiterInput = z.infer<typeof createWaiterSchema>;
export type UpdateWaiterInput = z.infer<typeof updateWaiterSchema>;
