import { Router } from 'express';
import mongoose from 'mongoose';
import { Restaurant, User, Order, SuperAdmin } from '../models';
import { createRestaurantSchema, updateRestaurantSchema } from '@repo/validation';
import { SAMPLE_MENU_ITEMS, SAMPLE_ROOMS, PLAN_DURATION_DAYS, DEFAULT_IMAGES } from '@repo/constants';
import { addDays } from '@repo/utils';
import {
  authenticate,
  authorize,
  validateBody,
  ApiError,
} from '../middleware';
import { hashPassword } from '../services';
import { MenuItem, Room } from '../models';

const router = Router();

// Apply super admin auth to all routes
router.use(authenticate, authorize('superAdmin'));

// GET /api/v1/super-admin/restaurants
router.get('/restaurants', async (req, res, next) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Restaurant.countDocuments(filter),
    ]);

    res.json({
      restaurants,
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

// POST /api/v1/super-admin/restaurants
router.post('/restaurants', validateBody(createRestaurantSchema), async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      slug,
      phone,
      address,
      adminName,
      adminPhone,
      adminPassword,
      plan,
      commissionEnabled,
      defaultCommission,
      createSampleData,
    } = req.body;

    // Check slug uniqueness
    const existingSlug = await Restaurant.findOne({ slug });
    if (existingSlug) {
      throw new ApiError('Bu slug allaqachon band', 409);
    }

    // Create restaurant
    const [restaurant] = await Restaurant.create(
      [
        {
          name,
          slug,
          phone,
          address,
          settings: {
            currency: 'UZS',
            commissionEnabled: commissionEnabled || false,
            defaultCommission: defaultCommission || 10,
            timezone: 'Asia/Tashkent',
          },
          subscription: {
            plan,
            expiresAt: addDays(new Date(), PLAN_DURATION_DAYS[plan as keyof typeof PLAN_DURATION_DAYS]),
          },
        },
      ],
      { session }
    );

    // Create admin user
    const passwordHash = await hashPassword(adminPassword);
    const [admin] = await User.create(
      [
        {
          restaurantId: restaurant._id,
          role: 'admin',
          name: adminName,
          phone: adminPhone,
          passwordHash,
        },
      ],
      { session }
    );

    // Create sample data if requested
    if (createSampleData) {
      // Create menu items
      const menuItems = SAMPLE_MENU_ITEMS.map((item, index) => ({
        restaurantId: restaurant._id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
        sortOrder: index,
      }));
      await MenuItem.create(menuItems, { session, ordered: true });

      // Create rooms
      const rooms = SAMPLE_ROOMS.map((name, index) => ({
        restaurantId: restaurant._id,
        name,
        sortOrder: index,
      }));
      await Room.create(rooms, { session, ordered: true });
    }

    await session.commitTransaction();

    res.status(201).json({
      restaurant,
      admin: {
        _id: admin._id,
        name: admin.name,
        phone: admin.phone,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// GET /api/v1/super-admin/restaurants/:id
router.get('/restaurants/:id', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      throw new ApiError('Restaurant topilmadi', 404);
    }

    const admin = await User.findOne({
      restaurantId: restaurant._id,
      role: 'admin',
    }).select('-passwordHash');

    // Get basic stats
    const [orderCount, totalRevenue] = await Promise.all([
      Order.countDocuments({ restaurantId: restaurant._id, status: 'closed' }),
      Order.aggregate([
        { $match: { restaurantId: restaurant._id, status: 'closed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    res.json({
      restaurant,
      admin,
      stats: {
        orderCount,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/super-admin/restaurants/:id
router.patch('/restaurants/:id', validateBody(updateRestaurantSchema), async (req, res, next) => {
  try {
    const updates = req.body;

    // Handle nested settings update
    if (updates.settings) {
      const settingsUpdate: any = {};
      Object.keys(updates.settings).forEach((key) => {
        settingsUpdate[`settings.${key}`] = updates.settings[key];
      });
      delete updates.settings;
      Object.assign(updates, settingsUpdate);
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!restaurant) {
      throw new ApiError('Restaurant topilmadi', 404);
    }

    res.json({ restaurant });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/super-admin/restaurants/:id
router.delete('/restaurants/:id', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const restaurantId = req.params.id;

    // Check restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new ApiError('Restaurant topilmadi', 404);
    }

    // Delete all related data
    await Promise.all([
      Order.deleteMany({ restaurantId }, { session }),
      MenuItem.deleteMany({ restaurantId }, { session }),
      Room.deleteMany({ restaurantId }, { session }),
      User.deleteMany({ restaurantId }, { session }),
      Restaurant.findByIdAndDelete(restaurantId, { session }),
    ]);

    await session.commitTransaction();

    res.json({ success: true, message: 'Restaurant va barcha ma\'lumotlar o\'chirildi' });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// PATCH /api/v1/super-admin/restaurants/:id/admin
router.patch('/restaurants/:id/admin', async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const admin = await User.findOne({
      restaurantId: req.params.id,
      role: 'admin',
    });

    if (!admin) {
      throw new ApiError('Admin topilmadi', 404);
    }

    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    await admin.save();

    res.json({
      admin: {
        _id: admin._id,
        name: admin.name,
        phone: admin.phone,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/super-admin/restaurants/:id/reset-admin-password
router.post('/restaurants/:id/reset-admin-password', async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      throw new ApiError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak', 400);
    }

    const admin = await User.findOne({
      restaurantId: req.params.id,
      role: 'admin',
    });

    if (!admin) {
      throw new ApiError('Admin topilmadi', 404);
    }

    admin.passwordHash = await hashPassword(newPassword);
    await admin.save();

    res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/super-admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalRestaurants,
      activeRestaurants,
      totalOrders,
      totalRevenueResult,
    ] = await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isActive: true }),
      Order.countDocuments({ status: 'closed' }),
      Order.aggregate([
        { $match: { status: 'closed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    res.json({
      totalRestaurants,
      activeRestaurants,
      totalOrders,
      totalRevenue: totalRevenueResult[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
});

// ================== RESTAURANT DATA MANAGEMENT ==================

// GET /api/v1/super-admin/restaurants/:id/menu-items
router.get('/restaurants/:id/menu-items', async (req, res, next) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.id }).sort({ sortOrder: 1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/super-admin/restaurants/:id/menu-items
router.post('/restaurants/:id/menu-items', async (req, res, next) => {
  try {
    const { name, price, category, image } = req.body;
    const count = await MenuItem.countDocuments({ restaurantId: req.params.id });
    const item = await MenuItem.create({
      restaurantId: req.params.id,
      name,
      price,
      category,
      image: image || DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES] || DEFAULT_IMAGES.food,
      sortOrder: count,
    });
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/super-admin/restaurants/:id/menu-items/:itemId
router.patch('/restaurants/:id/menu-items/:itemId', async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.itemId, restaurantId: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!item) {
      throw new ApiError('Taom topilmadi', 404);
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/super-admin/restaurants/:id/menu-items/:itemId
router.delete('/restaurants/:id/menu-items/:itemId', async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndDelete({
      _id: req.params.itemId,
      restaurantId: req.params.id,
    });
    if (!item) {
      throw new ApiError('Taom topilmadi', 404);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/super-admin/restaurants/:id/rooms
router.get('/restaurants/:id/rooms', async (req, res, next) => {
  try {
    const rooms = await Room.find({ restaurantId: req.params.id }).sort({ sortOrder: 1 });
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/super-admin/restaurants/:id/rooms
router.post('/restaurants/:id/rooms', async (req, res, next) => {
  try {
    const { name } = req.body;
    const count = await Room.countDocuments({ restaurantId: req.params.id });
    const room = await Room.create({
      restaurantId: req.params.id,
      name,
      sortOrder: count,
    });
    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/super-admin/restaurants/:id/rooms/:roomId
router.patch('/restaurants/:id/rooms/:roomId', async (req, res, next) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.roomId, restaurantId: req.params.id },
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
});

// DELETE /api/v1/super-admin/restaurants/:id/rooms/:roomId
router.delete('/restaurants/:id/rooms/:roomId', async (req, res, next) => {
  try {
    const room = await Room.findOneAndDelete({
      _id: req.params.roomId,
      restaurantId: req.params.id,
    });
    if (!room) {
      throw new ApiError('Xona topilmadi', 404);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/super-admin/restaurants/:id/waiters
router.get('/restaurants/:id/waiters', async (req, res, next) => {
  try {
    const waiters = await User.find({
      restaurantId: req.params.id,
      role: 'waiter',
    }).select('-passwordHash');
    res.json({ waiters });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/super-admin/restaurants/:id/waiters
router.post('/restaurants/:id/waiters', async (req, res, next) => {
  try {
    const { name, phone, password, commissionPercent } = req.body;
    const passwordHash = await hashPassword(password);
    const waiter = await User.create({
      restaurantId: req.params.id,
      role: 'waiter',
      name,
      phone,
      passwordHash,
      commissionPercent: commissionPercent || 0,
    });
    res.status(201).json({
      waiter: {
        _id: waiter._id,
        name: waiter.name,
        phone: waiter.phone,
        commissionPercent: waiter.commissionPercent,
        isActive: waiter.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/super-admin/restaurants/:id/waiters/:waiterId
router.patch('/restaurants/:id/waiters/:waiterId', async (req, res, next) => {
  try {
    const updates: any = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await hashPassword(updates.password);
      delete updates.password;
    }
    const waiter = await User.findOneAndUpdate(
      { _id: req.params.waiterId, restaurantId: req.params.id, role: 'waiter' },
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

// DELETE /api/v1/super-admin/restaurants/:id/waiters/:waiterId
router.delete('/restaurants/:id/waiters/:waiterId', async (req, res, next) => {
  try {
    const waiter = await User.findOneAndDelete({
      _id: req.params.waiterId,
      restaurantId: req.params.id,
      role: 'waiter',
    });
    if (!waiter) {
      throw new ApiError('Ofitsiant topilmadi', 404);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/super-admin/restaurants/:id/orders
router.get('/restaurants/:id/orders', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter: any = { restaurantId: req.params.id };
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
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

// GET /api/v1/super-admin/restaurants/:id/analytics
router.get('/restaurants/:id/analytics', async (req, res, next) => {
  try {
    const restaurantId = req.params.id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayStats, yesterdayStats, weekStats, monthStats] = await Promise.all([
      Order.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: 'closed', closedAt: { $gte: todayStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: 'closed', closedAt: { $gte: yesterdayStart, $lt: todayStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: 'closed', closedAt: { $gte: weekStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: 'closed', closedAt: { $gte: monthStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      stats: {
        today: {
          revenue: todayStats[0]?.revenue || 0,
          orderCount: todayStats[0]?.count || 0,
          avgOrderValue: todayStats[0]?.count ? Math.round(todayStats[0].revenue / todayStats[0].count) : 0,
        },
        yesterday: {
          revenue: yesterdayStats[0]?.revenue || 0,
          orderCount: yesterdayStats[0]?.count || 0,
          avgOrderValue: yesterdayStats[0]?.count ? Math.round(yesterdayStats[0].revenue / yesterdayStats[0].count) : 0,
        },
        thisWeek: {
          revenue: weekStats[0]?.revenue || 0,
          orderCount: weekStats[0]?.count || 0,
        },
        thisMonth: {
          revenue: monthStats[0]?.revenue || 0,
          orderCount: monthStats[0]?.count || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
