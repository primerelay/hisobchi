import { Router } from 'express';
import { User, Order } from '../models';
import { createWaiterSchema, updateWaiterSchema } from '@repo/validation';
import { startOfDay, endOfDay } from '@repo/utils';
import {
  authenticate,
  authorize,
  requireTenant,
  validateTenant,
  validateBody,
  ApiError,
} from '../middleware';
import { hashPassword } from '../services';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate, authorize('admin'), requireTenant, validateTenant);

// GET /api/v1/waiters
router.get('/', async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const filter: any = {
      restaurantId: req.restaurantId,
      role: 'waiter',
    };

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const waiters = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ waiters });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/waiters
router.post('/', validateBody(createWaiterSchema), async (req, res, next) => {
  try {
    const { name, phone, password, commissionPercent } = req.body;

    // Check if phone already exists
    const existing = await User.findOne({
      restaurantId: req.restaurantId,
      phone,
    });

    if (existing) {
      throw new ApiError('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan', 409);
    }

    const passwordHash = await hashPassword(password);

    const waiter = await User.create({
      restaurantId: req.restaurantId,
      role: 'waiter',
      name,
      phone,
      passwordHash,
      commissionPercent: commissionPercent || 0,
    });

    const waiterObj = waiter.toObject();
    delete waiterObj.passwordHash;

    res.status(201).json({ waiter: waiterObj });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/waiters/:id
router.get('/:id', async (req, res, next) => {
  try {
    const waiter = await User.findOne({
      _id: req.params.id,
      restaurantId: req.restaurantId,
      role: 'waiter',
    }).select('-passwordHash');

    if (!waiter) {
      throw new ApiError('Ofitsiant topilmadi', 404);
    }

    res.json({ waiter });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/waiters/:id
router.patch('/:id', validateBody(updateWaiterSchema), async (req, res, next) => {
  try {
    const updates: any = { ...req.body };

    // Hash password if provided
    if (updates.password) {
      updates.passwordHash = await hashPassword(updates.password);
      delete updates.password;
    }

    // Check phone uniqueness if updating
    if (updates.phone) {
      const existing = await User.findOne({
        restaurantId: req.restaurantId,
        phone: updates.phone,
        _id: { $ne: req.params.id },
      });

      if (existing) {
        throw new ApiError('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan', 409);
      }
    }

    const waiter = await User.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.restaurantId, role: 'waiter' },
      { $set: updates },
      { new: true }
    ).select('-passwordHash');

    if (!waiter) {
      throw new ApiError('Ofitsiant topilmadi', 404);
    }

    res.json({ waiter });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/waiters/:id/stats
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const waiter = await User.findOne({
      _id: req.params.id,
      restaurantId: req.restaurantId,
      role: 'waiter',
    });

    if (!waiter) {
      throw new ApiError('Ofitsiant topilmadi', 404);
    }

    const dateFrom = from ? new Date(from as string) : startOfDay(new Date());
    const dateTo = to ? new Date(to as string) : endOfDay(new Date());

    const stats = await Order.aggregate([
      {
        $match: {
          restaurantId: waiter.restaurantId,
          waiterId: waiter._id,
          status: 'closed',
          closedAt: { $gte: dateFrom, $lte: dateTo },
        },
      },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          commission: { $sum: '$waiterCommission.amount' },
        },
      },
    ]);

    res.json({
      waiterId: waiter._id,
      name: waiter.name,
      orders: stats[0]?.orderCount || 0,
      revenue: stats[0]?.revenue || 0,
      commission: stats[0]?.commission || 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
