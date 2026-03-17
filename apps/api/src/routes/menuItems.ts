import { Router } from 'express';
import { MenuItem } from '../models';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  reorderMenuItemsSchema,
} from '@repo/validation';
import { DEFAULT_IMAGES } from '@repo/constants';
import {
  authenticate,
  authorize,
  requireTenant,
  validateTenant,
  validateBody,
  upload,
  ApiError,
} from '../middleware';
import { uploadImage } from '../services';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate, requireTenant, validateTenant);

// GET /api/v1/menu-items
router.get('/', async (req, res, next) => {
  try {
    const { category, isActive, search } = req.query;

    const filter: any = { restaurantId: req.restaurantId };

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const items = await MenuItem.find(filter).sort({ sortOrder: 1, createdAt: -1 });

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/menu-items
router.post(
  '/',
  authorize('admin'),
  validateBody(createMenuItemSchema),
  async (req, res, next) => {
    try {
      const { name, price, category, image } = req.body;

      // Get max sortOrder
      const lastItem = await MenuItem.findOne({ restaurantId: req.restaurantId })
        .sort({ sortOrder: -1 });
      const sortOrder = (lastItem?.sortOrder || 0) + 1;

      const item = await MenuItem.create({
        restaurantId: req.restaurantId,
        name,
        price,
        category,
        image: image || DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES],
        sortOrder,
      });

      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/menu-items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await MenuItem.findOne({
      _id: req.params.id,
      restaurantId: req.restaurantId,
    });

    if (!item) {
      throw new ApiError('Taom topilmadi', 404);
    }

    res.json({ item });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/menu-items/:id
router.patch(
  '/:id',
  authorize('admin'),
  validateBody(updateMenuItemSchema),
  async (req, res, next) => {
    try {
      const item = await MenuItem.findOneAndUpdate(
        { _id: req.params.id, restaurantId: req.restaurantId },
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
  }
);

// DELETE /api/v1/menu-items/:id
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.restaurantId },
      { isActive: false },
      { new: true }
    );

    if (!item) {
      throw new ApiError('Taom topilmadi', 404);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/menu-items/reorder
router.post(
  '/reorder',
  authorize('admin'),
  validateBody(reorderMenuItemsSchema),
  async (req, res, next) => {
    try {
      const { items } = req.body;

      const bulkOps = items.map((item: { id: string; sortOrder: number }) => ({
        updateOne: {
          filter: { _id: item.id, restaurantId: req.restaurantId },
          update: { $set: { sortOrder: item.sortOrder } },
        },
      }));

      await MenuItem.bulkWrite(bulkOps);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/menu-items/:id/upload-image
router.post(
  '/:id/upload-image',
  authorize('admin'),
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ApiError('Rasm yuklanmadi', 400);
      }

      const item = await MenuItem.findOne({
        _id: req.params.id,
        restaurantId: req.restaurantId,
      });

      if (!item) {
        throw new ApiError('Taom topilmadi', 404);
      }

      const { url } = await uploadImage(req.file.buffer, 'menu-items');

      item.image = url;
      await item.save();

      res.json({ imageUrl: url });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
