import { z } from 'zod';
import { CATEGORIES } from '@repo/constants';

export const createMenuItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Nomi kiritilishi shart')
    .max(100, 'Nomi juda uzun'),
  price: z
    .number()
    .int('Narx butun son bo\'lishi kerak')
    .min(0, 'Narx manfiy bo\'lishi mumkin emas')
    .max(100_000_000, 'Narx juda katta'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Kategoriya tanlanishi shart' }),
  }),
  image: z.string().url('URL formati noto\'g\'ri').optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const reorderMenuItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Noto\'g\'ri ID'),
      sortOrder: z.number().int().min(0),
    })
  ),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type ReorderMenuItemsInput = z.infer<typeof reorderMenuItemsSchema>;
