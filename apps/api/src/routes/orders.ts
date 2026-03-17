import { Router } from 'express';
import { Order, Room } from '../models';
import { createOrderSchema, updateOrderSchema, cancelOrderSchema } from '@repo/validation';
import { PAGINATION } from '@repo/constants';
import {
  authenticate,
  authorize,
  requireTenant,
  validateTenant,
  validateBody,
  ApiError,
} from '../middleware';
import {
  createOrder,
  updateOrder,
  closeOrder,
  cancelOrder,
  getCurrentOrderForRoom,
  getOrCreateOrderForRoom,
  addItemToOrder,
} from '../services';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate, requireTenant, validateTenant);

// GET /api/v1/orders
router.get('/', async (req, res, next) => {
  try {
    const {
      status,
      roomId,
      waiterId,
      from,
      to,
      page = PAGINATION.defaultPage,
      limit = PAGINATION.defaultLimit,
    } = req.query;

    const filter: any = { restaurantId: req.restaurantId };

    if (status) {
      filter.status = status;
    }

    if (roomId) {
      filter.roomId = roomId;
    }

    if (waiterId) {
      filter.waiterId = waiterId;
    }

    // For waiters, only show their own orders
    if (req.user?.role === 'waiter') {
      filter.waiterId = req.user.id;
    }

    if (from || to) {
      filter.closedAt = {};
      if (from) filter.closedAt.$gte = new Date(from as string);
      if (to) filter.closedAt.$lte = new Date(to as string);
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(
      PAGINATION.maxLimit,
      Math.max(1, parseInt(limit as string, 10))
    );
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ openedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('roomId', 'name')
        .populate('waiterId', 'name'),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/orders
router.post('/', validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const order = await createOrder(
      req.restaurantId!,
      req.user!.id,
      req.body
    );

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders/room/:roomId/current
router.get('/room/:roomId/current', async (req, res, next) => {
  try {
    const order = await getCurrentOrderForRoom(
      req.restaurantId!,
      req.params.roomId
    );

    if (!order) {
      return res.status(404).json({ error: 'Ochiq buyurtma topilmadi' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/orders/room/:roomId/get-or-create
router.post('/room/:roomId/get-or-create', async (req, res, next) => {
  try {
    const { order, created } = await getOrCreateOrderForRoom(
      req.restaurantId!,
      req.user!.id,
      req.params.roomId
    );

    res.status(created ? 201 : 200).json({ order, created });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      restaurantId: req.restaurantId,
    })
      .populate('roomId', 'name')
      .populate('waiterId', 'name');

    if (!order) {
      throw new ApiError('Buyurtma topilmadi', 404);
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/orders/:id
router.patch('/:id', validateBody(updateOrderSchema), async (req, res, next) => {
  try {
    const order = await updateOrder(
      req.restaurantId!,
      req.params.id,
      req.body
    );

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/orders/:id/close
router.post('/:id/close', async (req, res, next) => {
  try {
    const order = await closeOrder(req.restaurantId!, req.params.id);
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/orders/:id/cancel
router.post(
  '/:id/cancel',
  authorize('admin'),
  validateBody(cancelOrderSchema),
  async (req, res, next) => {
    try {
      const { reason } = req.body;
      const order = await cancelOrder(req.restaurantId!, req.params.id, reason);
      res.json({ order });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/orders/:id/add-item
router.post('/:id/add-item', async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    if (!menuItemId) {
      throw new ApiError('menuItemId kiritilishi shart', 400);
    }

    const order = await addItemToOrder(
      req.restaurantId!,
      req.params.id,
      menuItemId,
      quantity
    );

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
