import { z } from 'zod';

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Telefon raqam kiritilishi shart')
    .regex(/^\+998[0-9]{9}$/, 'Telefon raqam formati: +998XXXXXXXXX'),
  password: z
    .string()
    .min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
});

export const superAdminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email kiritilishi shart')
    .email('Email formati noto\'g\'ri'),
  password: z
    .string()
    .min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Joriy parolni kiriting'),
  newPassword: z
    .string()
    .min(6, 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak')
    .regex(/[A-Za-z]/, 'Parolda harf bo\'lishi kerak')
    .regex(/[0-9]/, 'Parolda raqam bo\'lishi kerak'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SuperAdminLoginInput = z.infer<typeof superAdminLoginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
