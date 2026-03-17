import { z } from 'zod';

export const syncOperationSchema = z.object({
  type: z.enum(['CREATE_ORDER', 'UPDATE_ORDER', 'CLOSE_ORDER']),
  payload: z.record(z.unknown()),
  clientId: z.string().uuid(),
  timestamp: z.number(),
});

export const syncPushSchema = z.object({
  operations: z.array(syncOperationSchema),
});

export const syncPullParamsSchema = z.object({
  lastSyncAt: z.coerce.number().optional(),
});

export type SyncOperation = z.infer<typeof syncOperationSchema>;
export type SyncPushInput = z.infer<typeof syncPushSchema>;
export type SyncPullParams = z.infer<typeof syncPullParamsSchema>;
