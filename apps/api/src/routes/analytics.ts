import { Router } from 'express';
import { z } from 'zod';
import {
  authenticate,
  authorize,
  requireTenant,
  validateTenant,
  validateQuery,
} from '../middleware';
import {
  getDashboardStats,
  getTopItems,
  getWaiterStats,
  getRevenueByPeriod,
} from '../services';
import { startOfDay, endOfDay, subDays } from '@repo/utils';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate, authorize('admin'), requireTenant, validateTenant);

const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

// GET /api/v1/analytics/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const stats = await getDashboardStats(req.restaurantId!);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/analytics/revenue
router.get('/revenue', validateQuery(dateRangeSchema), async (req, res, next) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;

    const dateFrom = from
      ? new Date(from as string)
      : startOfDay(subDays(new Date(), 30));
    const dateTo = to ? new Date(to as string) : endOfDay(new Date());

    const data = await getRevenueByPeriod(
      req.restaurantId!,
      dateFrom,
      dateTo,
      groupBy as 'day' | 'week' | 'month'
    );

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/analytics/top-items
router.get('/top-items', validateQuery(dateRangeSchema), async (req, res, next) => {
  try {
    const { from, to, limit = 10 } = req.query;

    const dateFrom = from
      ? new Date(from as string)
      : startOfDay(subDays(new Date(), 30));
    const dateTo = to ? new Date(to as string) : endOfDay(new Date());

    const items = await getTopItems(
      req.restaurantId!,
      dateFrom,
      dateTo,
      Number(limit)
    );

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/analytics/waiters
router.get('/waiters', validateQuery(dateRangeSchema), async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const dateFrom = from
      ? new Date(from as string)
      : startOfDay(subDays(new Date(), 30));
    const dateTo = to ? new Date(to as string) : endOfDay(new Date());

    const waiters = await getWaiterStats(req.restaurantId!, dateFrom, dateTo);

    res.json({ waiters });
  } catch (error) {
    next(error);
  }
});

export default router;
