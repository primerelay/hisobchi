import { Router } from 'express';
import { Restaurant } from '../models';
import { updateRestaurantSchema } from '@repo/validation';
import {
  authenticate,
  authorize,
  requireTenant,
  validateTenant,
  validateBody,
  upload,
  ApiError,
} from '../middleware';
import { uploadImage, getDashboardStats } from '../services';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate, authorize('admin'), requireTenant, validateTenant);

// GET /api/v1/restaurant
router.get('/', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurantId);

    if (!restaurant) {
      throw new ApiError('Restaurant topilmadi', 404);
    }

    res.json({ restaurant });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/restaurant
router.patch('/', validateBody(updateRestaurantSchema), async (req, res, next) => {
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
      req.restaurantId,
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

// GET /api/v1/restaurant/stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getDashboardStats(req.restaurantId!);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/restaurant/upload-logo
router.post('/upload-logo', upload.single('logo'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError('Rasm yuklanmadi', 400);
    }

    const { url } = await uploadImage(req.file.buffer, 'logos');

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.restaurantId,
      { logo: url },
      { new: true }
    );

    res.json({ logoUrl: url, restaurant });
  } catch (error) {
    next(error);
  }
});

export default router;
