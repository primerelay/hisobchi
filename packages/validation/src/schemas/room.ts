import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, 'Xona nomi kiritilishi shart')
    .max(50, 'Xona nomi juda uzun'),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
