import { Router } from 'express';
import { Room, Order } from '../models';
import { createRoomSchema, updateRoomSchema } from '@repo/validation';
import {
  authenticate,
  authorize,
  requireTenant,
  validateTenant,
  validateBody,
  ApiError,
} from '../middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate, requireTenant, validateTenant);

// GET /api/v1/rooms
router.get('/', async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const filter: any = { restaurantId: req.restaurantId };

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const rooms = await Room.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .populate({
        path: 'currentOrderId',
        select: 'totalPrice waiterId status',
        populate: {
          path: 'waiterId',
          select: 'name',
        },
      });

    // Transform to include order details
    const roomsWithOrders = rooms.map((room) => {
      const roomObj = room.toObject();
      if (roomObj.currentOrderId && typeof roomObj.currentOrderId === 'object') {
        const order = roomObj.currentOrderId as any;
        return {
          ...roomObj,
          currentOrderId: order._id,
          currentOrder: {
            _id: order._id,
            totalPrice: order.totalPrice,
            waiterId: order.waiterId?._id,
            waiterName: order.waiterId?.name,
          },
        };
      }
      return {
        ...roomObj,
        currentOrder: null,
      };
    });

    res.json({ rooms: roomsWithOrders });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rooms
router.post(
  '/',
  authorize('admin'),
  validateBody(createRoomSchema),
  async (req, res, next) => {
    try {
      const { name } = req.body;

      // Get max sortOrder
      const lastRoom = await Room.findOne({ restaurantId: req.restaurantId })
        .sort({ sortOrder: -1 });
      const sortOrder = (lastRoom?.sortOrder || 0) + 1;

      const room = await Room.create({
        restaurantId: req.restaurantId,
        name,
        sortOrder,
      });

      res.status(201).json({ room });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/rooms/:id
router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      restaurantId: req.restaurantId,
    });

    if (!room) {
      throw new ApiError('Xona topilmadi', 404);
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/rooms/:id
router.patch(
  '/:id',
  authorize('admin'),
  validateBody(updateRoomSchema),
  async (req, res, next) => {
    try {
      const room = await Room.findOneAndUpdate(
        { _id: req.params.id, restaurantId: req.restaurantId },
        { $set: req.body },
        { new: true }
      );

      if (!room) {
        throw new ApiError('Xona topilmadi', 404);
      }

      res.json({ room });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/rooms/:id
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      restaurantId: req.restaurantId,
    });

    if (!room) {
      throw new ApiError('Xona topilmadi', 404);
    }

    // Check if room has open order
    if (room.currentOrderId) {
      throw new ApiError('Ochiq buyurtmasi bor xonani o\'chirib bo\'lmaydi', 400);
    }

    room.isActive = false;
    await room.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
