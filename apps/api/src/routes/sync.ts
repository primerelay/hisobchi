import { Router } from 'express';
import { z } from 'zod';
import { MenuItem, Room, Order } from '../models';
import {
  authenticate,
  requireTenant,
  validateTenant,
  validateBody,
  validateQuery,
} from '../middleware';
import { createOrder, updateOrder, closeOrder } from '../services';
import type { SyncResult } from '@repo/types';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate, requireTenant, validateTenant);

const syncPushSchema = z.object({
  operations: z.array(
    z.object({
      type: z.enum(['CREATE_ORDER', 'UPDATE_ORDER', 'CLOSE_ORDER']),
      payload: z.record(z.unknown()),
      clientId: z.string(),
      timestamp: z.number(),
    })
  ),
});

const syncPullSchema = z.object({
  lastSyncAt: z.coerce.number().optional(),
});

// POST /api/v1/sync/orders
router.post('/orders', validateBody(syncPushSchema), async (req, res, next) => {
  try {
    const { operations } = req.body;
    const results: SyncResult[] = [];

    for (const op of operations) {
      try {
        let order;

        switch (op.type) {
          case 'CREATE_ORDER':
            // Check if order with clientId already exists
            const existing = await Order.findOne({
              restaurantId: req.restaurantId,
              clientId: op.clientId,
            });

            if (existing) {
              // Already synced, return existing
              results.push({
                clientId: op.clientId,
                serverId: existing._id.toString(),
                status: 'success',
              });
              continue;
            }

            order = await createOrder(
              req.restaurantId!,
              req.user!.id,
              {
                ...op.payload,
                clientId: op.clientId,
              } as any
            );
            break;

          case 'UPDATE_ORDER':
            // Find order by clientId
            const orderToUpdate = await Order.findOne({
              restaurantId: req.restaurantId,
              clientId: op.clientId,
              status: 'open',
            });

            if (!orderToUpdate) {
              results.push({
                clientId: op.clientId,
                status: 'error',
                error: 'Order not found',
              });
              continue;
            }

            order = await updateOrder(
              req.restaurantId!,
              orderToUpdate._id.toString(),
              op.payload as any
            );
            break;

          case 'CLOSE_ORDER':
            const orderToClose = await Order.findOne({
              restaurantId: req.restaurantId,
              clientId: op.clientId,
            });

            if (!orderToClose) {
              results.push({
                clientId: op.clientId,
                status: 'error',
                error: 'Order not found',
              });
              continue;
            }

            order = await closeOrder(
              req.restaurantId!,
              orderToClose._id.toString()
            );
            break;
        }

        if (order) {
          // Mark as synced
          order.syncedAt = new Date();
          await order.save();

          results.push({
            clientId: op.clientId,
            serverId: order._id.toString(),
            status: 'success',
          });
        }
      } catch (error: any) {
        results.push({
          clientId: op.clientId,
          status: 'error',
          error: error.message,
        });
      }
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/sync/pull
router.get('/pull', validateQuery(syncPullSchema), async (req, res, next) => {
  try {
    const { lastSyncAt } = req.query;
    const since = lastSyncAt ? new Date(Number(lastSyncAt)) : new Date(0);

    const [menuItems, rooms, orders] = await Promise.all([
      MenuItem.find({
        restaurantId: req.restaurantId,
        updatedAt: { $gt: since },
      }),
      Room.find({
        restaurantId: req.restaurantId,
        updatedAt: { $gt: since },
      }),
      // For waiters, only sync their orders
      Order.find({
        restaurantId: req.restaurantId,
        waiterId: req.user!.id,
        updatedAt: { $gt: since },
      }),
    ]);

    res.json({
      menuItems,
      rooms,
      orders,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
