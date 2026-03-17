import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createOrderSchema = z.object({
  roomId: z.string().regex(objectIdRegex, 'Noto\'g\'ri xona ID'),
  items: z
    .array(
      z.object({
        menuItemId: z.string().regex(objectIdRegex, 'Noto\'g\'ri taom ID'),
        quantity: z.number().int().min(1).max(999),
      })
    )
    .optional()
    .default([]),
  clientId: z.string().uuid().optional(),
});

export const updateOrderSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string().regex(objectIdRegex, 'Noto\'g\'ri taom ID'),
      quantity: z.number().int().min(0).max(999),
    })
  ),
});

export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .min(1, 'Sabab kiritilishi shart')
    .max(500, 'Sabab juda uzun'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
